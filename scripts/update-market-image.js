const hre = require("hardhat");

async function main() {
  console.log("🖼️ Updating Market Image...");

  const contractAddress = "0xa17952b425026191D79Fc3909B77C40854EBB4F0";
  const marketId = 1; // BTC market ID
  
  // Get the contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.attach(contractAddress);

  // Get current market details
  console.log("📋 Checking current market...");
  const market = await predictionMarket.getMarket(marketId);
  
  console.log("Market Title:", market.title);
  console.log("Current Image URL:", market.imageUrl);
  
  // Note: Solidity contracts are immutable, we can't update the image URL after creation
  // We need to create a new market with the correct image URL
  
  console.log("\n💡 Contract data is immutable. We need to create a new market with the correct image.");
  console.log("🔗 Local image URL should be: /bitcoin.png");
  
  // Let's create a new market with the correct image
  const title = "Will Bitcoin reach $150,000 by December 31, 2025?";
  const description = "Bitcoin has been on a remarkable bull run in 2024-2025. This market predicts whether BTC will reach or exceed $150,000 USD by the end of December 2025. Resolution will be based on major exchange prices (Binance, Coinbase, Kraken average) at 23:59 UTC on December 31, 2025.";
  const optionA = "Yes - BTC ≥ $150K";
  const optionB = "No - BTC < $150K";
  const category = 4; // Finance category
  
  // End time: December 31, 2025, 23:59 UTC
  const endDate = new Date("2025-12-31T23:59:00Z");
  const endTime = Math.floor(endDate.getTime() / 1000);
  
  const minBet = hre.ethers.utils.parseEther("0.1"); // 0.1 tCTC minimum
  const maxBet = hre.ethers.utils.parseEther("50.0"); // 50 tCTC maximum
  const imageUrl = "/bitcoin.png"; // Local image path

  console.log("\n🚀 Creating new market with correct image...");
  console.log("New Image URL:", imageUrl);
  
  try {
    const tx = await predictionMarket.createMarket(
      title,
      description,
      optionA,
      optionB,
      category,
      endTime,
      minBet,
      maxBet,
      imageUrl
    );

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log("✅ New market created successfully!");
    console.log("📝 Transaction hash:", tx.hash);
    
    // Get the market ID from events
    const marketCreatedEvent = receipt.events?.find(e => e.event === 'MarketCreated');
    if (marketCreatedEvent) {
      const newMarketId = marketCreatedEvent.args?.marketId;
      console.log("🆔 New Market ID:", newMarketId.toString());
      console.log("🔗 View market at: http://localhost:3000/markets/" + newMarketId.toString());
    }

  } catch (error) {
    console.error("❌ Market creation failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });