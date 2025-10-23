// PYUSD Bridge client for Ethereum ↔ Hedera transfers
export class PYUSDBridgeClient {
  private ethBridgeAddress: string;
  private hederaBridgeAddress: string;
  private operatorEndpoint: string;

  constructor() {
    this.ethBridgeAddress = process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDRESS || '';
    this.hederaBridgeAddress = process.env.NEXT_PUBLIC_HEDERA_BRIDGE_ADDRESS || '';
    this.operatorEndpoint = process.env.NEXT_PUBLIC_BRIDGE_OPERATOR_ENDPOINT || 'http://localhost:3002';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.operatorEndpoint}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Bridge API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get bridge status and info
  async getBridgeInfo() {
    return this.makeRequest('/bridge-info');
  }

  // Get bridge statistics
  async getBridgeStats() {
    return this.makeRequest('/bridge-stats');
  }

  // Get transfer history for a user
  async getTransferHistory(userAddress: string, limit = 50) {
    return this.makeRequest(`/transfers?user=${userAddress}&limit=${limit}`);
  }

  // Get pending transfers
  async getPendingTransfers(userAddress?: string) {
    const query = userAddress ? `?user=${userAddress}` : '';
    return this.makeRequest(`/pending-transfers${query}`);
  }

  // Get transfer status by transaction hash
  async getTransferStatus(txHash: string) {
    return this.makeRequest(`/transfer-status/${txHash}`);
  }

  // Initiate bridge transfer (Ethereum → Hedera)
  async initiateBridgeTransfer(params: {
    amount: string;
    hederaAddress: string;
    userAddress: string;
  }) {
    return this.makeRequest('/initiate-transfer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Initiate reverse bridge transfer (Hedera → Ethereum)
  async initiateReverseBridgeTransfer(params: {
    amount: string;
    ethereumAddress: string;
    userAddress: string;
  }) {
    return this.makeRequest('/initiate-reverse-transfer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get bridge fees
  async getBridgeFees() {
    return this.makeRequest('/bridge-fees');
  }

  // Get supported networks
  async getSupportedNetworks() {
    return this.makeRequest('/supported-networks');
  }

  // Get bridge liquidity info
  async getBridgeLiquidity() {
    return this.makeRequest('/bridge-liquidity');
  }

  // Estimate transfer time
  async estimateTransferTime(fromNetwork: string, toNetwork: string) {
    return this.makeRequest(`/estimate-time?from=${fromNetwork}&to=${toNetwork}`);
  }

  // Get bridge operator status
  async getOperatorStatus() {
    return this.makeRequest('/operator-status');
  }

  // Subscribe to transfer updates
  async subscribeToTransferUpdates(userAddress: string, callback: (update: any) => void) {
    // WebSocket connection for real-time updates
    const wsUrl = this.operatorEndpoint.replace('http', 'ws') + '/ws';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🌉 Connected to Bridge WebSocket');
        ws.send(JSON.stringify({
          type: 'subscribe',
          userAddress,
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transfer_update') {
          callback(data.payload);
        }
      };

      ws.onerror = (error) => {
        console.error('Bridge WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect to bridge WebSocket:', error);
      return null;
    }
  }

  // Validate bridge transfer parameters
  async validateTransfer(params: {
    amount: string;
    fromNetwork: string;
    toNetwork: string;
    userAddress: string;
  }) {
    return this.makeRequest('/validate-transfer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get bridge health metrics
  async getBridgeHealth() {
    return this.makeRequest('/health');
  }
}

// Response types
export interface BridgeInfo {
  ethBridgeAddress: string;
  hederaBridgeAddress: string;
  pyusdAddress: string;
  wPyusdAddress: string;
  operatorAddress: string;
  isActive: boolean;
  version: string;
}

export interface BridgeStats {
  totalTransfers: number;
  totalVolume: string;
  ethToHederaVolume: string;
  hederaToEthVolume: string;
  averageTransferTime: number;
  successRate: number;
  activeLiquidity: string;
}

export interface TransferHistory {
  id: string;
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceTxHash: string;
  destinationTxHash?: string;
  createdAt: string;
  completedAt?: string;
  fee: string;
}

export interface PendingTransfer {
  id: string;
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  userAddress: string;
  status: 'waiting_confirmation' | 'processing' | 'waiting_mint';
  sourceTxHash: string;
  estimatedCompletionTime: string;
  currentStep: string;
  totalSteps: number;
}

export interface TransferStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  currentStep: string;
  totalSteps: number;
  estimatedTimeRemaining: number;
  sourceTxHash: string;
  destinationTxHash?: string;
  error?: string;
  updates: {
    timestamp: string;
    step: string;
    message: string;
  }[];
}

export interface BridgeFees {
  ethToHedera: {
    baseFee: string;
    percentageFee: number;
    minFee: string;
    maxFee: string;
  };
  hederaToEth: {
    baseFee: string;
    percentageFee: number;
    minFee: string;
    maxFee: string;
  };
}

export interface BridgeLiquidity {
  ethSide: {
    available: string;
    locked: string;
    total: string;
  };
  hederaSide: {
    available: string;
    minted: string;
    total: string;
  };
  utilizationRate: number;
}

export interface OperatorStatus {
  isOnline: boolean;
  lastHeartbeat: string;
  processedTransfers24h: number;
  averageProcessingTime: number;
  errorRate: number;
  currentLoad: number;
}

// Create singleton instance
export const pyusdBridgeClient = new PYUSDBridgeClient();