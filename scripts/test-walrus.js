#!/usr/bin/env node

/**
 * Walrus Network Test Script
 * Tests storing and retrieving data from Walrus decentralized storage
 */

// Multiple Walrus endpoints for fallback
const WALRUS_ENDPOINTS = {
  publishers: [
    process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    'https://walrus-testnet-publisher.nodes.guru',
    'https://publisher-devnet.walrus.space'
  ],
  aggregators: [
    process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    'https://walrus-testnet-aggregator.nodes.guru',
    'https://aggregator-devnet.walrus.space'
  ]
};

async function testWalrusStorage() {
  console.log('🐋 Testing Walrus Decentralized Storage...\n');

  // Test data
  const testData = {
    type: 'test_data',
    timestamp: new Date().toISOString(),
    content: 'Hello from SuimeraAI! This is a test of Walrus storage.',
    metadata: {
      version: '1.0',
      platform: 'SuimeraAI',
      testId: Math.random().toString(36).substring(7)
    }
  };

  let blobId = null;
  let storeSuccess = false;

  // Try each publisher endpoint
  for (const publisherUrl of WALRUS_ENDPOINTS.publishers) {
    try {
      console.log(`📤 Trying publisher: ${publisherUrl}`);
      console.log('Data:', JSON.stringify(testData, null, 2));

      const jsonData = JSON.stringify(testData);
      const blob = new Blob([jsonData], { type: 'application/json' });

      const formData = new FormData();
      formData.append('file', blob);

      const storeResponse = await fetch(`${publisherUrl}/v1/store`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000)
      });

      if (!storeResponse.ok) {
        throw new Error(`Store failed: ${storeResponse.statusText}`);
      }

      const storeResult = await storeResponse.json();
      console.log('✅ Store response:', JSON.stringify(storeResult, null, 2));

      if (storeResult.newlyCreated) {
        blobId = storeResult.newlyCreated.blobObject.blobId;
        console.log(`🆕 New blob created with ID: ${blobId}`);
        console.log(`💰 Cost: ${storeResult.newlyCreated.cost} units`);
        storeSuccess = true;
        break;
      } else if (storeResult.alreadyCertified) {
        blobId = storeResult.alreadyCertified.blobId;
        console.log(`♻️  Blob already exists with ID: ${blobId}`);
        storeSuccess = true;
        break;
      } else {
        throw new Error('Unexpected store response format');
      }
    } catch (error) {
      console.error(`❌ Publisher ${publisherUrl} failed:`, error.message);
      continue;
    }
  }

  if (!storeSuccess) {
    console.error('❌ All publishers failed, cannot continue test');
    return;
  }

    // Step 2: Wait a moment for propagation
    console.log('\n⏳ Waiting for data propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Retrieve data from aggregators
    console.log('\n📥 Retrieving data from Walrus...');
    let retrievedData = null;
    let retrieveSuccess = false;

    for (const aggregatorUrl of WALRUS_ENDPOINTS.aggregators) {
      try {
        console.log(`📥 Trying aggregator: ${aggregatorUrl}`);
        const retrieveResponse = await fetch(`${aggregatorUrl}/v1/${blobId}`, {
          signal: AbortSignal.timeout(30000)
        });

        if (!retrieveResponse.ok) {
          throw new Error(`Retrieve failed: ${retrieveResponse.statusText}`);
        }

        retrievedData = await retrieveResponse.json();
        console.log('✅ Retrieved data:', JSON.stringify(retrievedData, null, 2));
        retrieveSuccess = true;
        break;
      } catch (error) {
        console.error(`❌ Aggregator ${aggregatorUrl} failed:`, error.message);
        continue;
      }
    }

    if (!retrieveSuccess) {
      console.error('❌ All aggregators failed, cannot verify data');
      return;
    }

    // Step 4: Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    const originalContent = testData.content;
    const retrievedContent = retrievedData.content;

    if (originalContent === retrievedContent) {
      console.log('✅ Data integrity verified! Content matches perfectly.');
    } else {
      console.log('❌ Data integrity check failed!');
      console.log('Original:', originalContent);
      console.log('Retrieved:', retrievedContent);
    }

    // Step 5: Test blob existence check
    console.log('\n🔍 Testing blob existence check...');
    let existenceConfirmed = false;

    for (const aggregatorUrl of WALRUS_ENDPOINTS.aggregators) {
      try {
        const headResponse = await fetch(`${aggregatorUrl}/v1/${blobId}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });

        if (headResponse.ok) {
          console.log(`✅ Blob existence confirmed via ${aggregatorUrl}`);
          existenceConfirmed = true;
          break;
        }
      } catch (error) {
        console.error(`❌ Existence check failed for ${aggregatorUrl}:`, error.message);
        continue;
      }
    }

    if (!existenceConfirmed) {
      console.log('❌ Blob existence check failed on all aggregators');
    }

    console.log('\n🎉 Walrus storage test completed successfully!');
    console.log(`📋 Blob ID for future reference: ${blobId}`);
    console.log(`🔗 Access URLs:`);
    WALRUS_ENDPOINTS.aggregators.forEach(url => {
      console.log(`   ${url}/v1/${blobId}`);
    });
}

async function testNetworkStatus() {
  console.log('🌐 Testing Walrus network status...\n');

  // Test publishers
  console.log('📤 Testing Publisher endpoints...');
  let publisherOnline = 0;
  for (const publisherUrl of WALRUS_ENDPOINTS.publishers) {
    try {
      const response = await fetch(`${publisherUrl}/v1/info`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log(`✅ Publisher online: ${publisherUrl}`);
        publisherOnline++;
        try {
          const info = await response.json();
          console.log(`   📊 Info: ${JSON.stringify(info, null, 2)}`);
        } catch {
          console.log('   📊 Info not available');
        }
      } else {
        console.log(`❌ Publisher offline: ${publisherUrl}`);
      }
    } catch (error) {
      console.log(`❌ Publisher error: ${publisherUrl} - ${error.message}`);
    }
  }

  // Test aggregators
  console.log('\n📥 Testing Aggregator endpoints...');
  let aggregatorOnline = 0;
  for (const aggregatorUrl of WALRUS_ENDPOINTS.aggregators) {
    try {
      const response = await fetch(`${aggregatorUrl}/v1/info`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log(`✅ Aggregator online: ${aggregatorUrl}`);
        aggregatorOnline++;
        try {
          const info = await response.json();
          console.log(`   📊 Info: ${JSON.stringify(info, null, 2)}`);
        } catch {
          console.log('   📊 Info not available');
        }
      } else {
        console.log(`❌ Aggregator offline: ${aggregatorUrl}`);
      }
    } catch (error) {
      console.log(`❌ Aggregator error: ${aggregatorUrl} - ${error.message}`);
    }
  }

  console.log(`\n📊 Network Status Summary:`);
  console.log(`   Publishers online: ${publisherOnline}/${WALRUS_ENDPOINTS.publishers.length}`);
  console.log(`   Aggregators online: ${aggregatorOnline}/${WALRUS_ENDPOINTS.aggregators.length}`);

  if (publisherOnline === 0) {
    console.log('⚠️  Warning: No publishers available - storage operations will fail');
  }
  if (aggregatorOnline === 0) {
    console.log('⚠️  Warning: No aggregators available - retrieval operations will fail');
  }
}

// Main execution
async function main() {
  console.log('🔮 SuimeraAI - Walrus Integration Test\n');
  console.log('Testing multiple Walrus endpoints with fallback support...\n');

  await testNetworkStatus();
  await testWalrusStorage();
}

// Handle global fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
  global.FormData = require('form-data');
  global.Blob = require('blob-polyfill').Blob;
}

main().catch(console.error);