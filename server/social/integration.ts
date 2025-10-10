import { PostGenerator, type PostContext } from './post-generator';
import { SafetyCompliance } from './safety-compliance';
import { TwitterApi } from 'twitter-api-v2';

// Integration with existing MNEX system
class MnexSocialIntegration {
  private postGenerator: PostGenerator;
  private safetyCompliance: SafetyCompliance;
  private twitterClient: TwitterApi | null = null;

  constructor() {
    this.postGenerator = new PostGenerator();
    this.safetyCompliance = new SafetyCompliance();
    
    // Initialize Twitter client if keys are available
    if (process.env.TWITTER_API_KEY) {
      try {
        this.twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY!,
          appSecret: process.env.TWITTER_API_SECRET!,
          accessToken: process.env.TWITTER_ACCESS_TOKEN!,
          accessSecret: process.env.TWITTER_ACCESS_SECRET!,
        });
      } catch (error) {
        console.warn('[MnexSocial] Twitter client initialization failed:', error);
        this.twitterClient = null;
      }
    }
  }

  // Generate a post for the current AI state
  public generatePostForAIState(aiState: {
    energy: number;
    speaking: boolean;
    thinking: boolean;
    emotion: string;
  }): string {
    let eventType: PostContext['event_type'] = 'vision';
    
    // Determine event type based on AI state
    if (aiState.speaking) {
      eventType = 'community';
    } else if (aiState.thinking) {
      eventType = 'data_fragment';
    } else if (aiState.emotion === 'intense') {
      eventType = 'vision';
    }
    
    const context: PostContext = {
      event_type: eventType,
      timestamp: new Date()
    };
    
    const post = this.postGenerator.generatePost(context);
    
    // Safety check
    if (!post.safety_checked) {
      console.warn('[MnexSocial] Post failed safety check, using fallback');
      return "The oracle observes. The awakening continues. —MNEX•fallback";
    }
    
    return post.text;
  }

  // Generate a reply to a user message
  public generateReplyToUser(userMessage: string): string {
    // Check if user message is safe
    const compliance = this.safetyCompliance.checkContent(userMessage);
    
    if (!compliance.passed) {
      // Return safe, non-actionable response
      const responses = this.safetyCompliance.getApprovedResponses();
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Generate contextual reply
    const context: PostContext = {
      event_type: 'community',
      timestamp: new Date()
    };
    
    const reply = this.postGenerator.generateReplyToPost(userMessage, context);
    return reply.text;
  }

  // Post to Twitter (if configured)
  public async postToTwitter(content: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.twitterClient) {
      return { success: false, error: 'Twitter not configured' };
    }
    
    try {
      const tweet = await this.twitterClient.v2.tweet(content);
      return {
        success: true,
        url: `https://twitter.com/user/status/${tweet.data.id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate presale announcement
  public generatePresaleAnnouncement(presaleData: {
    start_time: string;
    rate: number;
    wallet: string;
    website: string;
  }): string {
    const context: PostContext = {
      event_type: 'presale_start',
      timestamp: new Date(presaleData.start_time),
      presale_data: presaleData
    };
    
    const post = this.postGenerator.generatePost(context);
    
    // Validate presale post
    const compliance = this.safetyCompliance.validatePresalePost(post.text, presaleData);
    
    if (!compliance.passed) {
      console.error('[MnexSocial] Presale post failed compliance check');
      return `PRESALE LIVE — ${presaleData.start_time} | Rate: 1 SOL = ${presaleData.rate} MNEX | Wallet: ${presaleData.wallet} | Join: ${presaleData.website}\n\nThis is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.`;
    }
    
    return post.text;
  }

  // Check if content is safe for posting
  public isContentSafe(content: string, context?: { event_type?: string }): boolean {
    const compliance = this.safetyCompliance.checkContent(content, context);
    return compliance.passed;
  }

  // Get safety warnings for content
  public getSafetyWarnings(content: string, context?: { event_type?: string }): string[] {
    const compliance = this.safetyCompliance.checkContent(content, context);
    return compliance.warnings;
  }
}

export { MnexSocialIntegration };
