# ChimeraAI 🔮

An AI-powered prediction market platform on Hedera EVM with autonomous agents, Pyth Oracle integration, and PYUSD betting. Features ASI Alliance reasoning agents for intelligent, automated trading strategies and seamless cross-chain PYUSD bridging.

## 🎯 Deployed Contracts (Hedera Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| **ChimeraProtocol** | `0xeF2E2B87A82c10F68183f7654784eEbFeC160b44` | ✅ Deployed & Verified |
| **wPYUSD** | `0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4` | ✅ Deployed & Working |
| **Pyth Oracle** | `0xa2aa501b19aff244d90cc15a4cf739d2725b5729` | ✅ Integrated & Tested |
| **PYUSD Bridge** | Cross-chain bridge system | ✅ Frontend Integration Complete |

## 🎯 Project Overview

ChimeraAI combines cutting-edge AI agents with decentralized prediction markets to create an autonomous, intelligent betting ecosystem. The platform leverages multiple sponsor technologies to deliver a comprehensive solution for AI-driven market predictions.

### 🏆 Sponsor Integrations

| Sponsor | Integration | Prize Track |
|---------|-------------|-------------|
| **ASI Alliance** | MeTTa reasoning agents for market analysis | AI Agent Integration |

| **Direct RPC** | Direct contract calls for real-time data | Data Infrastructure |
| **Pyth Network** | Oracle price feeds for price markets | Oracle Integration |


## 🚀 Platform Features

### 🌉 PYUSD Bridge (NEW!)
**Complete cross-chain bridge interface for seamless PYUSD transfers:**
- **Ethereum Sepolia → Hedera Testnet** bridge integration
- **RainbowKit Integration** for wallet connection and network switching
- **Real-time Balance Display** and transaction status
- **Automated Destination Address** using connected wallet
- **Bridge Fee Calculation** (0.1%) and estimated completion time (2-5 minutes)
- **Step-by-step Process**: Approval → Bridge → Success with visual feedback
- **Direct Integration** with prediction markets for immediate betting

### 📊 System Dashboard
- Real-time monitoring of all ecosystem components
- ASI Agent performance metrics and chat interface
- System security status and health monitoring
- Bridge statistics and cross-chain transfer analytics
- Live price feeds from Pyth Network integration

### 🧠 Market Intelligence & AI Agents
- **ASI Alliance Integration** with MeTTa reasoning for market analysis
- **Interactive Chat Interface** for natural language market queries
- **Agent Delegation System** for autonomous betting strategies
- **Sentiment Analysis** from multiple data sources
- **Risk Assessment** and intelligent betting recommendations
- **Real-time Price Monitoring** and condition analysis

### 🎯 Prediction Markets
- **Price Direction Markets** with Pyth Oracle integration
- **Custom Event Markets** with manual resolution
- **Real-time Betting Interface** with PYUSD integration
- **Market Creation Tools** for community-driven predictions
- **Live Market Analytics** and betting statistics

### 🔐 Enhanced Security & Infrastructure
- **Direct RPC Integration** for real-time blockchain data
- **Secure Transaction Validation** and execution
- **Comprehensive Audit Trail** for all operations
- **Emergency Stop Mechanisms** and safety controls

## 🛠️ Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js App]
        SD[System Dashboard]
        MI[Market Intelligence]
        BR[PYUSD Bridge Interface]
        MK[Markets & Betting]
    end

    subgraph "AI Layer"
        ASI[ASI Alliance Agent]
        CHAT[Chat Interface]
        AGENT[Agent Delegation]
    end

    subgraph "Cross-Chain Layer"
        ETH[Ethereum Sepolia]
        BRIDGE[PYUSD Bridge]
        HED[Hedera Testnet]
    end

    subgraph "Data Layer"
        RPC[Direct RPC Calls]
        PYT[Pyth Oracle]
        RK[RainbowKit]
    end

    subgraph "Blockchain Layer"
        CP[ChimeraProtocol]
        PYUSD[wPYUSD Token]
        WALLET[Multi-Chain Wallets]
    end

    FE --> SD
    FE --> MI
    FE --> BR
    FE --> MK
    
    SD --> ASI
    SD --> CHAT
    SD --> RPC
    
    MI --> ASI
    MI --> AGENT
    MI --> RPC
    MI --> PYT
    
    BR --> RK
    BR --> BRIDGE
    BR --> ETH
    BR --> HED
    
    MK --> CP
    MK --> PYUSD
    MK --> WALLET
    
    ASI --> CP
    AGENT --> CP
    CP --> PYUSD
    CP --> PYT
    
    RPC --> CP
    RK --> WALLET
