#!/usr/bin/env python3
"""
Setup script for ChimeraProtocol ASI Alliance Agent
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing ASI Alliance Agent dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    
    return True

def setup_environment():
    """Setup environment variables"""
    print("🔧 Setting up environment...")
    
    env_file = "../../.env"
    if os.path.exists(env_file):
        print("✅ Found .env file")
    else:
        print("⚠️  .env file not found, creating template...")
        with open(".env.template", "w") as f:
            f.write("""# ASI Alliance Agent Configuration
HEDERA_RPC_URL=https://testnet.hashio.io/api
CHIMERA_CONTRACT_ADDRESS=0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644

ASI_AGENT_SEED=your_agent_seed_here
ASI_AGENT_PORT=8001
""")
        print("📝 Created .env.template - please configure and rename to .env")

def main():
    """Main setup function"""
    print("🚀 Setting up ChimeraProtocol ASI Alliance Agent...")
    
    if not install_requirements():
        sys.exit(1)
    
    setup_environment()
    
    print("\n🎉 ASI Alliance Agent setup completed!")
    print("📋 Next steps:")
    print("1. Configure environment variables in .env")
    print("2. Run: python market_analyzer.py")
    print("3. Monitor agent logs for market analysis")

if __name__ == "__main__":
    main()