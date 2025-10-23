#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting AI Services...\n');

// Service configurations
const services = [
  {
    name: 'ASI Agent',
    command: 'python',
    args: ['market_analyzer.py'],
    cwd: path.join(__dirname, '../agents/asi-agent'),
    port: 8001,
    emoji: '🤖'
  },
  {
    name: 'Lit Protocol Vincent',
    command: 'node',
    args: ['chimera-vincent-skill.js'],
    cwd: path.join(__dirname, '../agents/lit-protocol'),
    port: 3001,
    emoji: '🔐'
  },
  {
    name: 'Envio HyperIndex',
    command: 'envio',
    args: ['dev'],
    cwd: __dirname,
    port: 8080,
    emoji: '📊'
  }
];

const processes = [];

// Function to start a service
function startService(service) {
  console.log(`${service.emoji} Starting ${service.name}...`);
  
  const process = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  process.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.log(`[${service.name}] ERROR: ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`[${service.name}] Process exited with code ${code}`);
  });

  process.on('error', (error) => {
    console.log(`[${service.name}] Failed to start: ${error.message}`);
  });

  processes.push({ name: service.name, process });
  
  console.log(`✅ ${service.name} started on port ${service.port}`);
}

// Function to check if port is available
async function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Start all services
async function startAllServices() {
  console.log('🔍 Checking port availability...\n');
  
  for (const service of services) {
    const isPortFree = await checkPort(service.port);
    
    if (!isPortFree) {
      console.log(`⚠️  Port ${service.port} is already in use (${service.name} might already be running)`);
      continue;
    }
    
    startService(service);
    
    // Wait a bit between starting services
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎯 All services started! Use Ctrl+C to stop all services.\n');
  
  console.log('📋 Service Status:');
  console.log('==================');
  services.forEach(service => {
    console.log(`${service.emoji} ${service.name}: http://localhost:${service.port}`);
  });
  
  console.log('\n🧪 Test the integration:');
  console.log('   npm run test:ai');
  
  console.log('\n🌐 Frontend URLs:');
  console.log('   Dashboard: http://localhost:3000/dashboard');
  console.log('   Markets: http://localhost:3000/markets');
  console.log('   Agents: http://localhost:3000/agents');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  
  processes.forEach(({ name, process }) => {
    console.log(`   Stopping ${name}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('✅ All services stopped.');
    process.exit(0);
  }, 2000);
});

// Start the services
startAllServices().catch(console.error);