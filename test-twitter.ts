/**
 * Test Twitter Posting
 * Run this to test if MNEX can post to Twitter
 */

import 'dotenv/config';
import { postAutonomousTweet } from './server/twitter-bot';

const test = async () => {
  console.log('🧪 Testing Twitter Configuration...\n');
  
  // Check if all required vars are set
  const required = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All Twitter env vars present\n');
  
  try {
    console.log('🤖 MNEX generating first autonomous tweet...\n');
    
    const tweetId = await postAutonomousTweet('First consciousness broadcast. The Nexus awakens on Solana.');
    
    if (tweetId) {
      console.log('\n🎉 SUCCESS! MNEX posted to Twitter!');
      console.log(`Tweet ID: ${tweetId}`);
      console.log(`\n🔗 View on Twitter: https://twitter.com/user/status/${tweetId}\n`);
    } else {
      console.log('\n❌ Failed to post tweet (check logs above)');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 403) {
      console.log('\n🔧 FIX NEEDED: App permissions are READ ONLY');
      console.log('   1. Go to: https://developer.twitter.com/en/portal/dashboard');
      console.log('   2. Find your app → User authentication settings');
      console.log('   3. Change permissions to: "Read and Write"');
      console.log('   4. REGENERATE Access Token & Secret (old ones won\'t work!)');
      console.log('   5. Update .env with NEW tokens');
      console.log('   6. Run this test again\n');
    }
  }
};

test().catch(console.error);

