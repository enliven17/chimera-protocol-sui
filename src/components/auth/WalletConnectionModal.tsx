'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useZkLogin, Provider } from '@/providers/ZkLoginProvider';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConnectionMethod = 'select' | 'zklogin' | 'sui-wallet';

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const [currentStep, setCurrentStep] = useState<ConnectionMethod>('select');
  const { loginWithProvider, isLoading } = useZkLogin();
  const currentAccount = useCurrentAccount();

  const handleProviderLogin = async (provider: Provider) => {
    await loginWithProvider(provider);
    onClose();
  };



  const getProviderColor = (provider: Provider) => {
    switch (provider) {
      case 'google':
        return 'border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50';
      case 'facebook':
        return 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50';
      case 'twitch':
        return 'border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50';
      default:
        return 'border-gray-500/30 hover:bg-gray-500/10 hover:border-gray-500/50';
    }
  };

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep !== 'select' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('select')}
                  className="p-1 h-8 w-8 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-xl text-white">
                {currentStep === 'select' && 'Connect Wallet'}
                {currentStep === 'zklogin' && 'zkLogin'}
                {currentStep === 'sui-wallet' && 'Sui Wallet'}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Method Selection */}
          {currentStep === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                Choose your preferred connection method
              </p>
              
              {/* zkLogin Option */}
              <div
                onClick={() => setCurrentStep('zklogin')}
                className="w-full h-16 border border-[#4DA6FF]/30 hover:bg-[#4DA6FF]/10 hover:border-[#4DA6FF]/50 flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer transition-all"
              >
                <div className="text-left">
                  <div className="font-semibold text-white">zkLogin</div>
                  <div className="text-xs text-gray-300">Google, Facebook, Twitch</div>
                </div>
                <div className="text-xs bg-[#4DA6FF]/30 text-[#4DA6FF] px-2 py-1 rounded font-medium">
                  Recommended
                </div>
              </div>

              {/* Sui Wallet Option */}
              <div
                onClick={() => setCurrentStep('sui-wallet')}
                className="w-full h-16 border border-gray-700 hover:bg-gray-800/50 hover:border-gray-600 flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer transition-all"
              >
                <div className="text-left">
                  <div className="font-semibold text-white">Sui Wallet</div>
                  <div className="text-xs text-gray-300">Browser extension</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center pt-2">
                Both methods are secure and decentralized
              </div>
            </div>
          )}

          {/* zkLogin Providers */}
          {currentStep === 'zklogin' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                Sign in with your preferred OAuth provider
              </p>
              
              <div className="space-y-3">
                {(['google', 'facebook', 'twitch'] as Provider[]).map((provider) => (
                  <Button
                    key={provider}
                    variant="outline"
                    onClick={() => handleProviderLogin(provider)}
                    disabled={isLoading}
                    className={`w-full h-12 justify-center capitalize bg-gray-900/50 text-white hover:text-white border-gray-700 hover:bg-gray-800/70 ${getProviderColor(provider)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Continue with {provider}</span>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </Button>
                ))}
              </div>

              <div className="bg-[#4DA6FF]/10 border border-[#4DA6FF]/20 rounded-lg p-3 mt-4">
                <div className="text-xs text-gray-300">
                  <div className="font-medium text-[#4DA6FF] mb-1">Zero-Knowledge Privacy</div>
                  Your login credentials are never stored. zkLogin uses cryptographic proofs to verify your identity without exposing personal data.
                </div>
              </div>
            </div>
          )}

          {/* Sui Wallet Connection */}
          {currentStep === 'sui-wallet' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                Connect your Sui wallet extension
              </p>
              
              <div className="flex justify-center">
                <div className="[&>button]:bg-[#4DA6FF] [&>button]:text-white [&>button]:border-[#4DA6FF] [&>button]:hover:bg-[#3B82F6] [&>button]:font-medium">
                  <ConnectButton
                    connectText="Connect Sui Wallet"
                  />
                </div>
              </div>

              {currentAccount && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-sm text-green-400 font-medium">
                    Wallet Connected!
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                  </div>
                </div>
              )}

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 mt-4">
                <div className="text-xs text-gray-300">
                  <div className="font-medium text-gray-200 mb-1">Browser Extension Required</div>
                  Install the official Sui Wallet browser extension to connect. Your private keys remain secure in your local wallet.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}