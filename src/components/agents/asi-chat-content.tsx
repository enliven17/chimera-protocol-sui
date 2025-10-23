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
  AlertTriangle
} from 'lucide-react';
import { useASIAgentStatus } from '@/hooks/useASIAgent';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  analysis?: {
    marketId: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
  }[];
}

interface ASIChatContentProps {
  className?: string;
}

export function ASIChatContent({ className }: ASIChatContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m the Chimera ASI Agent. I can help you analyze markets, provide betting recommendations, and answer questions about prediction markets. Try asking me about specific markets or say "analyze all markets".',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: agentStatus } = useASIAgentStatus();

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
      const response = await fetch('/api/asi-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        analysis: data.analysis,
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'I apologize, but I\'m currently unable to process your request. Please try again later or check if the ASI Agent service is running.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message to ASI Agent');
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
        type: 'agent',
        content: 'Hello! I\'m the Chimera ASI Agent. I can help you analyze markets, provide betting recommendations, and answer questions about prediction markets. Try asking me about specific markets or say "analyze all markets".',
        timestamp: new Date(),
      }
    ]);
  };

  const quickActions = [
    { label: 'Analyze Markets', message: 'analyze all markets' },
    { label: 'Get Recommendations', message: 'give me betting recommendations' },
    { label: 'Market Status', message: 'what is the current market status?' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-[#FFE100]" />
          <span className="font-semibold text-white">ASI Agent Chat</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={`text-xs ${
              agentStatus?.isOnline 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {agentStatus?.isOnline ? 'Connecting...' : 'Offline'}
          </Badge>
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
                    ? 'bg-[#FFE100] text-black'
                    : 'bg-gray-800/50 text-white border border-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'agent' && (
                    <Bot className="h-4 w-4 text-[#FFE100] mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Analysis Results */}
                    {message.analysis && message.analysis.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.analysis.map((analysis, index) => (
                          <div key={index} className="bg-gray-900/50 rounded p-2 border border-gray-600/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-[#FFE100]">
                                Market Analysis
                              </span>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                {analysis.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-300 mb-1">
                              <strong>Recommendation:</strong> {analysis.recommendation}
                            </p>
                            <p className="text-xs text-gray-400">
                              {analysis.reasoning}
                            </p>
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
                  <Bot className="h-4 w-4 text-[#FFE100]" />
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFE100]" />
                  <span className="text-sm text-gray-300">ASI Agent is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="flex flex-wrap gap-1 mb-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(action.message)}
              className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
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
            placeholder="Ask me about markets, get recommendations, or say 'help'"
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFE100] focus:ring-[#FFE100]/20"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black"
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