#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function deploySuiContract() {
  console.log('🚀 Deploying Sui Prediction Market Contract...\n');

  try {
    // Check if sui CLI is available
    try {
      execSync('sui --version', { stdio: 'pipe' });
      console.log('✅ Sui CLI found');
    } catch (error) {
      console.error('❌ Sui CLI not found. Please install Sui CLI first.');
      console.log('Installation guide: https://docs.sui.io/guides/developer/getting-started/sui-install');
      process.exit(1);
    }

    // Check if we're connected to testnet
    try {
      const envOutput = execSync('sui client active-env', { encoding: 'utf8' });
      console.log(`📡 Active environment: ${envOutput.trim()}`);
      
      if (!envOutput.includes('testnet')) {
        console.log('⚠️  Switching to testnet...');
        execSync('sui client switch --env testnet', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('🔧 Setting up testnet environment...');
      execSync('sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443', { stdio: 'inherit' });
      execSync('sui client switch --env testnet', { stdio: 'inherit' });
    }

    // Check wallet balance
    try {
      const balanceOutput = execSync('sui client balance', { encoding: 'utf8' });
      console.log('💰 Wallet balance:');
      console.log(balanceOutput);
      
      if (balanceOutput.includes('0 SUI')) {
        console.log('💧 Getting test SUI from faucet...');
        execSync('sui client faucet', { stdio: 'inherit' });
        
        // Wait a bit for faucet
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.log('💧 Getting test SUI from faucet...');
      execSync('sui client faucet', { stdio: 'inherit' });
    }

    // Build the contract
    console.log('\n🔨 Building Sui contract...');
    process.chdir('sui_contracts');
    execSync('sui move build', { stdio: 'inherit' });

    // Deploy the contract
    console.log('\n📦 Deploying contract...');
    const deployOutput = execSync('sui client publish --gas-budget 20000000 --json', { encoding: 'utf8' });
    const deployResult = JSON.parse(deployOutput);

    if (deployResult.effects?.status?.status !== 'success') {
      throw new Error('Deployment failed');
    }

    // Extract important information
    const packageId = deployResult.objectChanges?.find(change => 
      change.type === 'published'
    )?.packageId;

    const registryObject = deployResult.objectChanges?.find(change => 
      change.type === 'created' && 
      change.objectType?.includes('MarketRegistry')
    );

    if (!packageId) {
      throw new Error('Could not find package ID in deployment result');
    }

    console.log('\n🎉 Deployment successful!');
    console.log('📋 Deployment Details:');
    console.log(`   Package ID: ${packageId}`);
    if (registryObject) {
      console.log(`   Registry ID: ${registryObject.objectId}`);
    }
    console.log(`   Transaction: ${deployResult.digest}`);

    // Update .env file
    process.chdir('..');
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUI_PACKAGE_ID=.*/,
      `NEXT_PUBLIC_SUI_PACKAGE_ID=${packageId}`
    );
    
    if (registryObject) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_SUI_MARKET_REGISTRY_ID=.*/,
        `NEXT_PUBLIC_SUI_MARKET_REGISTRY_ID=${registryObject.objectId}`
      );
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables updated in .env file');

    // Save deployment info
    const deploymentInfo = {
      packageId,
      registryId: registryObject?.objectId,
      transactionDigest: deployResult.digest,
      timestamp: new Date().toISOString(),
      network: 'testnet'
    };

    const deploymentsDir = 'deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    const deploymentFile = path.join(deploymentsDir, `sui-testnet-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to ${deploymentFile}`);

    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit /sui-markets to test the prediction markets');
    console.log('3. Connect your Sui wallet and create your first market!');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.stdout) {
      console.log('\nStdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('\nStderr:', error.stderr.toString());
    }
    
    process.exit(1);
  }
}

// Run deployment
deploySuiContract().catch(console.error);