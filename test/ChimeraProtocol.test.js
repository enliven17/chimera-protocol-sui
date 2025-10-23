import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ChimeraProtocol", function () {
  // Fixture for deploying contracts
  async function deployChimeraFixture() {
    const [owner, user1, user2, agent1, agent2] = await ethers.getSigners();

    // Deploy mock PYUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const pyusdToken = await MockERC20.deploy("PayPal USD", "PYUSD", 18);

    // Deploy mock Pyth oracle
    const MockPyth = await ethers.getContractFactory("MockPyth");
    const pythOracle = await MockPyth.deploy();

    // Deploy ChimeraProtocol
    const ChimeraProtocol = await ethers.getContractFactory("ChimeraProtocol");
    const chimera = await ChimeraProtocol.deploy(
      await pythOracle.getAddress(),
      await pyusdToken.getAddress()
    );

    // Mint PYUSD tokens to users
    const mintAmount = ethers.parseUnits("10000", 18);
    await pyusdToken.mint(user1.address, mintAmount);
    await pyusdToken.mint(user2.address, mintAmount);
    await pyusdToken.mint(agent1.address, mintAmount);

    // Approve ChimeraProtocol to spend PYUSD
    await pyusdToken.connect(user1).approve(await chimera.getAddress(), mintAmount);
    await pyusdToken.connect(user2).approve(await chimera.getAddress(), mintAmount);
    await pyusdToken.connect(agent1).approve(await chimera.getAddress(), mintAmount);

    return {
      chimera,
      pyusdToken,
      pythOracle,
      owner,
      user1,
      user2,
      agent1,
      agent2
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      const { chimera, pyusdToken, pythOracle, owner } = await loadFixture(deployChimeraFixture);

      expect(await chimera.owner()).to.equal(owner.address);
      expect(await chimera.pyusdToken()).to.equal(await pyusdToken.getAddress());
      expect(await chimera.pyth()).to.equal(await pythOracle.getAddress());
      expect(await chimera.marketCounter()).to.equal(0);
      expect(await chimera.PLATFORM_FEE()).to.equal(250); // 2.5%
    });
  });

  describe("Market Creation", function () {
    it("Should create a custom event market", async function () {
      const { chimera, owner } = await loadFixture(deployChimeraFixture);

      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;

      await expect(
        chimera.createMarket(
          "Test Market",
          "Test Description",
          "Option A",
          "Option B",
          1, // category
          endTime,
          ethers.parseUnits("1", 18), // min bet
          ethers.parseUnits("100", 18), // max bet
          "https://example.com/image.png",
          1, // CustomEvent
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          0,
          false
        )
      ).to.emit(chimera, "MarketCreated");

      const market = await chimera.getMarket(1);
      expect(market.title).to.equal("Test Market");
      expect(market.creator).to.equal(owner.address);
      expect(market.status).to.equal(0); // Active
    });

    it("Should create a price direction market", async function () {
      const { chimera, owner } = await loadFixture(deployChimeraFixture);

      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      const priceId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
      const targetPrice = ethers.parseUnits("3000", 8);

      await expect(
        chimera.createMarket(
          "ETH Price Market",
          "Will ETH be above $3000?",
          "Above $3000",
          "Below $3000",
          1,
          endTime,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100", 18),
          "https://example.com/eth.png",
          0, // PriceDirection
          priceId,
          targetPrice,
          true
        )
      ).to.emit(chimera, "MarketCreated");

      const market = await chimera.getMarket(1);
      expect(market.marketType).to.equal(0); // PriceDirection
      expect(market.pythPriceId).to.equal(priceId);
      expect(market.targetPrice).to.equal(targetPrice);
      expect(market.priceAbove).to.equal(true);
    });
  });

  describe("Agent Delegation (as specified in eth.md)", function () {
    it("Should allow user to delegate to agent", async function () {
      const { chimera, user1, agent1 } = await loadFixture(deployChimeraFixture);

      const maxBetAmount = ethers.parseUnits("100", 18);

      await expect(
        chimera.connect(user1).delegateToAgent(agent1.address, maxBetAmount)
      ).to.emit(chimera, "AgentDelegationUpdated")
        .withArgs(user1.address, agent1.address, true, maxBetAmount);

      expect(await chimera.isAgentDelegated(user1.address, agent1.address)).to.be.true;
      expect(await chimera.getAgentMaxBet(agent1.address)).to.equal(maxBetAmount);
    });

    it("Should allow user to revoke delegation", async function () {
      const { chimera, user1, agent1 } = await loadFixture(deployChimeraFixture);

      const maxBetAmount = ethers.parseUnits("100", 18);
      await chimera.connect(user1).delegateToAgent(agent1.address, maxBetAmount);

      await expect(
        chimera.connect(user1).revokeDelegation(agent1.address)
      ).to.emit(chimera, "AgentDelegationUpdated")
        .withArgs(user1.address, agent1.address, false, 0);

      expect(await chimera.isAgentDelegated(user1.address, agent1.address)).to.be.false;
    });
  });

  describe("Betting System (PYUSD integration as per eth.md)", function () {
    it("Should allow direct user betting", async function () {
      const { chimera, user1, owner } = await loadFixture(deployChimeraFixture);

      // Create market
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("100", 18),
        "https://example.com/image.png",
        1, // CustomEvent
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      const betAmount = ethers.parseUnits("10", 18);

      await expect(
        chimera.connect(user1).placeBet(1, 0, betAmount)
      ).to.emit(chimera, "BetPlaced")
        .withArgs(1, user1.address, ethers.ZeroAddress, 0, betAmount, betAmount);

      const position = await chimera.getUserPosition(user1.address, 1);
      expect(position.optionAShares).to.equal(betAmount);
      expect(position.totalInvested).to.equal(betAmount);
    });

    it("Should allow agent betting with proper delegation", async function () {
      const { chimera, user1, agent1, owner } = await loadFixture(deployChimeraFixture);

      // Create market
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("100", 18),
        "https://example.com/image.png",
        1,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      // Delegate to agent
      const maxBetAmount = ethers.parseUnits("100", 18);
      await chimera.connect(user1).delegateToAgent(agent1.address, maxBetAmount);

      const betAmount = ethers.parseUnits("10", 18);

      await expect(
        chimera.connect(agent1).placeBetForUser(1, 0, betAmount, user1.address)
      ).to.emit(chimera, "BetPlaced")
        .withArgs(1, user1.address, agent1.address, 0, betAmount, betAmount);

      const position = await chimera.getUserPosition(user1.address, 1);
      expect(position.optionAShares).to.equal(betAmount);
    });

    it("Should reject agent betting without delegation", async function () {
      const { chimera, user1, agent1, owner } = await loadFixture(deployChimeraFixture);

      // Create market
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("100", 18),
        "https://example.com/image.png",
        1,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      const betAmount = ethers.parseUnits("10", 18);

      await expect(
        chimera.connect(agent1).placeBetForUser(1, 0, betAmount, user1.address)
      ).to.be.revertedWith("Agent not authorized");
    });

    it("Should enforce delegation limits", async function () {
      const { chimera, user1, agent1, owner } = await loadFixture(deployChimeraFixture);

      // Create market
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("1000", 18),
        "https://example.com/image.png",
        1,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      // Delegate with limit
      const maxBetAmount = ethers.parseUnits("50", 18);
      await chimera.connect(user1).delegateToAgent(agent1.address, maxBetAmount);

      const excessiveBet = ethers.parseUnits("100", 18);

      await expect(
        chimera.connect(agent1).placeBetForUser(1, 0, excessiveBet, user1.address)
      ).to.be.revertedWith("Amount exceeds agent limit");
    });
  });

  describe("Market Resolution", function () {
    it("Should resolve custom event market manually", async function () {
      const { chimera, user1, owner } = await loadFixture(deployChimeraFixture);

      // Create and setup market with bets
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("100", 18),
        "https://example.com/image.png",
        1,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      const betAmount = ethers.parseUnits("10", 18);
      await chimera.connect(user1).placeBet(1, 0, betAmount);

      await expect(
        chimera.resolveMarket(1, 0)
      ).to.emit(chimera, "MarketResolved")
        .withArgs(1, 0, owner.address, 0);

      const market = await chimera.getMarket(1);
      expect(market.resolved).to.be.true;
      expect(market.outcome).to.equal(0);
      expect(market.status).to.equal(2); // Resolved
    });
  });

  describe("Rewards and Claims", function () {
    it("Should allow winners to claim rewards", async function () {
      const { chimera, pyusdToken, user1, user2, owner } = await loadFixture(deployChimeraFixture);

      // Create market
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;
      await chimera.createMarket(
        "Test Market",
        "Test Description",
        "Option A",
        "Option B",
        1,
        endTime,
        ethers.parseUnits("1", 18),
        ethers.parseUnits("100", 18),
        "https://example.com/image.png",
        1,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        0,
        false
      );

      // Place bets
      const betAmount = ethers.parseUnits("10", 18);
      await chimera.connect(user1).placeBet(1, 0, betAmount); // Winner
      await chimera.connect(user2).placeBet(1, 1, betAmount); // Loser

      // Resolve market (Option A wins)
      await chimera.resolveMarket(1, 0);

      const initialBalance = await pyusdToken.balanceOf(user1.address);

      // Claim winnings
      await chimera.connect(user1).claimWinnings(1);

      const finalBalance = await pyusdToken.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});

// Mock contracts for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;
    
    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
`;

const MockPythSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract MockPyth is IPyth {
    mapping(bytes32 => PythStructs.Price) private prices;
    
    function getValidTimePeriod() external pure returns (uint) {
        return 60;
    }
    
    function getPrice(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function getEmaPrice(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function getPriceUnsafe(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function getEmaPriceUnsafe(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function getEmaPriceNoOlderThan(bytes32 id, uint age) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
    
    function updatePriceFeeds(bytes[] calldata updateData) external payable {
        // Mock implementation
    }
    
    function updatePriceFeedsIfNecessary(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64[] calldata publishTimes) external payable {
        // Mock implementation
    }
    
    function getUpdateFee(bytes[] calldata updateData) external pure returns (uint feeAmount) {
        return updateData.length * 1 wei;
    }
    
    function parsePriceFeedUpdates(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64 minPublishTime, uint64 maxPublishTime) external payable returns (PythStructs.PriceFeed[] memory) {
        // Mock implementation
        PythStructs.PriceFeed[] memory feeds = new PythStructs.PriceFeed[](priceIds.length);
        return feeds;
    }
    
    // Helper function to set mock prices for testing
    function setPrice(bytes32 id, int64 price, uint64 conf, int32 expo, uint64 publishTime) external {
        prices[id] = PythStructs.Price({
            price: price,
            conf: conf,
            expo: expo,
            publishTime: publishTime
        });
    }
}
`;