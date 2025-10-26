# System Architecture and Flow Diagrams

This document visualizes the project's system architecture, data flows, and component relationships using Mermaid diagrams.

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Markets Page] --> B[Market Cards]
        B --> C[Bet Dialog]
        A --> D[Dashboard]
        E[Auth Components] --> F[ZkLogin]
        E --> G[Wallet Connection]
        H[Floating Chatbot] --> I[Gemini Market Chat]
    end
    
    subgraph "API Routes"
        J[Market Analysis API] --> K[Gemini AI]
        L[Walrus Storage API] --> M[Walrus CLI]
        N[Auth APIs] --> O[ZkLogin Prove/Callback]
        P[Comments API] --> Q[Walrus Comments]
    end
    
    subgraph "External Services"
        R[Sui Blockchain] --> S[Smart Contracts]
        T[Walrus Storage Network]
        U[Supabase Database]
        V[Gemini AI Service]
    end
    
    A --> J
    C --> R
    L --> T
    N --> U
    J --> V
    P --> T
    
    style A fill:#e1f5fe
    style R fill:#f3e5f5
    style T fill:#e8f5e8
    style U fill:#fff3e0
    style V fill:#fce4ec
```

## 2. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant S as Sui Wallet
    participant Z as ZkLogin Service
    
    U->>F: Connect Wallet
    F->>S: Connection Request
    S->>F: Wallet Connected
    
    alt ZkLogin Flow
        U->>F: Choose ZkLogin
        F->>A: Initiate ZkLogin
        A->>Z: Generate Proof
        Z->>A: Return JWT
        A->>F: Authentication Success
    else Direct Wallet
        F->>S: Sign Message
        S->>F: Signature
        F->>A: Verify Signature
        A->>F: Authentication Success
    end
```

## 3. Walrus Storage Integration

```mermaid
graph LR
    subgraph "Application Layer"
        A[useWalrusStorage Hook] --> B[Walrus Client]
        C[Comments Service] --> B
        D[Market Data] --> B
        E[Walrus Status Component] --> B
    end
    
    subgraph "API Layer"
        B --> F[Store API Route]
        B --> G[Retrieve API Route]
        B --> H[CLI Store Route]
        B --> I[CLI Retrieve Route]
    end
    
    subgraph "Walrus Network"
        F --> J[Walrus Storage]
        G --> J
        H --> K[Walrus CLI]
        I --> K
        K --> J
    end
    
    style J fill:#e8f5e8
    style K fill:#f0f0f0
```

## 4. Market Betting Flow

```mermaid
stateDiagram-v2
    [*] --> ViewMarkets
    ViewMarkets --> SelectMarket
    SelectMarket --> ConnectWallet
    ConnectWallet --> PlaceBet
    PlaceBet --> ConfirmTransaction
    ConfirmTransaction --> TransactionPending
    TransactionPending --> TransactionSuccess
    TransactionPending --> TransactionFailed
    TransactionSuccess --> UpdateUI
    TransactionFailed --> RetryTransaction
    RetryTransaction --> PlaceBet
    UpdateUI --> ViewMarkets
    
    note right of ConnectWallet
        Supported wallet types:
        - Sui Wallet
        - ZkLogin
        - Unified Wallet
    end note
```

## 5. Component Relationships

```mermaid
graph TD
    subgraph "Providers"
        A[SuiWalletProvider] --> B[ZkLoginProvider]
    end
    
    subgraph "Pages"
        C[Markets Page] --> D[Dashboard]
        E[Auth Callback Page]
    end
    
    subgraph "Components"
        F[Header] --> G[Wallet Buttons]
        G --> H[UnifiedWalletButton]
        G --> I[SuiWalletButton]
        G --> J[ZkLoginButton]
        
        K[Market Components] --> L[SuiMarketCard]
        L --> M[Sui Bet Dialog]
        
        N[Shared Components] --> O[Floating Chatbot]
        N --> P[Walrus Status]
        N --> Q[Gemini Market Chat]
    end
    
    subgraph "Hooks"
        R[useWalrusStorage] --> S[useWalrusComments]
        T[use-user-bets]
    end
    
    A --> G
    B --> J
    C --> K
    K --> R
    K --> T
    O --> Q
```

## 6. Data Flow

```mermaid
flowchart LR
    subgraph "User Interaction"
        A[View Markets] --> B[Place Bet]
        B --> C[Add Comment]
        C --> D[Request AI Analysis]
    end
    
    subgraph "Data Processing"
        B --> E[Sui Blockchain]
        C --> F[Walrus Storage]
        D --> G[Gemini AI]
    end
    
    subgraph "Data Storage"
        E --> H[Smart Contracts]
        F --> I[Distributed Storage]
        G --> J[Analysis Results]
    end
    
    H --> K[Update UI]
    I --> K
    J --> K
    K --> A
```

## 7. Smart Contract Interaction

```mermaid
sequenceDiagram
    participant U as User Interface
    participant W as Wallet
    participant S as Sui Network
    participant PM as Prediction Market Contract
    participant WS as Walrus Storage Contract
    
    U->>W: Place Bet Request
    W->>S: Send Transaction
    S->>PM: execute_bet()
    PM->>PM: Validate Bet
    PM->>S: Emit Event
    S->>U: Transaction Confirmation
    
    U->>W: Store Data Request
    W->>S: Storage Transaction
    S->>WS: store_data()
    WS->>WS: Hash Data
    WS->>S: Storage Event
    S->>U: Storage Confirmation
```

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development] --> B[Next.js Dev Server]
        A --> C[Sui Local Network]
        A --> D[Walrus Testnet]
    end
    
    subgraph "Production"
        E[Vercel Deployment] --> F[Next.js App]
        F --> G[Sui Mainnet]
        F --> H[Walrus Mainnet]
        F --> I[Supabase Production]
    end
    
    subgraph "CI/CD"
        J[GitHub Repository] --> K[Vercel Auto Deploy]
        J --> L[Sui Contract Deploy Script]
    end
    
    K --> E
    L --> G
```

## Notes

- **Sui Blockchain**: Main blockchain network where smart contracts run
- **Walrus Storage**: Distributed storage network for large data
- **ZkLogin**: Privacy-focused authentication system
- **Gemini AI**: AI service for market analysis and chatbot
- **Vercel**: Frontend hosting and deployment platform

These diagrams are designed to help understand the project's complex structure and facilitate new developers' adaptation to the system.