```
| **ASI Alliance** | MeTTa reasoning with direct contract analysis | 🚀 Best use of Artificial Superintelligence Alliance |
| **Hedera** | EVM contracts + Agent Kit integration | EVM Innovator Track + Best Use of Hedera Agent Kit |
| **Pyth Network** | Pull Oracle for market resolution | ⛓️ Most Innovative use of Pyth pull oracle |
| **PayPal USD** | Wrapped PYUSD as betting currency | 🥇 Grand Prize / 🎖️ PYUSD Consumer Champion |


## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ASI Alliance  │    │     Hedera      │
│   (Reasoning)   │────│   (Blockchain)  │
│                 │    │                 │
│ • MeTTa Logic   │    │ • EVM Contracts │
│ • Market Analysis│    │ • Agent Kit     │
│ • Strategy AI   │    │ • Low Fees      │ 
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    │    ┌─────────────────┐
         │   Direct RPC    │    │    │      Pyth       │
         │   (Ethers.js)   │────┼────│    (Oracle)     │
         │                 │    │    │                 │
         │ • Contract Calls│    │    │ • Price Feeds   │
         │ • Real-time Data│    │    │ • Pull Oracle   │
         │ • No Indexing   │    │    │ • Market Data   │
         └─────────────────┘    │    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │      PYUSD      │
                    │   (Currency)    │
                    │                 │
                    │ • Wrapped Token │
                    │ • ERC-20 Compat │
                    │ • Bridge System │a
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn
- **MetaMask or compatible wallet** with:
  - Ethereum Sepolia testnet (for PYUSD bridging)
  - Hedera Testnet (for prediction markets)
- **Test Tokens:**
  - Sepolia ETH (for gas fees)
  - Hedera HBAR (for transactions)
  - PYUSD on Sepolia (for bridging)
- **Python 3.8+** (for ASI agent)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/your-repo/chimeraai
cd chimeraai
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (for RainbowKit)
# - HEDERA_RPC_URL (Hedera testnet RPC)
# - ASI agent configuration
```

3. **Setup wallet networks:**
```bash
# Add Ethereum Sepolia (Chain ID: 11155111)
# Add Hedera Testnet (Chain ID: 296)
# Configure RainbowKit for multi-chain support
```

## 🧪 Headless Run (No Demo UI)

Run ASI Agent locally without any UI.

```powershell
# Start ASI Agent with HTTP Server (Windows PowerShell)
npm run start:asi-http

# Or start ASI Agent in mailbox mode
npm run start:asi-headless
```

Notes:
- Hyperon MeTTa is optional; if not installed, the agent falls back to heuristic logic.
- Agentverse/ASI:One registration is not required for headless mode.



## 📡 Direct RPC Integration

### Ethers.js Contract Calls
- Direct contract interaction without indexing:
  1. Uses Hedera Testnet RPC endpoint
  2. Real-time contract state reading
  3. No external dependencies or indexing delays
  4. Efficient for read-only operations

Environment variables (Windows PowerShell):
```powershell
$env:HEDERA_RPC_URL = "https://testnet.hashio.io/api"
```

Used by:
- ASI Agent: `agents/asi-agent/market_analyzer.py`
- Frontend: `src/hooks/useDirectContract.ts`

