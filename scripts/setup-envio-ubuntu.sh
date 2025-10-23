#!/bin/bash

echo "🐧 Setting up Envio on Ubuntu..."

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt update
sudo apt install -y curl build-essential

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install pnpm (Envio prefers pnpm)
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install Envio CLI
echo "🔧 Installing Envio CLI..."
npm install -g envio

# Verify installation
echo "✅ Verifying installation..."
envio --version

echo "🎯 Setup complete! Now you can run:"
echo "   envio codegen"
echo "   envio dev"

# Create start script
cat > start-envio.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Envio HyperIndex..."

# Generate types
echo "📝 Generating types..."
envio codegen

# Start development server
echo "🌐 Starting development server on http://localhost:8080..."
envio dev
EOF

chmod +x start-envio.sh

echo "📋 Created start-envio.sh script"
echo "🎉 Ready to run Envio on Ubuntu!"