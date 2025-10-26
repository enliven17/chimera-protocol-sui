#!/usr/bin/env node

// Script to create a market for Suimera project winning Build on SUI Hackathon
// This script will output the market data that can be used to create the market via web interface

const marketData = {
  title: "Will Suimera project win the Build on SUI Hackathon?",
  description: "Prediction market for whether the Suimera project will win the Build on SUI Hackathon. The market will resolve based on the official hackathon results announcement. Suimera is an AI-powered prediction market platform built on Sui blockchain with Walrus storage integration.",
  optionA: "Yes - Suimera wins",
  optionB: "No - Suimera doesn't win", 
  category: 3, // Technology category
  endTime: "2025-10-28T12:17", // 48 hours from now
  minBet: "0.1",
  maxBet: "50",
  imageUrl: "/sui2.png",
  marketType: 0, // Custom market type
  targetPrice: "0",
  priceAbove: true
};

console.log("🎯 Suimera Hackathon Market Data:");
console.log("=====================================");
console.log(`Title: ${marketData.title}`);
console.log(`Description: ${marketData.description}`);
console.log(`Option A: ${marketData.optionA}`);
console.log(`Option B: ${marketData.optionB}`);
console.log(`Category: Technology (${marketData.category})`);
console.log(`End Time: ${marketData.endTime}`);
console.log(`Min Bet: ${marketData.minBet} SUI`);
console.log(`Max Bet: ${marketData.maxBet} SUI`);
console.log(`Image: ${marketData.imageUrl}`);
console.log("=====================================");
console.log("\n🚀 Next Steps:");
console.log("1. Open http://localhost:3001/markets in your browser");
console.log("2. Connect your Sui wallet");
console.log("3. Click 'Create New Market'");
console.log("4. Fill in the form with the data above");
console.log("5. Submit the transaction");
console.log("\n📝 Market Details:");
console.log("- Duration: 48 hours");
console.log("- Type: Custom prediction market");
console.log("- Resolution: Based on official Build on SUI Hackathon results");
console.log("- Image: Uses sui2.png from public folder");

// Also output as JSON for easy copying
console.log("\n📋 JSON Format (for developers):");
console.log(JSON.stringify(marketData, null, 2));