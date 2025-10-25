#!/usr/bin/env node

/**
 * Walrus CLI Installation Guide
 * Provides instructions for installing Walrus CLI
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkWalrusInstallation() {
  try {
    const { stdout } = await execAsync('walrus --version');
    console.log('✅ Walrus CLI is already installed!');
    console.log(`Version: ${stdout.trim()}`);
    return true;
  } catch {
    console.log('❌ Walrus CLI is not installed');
    return false;
  }
}

function getInstallationInstructions() {
  const platform = os.platform();
  const arch = os.arch();

  console.log('\n📦 Walrus CLI Installation Instructions:\n');

  switch (platform) {
    case 'linux':
      console.log('🐧 Linux Installation:');
      console.log('1. Download the latest release:');
      console.log('   curl -L https://github.com/MystenLabs/walrus/releases/latest/download/walrus-linux-x64 -o walrus');
      console.log('2. Make it executable:');
      console.log('   chmod +x walrus');
      console.log('3. Move to PATH:');
      console.log('   sudo mv walrus /usr/local/bin/');
      break;

    case 'darwin':
      console.log('🍎 macOS Installation:');
      console.log('1. Using Homebrew (recommended):');
      console.log('   brew install walrus');
      console.log('');
      console.log('2. Or download manually:');
      console.log('   curl -L https://github.com/MystenLabs/walrus/releases/latest/download/walrus-macos-x64 -o walrus');
      console.log('   chmod +x walrus');
      console.log('   sudo mv walrus /usr/local/bin/');
      break;

    case 'win32':
      console.log('🪟 Windows Installation:');
      console.log('1. Download the Windows executable:');
      console.log('   https://github.com/MystenLabs/walrus/releases/latest/download/walrus-windows-x64.exe');
      console.log('2. Rename to walrus.exe and add to PATH');
      console.log('3. Or use PowerShell:');
      console.log('   Invoke-WebRequest -Uri "https://github.com/MystenLabs/walrus/releases/latest/download/walrus-windows-x64.exe" -OutFile "walrus.exe"');
      break;

    default:
      console.log(`❓ Unknown platform: ${platform}`);
      console.log('Please check the Walrus documentation for installation instructions.');
  }

  console.log('\n📚 Documentation:');
  console.log('• Official docs: https://docs.wal.app/usage/client-cli.html');
  console.log('• GitHub releases: https://github.com/MystenLabs/walrus/releases');
  console.log('• Testnet setup: https://docs.wal.app/usage/setup.html');
}

function showUsageExamples() {
  console.log('\n🚀 Basic Walrus CLI Usage:');
  console.log('');
  console.log('1. Store a file:');
  console.log('   walrus store myfile.json');
  console.log('');
  console.log('2. Read a blob:');
  console.log('   walrus read <blob-id> output.json');
  console.log('');
  console.log('3. Check blob info:');
  console.log('   walrus info <blob-id>');
  console.log('');
  console.log('4. List stored blobs:');
  console.log('   walrus list');
  console.log('');
  console.log('💡 SuimeraAI Integration:');
  console.log('• Chat histories are stored as JSON blobs');
  console.log('• Bet histories include metadata and timestamps');
  console.log('• Blob IDs are used for cross-user sharing');
  console.log('• Automatic retry logic handles network issues');
}

async function main() {
  console.log('🐋 Walrus CLI Installation Helper\n');
  
  const isInstalled = await checkWalrusInstallation();
  
  if (!isInstalled) {
    getInstallationInstructions();
  }
  
  showUsageExamples();
  
  console.log('\n🔧 After Installation:');
  console.log('• Run "npm run walrus:status" to check network status');
  console.log('• Run "npm run test:walrus" to test full functionality');
  console.log('• Use the SuimeraAI interface to store chat/bet history');
  
  if (!isInstalled) {
    console.log('\n⚠️  Note: Install Walrus CLI to enable backend storage features');
  }
}

main().catch(console.error);