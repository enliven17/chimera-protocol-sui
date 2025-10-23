"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Menu,
  Home,
  TrendingUp,
  PlusCircle,
  Trophy,
  BookOpen,
  FileText,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleMobileNavLinkClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Mobile Navigation - Only shows on mobile */}
      <div className="lg:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              style={{ color: "white" }}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[300px] sm:w-[350px] flex flex-col h-full"
            style={{
              backgroundColor: "#1a1c26",
              borderColor: "#2a2d3a",
              color: "white",
            }}
          >
            <SheetHeader className="flex-shrink-0">
              <SheetTitle style={{ color: "white" }}>Menu</SheetTitle>
            </SheetHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 mt-4 pr-2">
              <div className="bg-[#2a2d3a] rounded-lg p-4">
                <ConnectButton accountStatus={{ smallScreen: "avatar", largeScreen: "full" }} chainStatus="none" />
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 px-3">
                  Navigation
                </h3>

                <Link
                  href="/"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <Home className="h-5 w-5" style={{ color: "#9b87f5" }} />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  href="/markets"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <TrendingUp
                    className="h-5 w-5"
                    style={{ color: "#9b87f5" }}
                  />
                  <span className="font-medium">Markets</span>
                </Link>

                {isConnected && (
                  <Link
                    href="/dashboard/create"
                    onClick={handleMobileNavLinkClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                  >
                    <PlusCircle
                      className="h-5 w-5"
                      style={{ color: "#9b87f5" }}
                    />
                    <span className="font-medium">Create Market</span>
                  </Link>
                )}

                <Link
                  href="/leaderboard"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <Trophy className="h-5 w-5" style={{ color: "#9b87f5" }} />
                  <span className="font-medium">Leaderboard</span>
                </Link>

                {isConnected && address && (
                  <Link
                    href={`/dashboard/${address}`}
                    onClick={handleMobileNavLinkClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                  >
                    <User className="h-5 w-5" style={{ color: "#9b87f5" }} />
                    <span className="font-medium">My Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 px-3">
                  Resources
                </h3>

                <Link
                  href="/learn"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <BookOpen className="h-5 w-5" style={{ color: "#9b87f5" }} />
                  <span className="font-medium">Learn</span>
                </Link>

                <Link
                  href="/terms"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <FileText className="h-5 w-5" style={{ color: "#9b87f5" }} />
                  <span className="font-medium">Terms</span>
                </Link>

                <Link
                  href="/privacy-policy"
                  onClick={handleMobileNavLinkClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-[#2a2d3a]"
                >
                  <Shield className="h-5 w-5" style={{ color: "#9b87f5" }} />
                  <span className="font-medium">Privacy Policy</span>
                </Link>
              </div>
            </div>

            {/* Fixed Footer - Logout Button */}
            <div className="flex-shrink-0 pt-4 mt-4 border-t border-[#2a2d3a]">
              <ConnectButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Wallet Button - Hidden on mobile */}
      <div className="hidden lg:block">
        <ConnectButton showBalance={{ smallScreen: true, largeScreen: true }} chainStatus="icon" />
      </div>
      <div className="lg:hidden">
        <ConnectButton accountStatus={{ smallScreen: "avatar", largeScreen: "full" }} chainStatus="none" />
      </div>
    </div>
  );
}