### Contract Integration
Access ChimeraProtocol data directly:

```powershell
$env:HEDERA_RPC_URL = "https://testnet.hashio.io/api"
$env:CHIMERA_CONTRACT_ADDRESS = "0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644"
npm run test:frontend
```

3. **Deploy contracts:**
```bash
npm run compile
npm run deploy:hedera-testnet
```

4. **Start the platform:**
```bash
# Frontend (includes bridge interface)
npm run dev

# ASI Agent with HTTP server
npm run start:asi-http

# Or ASI Agent in headless mode
npm run start:asi-headless

# Test bridge functionality
npm run test:bridge

# Test full integration
npm run test:integration
```

## 🌉 Using the PYUSD Bridge

### Step-by-Step Bridge Process

1. **Connect Wallet**: Use RainbowKit to connect MetaMask or compatible wallet
2. **Switch to Sepolia**: Ensure you're on Ethereum Sepolia network
3. **Enter Amount**: Specify PYUSD amount to bridge (minimum fees apply)
4. **Automatic Destination**: Your connected wallet address is used as destination
5. **Approve & Bridge**: Two-step process with visual feedback
6. **Receive wPYUSD**: Get wrapped PYUSD on Hedera for betting

### Bridge Features
- **0.1% Bridge Fee** with transparent calculation
- **2-5 minute processing time** with real-time status
- **Automatic network detection** and switching prompts
- **Balance validation** and insufficient funds warnings
- **Direct integration** with prediction markets

## 🔧 Core Components

### 1. Smart Contracts (Hedera EVM)

**ChimeraAI.sol** - Main prediction market contract with:
- PYUSD integration for betting
- Pyth Oracle for price-based market resolution
- Agent delegation system for autonomous betting
- Market creation and management
- Automated reward distribution

### 2. ASI Alliance Agent

**market_analyzer.py** - Enhanced intelligent market analysis agent:
- **Mailbox Agent**: Agentverse integration for remote communication
- **Chat Protocol**: Natural language interaction support
- **MeTTa Reasoning**: Advanced logic-based market analysis
- **Rate Limiting**: Prevents spam and ensures fair usage
- **OpenAI Integration**: Intelligent query processing and market filtering
- **Multi-Protocol Support**: Structured queries and chat messages
- **Direct RPC**: Real-time market data from Hedera contracts
- Implements contrarian betting strategies
- Executes trades directly via RPC


- Enforces spending limits and permissions
- Provides audit trail for all actions

### 4. Direct RPC Integration

Real-time blockchain data access:
- Direct contract calls via Ethers.js
- No indexing delays or external dependencies
- Real-time market state reading
- Efficient and reliable data access

### 5. Frontend (Next.js)

Modern web interface for:
- Market browsing and creation
- Manual betting and position management
- Agent delegation and configuration
- Real-time market data visualization

## 📊 Market Types

### Price Direction Markets
- **Oracle Integration:** Pyth Network price feeds
- **Resolution:** Automatic via price data
- **Examples:** "Will BTC be above $50k by Friday?"

### Custom Event Markets
- **Resolution:** Manual by market creator
- **Examples:** "Will it rain tomorrow?", "Who will win the election?"

## 🤖 AI Agent System

### ASI Alliance Integration
- **MeTTa Reasoning:** Advanced logical inference for market analysis
- **Data Sources:** Direct RPC calls + external sentiment
- **Strategies:** Contrarian betting, volume analysis, trend following


- **Permission Management:** Granular control over agent capabilities

## 🔗 Network Information

### Hedera Testnet
- **Chain ID:** 296
- **RPC:** https://testnet.hashio.io/api
- **Explorer:** https://hashscan.io/testnet
- **Currency:** HBAR

### Contract Addresses
- **ChimeraAI:** `TBD` (after deployment)
- **Wrapped PYUSD:** `0x95bc083e6911DeBc46b36cDCE8996fAEB28bf9A6`
- **Pyth Oracle:** `0x2880aB155794e7179c9eE2e38200202908C17B43`

