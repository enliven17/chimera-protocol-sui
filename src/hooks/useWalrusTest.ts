import { useState, useCallback } from 'react';
import { walrusClient } from '@/lib/walrus-client';

export interface WalrusTestResult {
  success: boolean;
  blobId?: string;
  data?: any;
  error?: string;
  size?: number;
  cost?: number;
}

export function useWalrusTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalrusTestResult | null>(null);

  const testStore = useCallback(async (data: any): Promise<WalrusTestResult> => {
    setLoading(true);
    setResult(null);

    try {
      const blob = await walrusClient.storeBlob(data);
      const testResult: WalrusTestResult = {
        success: true,
        blobId: blob.blobId,
        size: blob.size,
        cost: blob.cost
      };
      setResult(testResult);
      return testResult;
    } catch (error) {
      const testResult: WalrusTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setResult(testResult);
      return testResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const testRetrieve = useCallback(async (blobId: string): Promise<WalrusTestResult> => {
    setLoading(true);
    setResult(null);

    try {
      const data = await walrusClient.retrieveBlob(blobId);
      const testResult: WalrusTestResult = {
        success: true,
        data,
        blobId
      };
      setResult(testResult);
      return testResult;
    } catch (error) {
      const testResult: WalrusTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        blobId
      };
      setResult(testResult);
      return testResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const testExists = useCallback(async (blobId: string): Promise<boolean> => {
    try {
      return await walrusClient.blobExists(blobId);
    } catch (error) {
      console.error('Test exists failed:', error);
      return false;
    }
  }, []);

  const testStatus = useCallback(async () => {
    try {
      const httpApiAvailable = await walrusClient.isHttpApiAvailable();
      return {
        httpApiAvailable,
        mockMode: walrusClient['mockMode'],
        status: httpApiAvailable ? 'online' : 'mock'
      };
    } catch (error) {
      console.error('Test status failed:', error);
      return {
        httpApiAvailable: false,
        mockMode: true,
        status: 'error'
      };
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    loading,
    result,
    testStore,
    testRetrieve,
    testExists,
    testStatus,
    clearResult
  };
}







