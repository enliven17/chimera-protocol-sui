// Hedera EVM Smart Contract Interface
export const PREDICTION_MARKET_ABI = [
  // Market Management
  {
    "inputs": [
      {"name": "_title", "type": "string"},
      {"name": "_description", "type": "string"},
      {"name": "_optionA", "type": "string"},
      {"name": "_optionB", "type": "string"},
      {"name": "_category", "type": "uint8"},
      {"name": "_endTime", "type": "uint256"},
      {"name": "_minBet", "type": "uint256"},
      {"name": "_maxBet", "type": "uint256"},
      {"name": "_imageUrl", "type": "string"}
    ],
    "name": "createMarket",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Betting Functions
  {
    "inputs": [
      {"name": "_marketId", "type": "uint256"},
      {"name": "_option", "type": "uint8"}
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  
  // Admin Functions
  {
    "inputs": [
      {"name": "_marketId", "type": "uint256"},
      {"name": "_outcome", "type": "uint8"}
    ],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Claim Winnings
  {
    "inputs": [{"name": "_marketId", "type": "uint256"}],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // View Functions
  {
    "inputs": [{"name": "_marketId", "type": "uint256"}],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "optionA", "type": "string"},
          {"name": "optionB", "type": "string"},
          {"name": "category", "type": "uint8"},
          {"name": "creator", "type": "address"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "endTime", "type": "uint256"},
          {"name": "minBet", "type": "uint256"},
          {"name": "maxBet", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "outcome", "type": "uint8"},
          {"name": "resolved", "type": "bool"},
          {"name": "totalOptionAShares", "type": "uint256"},
          {"name": "totalOptionBShares", "type": "uint256"},
          {"name": "totalPool", "type": "uint256"},
          {"name": "imageUrl", "type": "string"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [],
    "name": "getAllMarkets",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "optionA", "type": "string"},
          {"name": "optionB", "type": "string"},
          {"name": "category", "type": "uint8"},
          {"name": "creator", "type": "address"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "endTime", "type": "uint256"},
          {"name": "minBet", "type": "uint256"},
          {"name": "maxBet", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "outcome", "type": "uint8"},
          {"name": "resolved", "type": "bool"},
          {"name": "totalOptionAShares", "type": "uint256"},
          {"name": "totalOptionBShares", "type": "uint256"},
          {"name": "totalPool", "type": "uint256"},
          {"name": "imageUrl", "type": "string"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [],
    "name": "getActiveMarkets",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "optionA", "type": "string"},
          {"name": "optionB", "type": "string"},
          {"name": "category", "type": "uint8"},
          {"name": "creator", "type": "address"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "endTime", "type": "uint256"},
          {"name": "minBet", "type": "uint256"},
          {"name": "maxBet", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "outcome", "type": "uint8"},
          {"name": "resolved", "type": "bool"},
          {"name": "totalOptionAShares", "type": "uint256"},
          {"name": "totalOptionBShares", "type": "uint256"},
          {"name": "totalPool", "type": "uint256"},
          {"name": "imageUrl", "type": "string"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_marketId", "type": "uint256"}
    ],
    "name": "getUserPosition",
    "outputs": [
      {
        "components": [
          {"name": "optionAShares", "type": "uint256"},
          {"name": "optionBShares", "type": "uint256"},
          {"name": "totalInvested", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "marketId", "type": "uint256"},
      {"indexed": false, "name": "title", "type": "string"},
      {"indexed": true, "name": "creator", "type": "address"}
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "marketId", "type": "uint256"},
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "option", "type": "uint8"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "shares", "type": "uint256"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "marketId", "type": "uint256"},
      {"indexed": false, "name": "outcome", "type": "uint8"},
      {"indexed": true, "name": "resolver", "type": "address"}
    ],
    "name": "MarketResolved",
    "type": "event"
  }
] as const;

export const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_CHIMERAAI_CONTRACT as `0x${string}`;
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as `0x${string}`;