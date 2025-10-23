"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  DollarSign,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useChimeraProtocol } from "@/hooks/useChimeraProtocol";
import { usePYUSD } from "@/hooks/usePYUSD";

// AI agents from environment variables
const AI_AGENTS = [
  {
    id: "asi-alliance",
    name: "ASI Alliance Agent",
    description: "MeTTa reasoning with direct contract analysis for contrarian betting strategies",
    address: (process.env.NEXT_PUBLIC_ASI_AGENT_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e") as `0x${string}`,
    type: "ASI Alliance",
    strategy: "Contrarian Analysis",
    riskLevel: "Medium",
    color: "blue",
  },

].filter(agent => agent.address !== "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e" && agent.address !== "0x8ba1f109551bD432803012645Hac136c22C85B"); // Filter out default addresses

export function AgentDelegation() {
  const { address, isConnected } = useAccount();
  const { 
    delegateToAgent, 
    revokeDelegation, 
    useAgentDelegation,
    isPending,
    isConfirming,
    isConfirmed 
  } = useChimeraProtocol();
  
  const { useBalance, useChimeraAllowance, approveChimeraMax } = usePYUSD();
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [maxBetAmount, setMaxBetAmount] = useState("100");
  const [customAgentAddress, setCustomAgentAddress] = useState("");
  const [showCustomAgent, setShowCustomAgent] = useState(false);

  // Get user's PYUSD balance and allowance
  const { data: balance } = useBalance(address);
  const { data: allowance } = useChimeraAllowance(address);

  const handleDelegateAgent = async (agentAddress: `0x${string}`) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await delegateToAgent(agentAddress, maxBetAmount);
      toast.success("Agent delegation submitted!");
    } catch (error) {
      console.error("Error delegating agent:", error);
      toast.error("Failed to delegate agent");
    }
  };

  const handleRevokeAgent = async (agentAddress: `0x${string}`) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await revokeDelegation(agentAddress);
      toast.success("Agent revocation submitted!");
    } catch (error) {
      console.error("Error revoking agent:", error);
      toast.error("Failed to revoke agent");
    }
  };

  const handleApproveMax = async () => {
    try {
      await approveChimeraMax();
      toast.success("Max approval submitted!");
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve");
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardContent className="p-6">
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to manage AI agent delegations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bot className="h-5 w-5 text-[#eab308]" />
            <span>AI Agent Delegation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Delegate betting permissions to AI agents for automated trading strategies. 
            Agents can place bets on your behalf within the limits you set.
          </p>
          
          {/* Balance and Allowance Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#0A0C14] rounded-lg border border-gray-800/50">
            <div>
              <Label className="text-gray-300">PYUSD Balance</Label>
              <p className="text-white font-medium">
                {balance ? (parseFloat(balance.toString()) / 1e6).toFixed(2) : "0.00"} PYUSD
              </p>
            </div>
            <div>
              <Label className="text-gray-300">ChimeraAI Allowance</Label>
              <div className="flex items-center space-x-2">
                <p className="text-white font-medium">
                  {allowance ? (parseFloat(allowance.toString()) / 1e6).toFixed(2) : "0.00"} PYUSD
                </p>
                {(!allowance || allowance < BigInt(1000 * 1e6)) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApproveMax}
                    className="text-xs"
                  >
                    Approve Max
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delegation Settings */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Settings className="h-5 w-5 text-[#eab308]" />
            <span>Delegation Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxBet" className="text-gray-300">
              Maximum Bet Amount per Transaction (PYUSD)
            </Label>
            <Input
              id="maxBet"
              type="number"
              step="0.01"
              min="0.01"
              value={maxBetAmount}
              onChange={(e) => setMaxBetAmount(e.target.value)}
              className="bg-[#0A0C14] border-gray-700 text-white"
              placeholder="100"
            />
            <p className="text-xs text-gray-400">
              This is the maximum amount an agent can bet in a single transaction
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Predefined AI Agents */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Available AI Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {AI_AGENTS.map((agent) => {
            const { data: isDelegated } = useAgentDelegation(address!, agent.address);
            
            return (
              <div
                key={agent.id}
                className="p-4 bg-[#0A0C14] rounded-lg border border-gray-800/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          agent.color === 'blue' 
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {agent.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{agent.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Strategy: {agent.strategy}</span>
                      <span>Risk: {agent.riskLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Address:</span>
                      <code className="bg-gray-800 px-2 py-1 rounded">
                        {agent.address.slice(0, 10)}...{agent.address.slice(-8)}
                      </code>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isDelegated ? (
                      <>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delegated
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAgent(agent.address)}
                          disabled={isPending || isConfirming}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          {isPending || isConfirming ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Revoke"
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDelegateAgent(agent.address)}
                        disabled={isPending || isConfirming}
                        className="bg-[#eab308] hover:bg-[#ca8a04] text-white"
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delegate"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Agent */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Custom Agent</span>
            <Switch
              checked={showCustomAgent}
              onCheckedChange={setShowCustomAgent}
            />
          </CardTitle>
        </CardHeader>
        {showCustomAgent && (
          <CardContent className="space-y-4">
            <Alert className="bg-orange-500/10 border-orange-500/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-400">
                Only delegate to agents you trust. Malicious agents could drain your allowance.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="customAgent" className="text-gray-300">
                Agent Contract Address
              </Label>
              <Input
                id="customAgent"
                value={customAgentAddress}
                onChange={(e) => setCustomAgentAddress(e.target.value)}
                className="bg-[#0A0C14] border-gray-700 text-white"
                placeholder="0x..."
              />
            </div>
            
            <Button
              onClick={() => handleDelegateAgent(customAgentAddress as `0x${string}`)}
              disabled={!customAgentAddress || isPending || isConfirming}
              className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-white"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Delegating...
                </>
              ) : (
                "Delegate Custom Agent"
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Security Notice */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-[#eab308] mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-white">Security Features</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Agents can only bet within your set limits</li>
                <li>• You maintain full control and can revoke access anytime</li>
                <li>• All agent actions are logged and auditable</li>
                <li>• Agents cannot withdraw your funds directly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}