#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

async function createSuimeraMarket() {
  console.log('🎯 Creating Suimera Hackathon Market on Sui...\n');

  try {
    // Check if sui CLI is available
    let suiCommand = 'sui';
    try {
      execSync('sui --version', { stdio: 'pipe' });
      console.log('✅ Sui CLI found');
    } catch (error) {
      // Try local sui CLI
      try {
        execSync('.\\sui\\sui.exe --version', { stdio: 'pipe' });
        suiCommand = '.\\sui\\sui.exe';
        console.log('✅ Local Sui CLI found');
      } catch (localError) {
        console.error('❌ Sui CLI not found. Please install Sui CLI first.');
        process.exit(1);
      }
    }

    // Read environment variables
    const envContent = fs.readFileSync('.env', 'utf8');
    const packageId = envContent.match(/NEXT_PUBLIC_SUI_PACKAGE_ID=(.*)/)?.[1];
    const registryId = envContent.match(/NEXT_PUBLIC_SUI_MARKET_REGISTRY_ID=(.*)/)?.[1];

    if (!packageId || !registryId) {
      console.error('❌ Package ID or Registry ID not found in .env file');
      console.log('Please run: node scripts/deploy-sui.js first');
      process.exit(1);
    }

    console.log(`📦 Package ID: ${packageId}`);
    console.log(`🏪 Registry ID: ${registryId}`);

    // Market parameters
    const marketTitle = "Will Suimera project win the Build on SUI Hackathon?";
    const marketDescription = "Prediction market for whether the Suimera project will win the Build on SUI Hackathon. The market will resolve based on the official hackathon results announcement. Suimera is an AI-powered prediction market platform built on Sui blockchain with Walrus storage integration.";
    const optionA = "Yes - Suimera wins";
    const optionB = "No - Suimera doesn't win";
    const category = 3; // Technology
    const endTime = Date.now() + (48 * 60 * 60 * 1000); // 48 hours from now in milliseconds
    const minBet = 100000000; // 0.1 SUI in MIST
    const maxBet = 50000000000; // 50 SUI in MIST
    const imageUrl = "/sui2.png";

    console.log('\n📋 Market Details:');
    console.log(`Title: ${marketTitle}`);
    console.log(`Option A: ${optionA}`);
    console.log(`Option B: ${optionB}`);
    console.log(`Category: Technology (${category})`);
    console.log(`Duration: 48 hours`);
    console.log(`Min Bet: 0.1 SUI`);
    console.log(`Max Bet: 50 SUI`);
    console.log(`Image: ${imageUrl}`);

    // Check wallet balance
    try {
      const balanceOutput = execSync(`${suiCommand} client balance`, { encoding: 'utf8' });
      console.log('\n💰 Wallet balance:');
      console.log(balanceOutput);
    } catch (error) {
      console.log('⚠️ Could not check wallet balance');
    }

    // Create market transaction
    console.log('\n🚀 Creating market on Sui blockchain...');
    
    // Get clock object ID (0x6 is the shared clock object on Sui)
    const clockId = "0x6";
    const marketType = 0; // MARKET_TYPE_CUSTOM
    const targetPrice = 0;
    const priceAbove = true;
    
    const createMarketCommand = `${suiCommand} client call --package ${packageId} --module prediction_market --function create_market --args ${registryId} "${marketTitle}" "${marketDescription}" "${optionA}" "${optionB}" ${category} ${endTime} ${minBet} ${maxBet} "${imageUrl}" ${marketType} ${targetPrice} ${priceAbove} ${clockId} --gas-budget 10000000 --json`;

    console.log('📤 Executing transaction...');
    const result = execSync(createMarketCommand, { encoding: 'utf8' });
    const txResult = JSON.parse(result);

    if (txResult.effects?.status?.status !== 'success') {
      throw new Error('Market creation failed');
    }

    // Extract market ID
    const marketObject = txResult.objectChanges?.find(change =>
      change.type === 'created' &&
      change.objectType?.includes('Market')
    );

    console.log('\n🎉 Market created successfully!');
    console.log('📋 Transaction Details:');
    console.log(`   Transaction: ${txResult.digest}`);
    if (marketObject) {
      console.log(`   Market ID: ${marketObject.objectId}`);
    }

    // Save market info
    const marketInfo = {
      title: marketTitle,
      description: marketDescription,
      optionA,
      optionB,
      category,
      endTime,
      minBet: "0.1",
      maxBet: "50",
      imageUrl,
      marketId: marketObject?.objectId,
      transactionDigest: txResult.digest,
      timestamp: new Date().toISOString(),
      network: 'testnet'
    };

    const marketsDir = 'markets';
    if (!fs.existsSync(marketsDir)) {
      fs.mkdirSync(marketsDir);
    }

    const marketFile = `markets/suimera-hackathon-${Date.now()}.json`;
    fs.writeFileSync(marketFile, JSON.stringify(marketInfo, null, 2));
    console.log(`📄 Market info saved to ${marketFile}`);

    console.log('\n🌐 Next steps:');
    console.log('1. Visit http://localhost:3000/markets to see your market');
    console.log('2. Share the market with others to start betting!');
    console.log('3. Market will automatically resolve in 48 hours');

  } catch (error) {
    console.error('\n❌ Market creation failed:', error.message);
    
    if (error.stdout) {
      console.log('\nStdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('\nStderr:', error.stderr.toString());
    }

    process.exit(1);
  }
}

// Run market creation
createSuimeraMarket().catch(console.error);