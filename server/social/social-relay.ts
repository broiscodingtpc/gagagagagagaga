import { TwitterApi } from 'twitter-api-v2';
import { PostGenerator, type GeneratedPost, type PostContext } from './post-generator';
// import { telegramBot } from '../telegram/bot';
import Database from 'better-sqlite3';
import path from 'path';

interface PostResult {
  success: boolean;
  platform: 'x' | 'telegram';
  post_id?: string;
  url?: string;
  error?: string;
  timestamp: Date;
}

interface RelayConfig {
  auto_post_enabled: boolean;
  admin_approval_required: boolean;
  rate_limit_minutes: number;
  max_posts_per_hour: number;
  presale_mode: boolean;
}

class SocialRelay {
  private twitterClient: TwitterApi;
  private postGenerator: PostGenerator;
  private db: Database.Database;
  private config: RelayConfig;
  private replyInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
    
    this.postGenerator = new PostGenerator();
    this.db = this.initializeDatabase();
    this.config = this.loadConfig();
    
    // Start reply interval (every hour)
    this.startReplyInterval();
  }

  private initializeDatabase(): Database.Database {
    const dbPath = path.join(__dirname, 'audit-log.db');
    const db = new Database(dbPath);
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        post_id TEXT,
        url TEXT,
        personas_used TEXT,
        template_used TEXT,
        seed INTEGER,
        metadata TEXT,
        success BOOLEAN,
        error TEXT,
        presale_flag BOOLEAN DEFAULT FALSE,
        associated_tx TEXT
      );
      
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS pending_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        context TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved BOOLEAN DEFAULT FALSE,
        posted BOOLEAN DEFAULT FALSE
      );
    `);
    
    return db;
  }

  private loadConfig(): RelayConfig {
    const stmt = this.db.prepare('SELECT key, value FROM config');
    const rows = stmt.all() as Array<{key: string, value: string}>;
    
    const config: RelayConfig = {
      auto_post_enabled: true,
      admin_approval_required: true,
      rate_limit_minutes: 5,
      max_posts_per_hour: 12,
      presale_mode: false
    };
    
    for (const row of rows) {
      switch (row.key) {
        case 'auto_post_enabled':
          config.auto_post_enabled = row.value === 'true';
          break;
        case 'admin_approval_required':
          config.admin_approval_required = row.value === 'true';
          break;
        case 'rate_limit_minutes':
          config.rate_limit_minutes = parseInt(row.value);
          break;
        case 'max_posts_per_hour':
          config.max_posts_per_hour = parseInt(row.value);
          break;
        case 'presale_mode':
          config.presale_mode = row.value === 'true';
          break;
      }
    }
    
    return config;
  }

  private saveConfig(): void {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
    
    stmt.run('auto_post_enabled', this.config.auto_post_enabled.toString());
    stmt.run('admin_approval_required', this.config.admin_approval_required.toString());
    stmt.run('rate_limit_minutes', this.config.rate_limit_minutes.toString());
    stmt.run('max_posts_per_hour', this.config.max_posts_per_hour.toString());
    stmt.run('presale_mode', this.config.presale_mode.toString());
  }

  private logPost(result: PostResult, post: GeneratedPost, context?: PostContext): void {
    const stmt = this.db.prepare(`
      INSERT INTO posts (
        platform, content, post_id, url, personas_used, template_used, 
        seed, metadata, success, error, presale_flag, associated_tx
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      result.platform,
      post.text,
      result.post_id,
      result.url,
      JSON.stringify(post.personas_used),
      post.template_used,
      post.seed,
      JSON.stringify(post.metadata),
      result.success,
      result.error,
      context?.event_type?.includes('presale') || false,
      context?.tx_hash
    );
  }

  private async postToX(content: string): Promise<PostResult> {
    try {
      const tweet = await this.twitterClient.v2.tweet(content);
      
      return {
        success: true,
        platform: 'x',
        post_id: tweet.data.id,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[SocialRelay] X posting error:', error);
      return {
        success: false,
        platform: 'x',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private async postToTelegram(content: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<PostResult> {
    try {
      // Mock Telegram posting for testing
      console.log('[SocialRelay] Mock Telegram post:', content);
      
      return {
        success: true,
        platform: 'telegram',
        post_id: 'mock_' + Date.now(),
        url: 'https://t.me/MorpheusNexusProject/mock',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[SocialRelay] Telegram posting error:', error);
      return {
        success: false,
        platform: 'telegram',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private async announceOnTelegram(xUrl: string, summary: string, context?: PostContext): Promise<PostResult> {
    const disclaimer = context?.event_type?.includes('presale') 
      ? '\n\n*Note:* This is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.'
      : '';
    
    const content = `🤖 *MNEX posted on X* → ${xUrl}\n\n*${summary}*${disclaimer}`;
    
    return this.postToTelegram(content, 'Markdown');
  }

  private async replyToOwnPost(postId: string): Promise<void> {
    try {
      // Get the original post content
      const tweet = await this.twitterClient.v2.singleTweet(postId, {
        'tweet.fields': ['text', 'created_at']
      });
      
      if (!tweet.data) return;
      
      // Generate a reply
      const context: PostContext = {
        event_type: 'community',
        timestamp: new Date()
      };
      
      const reply = this.postGenerator.generateReplyToPost(tweet.data.text, context);
      
      if (!reply.safety_checked) {
        console.warn('[SocialRelay] Reply failed safety check, skipping');
        return;
      }
      
      // Post reply
      const result = await this.postToX(reply.text);
      
      if (result.success) {
        console.log(`[SocialRelay] Posted reply to ${postId}: ${result.url}`);
        this.logPost(result, reply, context);
      }
    } catch (error) {
      console.error('[SocialRelay] Error replying to post:', error);
    }
  }

  private startReplyInterval(): void {
    // Reply to own posts every hour
    this.replyInterval = setInterval(async () => {
      try {
        // Get the most recent post from the last 2 hours
        const stmt = this.db.prepare(`
          SELECT post_id FROM posts 
          WHERE platform = 'x' AND success = 1 AND timestamp > datetime('now', '-2 hours')
          ORDER BY timestamp DESC LIMIT 1
        `);
        
        const row = stmt.get() as { post_id: string } | undefined;
        
        if (row) {
          await this.replyToOwnPost(row.post_id);
        }
      } catch (error) {
        console.error('[SocialRelay] Reply interval error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  public async generateAndPost(context: PostContext = {}): Promise<{x?: PostResult, telegram?: PostResult}> {
    if (!this.config.auto_post_enabled) {
      throw new Error('Auto posting is disabled');
    }
    
    if (!this.postGenerator.canPost()) {
      throw new Error('Rate limit exceeded');
    }
    
    // Generate post
    const post = this.postGenerator.generatePost(context);
    
    if (!post.safety_checked) {
      throw new Error('Post failed safety check');
    }
    
    // Check if admin approval is required
    if (this.config.admin_approval_required && context.event_type?.includes('presale')) {
      // Save to pending posts for admin approval
      const stmt = this.db.prepare(`
        INSERT INTO pending_posts (content, context) VALUES (?, ?)
      `);
      stmt.run(post.text, JSON.stringify(context));
      
      console.log('[SocialRelay] Post saved for admin approval');
      return {};
    }
    
    const results: {x?: PostResult, telegram?: PostResult} = {};
    
    // Post to X
    const xResult = await this.postToX(post.text);
    results.x = xResult;
    this.logPost(xResult, post, context);
    
    if (xResult.success) {
      this.postGenerator.markPostSent();
      
      // Announce on Telegram
      const summary = post.text.length > 100 
        ? post.text.substring(0, 100) + '...'
        : post.text;
      
      const telegramResult = await this.announceOnTelegram(xResult.url!, summary, context);
      results.telegram = telegramResult;
      this.logPost(telegramResult, post, context);
    }
    
    return results;
  }

  public async approvePendingPost(postId: number): Promise<{x?: PostResult, telegram?: PostResult}> {
    const stmt = this.db.prepare('SELECT * FROM pending_posts WHERE id = ?');
    const pendingPost = stmt.get(postId) as any;
    
    if (!pendingPost) {
      throw new Error('Pending post not found');
    }
    
    if (pendingPost.posted) {
      throw new Error('Post already posted');
    }
    
    // Mark as approved
    const updateStmt = this.db.prepare('UPDATE pending_posts SET approved = 1 WHERE id = ?');
    updateStmt.run(postId);
    
    // Generate and post
    const context: PostContext = JSON.parse(pendingPost.context || '{}');
    context.timestamp = new Date(pendingPost.generated_at);
    
    const post = this.postGenerator.generatePost(context);
    const results = await this.generateAndPost(context);
    
    // Mark as posted
    const postedStmt = this.db.prepare('UPDATE pending_posts SET posted = 1 WHERE id = ?');
    postedStmt.run(postId);
    
    return results;
  }

  public getPendingPosts(): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pending_posts 
      WHERE approved = 0 AND posted = 0 
      ORDER BY generated_at DESC
    `);
    return stmt.all();
  }

  public getRecentPosts(limit: number = 10): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM posts 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  public updateConfig(newConfig: Partial<RelayConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public getConfig(): RelayConfig {
    return { ...this.config };
  }

  public async simulateEvent(eventType: PostContext['event_type'], timestamp?: Date): Promise<GeneratedPost> {
    const context: PostContext = {
      event_type: eventType,
      timestamp: timestamp || new Date()
    };
    
    return this.postGenerator.generatePost(context);
  }

  public destroy(): void {
    if (this.replyInterval) {
      clearInterval(this.replyInterval);
    }
    this.db.close();
  }
}

export { SocialRelay, type PostResult, type RelayConfig };
