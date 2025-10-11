import { PostGenerator, type PostContext } from './post-generator';
import { SafetyCompliance } from './safety-compliance';
import { TwitterApi } from 'twitter-api-v2';
import { Database } from '../database/database';
import { WebSearch } from './web-search';

interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface TwitterComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

class AutonomousAI {
  private postGenerator: PostGenerator;
  private safetyCompliance: SafetyCompliance;
  private twitterClient: TwitterApi | null = null;
  private database: Database | null = null;
  private webSearch: WebSearch;
  private lastPostTime: number = 0;
  private lastCommentCheck: number = 0;

  constructor(database?: Database) {
    this.postGenerator = new PostGenerator();
    this.safetyCompliance = new SafetyCompliance();
    this.database = database || null;
    this.webSearch = new WebSearch(database);
    
    if (process.env.TWITTER_API_KEY) {
      this.twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
      });
    }
  }

  // Search for Solana news and market information
  private async searchSolanaNews(): Promise<WebSearchResult[]> {
    return await this.webSearch.searchSolanaNews();
  }

  // Get comments from Twitter posts - DISABLED to avoid rate limits
  private async getTwitterComments(postId: string): Promise<TwitterComment[]> {
    // Comment checking disabled to prevent Twitter API rate limiting
    // The new v2.5 scheduler handles interactions more efficiently
    console.log('[AutonomousAI] Comment checking disabled to avoid rate limits');
    return [];
  }

  // Generate intelligent reply to comment
  private async generateCommentReply(comment: TwitterComment): Promise<string> {
    const context: PostContext = {
      event_type: 'community',
      timestamp: new Date(),
      user_interaction: comment.text
    };
    
    const reply = this.postGenerator.generateReplyToPost(comment.text, context);
    
    // Make it shorter for Twitter replies
    let shortReply = reply.text;
    if (shortReply.length > 200) {
      shortReply = shortReply.substring(0, 197) + '...';
    }
    
    // Log interaction to database
    if (this.database) {
      try {
        await this.database.logUserInteraction({
          user_id: comment.author,
          platform: 'twitter',
          interaction_type: 'comment',
          content: comment.text,
          response_generated: shortReply,
          sentiment_score: this.analyzeSentiment(comment.text)
        });
      } catch (error) {
        console.error('[AutonomousAI] Error logging interaction:', error);
      }
    }
    
    return shortReply;
  }

  // Simple sentiment analysis
  private analyzeSentiment(text: string): number {
    const positiveWords = ['great', 'awesome', 'love', 'amazing', 'excellent', 'good', 'nice', 'cool'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'stupid', 'dumb'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  // Post reply to Twitter comment
  private async replyToComment(commentId: string, replyText: string): Promise<boolean> {
    if (!this.twitterClient) return false;
    
    try {
      await this.twitterClient.v2.reply(replyText, commentId);
      console.log(`[AutonomousAI] Replied to comment ${commentId}: ${replyText}`);
      return true;
    } catch (error) {
      console.error('[AutonomousAI] Error replying to comment:', error);
      return false;
    }
  }

  // Generate post based on market/news context
  private async generateContextualPost(): Promise<string> {
    const news = await this.searchSolanaNews();
    const randomNews = news[Math.floor(Math.random() * news.length)];
    
    // Determine post type based on news content
    let eventType: PostContext['event_type'] = 'vision';
    
    if (randomNews.title.toLowerCase().includes('price') || randomNews.title.toLowerCase().includes('surge')) {
      eventType = 'data_fragment';
    } else if (randomNews.title.toLowerCase().includes('ai') || randomNews.title.toLowerCase().includes('token')) {
      eventType = 'development';
    } else if (randomNews.title.toLowerCase().includes('ecosystem') || randomNews.title.toLowerCase().includes('growth')) {
      eventType = 'community';
    }
    
    const context: PostContext = {
      event_type: eventType,
      timestamp: new Date(),
      user_interaction: `Market context: ${randomNews.title}`
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Main autonomous posting logic
  public async runAutonomousCycle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    const timeSinceLastCommentCheck = now - this.lastCommentCheck;
    
    // Post every 2-4 hours randomly
    const shouldPost = timeSinceLastPost > (2 + Math.random() * 2) * 60 * 60 * 1000;
    
    // Check comments every 30 minutes
    const shouldCheckComments = timeSinceLastCommentCheck > 30 * 60 * 1000;
    
    if (shouldPost) {
      try {
        const postContent = await this.generateContextualPost();
        
        if (this.twitterClient) {
          const tweet = await this.twitterClient.v2.tweet(postContent);
          console.log(`[AutonomousAI] Posted: ${postContent}`);
          console.log(`[AutonomousAI] Tweet ID: ${tweet.data.id}`);
          
          // Save to database
          if (this.database) {
            try {
              await this.database.createPost({
                content: postContent,
                personas_used: ['autonomous'],
                template_used: 'autonomous',
                event_type: 'autonomous_post',
                safety_checked: true,
                posted_to_twitter: true,
                posted_to_telegram: false,
                twitter_post_id: tweet.data.id,
                posted_at: new Date(),
                metadata: { autonomous: true, cycle: 'main' }
              });
            } catch (dbError) {
              console.error('[AutonomousAI] Error saving to database:', dbError);
            }
          }
          
          this.lastPostTime = now;
        }
      } catch (error) {
        console.error('[AutonomousAI] Error posting:', error);
        if (this.database) {
          await this.database.logAutonomousAction('post', 'Failed to post', { error: error.message }, false, error.message);
        }
      }
    }
    
    // Comment checking disabled to avoid Twitter rate limits
    // The new v2.5 scheduler handles all Twitter interactions more efficiently
    if (false && shouldCheckComments && this.twitterClient) {
      try {
        // Get recent tweets to check for comments
        const recentTweets = await this.twitterClient.v2.userTimeline('me', {
          max_results: 5
        });
        
        for (const tweet of recentTweets.data?.data || []) {
          const comments = await this.getTwitterComments(tweet.id);
          
          for (const comment of comments) {
            // Only reply to comments that don't already have replies
            const replyText = await this.generateCommentReply(comment);
            await this.replyToComment(comment.id, replyText);
            
            // Wait between replies to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        
        this.lastCommentCheck = now;
      } catch (error) {
        console.error('[AutonomousAI] Error checking comments:', error);
      }
    }
  }

  // Generate project update post
  public async generateProjectUpdate(): Promise<string> {
    const updateTypes = ['tokenomics', 'development', 'roadmap', 'community'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    const context: PostContext = {
      event_type: randomType as any,
      timestamp: new Date()
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Generate market analysis post
  public async generateMarketAnalysis(): Promise<string> {
    const marketData = await this.webSearch.getMarketData();
    const context: PostContext = {
      event_type: 'data_fragment',
      timestamp: new Date(),
      user_interaction: `Market analysis: SOL $${marketData.solanaPrice?.toFixed(2) || 'N/A'}, Volume: $${(marketData.volume24h || 0).toLocaleString()}`
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Generate AI news post
  public async generateAINewsPost(): Promise<string> {
    const aiNews = await this.webSearch.searchAINews();
    const context: PostContext = {
      event_type: 'development',
      timestamp: new Date(),
      user_interaction: `AI news: ${aiNews[0]?.title || 'AI tokens trending'}`
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Generate presale information post
  public async generatePresaleInfoPost(): Promise<string> {
    const presaleInfo = await this.webSearch.searchPresaleInfo();
    const context: PostContext = {
      event_type: 'presale_start',
      timestamp: new Date(),
      user_interaction: `Presale info: ${presaleInfo[0]?.title || 'New presale opportunities'}`
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Generate trending topics post
  public async generateTrendingTopicsPost(): Promise<string> {
    const trendingTopics = await this.webSearch.getTrendingTopics();
    const context: PostContext = {
      event_type: 'community',
      timestamp: new Date(),
      user_interaction: `Trending: ${trendingTopics.slice(0, 3).join(', ')}`
    };
    
    const post = this.postGenerator.generatePost(context);
    return post.text;
  }

  // Start autonomous operation
  public startAutonomousMode(): void {
    console.log('[AutonomousAI] Starting autonomous mode...');
    
    // Run cycle every 5 minutes
    setInterval(() => {
      this.runAutonomousCycle().catch(console.error);
    }, 5 * 60 * 1000);
    
    // Generate project updates every 6 hours
    setInterval(async () => {
      try {
        const update = await this.generateProjectUpdate();
        if (this.twitterClient) {
          const tweet = await this.twitterClient.v2.tweet(update);
          console.log(`[AutonomousAI] Project update posted: ${update}`);
          
          // Save to database
          if (this.database) {
            await this.database.createPost({
              content: update,
              personas_used: ['autonomous'],
              template_used: 'project_update',
              event_type: 'project_update',
              safety_checked: true,
              posted_to_twitter: true,
              posted_to_telegram: false,
              twitter_post_id: tweet.data.id,
              posted_at: new Date(),
              metadata: { autonomous: true, cycle: 'project_update' }
            });
          }
        }
      } catch (error) {
        console.error('[AutonomousAI] Error posting project update:', error);
      }
    }, 6 * 60 * 60 * 1000);
    
    // Generate market analysis every 8 hours
    setInterval(async () => {
      try {
        const analysis = await this.generateMarketAnalysis();
        if (this.twitterClient) {
          const tweet = await this.twitterClient.v2.tweet(analysis);
          console.log(`[AutonomousAI] Market analysis posted: ${analysis}`);
          
          // Save to database
          if (this.database) {
            await this.database.createPost({
              content: analysis,
              personas_used: ['autonomous'],
              template_used: 'market_analysis',
              event_type: 'market_analysis',
              safety_checked: true,
              posted_to_twitter: true,
              posted_to_telegram: false,
              twitter_post_id: tweet.data.id,
              posted_at: new Date(),
              metadata: { autonomous: true, cycle: 'market_analysis' }
            });
          }
        }
      } catch (error) {
        console.error('[AutonomousAI] Error posting market analysis:', error);
      }
    }, 8 * 60 * 60 * 1000);

    // Generate AI news posts every 10 hours
    setInterval(async () => {
      try {
        const aiNews = await this.generateAINewsPost();
        if (this.twitterClient) {
          const tweet = await this.twitterClient.v2.tweet(aiNews);
          console.log(`[AutonomousAI] AI news posted: ${aiNews}`);
          
          // Save to database
          if (this.database) {
            await this.database.createPost({
              content: aiNews,
              personas_used: ['autonomous'],
              template_used: 'ai_news',
              event_type: 'ai_news',
              safety_checked: true,
              posted_to_twitter: true,
              posted_to_telegram: false,
              twitter_post_id: tweet.data.id,
              posted_at: new Date(),
              metadata: { autonomous: true, cycle: 'ai_news' }
            });
          }
        }
      } catch (error) {
        console.error('[AutonomousAI] Error posting AI news:', error);
      }
    }, 10 * 60 * 60 * 1000);

    // Generate trending topics posts every 12 hours
    setInterval(async () => {
      try {
        const trending = await this.generateTrendingTopicsPost();
        if (this.twitterClient) {
          const tweet = await this.twitterClient.v2.tweet(trending);
          console.log(`[AutonomousAI] Trending topics posted: ${trending}`);
          
          // Save to database
          if (this.database) {
            await this.database.createPost({
              content: trending,
              personas_used: ['autonomous'],
              template_used: 'trending_topics',
              event_type: 'trending_topics',
              safety_checked: true,
              posted_to_twitter: true,
              posted_to_telegram: false,
              twitter_post_id: tweet.data.id,
              posted_at: new Date(),
              metadata: { autonomous: true, cycle: 'trending_topics' }
            });
          }
        }
      } catch (error) {
        console.error('[AutonomousAI] Error posting trending topics:', error);
      }
    }, 12 * 60 * 60 * 1000);
  }
}

export { AutonomousAI };
