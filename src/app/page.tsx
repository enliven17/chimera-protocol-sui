"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3, Activity, Coins, Users } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { getAllMarkets, Market } from "@/lib/sui-client";
import { SuiMarketCard } from "@/components/SuiMarketCard";


// Simple currency formatter
const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    } else {
        return `$${value.toFixed(0)}`;
    }
};

export default function HomePage() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load markets on component mount
    useEffect(() => {
        const loadMarkets = async () => {
            try {
                setIsLoading(true);
                const allMarkets = await getAllMarkets();
                setMarkets(allMarkets);
            } catch (err) {
                console.error('Error loading markets:', err);
                setError('Failed to load markets');
            } finally {
                setIsLoading(false);
            }
        };

        loadMarkets();
    }, []);

    // Calculate platform stats from real data
    const platformStats = {
        totalVolume: markets.reduce((sum, market) => sum + market.totalPool, 0),
        totalUsers: new Set(markets.map(m => m.creator)).size,
        activeMarkets: markets.filter(m => m.status === 0).length,
        totalMarkets: markets.length,
    };

    const featuredMarkets = markets.slice(0, 3); // Show first 3 markets as featured



    return (
        <div className="min-h-screen">
            {/* Hero Section - Banner Style */}
            <section className="w-full h-[500px] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239b87f5' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundRepeat: "repeat",
                        }}
                    ></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center justify-center px-4">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-10">
                            <span className="inline-block animate-pull-up" style={{ animationDelay: "0ms" }}>Sui.</span>{" "}
                            <span className="inline-block animate-pull-up text-[#4DA6FF]" style={{ animationDelay: "120ms" }}>Predict.</span>{" "}
                            <span className="inline-block animate-pull-up" style={{ animationDelay: "240ms" }}>Profit.</span>
                        </h1>

                        {/* Subheading removed per request */}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
                            <Button
                                asChild
                                size="lg"
                                style={{
                                    backgroundColor: "#4DA6FF",
                                    color: "white",
                                    fontSize: "16px",
                                    height: "fit-content",
                                    padding: "12px 32px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#3B82F6";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#4DA6FF";
                                }}
                            >
                                <Link href="/markets">
                                    Explore Markets
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>

                            <button
                                className="border border-[#4DA6FF] text-[#4DA6FF] hover:bg-[#4DA6FF] hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 max-sm:w-[60%]"
                                onClick={() =>
                                    window.scrollTo({
                                        top: window.innerHeight,
                                        behavior: "smooth",
                                    })
                                }
                            >
                                <Link href={"/learn"}>Learn More</Link>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animated Background Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#4DA6FF]/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#4DA6FF]/5 rounded-full blur-lg animate-bounce delay-500"></div>

                {/* Bottom Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0A0C14] to-transparent"></div>
            </section>

            {/* Platform Stats */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {/* Total Markets */}
                        <div className="bg-[#1A1F2C] rounded-xl p-6 shadow-lg border border-gray-800/60 hover:border-[#4DA6FF]/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-[#4DA6FF]/15">
                                    <BarChart3 className="h-5 w-5 text-[#4DA6FF]" />
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20">live</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                <CountUp end={platformStats.totalMarkets} />
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Total Markets</div>
                        </div>

                        {/* Active Now */}
                        <div className="bg-[#1A1F2C] rounded-xl p-6 shadow-lg border border-gray-800/60 hover:border-[#4DA6FF]/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-[#4DA6FF]/15">
                                    <Activity className="h-5 w-5 text-[#4DA6FF]" />
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20">now</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                <CountUp end={platformStats.activeMarkets} />
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Active Now</div>
                        </div>

                        {/* SUI Volume */}
                        <div className="bg-[#1A1F2C] rounded-xl p-6 shadow-lg border border-gray-800/60 hover:border-[#4DA6FF]/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-[#4DA6FF]/15">
                                    <Coins className="h-5 w-5 text-[#4DA6FF]" />
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20">SUI</span>
                            </div>
                            <div className="text-3xl font-bold text-[#4DA6FF]">
                                {formatCompactCurrency(platformStats.totalVolume)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Total Volume</div>
                        </div>

                        {/* Users */}
                        <div className="bg-[#1A1F2C] rounded-xl p-6 shadow-lg border border-gray-800/60 hover:border-[#4DA6FF]/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-[#4DA6FF]/15">
                                    <Users className="h-5 w-5 text-[#4DA6FF]" />
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20">all-time</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                <CountUp end={platformStats.totalUsers} suffix="+" />
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Users</div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Featured Markets Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center md:justify-between mb-8 max-sm:flex-col max-sm:gap-4">
                        <div className="max-sm:text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Featured Markets
                            </h2>
                            <p className="text-gray-400">
                                Most popular and trending prediction markets
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            style={{
                                borderColor: "#4DA6FF",
                                color: "#4DA6FF",
                                backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#4DA6FF";
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#4DA6FF";
                            }}
                        >
                            <Link href="/markets">View All Markets</Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-[#1A1F2C] rounded-lg h-64"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-[#1A1F2C] rounded-lg">
                            <div className="text-gray-400 mb-4">
                                <TrendingUp className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                Unable to load markets
                            </h3>
                            <p className="text-gray-400 mb-2">{error}</p>
                            <p className="text-xs text-gray-500 mb-4">
                                Check console for contract debugging info
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="mt-4 border-[#4DA6FF] text-[#4DA6FF] hover:bg-[#4DA6FF] hover:text-white"
                            >
                                Retry
                            </Button>
                        </div>
                    ) : featuredMarkets.length === 0 ? (
                        <div className="text-center py-12 bg-[#1A1F2C] rounded-lg">
                            <div className="text-gray-400 mb-4">
                                <TrendingUp className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                No active markets found
                            </h3>
                            <p className="text-gray-400 mb-4">
                                No markets are currently available. Check back soon for new prediction markets!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredMarkets.map((market) => (
                                <SuiMarketCard 
                                    key={market.id} 
                                    market={market} 
                                    onUpdate={() => {
                                        // Reload markets when updated
                                        const loadMarkets = async () => {
                                            try {
                                                const allMarkets = await getAllMarkets();
                                                setMarkets(allMarkets);
                                            } catch (err) {
                                                console.error('Error reloading markets:', err);
                                            }
                                        };
                                        loadMarkets();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}