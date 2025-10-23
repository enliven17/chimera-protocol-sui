"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Wallet } from "lucide-react";
import Link from "next/link";

export default function MyBetsPage() {
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount;
  const address = currentAccount?.address;

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-2">
                My Betting History
              </h1>
              <p className="text-gray-400 text-lg">
                Track all your prediction market bets and performance
              </p>
            </div>

            {/* Connect Wallet Card */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#4DA6FF]/20 to-[#3B82F6]/20 rounded-full flex items-center justify-center mb-6">
                  <Wallet className="h-8 w-8 text-[#4DA6FF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your wallet to view your complete betting history and track your performance across all markets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
                  >
                    <Link href="/markets">
                      Browse Markets
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    <Link href="/learn">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-8 w-8 text-[#4DA6FF]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                My Betting History
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Track all your prediction market bets and performance
            </p>
          </div>

          {/* My Bets Component - Coming Soon */}
          <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#4DA6FF]/20 to-[#3B82F6]/20 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-[#4DA6FF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Betting History Coming Soon
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Your Sui prediction market betting history will appear here once you start placing bets.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
              >
                <Link href="/markets">
                  Start Betting
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
