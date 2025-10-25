"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllMarkets } from '@/lib/sui-client';
import { useWalrusStorage } from '@/hooks/useWalrusStorage';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    marketTitle: string;
    recommendation: 'BUY_A' | 'BUY_B' | 'HOLD' | 'AVOID';
    confidence: number;
    reasoning: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

interface GeminiMarketChatProps {
  className?: string;
}

export function GeminiMarketChat({ className }: GeminiMarketChatProps) {
  const currentAccount = useCurrentAccount();
  const walrusStorage = useWalrusStorage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Sui Market Analyst powered by Gemini AI. I can help you analyze prediction markets, provide betting recommendations, and explain market trends. Ask me about specific markets or say "analyze all markets".',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blobIdInput, setBlobIdInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get current markets for context
      const markets = await getAllMarkets();
      
      const response = await fetch('/api/gemini/market-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          markets: markets,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        analysis: data.analysis,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m currently unable to process your request. Please try again later.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hello! I\'m your Sui Market Analyst powered by Gemini AI. I can help you analyze prediction markets, provide betting recommendations, and explain market trends. Ask me about specific markets or say "analyze all markets".',
        timestamp: new Date(),
      }
    ]);
  };

  // Save chat to Walrus
  const saveChatToWalrus = async () => {
    if (!currentAccount?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (messages.length <= 1) {
      toast.error('No chat messages to save');
      return;
    }

    try {
      const blobId = await walrusStorage.storeChatMessages(messages, currentAccount.address);
      if (blobId) {
        console.log('Chat saved to Walrus with blob ID:', blobId);
        toast.success(`Chat saved! Blob ID: ${blobId.substring(0, 8)}...`);
      }
    } catch (error) {
      console.error('Failed to save chat:', error);
      toast.error('Failed to save chat to Walrus');
    }
  };

  // Load chat from Walrus
  const loadChatFromWalrus = async () => {
    if (!blobIdInput.trim()) {
      toast.error('Please enter a blob ID');
      return;
    }

    const loadedMessages = await walrusStorage.retrieveChatMessages(blobIdInput.trim());
    if (loadedMessages) {
      setMessages(loadedMessages);
      setBlobIdInput('');
    }
  };

  const quickActions = [
    { label: 'Analyze Markets', message: 'analyze all available markets', icon: BarChart3 },
    { label: 'Best Opportunities', message: 'what are the best betting opportunities right now?', icon: Target },
    { label: 'Market Trends', message: 'explain current market trends', icon: TrendingUp },
    { label: 'Risk Assessment', message: 'assess the risk levels of current markets', icon: Sparkles },
  ];

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY_A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BUY_B': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'AVOID': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-[#4DA6FF]" />
          <span className="font-semibold text-white">Market Analyst</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-[#4DA6FF]/20 text-[#4DA6FF] border-[#4DA6FF]/30 text-xs">
            Gemini AI
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
            Walrus
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={saveChatToWalrus}
            disabled={walrusStorage.isLoading || !currentAccount?.address}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            title="Save chat to Walrus"
          >
            {walrusStorage.isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Walrus Load Section */}
      <div className="p-3 border-b border-gray-800/50 bg-gray-900/30">
        <div className="flex items-center space-x-2">
          <Input
            value={blobIdInput}
            onChange={(e) => setBlobIdInput(e.target.value)}
            placeholder="Enter Walrus blob ID to load chat..."
            className="flex-1 h-8 text-xs bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={loadChatFromWalrus}
            disabled={walrusStorage.isLoading || !blobIdInput.trim()}
            className="h-8 px-3 text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Upload className="h-3 w-3 mr-1" />
            Load
          </Button>
        </div>
        {walrusStorage.lastBlobId && (
          <p className="text-xs text-gray-400 mt-2">
            Last saved: {walrusStorage.lastBlobId}
          </p>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-[#4DA6FF] text-white'
                    : 'bg-gray-800/50 text-white border border-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Sparkles className="h-4 w-4 text-[#4DA6FF] mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Analysis Results */}
                    {message.analysis && message.analysis.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.analysis.map((analysis, index) => (
                          <div key={index} className="bg-gray-900/50 rounded p-3 border border-gray-600/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#4DA6FF] truncate">
                                {analysis.marketTitle}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getRecommendationColor(analysis.recommendation)}`}>
                                  {analysis.recommendation.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {analysis.confidence}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-300 mb-2">
                              {analysis.reasoning}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                Risk Level:
                              </span>
                              <span className={`text-xs font-medium ${getRiskColor(analysis.riskLevel)}`}>
                                {analysis.riskLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 text-white border border-gray-700/50 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-[#4DA6FF]" />
                  <Loader2 className="h-4 w-4 animate-spin text-[#4DA6FF]" />
                  <span className="text-sm text-gray-300">Analyzing markets...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="grid grid-cols-2 gap-1 mb-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(action.message)}
              className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white justify-start"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about market analysis, trends, or recommendations..."
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#4DA6FF] focus:ring-[#4DA6FF]/20"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}