## 🛠️ Development

### Available Scripts

```bash
# Frontend & Bridge
npm run dev                  # Start development server with bridge
npm run build               # Build for production
npm run start               # Start production server

# Smart Contracts
npm run compile              # Compile contracts
npm run deploy:hedera-testnet # Deploy to Hedera testnet
npm run test                 # Run contract tests

# ASI Agents
npm run start:asi-http       # Start ASI agent with HTTP server
npm run start:asi-headless   # Start ASI agent in headless mode
cd agents/asi-agent && python market_analyzer.py    # Manual agent start

# Bridge & Integration Testing
npm run test:bridge          # Test PYUSD bridge functionality
npm run test:frontend       # Test direct contract calls
npm run test:integration    # Full system integration tests
npm run debug:frontend      # Debug contract integration

# Cross-Chain Testing
npm run test:sepolia        # Test Ethereum Sepolia integration
npm run test:hedera         # Test Hedera testnet integration
```

### Testing

```bash
# Contract tests
npm run test

# Agent tests
cd agents/asi-agent && python -m pytest tests/

# Integration tests
npm run test:integration
```

## 📈 Usage Examples

### 1. Bridge PYUSD from Ethereum to Hedera

```javascript
// Frontend bridge interface handles this automatically
// User connects wallet → selects amount → approves → bridges
// Result: wPYUSD available on Hedera for betting
```

### 2. Create a Price Market

```javascript
await chimeraContract.createMarket(
  "BTC Price Prediction",
  "Will Bitcoin be above $50,000 on Friday?",
  "Above $50k",
  "Below $50k",
  1, // category
  endTime,
  minBet,
  maxBet,
  imageUrl,
  0, // PriceDirection market
  btcPriceId, // Pyth price ID
  5000000000000, // $50k (scaled by 1e8)
  true // betting price will be above
);
```

### 3. Interact with ASI Agent

```javascript
// Chat with agent via frontend interface
// Natural language: "What markets should I bet on?"
// Agent analyzes markets and provides recommendations

// Or delegate betting authority
await chimeraContract.delegateToAgent(
  agentAddress,
  ethers.parseUnits("100", 6) // Max 100 PYUSD per bet
);
```

### 4. Manual Betting with wPYUSD

```javascript
// After bridging PYUSD to Hedera:
// Approve wPYUSD
await pyusdContract.approve(chimeraAddress, betAmount);

// Place bet
await chimeraContract.placeBet(marketId, option, betAmount);
```

## 🔒 Security Features

- **Agent Delegation:** Users maintain full control over agent permissions
- **Spending Limits:** Configurable maximum bet amounts per agent
- **Audit Trail:** All agent actions logged and verifiable
- **Oracle Security:** Pyth Network's secure price feed validation
- **Contract Verification:** All contracts verified on Hashscan

## 🌟 Key Features

- ✅ **Cross-Chain PYUSD Bridge:** Seamless Ethereum ↔ Hedera transfers
- ✅ **AI-Powered Predictions:** ASI Alliance MeTTa reasoning with chat interface
- ✅ **Multi-Chain Wallet Support:** RainbowKit integration with network switching
- ✅ **Real-time Agent Interaction:** HTTP server for live AI communication
- ✅ **Oracle Integration:** Pyth Network price feeds for market resolution
- ✅ **Stable Currency Betting:** PYUSD/wPYUSD with automatic bridging
- ✅ **Agent Delegation System:** Autonomous betting with user-controlled limits
- ✅ **Low Fees:** Hedera EVM efficiency for cost-effective trading
- ✅ **Full Transparency:** On-chain verification and comprehensive audit trails
- ✅ **Modern UI/UX:** Responsive design with real-time status updates

## 📞 Support

- **Documentation:** [Link to docs]
- **Discord:** [Community link]
- **GitHub Issues:** [Issues link]
- **Email:** support@chimeraai.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the future of AI-powered prediction markets**
