import hre from "hardhat";

async function main() {
  console.log("🧪 Testing Hardhat 3...");
  console.log("HRE:", typeof hre);
  console.log("HRE keys:", Object.keys(hre));
  
  if (hre.ethers) {
    console.log("✅ ethers available");
    const signers = await hre.ethers.getSigners();
    console.log("✅ Signers:", signers.length);
  } else {
    console.log("❌ ethers not available");
  }
}

main().catch(console.error);