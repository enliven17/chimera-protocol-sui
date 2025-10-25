"use client";

import Link from "next/link";
import { UnifiedWalletButton } from "../auth/UnifiedWalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-gradient-to-r from-[#0A0C14]/90 via-[#1A1F2C]/90 to-[#0A0C14]/90 animate-gradient rounded-3xl border border-[#E6CC00]/20 p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFE100]/5 via-transparent to-[#E6CC00]/5 animate-gradient opacity-50"></div>
          <div className="relative z-10 flex items-center justify-between gap-[20px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {/* Text Only */}
              <div className="sm:text-3xl text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-[#4DA6FF] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent animate-sui-gradient">
                  Sui
                </span>
                <span className="text-white">mera</span>
              </div>
            </Link>
            
            {/* Navigation Links - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <Link 
                href="/markets" 
                className="text-gray-300 hover:text-[#4DA6FF] transition-colors text-sm font-medium"
              >
                Markets
              </Link>
              <Link 
                href="/dashboard/my-bets" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                My Bets
              </Link>
              <Link 
                href="/learn" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Learn
              </Link>
            </nav>
            
            {/* Wallet Button */}
            <UnifiedWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}