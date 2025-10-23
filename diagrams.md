# System Diagrams

## High-Level Architecture
```mermaid
flowchart LR
  subgraph "User Layer"
    U[User]
  end

  subgraph Frontend
    FE["Next.js App"]
  end

  subgraph Agents
    AAI["ASI Agent (uAgents + MeTTa)"]

  end

  subgraph Data

    HS_SCAN["HashScan Explorer"]
  end

  subgraph "On-Chain (Hedera EVM)"
    CP["ChimeraProtocol.sol"]
    PY["PYUSD (wPYUSD)"]
    PO["Pyth Oracle"]
  end

  U -->|"Wallet (Wagmi/RainbowKit)"| FE
  FE -->|"Read Markets & Positions"| CP
  FE -->|"Tx / View"| CP
  FE -->|"Explorer Links"| HS_SCAN

  AAI -->|"Direct Execution"| CP

  CP -->|"Price Feeds"| PO
  CP -->|"ERC20 Ops"| PY
```

## Headless Execution Sequence
```mermaid
sequenceDiagram
  autonumber
  participant AG as ASI Agent

  participant CP as ChimeraProtocol (Hedera)
  participant PY as PYUSD
  participant PO as Pyth Oracle

  AG->>CP: Query active markets (RPC)
  CP-->>AG: Markets, pools, shares
  AG->>AG: MeTTa reasoning (Hyperon)
  AG->>CP: placeBet(marketId, option, amount)
  CP->>PY: transferFrom(user, CP, amount)
  CP-->>AG: BetPlaced event (tx receipt)
  PO-->>CP: Price update (pull/oracle)
  CP-->>CP: Settle market on condition
```

## Components
- Frontend: `Next.js` app (headless optional)
- ASI Agent: uAgents + MeTTa (Hyperon) with fallback

- On-Chain: `ChimeraProtocol.sol`, Pyth Oracle, PYUSD (wPYUSD)
- Observability: HashScan Explorer
