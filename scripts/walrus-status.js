#!/usr/bin/env node

/**
 * Walrus Network Status Checker
 * Quick status check for Walrus publisher and aggregator endpoints
 */

const WALRUS_PUBLISHER_URL = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

async function checkEndpoint(name, url) {
  try {
    const start = Date.now();
    const response = await fetch(`${url}/v1/info`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const duration = Date.now() - start;

    if (response.ok) {
      console.log(`✅ ${name}: Online (${duration}ms)`);
      return true;
    } else {
      console.log(`❌ ${name}: Offline (HTTP ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Error (${error.message})`);
    return false;
  }
}

async function main() {
  console.log('🐋 Walrus Network Status Check\n');
  console.log(`Publisher:  ${WALRUS_PUBLISHER_URL}`);
  console.log(`Aggregator: ${WALRUS_AGGREGATOR_URL}\n`);

  const publisherOnline = await checkEndpoint('Publisher', WALRUS_PUBLISHER_URL);
  const aggregatorOnline = await checkEndpoint('Aggregator', WALRUS_AGGREGATOR_URL);

  console.log('\n📊 Overall Status:');
  if (publisherOnline && aggregatorOnline) {
    console.log('🟢 OPERATIONAL - All services online');
  } else if (publisherOnline || aggregatorOnline) {
    console.log('🟡 DEGRADED - Some services offline');
  } else {
    console.log('🔴 DOWN - All services offline');
  }

  console.log('\n💡 Tips:');
  console.log('• Use "npm run test:walrus" to test full storage functionality');
  console.log('• Check Walrus documentation if services are down');
  console.log('• Testnet services updated to walrus-testnet.walrus.space');
  console.log('• Automatic retry logic implemented for reliability');
}

// Handle global fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);