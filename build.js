#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MNEX Oracle - Custom Build Script');
console.log('=====================================');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found!');
  }

  // Check if vite is installed
  const nodeModulesPath = path.join(__dirname, 'node_modules', 'vite');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ Vite not found in node_modules, installing...');
    execSync('npm install vite @vitejs/plugin-react', { stdio: 'inherit' });
  }

  // Check if web directory exists
  if (!fs.existsSync('web')) {
    throw new Error('web directory not found!');
  }

  // Create dist directory if it doesn't exist
  const distPath = path.join(__dirname, 'web', 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  console.log('✅ Running vite build...');
  
  // Run vite build directly
  execSync('node node_modules/vite/bin/vite.js build', { 
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: web/dist');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
