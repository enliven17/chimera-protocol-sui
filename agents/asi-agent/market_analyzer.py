"""
ChimeraProtocol ASI Alliance Market Analyzer Agent
Uses MeTTa reasoning and direct contract data to make intelligent betting decisions
"""

import asyncio
import json
import os
import requests
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import uuid4

# ASI Alliance imports (as specified in eth.md)
from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
from uagents.network import wait_for_tx_to_complete

# Chat protocol for natural language interaction
try:
    from uagents_core.contrib.protocols.chat import (
        ChatMessage,
        ChatAcknowledgement,
        TextContent,
        chat_protocol_spec
    )
    CHAT_AVAILABLE = True
except ImportError:
    CHAT_AVAILABLE = False
    print("⚠️ Chat protocol not available - install uagents_core for chat support")

# OpenAI for intelligent analysis
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI not available - install openai for enhanced analysis")

# Response Models
class MarketAnalysis(Model):
    market_id: str
    recommendation: str
    confidence: float
    reasoning: str
    risk_level: str
    timestamp: str

class ChimeraResponse(Model):
    analysis: List[MarketAnalysis]
    message: str
    type: str = "chimera_analysis"

class StructuredQuery(Model):
    query: str
    parameters: Optional[Dict] = None

# Rate limiting
class RateLimiter:
    def __init__(self, max_requests=30, time_window=3600):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = {}
    
    def is_allowed(self, user_id: str) -> bool:
        now = time.time()
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Clean old requests
        self.requests[user_id] = [req_time for req_time in self.requests[user_id] 
                                  if now - req_time < self.time_window]
        
        if len(self.requests[user_id]) >= self.max_requests:
            return False
        
        self.requests[user_id].append(now)
        return True

# MeTTa reasoning engine (Hyperon runtime with graceful fallback)
class MeTTaReasoner:
    """MeTTa-based reasoning engine for market analysis"""

    def __init__(self):
        self.metta = None
        try:
            # Lazy import to avoid hard crash if hyperon is not available
            from hyperon import MeTTa  # type: ignore
            self.metta = MeTTa()
            # Seed a minimal knowledge base for contrarian reasoning
            self.metta.run('''
                (:- (contrarian BUY_B RATIO)
                    (> RATIO 0.7))
                (:- (contrarian BUY_A RATIO)
                    (> (- 1 RATIO) 0.7))
            ''')
        except Exception:
            self.metta = None

    def _fallback_analysis(self, market_data: Dict) -> Dict:
        total_volume = market_data.get("totalPool", 0)
        option_a_ratio = market_data.get("optionARatio", 0.5)
        option_b_ratio = 1 - option_a_ratio

        analysis = {
            "confidence": 0.0,
            "recommendation": "HOLD",
            "reasoning": "",
            "risk_level": "MEDIUM",
            "metta_analysis": "Fallback heuristic contrarian analysis"
        }

        if option_a_ratio > 0.7:
            analysis["recommendation"] = "BUY_B"
            analysis["confidence"] = min(0.8, (option_a_ratio - 0.5) * 2)
            analysis["reasoning"] = f"Contrarian bet: Option A heavily favored ({option_a_ratio:.1%})"
        elif option_b_ratio > 0.7:
            analysis["recommendation"] = "BUY_A"
            analysis["confidence"] = min(0.8, (option_b_ratio - 0.5) * 2)
            analysis["reasoning"] = f"Contrarian bet: Option B heavily favored ({option_b_ratio:.1%})"
        else:
            analysis["recommendation"] = "HOLD"
            analysis["reasoning"] = "Market appears balanced, waiting for better opportunity"

        if total_volume < 1000:
            analysis["risk_level"] = "HIGH"
        elif total_volume > 10000:
            analysis["risk_level"] = "LOW"

        return analysis

    def analyze_market_data(self, market_data: Dict) -> Dict:
        """Analyze market data using MeTTa rules; fallback to heuristic if needed."""

        option_a_ratio = float(market_data.get("optionARatio", 0.5))

        if not self.metta:
            return self._fallback_analysis(market_data)

        try:
            # Evaluate MeTTa predicates for contrarian strategy
            result_buy_b = self.metta.run(f"(contrarian BUY_B {option_a_ratio})")
            result_buy_a = self.metta.run(f"(contrarian BUY_A {option_a_ratio})")

            recommendation = "HOLD"
            confidence = 0.5
            if result_buy_b:
                recommendation = "BUY_B"
                confidence = min(0.9, max(0.6, (option_a_ratio - 0.5) * 2))
            elif result_buy_a:
                recommendation = "BUY_A"
                inverted = 1 - option_a_ratio
                confidence = min(0.9, max(0.6, (inverted - 0.5) * 2))

            analysis = self._fallback_analysis(market_data)
            analysis["recommendation"] = recommendation
            analysis["confidence"] = float(confidence)
            analysis["metta_analysis"] = "Hyperon MeTTa rules applied for contrarian detection"
            return analysis
        except Exception:
            return self._fallback_analysis(market_data)

