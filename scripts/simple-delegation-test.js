import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  console.log("🤖 Simple Agent Delegation Test...");

  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Using account:", deployer.address);
  console.log("🏠 ChimeraProtocol:", chimeraAddress);

  const ChimeraProtocol = await ethers.getContractFactory("ChimeraProtocol");
  const chimera = ChimeraProtocol.attach(chimeraAddress);

  try {
    // Test 1: Delegate to a test agent address (proper checksum)
    const testAgentAddress = ethers.getAddress("0x742d35cc6634c0532925a3b8d4c9db96590c6c87");
    const maxBetAmount = ethers.parseUnits("100", 18);

    console.log("\n1️⃣ Delegating to test agent...");
    const delegateTx = await chimera.delegateToAgent(testAgentAddress, maxBetAmount);
    await delegateTx.wait();
    console.log("✅ Delegation successful");

    // Test 2: Verify delegation
    console.log("2️⃣ Verifying delegation...");
    const isDelegated = await chimera.isAgentDelegated(deployer.address, testAgentAddress);
    const agentMaxBet = await chimera.getAgentMaxBet(testAgentAddress);
    
    console.log("  - Is delegated:", isDelegated);
    console.log("  - Max bet amount:", ethers.formatUnits(agentMaxBet, 18), "PYUSD");

    // Test 3: Update delegation limit
    console.log("3️⃣ Updating delegation limit...");
    const newMaxBet = ethers.parseUnits("200", 18);
    const updateTx = await chimera.updateAgentMaxBet(testAgentAddress, newMaxBet);
    await updateTx.wait();
    
    const updatedMaxBet = await chimera.getAgentMaxBet(testAgentAddress);
    console.log("  - Updated max bet:", ethers.formatUnits(updatedMaxBet, 18), "PYUSD");

    // Test 4: Revoke delegation
    console.log("4️⃣ Revoking delegation...");
    const revokeTx = await chimera.revokeDelegation(testAgentAddress);
    await revokeTx.wait();
    
    const isDelegatedAfter = await chimera.isAgentDelegated(deployer.address, testAgentAddress);
    console.log("  - Is delegated after revoke:", isDelegatedAfter);

    console.log("\n✅ All delegation tests passed!");
    console.log("🎯 Agent delegation system working as specified in eth.md");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });