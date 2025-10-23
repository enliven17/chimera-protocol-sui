export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  chainId?: number;
}

export interface TransactionStatus {
  status: 'pending' | 'success' | 'failed';
  txId: string;
  errorMessage?: string;
  blockHeight?: number;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value?: string;
  gasLimit?: number;
}

export interface ContractEvent {
  name: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
}