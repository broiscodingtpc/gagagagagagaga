import { postAutonomousTweet } from './server/twitter-bot';
import { telegramBot } from './telegram/bot';

async function testTelegramNotification() {
  console.log('🧪 Testing Telegram notification...');
  
  try {
    // Test posting a tweet with Telegram notification
    const result = await postAutonomousTweet(telegramBot, '@MorpheusNexusProject');
    console.log('✅ Tweet posted and Telegram notified!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTelegramNotification();
