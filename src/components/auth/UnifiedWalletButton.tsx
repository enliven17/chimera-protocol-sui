'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wallet,
  User,
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useZkLogin } from '@/providers/ZkLoginProvider';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnectionModal } from './WalletConnectionModal';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';

interface UnifiedWalletButtonProps {
  className?: string;
}

export function UnifiedWalletButton({ className }: UnifiedWalletButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  
  const { isAuthenticated, userInfo, suiAddress, logout } = useZkLogin();
  const currentAccount = useCurrentAccount();
  
  // Check if any wallet is connected
  const isConnected = isAuthenticated || !!currentAccount;
  const connectedAddress = suiAddress || currentAccount?.address;
  const displayName = userInfo?.name || userInfo?.email || 'Wallet';
  const avatar = userInfo?.picture;

  const handleUserMenuToggle = () => {
    if (showUserMenu) {
      setShowUserMenu(false);
    } else {
      // Calculate dropdown position
      const button = document.getElementById('wallet-button');
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
      setShowUserMenu(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  if (isConnected && connectedAddress) {
    return (
      <>
        <Button
          id="wallet-button"
          variant="outline"
          onClick={handleUserMenuToggle}
          className={`flex items-center gap-2 border-[#4DA6FF]/30 text-[#4DA6FF] hover:bg-[#4DA6FF]/10 ${className}`}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          
          <span className="hidden sm:inline max-w-24 truncate">
            {displayName}
          </span>
          
          <span className="text-xs text-gray-400">
            {connectedAddress.slice(0, 4)}...{connectedAddress.slice(-4)}
          </span>
          
          <ChevronDown className="h-3 w-3" />
        </Button>

        {/* User Menu Dropdown */}
        {showUserMenu && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setShowUserMenu(false)}>
            <Card 
              className="absolute bg-[#1A1F2C] border-gray-800/50 shadow-xl min-w-[200px]"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              <CardContent className="p-2" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <div className="px-3 py-2 border-b border-gray-800/50">
                    <div className="text-sm font-medium text-white truncate">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-8)}
                    </div>
                    {userInfo?.provider && (
                      <div className="text-xs text-[#4DA6FF] mt-1">
                        Connected via {userInfo.provider}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
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
      <Button
        onClick={() => setShowModal(true)}
        className={`bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white flex items-center gap-2 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </Button>

      <WalletConnectionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}