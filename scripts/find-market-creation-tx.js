#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function findMarketCreationTx() {
  console.log('🔍 Finding market creation transactions...\n');

  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
  const contractAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;

  // MarketCreated event signature
  const marketCreatedTopic = ethers.id("MarketCreated(uint256,string,address,uint8)");
  
  console.log('Contract:', contractAddress);
  console.log('Event Topic:', marketCreatedTopic);

  try {
    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log('Current Block:', currentBlock);

    // Search for MarketCreated events in recent blocks
    const fromBlock = currentBlock - 50000; // Last 50k blocks
    const toBlock = currentBlock;

    console.log(`\n🔍 Searching for MarketCreated events from block ${fromBlock} to ${toBlock}...`);

    const filter = {
      address: contractAddress,
      topics: [marketCreatedTopic],
      fromBlock: fromBlock,
      toBlock: toBlock
    };

    const logs = await provider.getLogs(filter);
    
    console.log(`\n📊 Found ${logs.length} MarketCreated events:`);

    if (logs.length > 0) {
      for (const log of logs) {
        const block = await provider.getBlock(log.blockNumber);
        console.log(`\n🎯 Market Creation:`);
        console.log(`   Block: ${log.blockNumber}`);
        console.log(`   Timestamp: ${new Date(block.timestamp * 1000).toISOString()}`);
        console.log(`   Transaction: ${log.transactionHash}`);
        
        // Decode the event
        const iface = new ethers.Interface([
          "event MarketCreated(uint256 indexed marketId, string title, address indexed creator, uint8 marketType)"
        ]);
        
        try {
          const decoded = iface.parseLog(log);
          console.log(`   Market ID: ${decoded.args.marketId}`);
          console.log(`   Title: ${decoded.args.title}`);
          console.log(`   Creator: ${decoded.args.creator}`);
          console.log(`   Type: ${decoded.args.marketType}`);
        } catch (decodeError) {
          console.log(`   Could not decode event data`);
        }
      }

      // Suggest start block
      const earliestBlock = Math.min(...logs.map(log => log.blockNumber));
      const suggestedStartBlock = earliestBlock - 100; // A bit before the first event
      
      console.log(`\n🎯 Suggested start_block for Envio: ${suggestedStartBlock}`);
      return suggestedStartBlock;
    } else {
      console.log('❌ No MarketCreated events found in recent blocks');
      
      // Try with a different event signature (in case the ABI is different)
      console.log('\n🔍 Trying alternative event signature...');
      
      const altTopic = ethers.id("MarketCreated(uint256,string,address,uint256)");
      const altFilter = {
        address: contractAddress,
        topics: [altTopic],
        fromBlock: fromBlock,
        toBlock: toBlock
      };
      
      const altLogs = await provider.getLogs(altFilter);
      console.log(`Found ${altLogs.length} events with alternative signature`);
      
      return null;
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

findMarketCreationTx();