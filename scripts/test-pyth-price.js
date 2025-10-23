#!/usr/bin/env node

// Test Pyth price fetching
async function testPythPrice() {
    try {
        console.log('🔍 Testing Pyth Network BTC price...');
        
        const btcPriceId = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';
        const pythEndpoint = 'https://hermes.pyth.network/api/latest_price_feeds';
        
        console.log(`📡 Fetching from: ${pythEndpoint}`);
        console.log(`🪙 BTC Price ID: ${btcPriceId}`);
        
        const response = await fetch(`${pythEndpoint}?ids[]=${btcPriceId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('\n📊 Raw Pyth Response:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data && data.length > 0) {
            const priceFeed = data[0];
            const price = parseInt(priceFeed.price.price);
            const expo = priceFeed.price.expo;
            const formattedPrice = price * Math.pow(10, expo);
            
            console.log('\n💰 BTC Price Analysis:');
            console.log(`   Raw Price: ${price}`);
            console.log(`   Exponent: ${expo}`);
            console.log(`   Formatted Price: $${formattedPrice.toLocaleString()}`);
            console.log(`   Confidence: ±$${(parseInt(priceFeed.price.conf) * Math.pow(10, expo)).toLocaleString()}`);
            console.log(`   Publish Time: ${new Date(priceFeed.price.publish_time * 1000).toLocaleString()}`);
            
            // Check against $150k target
            const target = 150000;
            const distance = ((target - formattedPrice) / formattedPrice) * 100;
            
            console.log('\n🎯 Market Analysis:');
            console.log(`   Target: $${target.toLocaleString()}`);
            console.log(`   Current: $${formattedPrice.toLocaleString()}`);
            
            if (formattedPrice >= target) {
                console.log(`   Status: ✅ TARGET REACHED! BTC is above $150k`);
            } else {
                console.log(`   Status: 📈 ${distance.toFixed(1)}% gain needed to reach $150k`);
            }
            
            console.log('\n✅ Pyth price fetch successful!');
            
        } else {
            console.log('❌ No price data received');
        }
        
    } catch (error) {
        console.error('❌ Error fetching Pyth price:', error.message);
    }
}

// Run the test
testPythPrice();