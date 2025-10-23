"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
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

interface ASIChatProps {
  className?: string;
}

export function ASIChat({ className }: ASIChatProps) {
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: agentStatus, isLoading: statusLoading } = useASIAgentStatus();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
      // Send message to ASI Agent
      const response = await fetch('/api/asi-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: 'web-chat',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ASI Agent');
      }

      const data = await response.json();

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.message || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date(),
        analysis: data.analysis,
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error sending message to ASI Agent:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later or check if the ASI Agent is running.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to connect to ASI Agent');
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
        content: 'Chat cleared. How can I help you with market analysis?',
        timestamp: new Date(),
      }
    ]);
  };

  const getStatusColor = () => {
    if (statusLoading) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (agentStatus?.status === 'healthy') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getStatusText = () => {
    if (statusLoading) return 'Connecting...';
    if (agentStatus?.status === 'healthy') return 'Online';
    return 'Offline';
  };

  return (
    <Card className={`bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bot className="h-5 w-5 text-blue-400" />
            <span>ASI Agent Chat</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-96 w-full rounded-md border border-gray-800/50 p-4 bg-[#0A0C14]"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'agent' && (
                      <Bot className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-0.5 text-white flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Show analysis results if available */}
                      {message.analysis && message.analysis.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.analysis.map((analysis, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded p-2 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">Market {analysis.marketId}</span>
                                <Badge 
                                  className={`text-xs ${
                                    analysis.confidence > 0.7 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : analysis.confidence > 0.5
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {(analysis.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-1">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {analysis.recommendation}
                              </p>
                              <p className="text-gray-400 text-xs">{analysis.reasoning}</p>
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
                <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm">ASI Agent is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about markets, get recommendations, or say 'help'..."
            className="flex-1 bg-[#0A0C14] border-gray-800/50 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('analyze all markets')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Analyze Markets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('what should I bet on?')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Get Recommendations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('show me crypto markets')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Crypto Markets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('health')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Agent Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}