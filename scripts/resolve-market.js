const hre = require("hardhat");

async function main() {
  console.log("⚖️ Resolving Market...");

  const contractAddress = "0xa17952b425026191D79Fc3909B77C40854EBB4F0";
  const marketId = 1; // BTC market ID
  
  // Get the contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.attach(contractAddress);

  // Get market details first
  console.log("📋 Checking market status...");
  const market = await predictionMarket.getMarket(marketId);
  
  console.log("Market Title:", market.title);
  console.log("Current Status:", market.status); // 0=Active, 1=Paused, 2=Resolved
  console.log("Already Resolved:", market.resolved);
  console.log("End Time:", new Date(market.endTime * 1000).toISOString());
  console.log("Current Time:", new Date().toISOString());

  if (market.resolved) {
    console.log("❌ Market already resolved with outcome:", market.outcome === 0 ? "Option A" : "Option B");
    return;
  }

  // Ask user for outcome
  console.log("\n🎯 Choose outcome:");
  console.log("0 = Yes - BTC ≥ $150K");
  console.log("1 = No - BTC < $150K");
  
  // For demo, let's resolve with "Yes" (0)
  const outcome = 0; // Change this to 1 for "No"
  
  console.log(`\n📤 Resolving market with outcome: ${outcome === 0 ? "Yes - BTC ≥ $150K" : "No - BTC < $150K"}`);
  
  try {
    const tx = await predictionMarket.resolveMarket(marketId, outcome);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log("✅ Market resolved successfully!");
    console.log("📝 Transaction hash:", tx.hash);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
    // Check events
    const marketResolvedEvent = receipt.events?.find(e => e.event === 'MarketResolved');
    if (marketResolvedEvent) {
      console.log("🎉 Market resolved with outcome:", marketResolvedEvent.args?.outcome.toString());
    }

    console.log("\n💰 Winners can now claim their rewards!");
    console.log("🔗 View resolved market: http://localhost:3000/markets/" + marketId);

  } catch (error) {
    console.error("❌ Market resolution failed:", error);
    
    if (error.message.includes("Market already resolved")) {
      console.log("💡 Market is already resolved");
    }
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Only the contract owner can resolve markets");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });