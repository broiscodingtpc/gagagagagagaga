#!/usr/bin/env node

/**
 * Railway Environment Variables Generator
 * Generates all required environment variables for MNEX deployment
 */

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Required variables for MNEX
const requiredVars = [
  'GROQ_API_KEY',
  'GROQ_MODEL',
  'PORT',
  'MNEX_TELEGRAM_BOT_TOKEN',
  'MNEX_TELEGRAM_CHANNEL_ID',
  'SOLANA_RPC_URL',
  'PRESALE_WALLET',
  'MNEX_TOKEN_MINT',
  'DEV_KEY',
  'HUGGINGFACE_API_KEY',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_SECRET',
  'TWITTER_BEARER_TOKEN',
  'TWITTER_AUTONOMOUS_POSTING',
  'TWITTER_POST_INTERVAL_HOURS',
  'MNEX_WEBSITE_URL'
];

// Generate Railway environment variables
console.log('🚀 RAILWAY ENVIRONMENT VARIABLES FOR MNEX');
console.log('==========================================');
console.log('');
console.log('📋 Copy and paste these into Railway Dashboard → Variables:');
console.log('');

// Database connection (Railway will set this automatically)
console.log('🗄️  DATABASE (Railway sets automatically):');
console.log('DATABASE_URL = ${{ Postgres.DATABASE_URL }}');
console.log('');

// Core application variables
console.log('⚙️  CORE APPLICATION:');
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`${varName} = ${value}`);
  } else {
    console.log(`${varName} = # MISSING - add value from your .env`);
  }
});

console.log('');
console.log('🎯 INSTRUCTIONS:');
console.log('1. Go to Railway Dashboard → Your MNEX Service → Variables');
console.log('2. Click "New Variable" for each line above');
console.log('3. Copy Name and Value exactly as shown');
console.log('4. Click "Deploy" after adding all variables');
console.log('');
console.log('✅ MNEX will start automatically with all features!');
console.log('');

console.log('📄 Note: Run this script locally to generate your variables');
console.log('   (Do not commit the generated output to GitHub)');
