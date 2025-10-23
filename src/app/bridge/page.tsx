"use client";

import { PYUSDBridge } from "@/components/bridge/pyusd-bridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";

export default function BridgePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            background: linear-gradient(to bottom right, #0A0C14, #1A1F2C, #151923) !important;
            background-attachment: fixed !important;
          }
          .bridge-page {
            background: linear-gradient(to bottom right, #0A0C14, #1A1F2C, #151923) !important;
            background-attachment: fixed !important;
          }
        `
      }} />
      <div className="bridge-page min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ArrowLeftRight className="h-8 w-8 text-[#FFE100]" />
            <h1 className="text-4xl font-bold">PYUSD Bridge</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bridge your PYUSD from Ethereum Sepolia to Hedera Testnet and start betting on prediction markets
          </p>
        </div>





        {/* Bridge Component */}
        <div className="max-w-2xl mx-auto">
          <PYUSDBridge />
        </div>

        {/* Network Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">Source Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Network:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Ethereum Sepolia
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Token:</span>
                <span className="text-white">PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Decimals:</span>
                <span className="text-white">6</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">Destination Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Network:</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Hedera Testnet
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Token:</span>
                <span className="text-white">wPYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Decimals:</span>
                <span className="text-white">6</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
}