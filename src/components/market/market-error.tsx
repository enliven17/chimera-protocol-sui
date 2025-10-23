import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketErrorProps {
  error: string;
  onRetry: () => void;
}

export const MarketError: React.FC<MarketErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <TrendingUp className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to load markets
        </h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>
    </div>
  );
};