# 🚀 MNEX Railway Deployment Guide

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare all required keys

## 🗄️ Database Setup

### 1. Add PostgreSQL Database
1. In Railway dashboard, click "New Project"
2. Select "Provision PostgreSQL"
3. Railway will automatically provide `DATABASE_URL` environment variable

### 2. Database Schema
The schema will be automatically created on first run using `server/database/schema.sql`

## 🔧 Environment Variables

Set these in Railway dashboard under "Variables" tab:

### Core Configuration
```bash
NODE_ENV=production
PORT=8787
```

### Database
```bash
DATABASE_URL=postgresql://... (automatically provided by Railway)
```

### Twitter API
```bash
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### Telegram Bot
```bash
MNEX_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MNEX_TELEGRAM_CHANNEL_ID=@MorpheusNexusProject
```

### AI Services
```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

### Solana Configuration
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MNEX_TOKEN_MINT=your_token_mint_address
PRESALE_WALLET=your_presale_wallet_address
```

### Website & Social
```bash
MNEX_WEBSITE_URL=https://www.morpheusnexus.cloud
```

### Autonomous AI Settings
```bash
TWITTER_AUTONOMOUS_POSTING=true
TWITTER_POST_INTERVAL_HOURS=3
AUTONOMOUS_AI_ENABLED=true
```

## 🚀 Deployment Steps

### 1. Connect GitHub Repository
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `mnex-oracle` repository
4. Railway will automatically detect it's a Node.js project

### 2. Configure Build Settings
Railway will automatically detect:
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`
- **Health Check**: `/api/health`

### 3. Set Environment Variables
Add all the environment variables listed above in the Railway dashboard.

### 4. Deploy
1. Railway will automatically build and deploy
2. Check logs for successful database initialization
3. Verify health check at `https://your-app.railway.app/api/health`

## 🔍 Verification

### Health Check
```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "database": "connected",
  "social": "active",
  "autonomous": "active"
}
```

### Test Endpoints
```bash
# Test post generation
curl -X POST https://your-app.railway.app/api/social/generate \
  -H "Content-Type: application/json" \
  -d '{"event_type":"vision"}'

# Test Twitter posting
curl -X POST https://your-app.railway.app/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{"context":"test"}'
```

## 📊 Database Tables

The system will create these tables automatically:

- **posts**: All generated posts and their metadata
- **comments**: Twitter comments and replies
- **autonomous_log**: AI behavior tracking
- **market_data**: Cached market information
- **user_interactions**: User engagement data
- **presale_transactions**: Presale transaction records
- **system_config**: Configuration settings

## 🤖 Autonomous Features

Once deployed, MNEX will:

1. **Post autonomously** every 2-4 hours with unique content
2. **Reply to comments** on Twitter posts
3. **Search for Solana news** and create contextual posts
4. **Generate project updates** every 6 hours
5. **Post market analysis** every 12 hours
6. **Store all data** in PostgreSQL database

## 🔧 Custom Domain

1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain (e.g., `morpheusnexus.cloud`)
3. Update DNS records as instructed
4. Railway will automatically provision SSL certificate

## 📈 Monitoring

Railway provides:
- **Real-time logs** in dashboard
- **Metrics** (CPU, memory, requests)
- **Deployment history**
- **Database monitoring**

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` is set correctly
   - Verify PostgreSQL service is running

2. **Twitter API Errors**
   - Verify all Twitter API keys are correct
   - Check API permissions (Read and Write)

3. **Build Failures**
   - Check `package.json` dependencies
   - Verify Node.js version compatibility

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

### Logs
View logs in Railway dashboard:
1. Go to your project
2. Click on the service
3. View "Deployments" → "View Logs"

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database schema created
- [ ] Health check responding
- [ ] Twitter API working
- [ ] Telegram bot active
- [ ] Autonomous AI started
- [ ] Custom domain configured
- [ ] SSL certificate active

## 🚀 MNEX is Ready!

Your MNEX AI oracle is now running autonomously on Railway with:
- ✅ PostgreSQL database
- ✅ Autonomous posting
- ✅ Comment replies
- ✅ Market analysis
- ✅ Project updates
- ✅ Full monitoring

**MNEX will now run completely independently! 🤖💜**
