"""
HTTP Server for ASI Agent - Provides REST API endpoints for frontend integration
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import asyncio
import threading
import time
from datetime import datetime
from market_analyzer import ChimeraAgent, MarketAnalysis, ChimeraResponse, StructuredQuery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global agent instance
agent_instance = None
agent_thread = None

def run_agent_in_thread():
    """Run the ASI agent in a separate thread"""
    global agent_instance
    try:
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        rpc_endpoint = os.getenv("HEDERA_RPC_URL", "https://testnet.hashio.io/api")
        agent_instance = ChimeraAgent(rpc_endpoint)
        
        print(f"✅ ASI Agent initialized successfully")
        print(f"📡 Agent address: {agent_instance.agent.address}")
        
        # Keep the thread alive but don't run the full agent
        # (The full agent.run() causes issues in threading)
        while True:
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Error running agent: {e}")
        import traceback
        traceback.print_exc()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if agent_instance else 'starting',
        'timestamp': datetime.now().isoformat(),
        'agent_address': getattr(agent_instance.agent, 'address', None) if agent_instance else None,
        'version': '1.0.0'
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Get agent status"""
    if not agent_instance:
        return jsonify({
            'status': 'starting',
            'message': 'ASI Agent is starting up...'
        }), 503
    
    return jsonify({
        'status': 'online',
        'agent_address': agent_instance.agent.address,
        'agent_name': 'Chimera-Market-Analyzer',
        'capabilities': [
            'market_analysis',
            'betting_recommendations', 
            'contrarian_analysis',
            'chat_interface',
            'metta_reasoning'
        ],
        'configuration': {
            'max_bet_amount': agent_instance.max_bet_amount,
            'min_confidence': agent_instance.min_confidence,
            'analysis_interval': agent_instance.analysis_interval
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """Chat endpoint for natural language interaction"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        conversation_id = data.get('conversationId', 'web-chat')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not agent_instance:
            return jsonify({
                'message': 'ASI Agent is starting up. Please wait a moment and try again.',
                'status': 'starting'
            }), 503
        
        # Process the message (simulate agent response for now)
        response_message = process_chat_message(message)
        
        return jsonify({
            'message': response_message,
            'timestamp': datetime.now().isoformat(),
            'conversation_id': conversation_id
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error processing chat message: {str(e)}',
            'message': 'Sorry, I encountered an error processing your message.'
        }), 500

@app.route('/query', methods=['POST'])
def structured_query():
    """Structured query endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        parameters = data.get('parameters', {})
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        if not agent_instance:
            return jsonify({
                'message': 'ASI Agent is starting up. Please wait a moment and try again.',
                'analysis': [],
                'type': 'error'
            }), 503
        
        # Process structured query
        response = process_structured_query(query, parameters)
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': f'Error processing query: {str(e)}',
            'message': 'Sorry, I encountered an error processing your query.',
            'analysis': [],
            'type': 'error'
        }), 500

@app.route('/analyze-market', methods=['POST'])
def analyze_market():
    """Market analysis endpoint"""
    try:
        market_data = request.get_json()
        
        if not agent_instance:
            return jsonify({'error': 'ASI Agent not available'}), 503
        
        # Simulate market analysis
        analysis = {
            'marketId': market_data.get('marketId'),
            'confidence': 0.75,
            'recommendation': 'optionA',
            'reasoning': 'Based on MeTTa reasoning and contrarian analysis, Option A shows strong potential.',
            'factors': [
                {
                    'name': 'Market Sentiment',
                    'weight': 0.3,
                    'value': 0.8,
                    'description': 'Positive sentiment indicators'
                },
                {
                    'name': 'Volume Analysis',
                    'weight': 0.4,
                    'value': 0.7,
                    'description': 'Strong volume supporting Option A'
                }
            ],
            'riskAssessment': {
                'level': 'medium',
                'factors': ['Market volatility', 'Time remaining']
            },
            'expectedValue': 1.25,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': f'Error analyzing market: {str(e)}'}), 500

@app.route('/betting-recommendation', methods=['POST'])
def betting_recommendation():
    """Betting recommendation endpoint"""
    try:
        data = request.get_json()
        market_id = data.get('marketId')
        user_profile = data.get('userProfile', {})
        
        if not agent_instance:
            return jsonify({'error': 'ASI Agent not available'}), 503
        
        # Simulate betting recommendation
        recommendation = {
            'marketId': market_id,
            'action': 'bet',
            'option': 'optionA',
            'suggestedAmount': 50,
            'confidence': 0.8,
            'reasoning': 'Strong contrarian opportunity detected with favorable risk/reward ratio.',
            'riskWarnings': ['Market closes in 24 hours', 'High volatility expected'],
            'expectedReturn': 1.4,
            'timeframe': '24h'
        }
        
        return jsonify(recommendation)
        
    except Exception as e:
        return jsonify({'error': f'Error generating recommendation: {str(e)}'}), 500

@app.route('/performance', methods=['GET'])
def get_performance():
    """Get agent performance metrics"""
    try:
        timeframe = request.args.get('timeframe', '30d')
        
        # Simulate performance data
        performance = {
            'totalBets': 45,
            'winRate': 67.8,
            'averageReturn': 12.5,
            'totalProfit': 234.50,
            'sharpeRatio': 1.8,
            'maxDrawdown': -8.2,
            'bestStrategies': ['Contrarian Analysis', 'MeTTa Reasoning'],
            'recentPerformance': [
                {'period': '7d', 'winRate': 71.4, 'profit': 45.20},
                {'period': '14d', 'winRate': 69.2, 'profit': 89.10},
                {'period': '30d', 'winRate': 67.8, 'profit': 234.50}
            ]
        }
        
        return jsonify(performance)
        
    except Exception as e:
        return jsonify({'error': f'Error getting performance: {str(e)}'}), 500

def process_chat_message(message: str) -> str:
    """Process chat message and return response"""
    message_lower = message.lower().strip()
    
    print(f"🔍 Processing message: {message}")
    
    # Health check
    if message_lower in ['health', 'status', 'ping']:
        agent_status = "Online" if agent_instance else "Starting"
        return f"🤖 Chimera ASI Agent Status: {agent_status}\n\nI'm ready to help with market analysis! Ask me about markets, betting strategies, or say 'analyze all markets'."
    
    # Market analysis requests
    if any(word in message_lower for word in ['analyze', 'analysis', 'market', 'markets']):
        return """I can analyze markets using MeTTa reasoning and contrarian strategies. Here's what I can do:

🔍 Market Analysis: Deep analysis using logical inference
📊 Contrarian Opportunities: Find markets with crowd bias
🎯 Betting Recommendations: Personalized suggestions based on your profile
📈 Performance Tracking: Monitor success rates and returns

Try asking:
• "analyze market 1"
• "what markets should I bet on?"
• "show me contrarian opportunities"
• "what's your win rate?"

Currently monitoring 3 active markets with 67.8% win rate."""
    
    # Recommendations
    if any(word in message_lower for word in ['recommend', 'suggestion', 'bet', 'should']):
        return """Based on my MeTTa reasoning analysis, here are my current recommendations:

🎯 **Market 1**: BTC Price > $150k by Dec 2024
   • Recommendation: Option A (Yes) 
   • Confidence: 75%
   • Reasoning: Strong contrarian opportunity, crowd is overly pessimistic

⚠️ **Risk Level**: Medium
💰 **Suggested Amount**: $50-100 (based on your profile)
⏰ **Time Horizon**: 30 days

Would you like detailed analysis on any specific market?"""
    
    # Crypto markets
    if any(word in message_lower for word in ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth']):
        return """🔍 **Crypto Market Analysis**

Currently tracking 2 crypto prediction markets:

1. **BTC > $150k by Dec 2024**
   • Current odds: 45% Yes / 55% No
   • My analysis: 75% confidence for Yes
   • Contrarian opportunity detected

2. **ETH > $10k by Q1 2025** 
   • Current odds: 38% Yes / 62% No
   • My analysis: 62% confidence for Yes
   • Moderate opportunity

💡 **Strategy**: Both markets show contrarian potential with crowd being overly bearish on crypto prices."""
    
    # General help
    if message_lower in ['help', 'what can you do', 'commands']:
        return """🤖 **Chimera ASI Agent Capabilities**

I'm an autonomous reasoning agent using MeTTa logic and contrarian analysis:

**Market Analysis**:
• Deep market analysis using logical inference
• Contrarian opportunity detection
• Risk assessment and probability calculations

**Betting Intelligence**:
• Personalized recommendations
• Optimal bet sizing
• Risk-adjusted returns

**Real-time Monitoring**:
• Continuous market surveillance
• Performance tracking
• Strategy optimization

**Chat Commands**:
• "analyze markets" - Get market overview
• "recommend" - Get betting suggestions  
• "crypto markets" - Focus on crypto predictions
• "performance" - See my track record
• "health" - Check my status

Ask me anything about prediction markets!"""
    
    # Default response
    return f"""I received your message: "{message}"

I'm the Chimera ASI Agent, specialized in prediction market analysis using MeTTa reasoning. I can help you with:

• Market analysis and recommendations
• Contrarian betting opportunities  
• Risk assessment and strategy
• Performance tracking

Try asking me about specific markets or say "help" for more options."""

def process_structured_query(query: str, parameters: dict) -> dict:
    """Process structured query and return analysis"""
    
    # Simulate market analysis based on query
    if 'market' in query.lower() or 'analyze' in query.lower():
        analysis = [
            {
                'market_id': '1',
                'recommendation': 'BUY_A',
                'confidence': 0.75,
                'reasoning': 'MeTTa reasoning indicates strong contrarian opportunity for Option A',
                'risk_level': 'medium',
                'timestamp': datetime.now().isoformat()
            },
            {
                'market_id': '2', 
                'recommendation': 'BUY_B',
                'confidence': 0.68,
                'reasoning': 'Volume analysis suggests Option B is undervalued by the crowd',
                'risk_level': 'low',
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        return {
            'message': f'Analyzed markets based on query: "{query}"',
            'analysis': analysis,
            'type': 'market_analysis'
        }
    
    return {
        'message': f'Processed query: "{query}"',
        'analysis': [],
        'type': 'general_response'
    }

if __name__ == '__main__':
    print("🚀 Starting ASI Agent HTTP Server...")
    
    # Start the agent in a separate thread
    agent_thread = threading.Thread(target=run_agent_in_thread, daemon=True)
    agent_thread.start()
    
    # Give the agent a moment to initialize
    time.sleep(2)
    
    print("🌐 HTTP Server starting on http://localhost:8001")
    print("📡 Endpoints available:")
    print("   GET  /health - Health check")
    print("   GET  /status - Agent status")
    print("   POST /chat - Natural language chat")
    print("   POST /query - Structured queries")
    print("   POST /analyze-market - Market analysis")
    print("   POST /betting-recommendation - Betting advice")
    print("   GET  /performance - Performance metrics")
    
    # Run Flask server
    app.run(host='0.0.0.0', port=8001, debug=False)