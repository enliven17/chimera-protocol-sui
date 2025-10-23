#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);

// ChimeraProtocol ABI - just the events we need
const abi = [
  "event MarketCreated(uint256 indexed marketId, string title, address indexed creator, uint8 marketType)",
  "event BetPlaced(uint256 indexed marketId, address indexed user, address indexed agent, uint8 option, uint256 amount, uint256 shares)",
  "event MarketResolved(uint256 indexed marketId, uint8 outcome, address indexed resolver, int64 finalPrice)",
  "event AgentDelegationUpdated(address indexed user, address indexed agent, bool approved, uint256 maxBetAmount)",
  "event PythPriceUpdated(bytes32 indexed priceId, int64 price, uint64 timestamp)"
];

async function checkEventSignatures() {
  console.log('🔍 Checking event signatures...\n');

  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS, abi, provider);
  
  // Get event topics
  const marketCreatedTopic = contract.interface.getEvent('MarketCreated').topicHash;
  const betPlacedTopic = contract.interface.getEvent('BetPlaced').topicHash;
  const marketResolvedTopic = contract.interface.getEvent('MarketResolved').topicHash;
  const agentDelegationTopic = contract.interface.getEvent('AgentDelegationUpdated').topicHash;
  const pythPriceTopic = contract.interface.getEvent('PythPriceUpdated').topicHash;

  console.log('📋 Event Topics:');
  console.log(`   MarketCreated: ${marketCreatedTopic}`);
  console.log(`   BetPlaced: ${betPlacedTopic}`);
  console.log(`   MarketResolved: ${marketResolvedTopic}`);
  console.log(`   AgentDelegationUpdated: ${agentDelegationTopic}`);
  console.log(`   PythPriceUpdated: ${pythPriceTopic}`);

  // Check for events in the specific transaction we know exists
  const txHash = '0x0bc5c2f1618dc5ac2949ff5f45e752b5c6876a19e819be5c01ea324a824f1c27';
  console.log(`\n🔍 Checking transaction: ${txHash}`);
  
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Logs: ${receipt.logs.length}`);
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\n   Log ${i}:`);
      console.log(`     Address: ${log.address}`);
      console.log(`     Topic[0]: ${log.topics[0]}`);
      
      if (log.topics[0] === marketCreatedTopic) {
        console.log('     ✅ This is a MarketCreated event!');
        
        // Decode the event
        const decoded = contract.interface.parseLog(log);
        console.log('     Decoded:', {
          marketId: decoded.args.marketId.toString(),
          title: decoded.args.title,
          creator: decoded.args.creator,
          marketType: decoded.args.marketType
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking transaction:', error.message);
  }

  // Also check recent blocks for any events
  console.log('\n🔍 Checking recent blocks for events...');
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(26156705, currentBlock - 1000);
  
  try {
    const filter = {
      address: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
      topics: [marketCreatedTopic],
      fromBlock: fromBlock,
      toBlock: currentBlock
    };
    
    const logs = await provider.getLogs(filter);
    console.log(`   Found ${logs.length} MarketCreated events from block ${fromBlock} to ${currentBlock}`);
    
    for (const log of logs) {
      const decoded = contract.interface.parseLog(log);
      console.log(`   Block ${log.blockNumber}: Market "${decoded.args.title}" (ID: ${decoded.args.marketId})`);
    }
    
  } catch (error) {
    console.error('❌ Error querying events:', error.message);
  }
}

checkEventSignatures();