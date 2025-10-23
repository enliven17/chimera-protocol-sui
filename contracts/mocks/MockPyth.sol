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
    
    function parsePriceFeedUpdatesUnique(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64 minPublishTime, uint64 maxPublishTime) external payable returns (PythStructs.PriceFeed[] memory) {
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