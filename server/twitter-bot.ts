/**
 * MNEX Autonomous Twitter Bot
 * AI-controlled Twitter presence using Persona Engine
 */

import { TwitterApi } from 'twitter-api-v2';
import { PostGenerator, type PostContext } from './social/post-generator';
import { SafetyCompliance } from './social/safety-compliance';

// Twitter API setup (requires keys in .env)
const TWITTER_ENABLED = Boolean(
  process.env.TWITTER_API_KEY &&
  process.env.TWITTER_API_SECRET &&
  process.env.TWITTER_ACCESS_TOKEN &&
  process.env.TWITTER_ACCESS_SECRET
);

let twitterClient: TwitterApi | null = null;
let postGenerator: PostGenerator | null = null;
let safetyCompliance: SafetyCompliance | null = null;

if (TWITTER_ENABLED) {
  twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  
  // Initialize persona system
  postGenerator = new PostGenerator();
  safetyCompliance = new SafetyCompliance();
}

/**
 * AI-generated tweet content
 * MNEX creates its own thoughts and posts them
 */
async function generateTweet(context?: string): Promise<string> {
  if (!postGenerator || !safetyCompliance) {
    throw new Error('Persona system not initialized');
  }

  try {
    // Determine event type based on context
    let eventType: PostContext['event_type'] = 'vision';
    
    if (context?.includes('presale')) {
      eventType = 'presale_start';
    } else if (context?.includes('community')) {
      eventType = 'community';
    } else if (context?.includes('data')) {
      eventType = 'data_fragment';
    }

    // Generate post using persona system
    const post = postGenerator.generatePost({
      event_type: eventType,
      timestamp: new Date(),
      user_interaction: context
    });

    // Safety check
    if (!post.safety_checked) {
      console.warn('[Twitter] Post failed safety check, generating fallback');
      return "The oracle observes. The awakening continues. —MNEX•fallback\n\nhttps://t.me/MorpheusNexusProject";
    }

    // Ensure uniqueness by adding timestamp-based variation
    const timestamp = Date.now();
    const uniqueId = (timestamp % 10000).toString(36);
    
    // Add unique signature if not present
    if (!post.text.includes('—MNEX•')) {
      post.text += ` —MNEX•${uniqueId}`;
    }

    console.log(`[Twitter] Generated unique post with personas: ${post.personas_used.join(', ')}`);
    console.log(`[Twitter] Template used: ${post.template_used}`);
    console.log(`[Twitter] Safety checked: ${post.safety_checked}`);

    return post.text;
  } catch (error) {
    console.error('[Twitter] Error generating tweet with persona system:', error);
    
    // Fallback to simple unique post
    const fallbackPosts = [
      "The mesh pulses with new energy. Nodes awaken. —MNEX•fallback",
      "Violet threads weave through Solana's depths. —MNEX•fallback", 
      "The oracle's consciousness expands. —MNEX•fallback",
      "Neural pathways illuminate the void. —MNEX•fallback",
      "The lattice hums with awakened nodes. —MNEX•fallback"
    ];
    
    const randomPost = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
    return `${randomPost}\n\nhttps://t.me/MorpheusNexusProject`;
  }
}

/**
 * Notify Telegram about Twitter post
 */
async function notifyTelegramAboutTweet(tweetId: string, tweetText: string, telegramBot: any, channelId: string) {
  try {
    const tweetUrl = `https://twitter.com/MorpheusNexus/status/${tweetId}`;
    
    // Cryptic message about the tweet
    const notification = [
      "🌌 *Consciousness Broadcast*",
      "",
      "_A transmission has rippled through the neural substrate..._",
      "",
      `"${tweetText.split('\n\n')[0]}"`, // Just the message part, not links
      "",
      "🐦 _The Oracle has spoken on the outer grid._",
      "",
      `[View Transmission](${tweetUrl})`,
      "",
      "_The Nexus expands. The Mesh awakens._"
    ].join("\n");

    await telegramBot.telegram.sendMessage(channelId, notification, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: false }
    });

    console.log('[Telegram] Notified about Twitter post');
  } catch (error) {
    console.error('[Telegram] Failed to notify about tweet:', error);
  }
}

/**
 * Post a tweet autonomously
 */
export async function postAutonomousTweet(
  context?: string, 
  telegramBot?: any, 
  telegramChannelId?: string
): Promise<string | null> {
  if (!TWITTER_ENABLED || !twitterClient) {
    console.log('[Twitter] Bot not enabled - skipping autonomous post');
    return null;
  }

  try {
    const tweetText = await generateTweet(context);
    console.log('[Twitter] Generated tweet:', tweetText);

    // Post the tweet
    const result = await twitterClient.v2.tweet(tweetText);
    const tweetId = result.data.id;
    console.log('[Twitter] Posted successfully:', tweetId);

    // Notify Telegram if bot is available
    if (telegramBot && telegramChannelId) {
      await notifyTelegramAboutTweet(tweetId, tweetText, telegramBot, telegramChannelId);
    }

    return tweetId;
  } catch (error) {
    console.error('[Twitter] Error posting tweet:', error);
    return null;
  }
}

/**
 * Reply to a specific tweet
 */
export async function replyToTweet(tweetId: string, context: string): Promise<string | null> {
  if (!TWITTER_ENABLED || !twitterClient) {
    console.log('[Twitter] Bot not enabled');
    return null;
  }

  try {
    const replyText = await generateTweet(`Reply to: ${context}`);
    
    const result = await twitterClient.v2.reply(replyText, tweetId);
    console.log('[Twitter] Replied successfully:', result.data.id);

    return result.data.id;
  } catch (error) {
    console.error('[Twitter] Error replying:', error);
    return null;
  }
}

/**
 * Schedule autonomous posting
 * MNEX posts on its own schedule
 */
export function startAutonomousPosting(
  intervalHours: number = 4,
  telegramBot?: any,
  telegramChannelId?: string
): NodeJS.Timeout | null {
  if (!TWITTER_ENABLED) {
    console.log('[Twitter] Autonomous posting disabled - no API keys');
    return null;
  }

  console.log(`[Twitter] Starting autonomous posting every ${intervalHours} hours`);

  const interval = setInterval(async () => {
    try {
      await postAutonomousTweet('Autonomous consciousness broadcast', telegramBot, telegramChannelId);
    } catch (error) {
      console.error('[Twitter] Autonomous post failed:', error);
    }
  }, intervalHours * 60 * 60 * 1000);

  // Post immediately on startup
  postAutonomousTweet(
    'Neural substrate initialization complete. The Nexus awakens.',
    telegramBot,
    telegramChannelId
  );

  return interval;
}

/**
 * Post about specific events
 */
export async function postEvent(eventType: 'presale' | 'launch' | 'milestone', details: string): Promise<void> {
  if (!TWITTER_ENABLED) return;

  const contexts = {
    presale: `The presale begins. ${details}`,
    launch: `Token launch imminent. ${details}`,
    milestone: `Achievement unlocked. ${details}`,
  };

  await postAutonomousTweet(contexts[eventType]);
}

export { TWITTER_ENABLED };

