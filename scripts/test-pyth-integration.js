import hre from "hardhat";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { config } from "dotenv";

config();

async function main() {
  console.log("🧪 Testing Pyth Oracle Integration...");

  // Get the deployed contract
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  if (!chimeraAddress) {
    throw new Error("NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS not set in .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("📝 Testing with account:", deployer.address);

  // Get ChimeraProtocol contract
  const ChimeraProtocol = await hre.ethers.getContractFactory("ChimeraProtocol");
  const chimera = ChimeraProtocol.attach(chimeraAddress);

  // Pyth price service connection
  const connection = new EvmPriceServiceConnection("https://hermes.pyth.network");

  // Test price IDs (ETH/USD and BTC/USD)
  const priceIds = [
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"  // BTC/USD
  ];

  console.log("\n🔍 Testing Pyth price feeds...");

  try {
    // Get latest price update data
    const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);
    console.log("✅ Successfully fetched price update data");

    // Get Pyth contract directly
    const pythContract = await hre.ethers.getContractAt("IPyth", "0xa2aa501b19aff244d90cc15a4cf739d2725b5729");
    
    // Get update fee
    const updateFee = await pythContract.getUpdateFee(priceUpdateData);
    console.log("💰 Update fee:", hre.ethers.formatEther(updateFee), "HBAR");

    // Test creating a price-based market
    console.log("\n📊 Creating test price market...");
    
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + 3600; // 1 hour from now
    const targetPrice = hre.ethers.parseUnits("3000", 8); // $3000 with 8 decimals

    const tx = await chimera.createMarket(
      "ETH Price Prediction",
      "Will ETH be above $3000 in 1 hour?",
      "Above $3000",
      "Below $3000",
      1, // category
      endTime,
      hre.ethers.parseUnits("10", 18), // min bet: 10 PYUSD
      hre.ethers.parseUnits("1000", 18), // max bet: 1000 PYUSD
      "https://example.com/eth-image.png",
      0, // MarketType.PriceDirection
      priceIds[0], // ETH/USD price ID
      targetPrice,
      true // priceAbove
    );

    await tx.wait();
    console.log("✅ Test market created successfully");

    // Get the market
    const marketId = await chimera.marketCounter();
    const market = await chimera.getMarket(marketId);
    
    console.log("\n📋 Market details:");
    console.log("  - ID:", market.id.toString());
    console.log("  - Title:", market.title);
    console.log("  - Pyth Price ID:", market.pythPriceId);
    console.log("  - Target Price:", hre.ethers.formatUnits(market.targetPrice, 8));
    console.log("  - Price Above:", market.priceAbove);

    // Test getting current price (without updating)
    try {
      const currentPrice = await pythContract.getPrice(priceIds[0]);
      console.log("\n💹 Current ETH price:");
      console.log("  - Price:", hre.ethers.formatUnits(currentPrice.price, 8));
      console.log("  - Confidence:", hre.ethers.formatUnits(currentPrice.conf, 8));
      console.log("  - Publish Time:", new Date(Number(currentPrice.publishTime) * 1000).toISOString());
    } catch (error) {
      console.log("⚠️  Current price not available (needs update)");
    }

    console.log("\n✅ Pyth Oracle integration test completed successfully!");
    console.log("🎯 Ready for market settlement using settleMarket() function");

  } catch (error) {
    console.error("❌ Pyth integration test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });