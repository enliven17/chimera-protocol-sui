const hre = require("hardhat");

async function main() {
  console.log("💰 Funding Treasury with initial funds...");

  const contractAddress = "0xa17952b425026191D79Fc3909B77C40854EBB4F0";
  
  // Get the contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.attach(contractAddress);

  // Fund treasury with 10 tCTC
  const fundAmount = hre.ethers.utils.parseEther("10.0");
  
  console.log("📤 Depositing", hre.ethers.utils.formatEther(fundAmount), "tCTC to treasury...");
  
  const tx = await predictionMarket.depositToTreasury({ value: fundAmount });
  await tx.wait();

  console.log("✅ Treasury funded successfully!");
  console.log("📝 Transaction hash:", tx.hash);
  
  // Check treasury balance
  const treasuryBalance = await predictionMarket.getTreasuryBalance();
  console.log("💰 Treasury Balance:", hre.ethers.utils.formatEther(treasuryBalance), "tCTC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Treasury funding failed:", error);
    process.exit(1);
  });