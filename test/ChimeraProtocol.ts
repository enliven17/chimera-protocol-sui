import { expect } from "chai";
import hre from "hardhat";

describe("ChimeraProtocol TypeScript Tests", function () {
  it("Should deploy ChimeraProtocol contract", async function () {
    const { viem } = hre;
    
    // Deploy mock contracts first
    const MockERC20 = await viem.deployContract("MockERC20", [
      "PayPal USD",
      "PYUSD", 
      18
    ]);
    
    const MockPyth = await viem.deployContract("MockPyth");
    
    // Deploy ChimeraProtocol
    const ChimeraProtocol = await viem.deployContract("ChimeraProtocol", [
      MockPyth.address,
      MockERC20.address
    ]);
    
    expect(ChimeraProtocol.address).to.be.properAddress;
    expect(await ChimeraProtocol.read.owner()).to.be.properAddress;
    expect(await ChimeraProtocol.read.marketCounter()).to.equal(0n);
  });

  it("Should create a market", async function () {
    const { viem } = hre;
    
    // Deploy contracts
    const MockERC20 = await viem.deployContract("MockERC20", [
      "PayPal USD",
      "PYUSD", 
      18
    ]);
    
    const MockPyth = await viem.deployContract("MockPyth");
    
    const ChimeraProtocol = await viem.deployContract("ChimeraProtocol", [
      MockPyth.address,
      MockERC20.address
    ]);
    
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + 3600;
    
    // Create market
    await ChimeraProtocol.write.createMarket([
      "Test Market",
      "Test Description", 
      "Option A",
      "Option B",
      1, // category
      BigInt(endTime),
      BigInt("1000000000000000000"), // 1 ETH in wei
      BigInt("100000000000000000000"), // 100 ETH in wei
      "https://example.com/image.png",
      1, // CustomEvent
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      0n,
      false
    ]);
    
    const market = await ChimeraProtocol.read.getMarket([1n]);
    expect(market.title).to.equal("Test Market");
    expect(market.status).to.equal(0); // Active
  });
});


