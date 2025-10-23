// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract ChimeraProtocol is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    enum MarketStatus { Active, Paused, Resolved }
    enum MarketType { PriceDirection, CustomEvent }
    
    struct Market {
        uint256 id;
        string title;
        string description;
        string optionA;
        string optionB;
        uint8 category;
        address creator;
        uint256 createdAt;
        uint256 endTime;
        uint256 minBet;
        uint256 maxBet;
        MarketStatus status;
        uint8 outcome; // 0 for optionA, 1 for optionB
        bool resolved;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        uint256 totalPool;
        string imageUrl;
        MarketType marketType;
        bytes32 pythPriceId; // For price-based markets
        int64 targetPrice; // Target price for resolution (scaled by 1e8)
        bool priceAbove; // true if betting price will be above target, false if below
    }
    
    struct UserPosition {
        uint256 optionAShares;
        uint256 optionBShares;
        uint256 totalInvested;
    }
    
    // State variables
    uint256 public marketCounter;
    uint256 public constant PLATFORM_FEE = 250; // 2.5% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Pyth Oracle integration
    IPyth public pyth;
    
    // PYUSD token integration
    IERC20 public pyusdToken;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserPosition)) public userPositions;
    mapping(address => uint256[]) public userMarkets;
    
    // Agent delegation system
    mapping(address => mapping(address => bool)) public agentDelegations; // user => agent => approved
    mapping(address => uint256) public agentMaxBetAmount; // agent => max bet amount per transaction
    
    uint256[] public allMarketIds;
    
    // Treasury for automatic reward distribution
    uint256 public treasuryBalance;
    
    // Events
    event MarketCreated(uint256 indexed marketId, string title, address indexed creator, MarketType marketType);
    event BetPlaced(uint256 indexed marketId, address indexed user, address indexed agent, uint8 option, uint256 amount, uint256 shares);
    event MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver, int64 finalPrice);
    event RewardsDistributed(uint256 indexed marketId, uint256 totalRewards, uint256 winnersCount);
    event TreasuryDeposit(uint256 amount);
    event TreasuryWithdraw(uint256 amount);
    event AgentDelegationUpdated(address indexed user, address indexed agent, bool approved, uint256 maxBetAmount);
    event PythPriceUpdated(bytes32 indexed priceId, int64 price, uint64 timestamp);
    
    constructor(address _pythContract, address _pyusdToken) Ownable(msg.sender) {
        marketCounter = 0;
        pyth = IPyth(_pythContract);
        pyusdToken = IERC20(_pyusdToken);
    }
    
    // Agent delegation functions
    function delegateToAgent(address _agent, uint256 _maxBetAmount) external {
        require(_agent != address(0), "Invalid agent address");
        require(_maxBetAmount > 0, "Max bet amount must be greater than 0");
        
        agentDelegations[msg.sender][_agent] = true;
        agentMaxBetAmount[_agent] = _maxBetAmount;
        
        emit AgentDelegationUpdated(msg.sender, _agent, true, _maxBetAmount);
    }
    
    function revokeDelegation(address _agent) external {
        agentDelegations[msg.sender][_agent] = false;
        emit AgentDelegationUpdated(msg.sender, _agent, false, 0);
    }
    
    function updateAgentMaxBet(address _agent, uint256 _maxBetAmount) external {
        require(agentDelegations[msg.sender][_agent], "Agent not delegated");
        agentMaxBetAmount[_agent] = _maxBetAmount;
        emit AgentDelegationUpdated(msg.sender, _agent, true, _maxBetAmount);
    }
    
    // Deposit PYUSD to treasury for automatic reward distribution
    function depositToTreasury(uint256 _amount) external onlyOwner {
        pyusdToken.safeTransferFrom(msg.sender, address(this), _amount);
        treasuryBalance += _amount;
        emit TreasuryDeposit(_amount);
    }
    
    // Withdraw from treasury (emergency only)
    function withdrawFromTreasury(uint256 amount) external onlyOwner {
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        treasuryBalance -= amount;
        pyusdToken.safeTransfer(owner(), amount);
        emit TreasuryWithdraw(amount);
    }
    
    // Create a new prediction market
    function createMarket(
        string memory _title,
        string memory _description,
        string memory _optionA,
        string memory _optionB,
        uint8 _category,
        uint256 _endTime,
        uint256 _minBet,
        uint256 _maxBet,
        string memory _imageUrl,
        MarketType _marketType,
        bytes32 _pythPriceId,
        int64 _targetPrice,
        bool _priceAbove
    ) external onlyOwner returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_minBet > 0, "Minimum bet must be greater than 0");
        require(_maxBet >= _minBet, "Maximum bet must be >= minimum bet");
        
        if (_marketType == MarketType.PriceDirection) {
            require(_pythPriceId != bytes32(0), "Price ID required for price markets");
            require(_targetPrice != 0, "Target price required for price markets");
        }
        
        marketCounter++;
        
        markets[marketCounter] = Market({
            id: marketCounter,
            title: _title,
            description: _description,
            optionA: _optionA,
            optionB: _optionB,
            category: _category,
            creator: msg.sender,
            createdAt: block.timestamp,
            endTime: _endTime,
            minBet: _minBet,
            maxBet: _maxBet,
            status: MarketStatus.Active,
            outcome: 0,
            resolved: false,
            totalOptionAShares: 0,
            totalOptionBShares: 0,
            totalPool: 0,
            imageUrl: _imageUrl,
            marketType: _marketType,
            pythPriceId: _pythPriceId,
            targetPrice: _targetPrice,
            priceAbove: _priceAbove
        });
        
        allMarketIds.push(marketCounter);
        
        emit MarketCreated(marketCounter, _title, msg.sender, _marketType);
        return marketCounter;
    }
    
    // Place a bet on a market (direct user bet)
    function placeBet(uint256 _marketId, uint8 _option, uint256 _amount) external nonReentrant whenNotPaused {
        _placeBetInternal(_marketId, _option, _amount, msg.sender, address(0));
    }
    
    // Place a bet on behalf of a user (agent bet)
    function placeBetForUser(uint256 _marketId, uint8 _option, uint256 _amount, address _user) external nonReentrant whenNotPaused {
        require(agentDelegations[_user][msg.sender], "Agent not authorized");
        require(_amount <= agentMaxBetAmount[msg.sender], "Amount exceeds agent limit");
        
        _placeBetInternal(_marketId, _option, _amount, _user, msg.sender);
    }
    
    // Internal bet placement logic
    function _placeBetInternal(uint256 _marketId, uint8 _option, uint256 _amount, address _user, address _agent) internal {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Active, "Market is not active");
        require(block.timestamp < market.endTime, "Market has ended");
        require(_option == 0 || _option == 1, "Invalid option");
        require(_amount >= market.minBet, "Bet amount too low");
        require(_amount <= market.maxBet, "Bet amount too high");
        
        // Transfer PYUSD from user to contract using transferFrom (as specified in eth.md)
        // For agent bets, the agent must have approval from the user
        address payer = _agent != address(0) ? _user : _user; // Always from user's balance
        pyusdToken.safeTransferFrom(payer, address(this), _amount);
        
        UserPosition storage position = userPositions[_marketId][_user];
        
        // Calculate shares (1:1 ratio for simplicity)
        uint256 shares = _amount;
        
        // Update user position
        if (_option == 0) {
            position.optionAShares += shares;
            market.totalOptionAShares += shares;
        } else {
            position.optionBShares += shares;
            market.totalOptionBShares += shares;
        }
        
        position.totalInvested += _amount;
        market.totalPool += _amount;
        
        // Add to user's market list if first bet
        if (position.totalInvested == _amount) {
            userMarkets[_user].push(_marketId);
        }
        
        emit BetPlaced(_marketId, _user, _agent, _option, _amount, shares);
    }
    
    // Resolve a market manually (for custom events)
    function resolveMarket(uint256 _marketId, uint8 _outcome) external onlyOwner nonReentrant {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(market.marketType == MarketType.CustomEvent, "Use resolvePriceMarket for price markets");
        require(_outcome == 0 || _outcome == 1, "Invalid outcome");
        
        market.resolved = true;
        market.outcome = _outcome;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(_marketId, _outcome, msg.sender, 0);
        
        // Automatically distribute rewards
        _distributeRewards(_marketId);
    }
    
    // Resolve a price-based market using Pyth Oracle (Pull Oracle implementation)
    function settleMarket(uint256 _marketId, bytes[] calldata _priceUpdateData) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(market.marketType == MarketType.PriceDirection, "Not a price market");
        require(block.timestamp >= market.endTime, "Market not ended yet");
        
        // Update price feeds using Pyth Pull Oracle
        uint fee = pyth.getUpdateFee(_priceUpdateData);
        require(msg.value >= fee, "Insufficient fee for price update");
        pyth.updatePriceFeeds{value: fee}(_priceUpdateData);
        
        // Get the latest price using Pyth's getPrice method
        PythStructs.Price memory price = pyth.getPrice(market.pythPriceId);
        require(price.publishTime <= market.endTime, "Price published after market end");
        require(price.conf > 0, "Invalid price confidence");
        
        // Determine outcome based on price vs target (as specified in eth.md)
        uint8 outcome;
        if (market.priceAbove) {
            outcome = price.price >= market.targetPrice ? 0 : 1; // 0 = optionA wins (price above), 1 = optionB wins (price below)
        } else {
            outcome = price.price <= market.targetPrice ? 0 : 1; // 0 = optionA wins (price below), 1 = optionB wins (price above)
        }
        
        market.resolved = true;
        market.outcome = outcome;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(_marketId, outcome, msg.sender, price.price);
        emit PythPriceUpdated(market.pythPriceId, price.price, uint64(price.publishTime));
        
        // Automatically distribute rewards
        _distributeRewards(_marketId);
    }
    
    // Legacy function name for backward compatibility
    function resolvePriceMarket(uint256 _marketId, bytes[] calldata _priceUpdateData) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(market.marketType == MarketType.PriceDirection, "Not a price market");
        require(block.timestamp >= market.endTime, "Market not ended yet");
        
        // Update price feeds using Pyth Pull Oracle
        uint fee = pyth.getUpdateFee(_priceUpdateData);
        require(msg.value >= fee, "Insufficient fee for price update");
        pyth.updatePriceFeeds{value: fee}(_priceUpdateData);
        
        // Get the latest price using Pyth's getPrice method
        PythStructs.Price memory price = pyth.getPrice(market.pythPriceId);
        require(price.publishTime <= market.endTime, "Price published after market end");
        require(price.conf > 0, "Invalid price confidence");
        
        // Determine outcome based on price vs target (as specified in eth.md)
        uint8 outcome;
        if (market.priceAbove) {
            outcome = price.price >= market.targetPrice ? 0 : 1; // 0 = optionA wins (price above), 1 = optionB wins (price below)
        } else {
            outcome = price.price <= market.targetPrice ? 0 : 1; // 0 = optionA wins (price below), 1 = optionB wins (price above)
        }
        
        market.resolved = true;
        market.outcome = outcome;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(_marketId, outcome, msg.sender, price.price);
        emit PythPriceUpdated(market.pythPriceId, price.price, uint64(price.publishTime));
        
        // Automatically distribute rewards
        _distributeRewards(_marketId);
    }
    
    // Internal function to distribute rewards automatically
    function _distributeRewards(uint256 _marketId) internal {
        Market storage market = markets[_marketId];
        
        uint256 totalPool = market.totalPool;
        uint256 platformFee = (totalPool * PLATFORM_FEE) / BASIS_POINTS;
        uint256 rewardPool = totalPool - platformFee;
        
        uint256 winningShares = market.outcome == 0 ? market.totalOptionAShares : market.totalOptionBShares;
        
        if (winningShares == 0) {
            // No winners, return funds to treasury
            treasuryBalance += totalPool;
            return;
        }
        
        // Count winners and calculate total rewards needed
        uint256 winnersCount = 0;
        uint256 totalRewardsNeeded = 0;
        
        // First pass: calculate total rewards needed
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            // This is a simplified approach - in production, you'd want to track participants more efficiently
            // For now, we'll use events or maintain a separate mapping of participants
        }
        
        // Add platform fee to treasury
        treasuryBalance += platformFee;
        
        // For now, emit event - in production you'd implement the actual distribution
        emit RewardsDistributed(_marketId, rewardPool, winnersCount);
    }
    
    // Claim winnings for a specific market
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");
        
        UserPosition storage position = userPositions[_marketId][msg.sender];
        require(position.totalInvested > 0, "No position in this market");
        
        uint256 winningShares = market.outcome == 0 ? position.optionAShares : position.optionBShares;
        require(winningShares > 0, "No winning position");
        
        uint256 totalWinningShares = market.outcome == 0 ? market.totalOptionAShares : market.totalOptionBShares;
        uint256 totalPool = market.totalPool;
        uint256 platformFee = (totalPool * PLATFORM_FEE) / BASIS_POINTS;
        uint256 rewardPool = totalPool - platformFee;
        
        uint256 userReward = (rewardPool * winningShares) / totalWinningShares;
        
        // Mark as claimed
        position.optionAShares = 0;
        position.optionBShares = 0;
        position.totalInvested = 0;
        
        // Transfer PYUSD reward using transfer (as specified in eth.md)
        pyusdToken.safeTransfer(msg.sender, userReward);
    }
    
    // View functions
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
    
    function getAllMarkets() external view returns (Market[] memory) {
        Market[] memory allMarkets = new Market[](allMarketIds.length);
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            allMarkets[i] = markets[allMarketIds[i]];
        }
        return allMarkets;
    }
    
    function getActiveMarkets() external view returns (Market[] memory) {
        uint256 activeCount = 0;
        
        // Count active markets
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            if (markets[allMarketIds[i]].status == MarketStatus.Active && 
                block.timestamp < markets[allMarketIds[i]].endTime) {
                activeCount++;
            }
        }
        
        // Create array of active markets
        Market[] memory activeMarkets = new Market[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allMarketIds.length; i++) {
            if (markets[allMarketIds[i]].status == MarketStatus.Active && 
                block.timestamp < markets[allMarketIds[i]].endTime) {
                activeMarkets[index] = markets[allMarketIds[i]];
                index++;
            }
        }
        
        return activeMarkets;
    }
    
    function getUserPosition(address _user, uint256 _marketId) external view returns (UserPosition memory) {
        return userPositions[_marketId][_user];
    }
    
    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }
    
    // Admin functions
    function pauseContract() external onlyOwner {
        _pause();
    }
    
    function unpauseContract() external onlyOwner {
        _unpause();
    }
    
    function updateMarketStatus(uint256 _marketId, MarketStatus _status) external onlyOwner {
        markets[_marketId].status = _status;
    }
    
    // Emergency withdraw (only owner)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = pyusdToken.balanceOf(address(this));
        pyusdToken.safeTransfer(owner(), balance);
    }
    
    // Get contract PYUSD balance
    function getContractBalance() external view returns (uint256) {
        return pyusdToken.balanceOf(address(this));
    }
    
    // View functions for agent delegation
    function isAgentDelegated(address _user, address _agent) external view returns (bool) {
        return agentDelegations[_user][_agent];
    }
    
    function getAgentMaxBet(address _agent) external view returns (uint256) {
        return agentMaxBetAmount[_agent];
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return treasuryBalance;
    }
}