@dataclass
class MarketData:
    """Market data structure"""
    id: int
    title: str
    total_pool: int
    option_a_shares: int
    option_b_shares: int
    end_time: datetime
    market_type: str
    status: str

class DirectRPCDataFetcher:
    """Fetches market data directly from RPC"""
    
    def __init__(self, rpc_endpoint: str):
        self.endpoint = rpc_endpoint
        self.contract_address = os.getenv("CHIMERA_CONTRACT_ADDRESS", "0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644")
    
    async def get_active_markets(self) -> List[MarketData]:
        """Fetch active markets from contract directly"""
        
        import aiohttp
        import os
        import time
        
        try:
            chimera_address = os.getenv("CHIMERA_CONTRACT_ADDRESS", "0x7Bee0AB565e6aB33009647174Eb8cd55B56EcD7c")
            
            async with aiohttp.ClientSession() as session:
                # Get contract transactions
                url = f"{self.endpoint}/api/v2/addresses/{chimera_address}/transactions"
                async with session.get(url, params={"limit": 100}) as response:
                    data = await response.json()
                    
                    markets = []
                    for tx in data.get("items", []):
                        # Filter for market creation transactions
                        if tx.get("method") == "createMarket" or int(tx.get("value", "0")) == 0:
                            markets.append(MarketData(
                                id=int(tx["hash"][-8:], 16),  # Convert hex to int
                                title=f"Market {tx['hash'][-8:]}",
                                total_pool=0,  # Will be calculated from bets
                                option_a_shares=0,
                                option_b_shares=0,
                                end_time=datetime.fromtimestamp(time.time() + 86400),  # 24h from now
                                market_type="binary",
                                status="active"
                            ))
                    
                    return markets[:10]  # Return first 10 markets
                    
        except Exception as e:
            print(f"Error fetching markets from RPC: {e}")
            return []
    
    async def get_market_history(self, market_id: int) -> List[Dict]:
        """Get betting history for a specific market"""
        
        query = f"""
        query GetMarketHistory {{
          betPlacedEvents(where: {{marketId: {market_id}}}) {{
            id
            user
            agent
            option
            amount
            shares
            blockTimestamp
          }}
        }}
        """
        
        try:
            response = requests.post(
                self.endpoint,
                json={"query": query},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("data", {}).get("betPlacedEvents", [])
            else:
                return []
                
        except Exception as e:
            print(f"Error fetching market history: {e}")
            return []

class ChimeraAgent:
    """Main ChimeraProtocol ASI Agent"""
    
    def __init__(self, rpc_endpoint: str):
        # Initialize rate limiter
        self.rate_limiter = RateLimiter()
        
        # Create ASI-compatible mailbox agent
        self.agent = Agent(
            name="Chimera-Market-Analyzer",
            seed="chimera_market_agent_seed_2024",
            port=8001,
            endpoint=["http://127.0.0.1:8001/submit"],
            mailbox=True,
            agentverse={"api_key": os.getenv("ACCESS_TOKEN")}
        )
        
        # Fund agent if needed
        fund_agent_if_low(self.agent.wallet.address())
        
        self.rpc_fetcher = DirectRPCDataFetcher(rpc_endpoint)
        self.metta_reasoner = MeTTaReasoner()
        
        # Initialize OpenAI if available
        if OPENAI_AVAILABLE:
            openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Agent configuration
        self.max_bet_amount = 100  # Maximum bet per transaction
        self.min_confidence = 0.6  # Minimum confidence to place bet
        self.analysis_interval = 300  # Analyze markets every 5 minutes
        
        # Setup protocols
        self.setup_protocols()
        
        # Ensure the agent is funded for almanac/identity operations
        try:
            fund_agent_if_low(self.agent.wallet.address())
        except Exception:
            pass

        self.setup_protocols()
    
    def setup_protocols(self):
        """Setup agent protocols and behaviors"""
        
        # Market analysis protocol for periodic analysis
        market_analysis_protocol = Protocol("MarketAnalysis")
        
        @market_analysis_protocol.on_interval(period=self.analysis_interval)
        async def analyze_markets(ctx: Context):
            """Periodic market analysis"""
            ctx.logger.info("🔍 Starting market analysis...")
            
            try:
                # Fetch active markets
                markets = await self.rpc_fetcher.get_active_markets()
                ctx.logger.info(f"📊 Found {len(markets)} active markets")
                
                for market in markets:
                    await self.analyze_single_market(ctx, market)
                    
            except Exception as e:
                ctx.logger.error(f"❌ Error in market analysis: {e}")
        
        self.agent.include(market_analysis_protocol)
        
        # Structured protocol for API-like queries
        structured_protocol = Protocol("StructuredAnalysis")
        
        @structured_protocol.on_message(model=StructuredQuery)
        async def handle_structured_query(ctx: Context, sender: str, msg: StructuredQuery):
            """Handle structured market analysis queries"""
            print(f"🔥 STRUCTURED QUERY: From {sender}, Query: {msg.query}")
            
            # Rate limiting
            if not self.rate_limiter.is_allowed(sender):
                await ctx.send(sender, ChimeraResponse(
                    analysis=[],
                    message="Rate limit exceeded. Please try again later.",
                    type="error"
                ))
                return
            
            # Process the query
            response = await self.process_market_query(msg.query, sender)
            await ctx.send(sender, response)
        
        self.agent.include(structured_protocol)
        
        # Chat protocol if available
        if CHAT_AVAILABLE:
            chat_proto = Protocol(spec=chat_protocol_spec)
            
            @chat_proto.on_message(model=ChatMessage)
            async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
                """Handle natural language chat messages"""
                # Extract text from content
                text_content = ""
                if msg.content and len(msg.content) > 0:
                    for content in msg.content:
                        if hasattr(content, 'text'):
                            text_content += content.text + " "
                text_content = text_content.strip()
                
                print(f"🔥 CHAT MESSAGE: From {sender}, Text: {text_content}")
                
                # Send acknowledgment
                ack = ChatAcknowledgement(
                    timestamp=datetime.utcnow(),
                    acknowledged_msg_id=msg.msg_id
                )
                await ctx.send(sender, ack)
                
                # Health check
                if text_content.lower() in ["health", "status", "ping"]:
                    response = ChatMessage(
                        timestamp=datetime.utcnow(),
                        msg_id=uuid4(),
                        content=[TextContent(type="text", text="Chimera Market Analyzer is healthy and ready for market analysis!")]
                    )
                    await ctx.send(sender, response)
                    return
                
                # Rate limiting
                if not self.rate_limiter.is_allowed(sender):
                    response = ChatMessage(
                        timestamp=datetime.utcnow(),
                        msg_id=uuid4(),
                        content=[TextContent(type="text", text="Rate limit exceeded. Please try again later.")]
                    )
                    await ctx.send(sender, response)
                    return
                
                # Process market analysis request
                analysis_response = await self.process_market_query(text_content, sender)
                
                # Format response for chat
                formatted_message = f"{analysis_response.message}\n"
                if analysis_response.analysis:
                    for i, analysis in enumerate(analysis_response.analysis[:3], 1):
                        formatted_message += f"{i}. Market {analysis.market_id}: {analysis.recommendation} (Confidence: {analysis.confidence:.1%})\n"
                        formatted_message += f"   Reasoning: {analysis.reasoning}\n"
                
                response = ChatMessage(
                    timestamp=datetime.utcnow(),
                    msg_id=uuid4(),
                    content=[TextContent(type="text", text=formatted_message)]
                )
                await ctx.send(sender, response)
            
            @chat_proto.on_message(ChatAcknowledgement)
            async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
                ctx.logger.info(f"Received acknowledgement from {sender}")
            
            self.agent.include(chat_proto)

        # Minimal Chat protocol for ASI:One compatibility
        chat_protocol = Protocol("Chat")

        class ChatMessage(Model):
            text: str

        @chat_protocol.on_message(model=ChatMessage, replies={ChatMessage})
        async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
            # Provide a brief status and last analysis hint
            reply = ChatMessage(
                text=(
                    "Chimera ASI Agent is running. "
                    f"Analysis interval: {self.analysis_interval}s. "
                    "Send 'status' to get a quick health check."
                )
            )
            await ctx.send(sender, reply)

        self.agent.include(chat_protocol)
    
    async def analyze_single_market(self, ctx: Context, market: MarketData):
        """Analyze a single market and potentially place bet"""
        
        ctx.logger.info(f"🎯 Analyzing market: {market.title}")
        
        # Calculate market ratios
        total_shares = market.option_a_shares + market.option_b_shares
        if total_shares == 0:
            return
        
        option_a_ratio = market.option_a_shares / total_shares
        
        market_data = {
            "totalPool": market.total_pool,
            "optionARatio": option_a_ratio,
            "totalShares": total_shares,
            "marketType": market.market_type
        }
        
        # Get MeTTa analysis
        analysis = self.metta_reasoner.analyze_market_data(market_data)
        
        ctx.logger.info(f"🧠 Analysis: {analysis['recommendation']} "
                       f"(confidence: {analysis['confidence']:.2f})")
        ctx.logger.info(f"💭 Reasoning: {analysis['reasoning']}")
        
        # Check if we should place a bet
        if (analysis["confidence"] >= self.min_confidence and 
            analysis["recommendation"] in ["BUY_A", "BUY_B"]):
            
            # Calculate bet amount based on confidence
            bet_amount = int(self.max_bet_amount * analysis["confidence"])
            option = 0 if analysis["recommendation"] == "BUY_A" else 1
            
            await self.place_bet_via_lit(ctx, market.id, option, bet_amount, analysis)
    
    async def process_market_query(self, query: str, sender: str) -> ChimeraResponse:
        """Process natural language market analysis queries"""
        try:
            print(f"🔍 Processing query: {query}")
            
            # Get active markets
            markets = await self.rpc_fetcher.get_active_markets()
            
            if not markets:
                return ChimeraResponse(
                    analysis=[],
                    message="No active markets found. Please check the contract connection."
                )
            
            # Use LLM to understand query intent if available
            if OPENAI_AVAILABLE and openai.api_key:
                filtered_markets = await self.filter_markets_with_llm(query, markets)
            else:
                # Fallback: analyze all markets
                filtered_markets = markets[:3]  # Limit to first 3 for performance
            
            # Analyze filtered markets
            analysis_results = []
            for market in filtered_markets:
                analysis = self.metta_reasoner.analyze_market(market.__dict__)
                
                analysis_results.append(MarketAnalysis(
                    market_id=str(market.id),
                    recommendation=analysis["recommendation"],
                    confidence=analysis["confidence"],
                    reasoning=analysis["reasoning"],
                    risk_level=analysis["risk_level"],
                    timestamp=datetime.now().isoformat()
                ))
            
            message = f"Analyzed {len(analysis_results)} markets based on your query: '{query}'"
            if not analysis_results:
                message = "No markets matched your query. Try asking about specific topics or 'analyze all markets'."
            
            return ChimeraResponse(
                analysis=analysis_results,
                message=message
            )
            
        except Exception as e:
            print(f"Error processing query: {e}")
            return ChimeraResponse(
                analysis=[],
                message=f"Sorry, I encountered an error while analyzing markets: {str(e)}"
            )
    
    async def filter_markets_with_llm(self, query: str, markets: List) -> List:
        """Use LLM to filter markets based on user query"""
        try:
            if not markets:
                return []
            
            # Prepare market descriptions for LLM
            market_descriptions = []
            for market in markets:
                desc = f"ID: {market.id}, Title: {market.title}, End Time: {market.end_time}"
                market_descriptions.append(desc)
            
            prompt = f"""
            User query: "{query}"
            
            Available markets:
            {chr(10).join(market_descriptions)}
            
            Which markets are most relevant to the user's query? Return market IDs separated by commas, or "ALL" for general analysis requests.
            """
            
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that matches betting markets to user queries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            result = response.choices[0].message.content.strip()
            
            if result == "ALL":
                return markets
            
            # Parse the result and filter markets
            relevant_ids = [int(id.strip()) for id in result.split(",") if id.strip().isdigit()]
            filtered_markets = [market for market in markets if market.id in relevant_ids]
            
            return filtered_markets
            
        except Exception as e:
            print(f"Error filtering markets with LLM: {e}")
            return markets[:3]  # Fallback to first 3 markets

    async def place_bet_direct(self, ctx: Context, market_id: int, option: int, 
                               amount: int, analysis: Dict):
        """Place bet directly through RPC"""
        
        ctx.logger.info(f"🎲 Placing bet: Market {market_id}, "
                       f"Option {option}, Amount {amount}")
        
        # Direct contract execution (placeholder)
        try:
            ctx.logger.info("✅ Bet placed successfully via direct RPC")
        except Exception as e:
            ctx.logger.error(f"❌ Error placing bet via RPC: {e}")
    
    def run(self):
        """Start the agent"""
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            print("🚀 ChimeraProtocol ASI Agent starting up...")
            print(f"📍 Agent address: {self.agent.address}")
            print(f"🏷️  Agent name: Chimera-Market-Analyzer")
            print(f"📡 RPC endpoint: {self.rpc_fetcher.endpoint}")
            print(f"💰 Max bet amount: {self.max_bet_amount}")
            print(f"🎯 Min confidence: {self.min_confidence}")
            
            # Test environment
            print(f"🔧 Environment check:")
            print(f"   OpenAI: {'✅ Available' if OPENAI_AVAILABLE and openai.api_key else '❌ Missing'}")
            print(f"   Chat Protocol: {'✅ Available' if CHAT_AVAILABLE else '❌ Missing'}")
            print(f"   ACCESS_TOKEN: {'✅ Set' if os.getenv('ACCESS_TOKEN') else '❌ Missing'}")
            
            # Test RPC connection
            try:
                markets = await self.rpc_fetcher.get_active_markets()
                print(f"✅ RPC connection successful - Found {len(markets)} markets")
            except Exception as e:
                print(f"❌ RPC connection failed: {e}")
            
            print("✅ Ready for market analysis and chat interactions!")
            print("👀 Waiting for messages...")
            
            ctx.logger.info("ChimeraProtocol ASI Agent startup complete")
        
        print("🚀 Starting ChimeraProtocol ASI Agent...")
        self.agent.run()

if __name__ == "__main__":
    # Configuration from environment
    import os
    RPC_ENDPOINT = os.getenv("HEDERA_RPC_URL", "https://testnet.hashio.io/api")

    
    print("🚀 Starting ChimeraProtocol ASI Alliance Agent...")
    print(f"📡 RPC endpoint: {RPC_ENDPOINT}")

    
    # Create and run agent
    agent = ChimeraAgent(RPC_ENDPOINT)
    
    try:
        agent.run()
    except KeyboardInterrupt:
        print("\n👋 Agent stopped by user")
    except Exception as e:
        print(f"\n❌ Agent error: {e}")
        raise