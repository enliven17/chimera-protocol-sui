'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LogIn, 
  LogOut, 
  User, 
  Loader2,
  Chrome,
  Facebook,
  Twitch
} from 'lucide-react';
import { useZkLogin, Provider } from '@/providers/ZkLoginProvider';

interface ZkLoginButtonProps {
  className?: string;
}

export function ZkLoginButton({ className }: ZkLoginButtonProps) {
  const {
    isAuthenticated,
    userInfo,
    suiAddress,
    isLoading,
    loginWithProvider,
    logout,
  } = useZkLogin();

  const [showProviders, setShowProviders] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showProviders && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showProviders]);

  const handleProviderLogin = async (provider: Provider) => {
    setShowProviders(false);
    await loginWithProvider(provider);
  };

  const getProviderIcon = (provider: Provider) => {
    switch (provider) {
      case 'google':
        return <Chrome className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitch':
        return <Twitch className="h-4 w-4" />;
      default:
        return <LogIn className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: Provider) => {
    switch (provider) {
      case 'google':
        return 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30';
      case 'facebook':
        return 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30';
      case 'twitch':
        return 'hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30';
      default:
        return 'hover:bg-gray-500/10 hover:text-gray-400 hover:border-gray-500/30';
    }
  };

  if (isAuthenticated && userInfo && suiAddress) {
    return (
      <>
        <div ref={buttonRef} className={`relative ${className}`}>
          <Button
            variant="outline"
            onClick={() => setShowProviders(!showProviders)}
            className="flex items-center gap-2 border-[#4DA6FF]/30 text-[#4DA6FF] hover:bg-[#4DA6FF]/10"
          >
            {userInfo.picture ? (
              <img
                src={userInfo.picture}
                alt={userInfo.name || 'User'}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {userInfo.name || userInfo.email || 'User'}
            </span>
            <span className="text-xs text-gray-400">
              {suiAddress.slice(0, 6)}...{suiAddress.slice(-4)}
            </span>
          </Button>
        </div>

        {showProviders && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setShowProviders(false)}>
            <Card 
              className="absolute bg-[#1A1F2C] border-gray-800/50 shadow-xl min-w-[200px]"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              <CardContent className="p-2" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-800/50">
                    Signed in with {userInfo.provider}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      <div ref={buttonRef} className={`relative ${className}`}>
        <Button
          onClick={() => setShowProviders(!showProviders)}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isLoading ? 'Connecting...' : 'zkLogin'}
        </Button>
      </div>

      {showProviders && !isLoading && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={() => setShowProviders(false)}>
          <Card 
            className="absolute bg-[#1A1F2C] border-gray-800/50 shadow-xl min-w-[200px]"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
          >
            <CardContent className="p-2" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-800/50 mb-2">
                  Sign in with
                </div>
                
                {(['google', 'facebook', 'twitch'] as Provider[]).map((provider) => (
                  <Button
                    key={provider}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleProviderLogin(provider)}
                    className={`w-full justify-start capitalize ${getProviderColor(provider)}`}
                  >
                    {getProviderIcon(provider)}
                    <span className="ml-2">{provider}</span>
                  </Button>
                ))}
                
                <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-800/50 mt-2">
                  Secure authentication with zero-knowledge proofs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}