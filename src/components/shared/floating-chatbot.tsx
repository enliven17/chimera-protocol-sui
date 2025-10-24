"use client";

import { useState } from "react";
import { MessageCircle, X, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeminiMarketChat } from "@/components/shared/gemini-market-chat";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleOpen}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div 
            className={`bg-gradient-to-br from-[#1A1F2C] to-[#151923] border border-gray-800/50 rounded-lg shadow-2xl transition-all duration-300 ${
              isMinimized 
                ? 'w-80 h-16' 
                : 'w-96 h-[600px] lg:w-[500px] lg:h-[700px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#4DA6FF]" />
                <span className="text-lg font-semibold text-white">Market Analyst</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content - Gemini Market Chat */}
            {!isMinimized && (
              <div className="h-[calc(100%-4rem)]">
                <GeminiMarketChat />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}