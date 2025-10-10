import { Pool, PoolClient } from 'pg';

export interface Post {
  id: number;
  content: string;
  personas_used: string[];
  template_used: string;
  event_type: string;
  safety_checked: boolean;
  posted_to_twitter: boolean;
  posted_to_telegram: boolean;
  twitter_post_id?: string;
  telegram_post_id?: string;
  created_at: Date;
  posted_at?: Date;
  metadata?: any;
}

export interface Comment {
  id: number;
  twitter_comment_id: string;
  parent_post_id?: number;
  author_id: string;
  content: string;
  replied_to: boolean;
  reply_content?: string;
  created_at: Date;
  replied_at?: Date;
}

export interface MarketData {
  id: number;
  data_type: string;
  title?: string;
  content?: string;
  source_url?: string;
  relevance_score: number;
  created_at: Date;
  expires_at?: Date;
}

export interface UserInteraction {
  id: number;
  user_id: string;
  platform: string;
  interaction_type: string;
  content?: string;
  response_generated?: string;
  sentiment_score?: number;
  created_at: Date;
}

export interface PresaleTransaction {
  id: number;
  transaction_hash: string;
  wallet_address: string;
  sol_amount: number;
  mnex_tokens: number;
  verified: boolean;
  created_at: Date;
  verified_at?: Date;
}

export class Database {
  private pool: Pool;

  constructor() {
    // Railway provides DATABASE_URL environment variable
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('Database connection string not found. Please set DATABASE_URL or POSTGRES_URL');
    }

    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('[Database] PostgreSQL connection pool initialized');
  }

  async initialize(): Promise<void> {
    try {
      // Run schema creation
      const client = await this.pool.connect();
      try {
        const fs = await import('fs');
        const path = await import('path');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schema);
        console.log('[Database] Schema initialized successfully');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[Database] Initialization error:', error);
      throw error;
    }
  }

  // Posts operations
  async createPost(post: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO posts (content, personas_used, template_used, event_type, safety_checked, 
                          posted_to_twitter, posted_to_telegram, twitter_post_id, telegram_post_id, 
                          posted_at, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        post.content,
        post.personas_used,
        post.template_used,
        post.event_type,
        post.safety_checked,
        post.posted_to_twitter,
        post.posted_to_telegram,
        post.twitter_post_id,
        post.telegram_post_id,
        post.posted_at,
        JSON.stringify(post.metadata || {})
      ]);
      
      return this.mapRowToPost(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM posts 
        ORDER BY created_at DESC 
        LIMIT $1
      `, [limit]);
      
      return result.rows.map(row => this.mapRowToPost(row));
    } finally {
      client.release();
    }
  }

  async updatePostTwitterInfo(postId: number, twitterPostId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE posts 
        SET posted_to_twitter = true, twitter_post_id = $2, posted_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [postId, twitterPostId]);
    } finally {
      client.release();
    }
  }

  // Comments operations
  async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO comments (twitter_comment_id, parent_post_id, author_id, content, 
                             replied_to, reply_content, replied_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        comment.twitter_comment_id,
        comment.parent_post_id,
        comment.author_id,
        comment.content,
        comment.replied_to,
        comment.reply_content,
        comment.replied_at
      ]);
      
      return this.mapRowToComment(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getUnrepliedComments(): Promise<Comment[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM comments 
        WHERE replied_to = false 
        ORDER BY created_at ASC
      `);
      
      return result.rows.map(row => this.mapRowToComment(row));
    } finally {
      client.release();
    }
  }

  async markCommentReplied(commentId: number, replyContent: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE comments 
        SET replied_to = true, reply_content = $2, replied_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [commentId, replyContent]);
    } finally {
      client.release();
    }
  }

  // Market data operations
  async storeMarketData(data: Omit<MarketData, 'id' | 'created_at'>): Promise<MarketData> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO market_data (data_type, title, content, source_url, relevance_score, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.data_type,
        data.title,
        data.content,
        data.source_url,
        data.relevance_score,
        data.expires_at
      ]);
      
      return this.mapRowToMarketData(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getRecentMarketData(dataType: string, limit: number = 5): Promise<MarketData[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM market_data 
        WHERE data_type = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC 
        LIMIT $2
      `, [dataType, limit]);
      
      return result.rows.map(row => this.mapRowToMarketData(row));
    } finally {
      client.release();
    }
  }

  // User interactions
  async logUserInteraction(interaction: Omit<UserInteraction, 'id' | 'created_at'>): Promise<UserInteraction> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO user_interactions (user_id, platform, interaction_type, content, 
                                      response_generated, sentiment_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        interaction.user_id,
        interaction.platform,
        interaction.interaction_type,
        interaction.content,
        interaction.response_generated,
        interaction.sentiment_score
      ]);
      
      return this.mapRowToUserInteraction(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Presale transactions
  async createPresaleTransaction(tx: Omit<PresaleTransaction, 'id' | 'created_at'>): Promise<PresaleTransaction> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO presale_transactions (transaction_hash, wallet_address, sol_amount, 
                                         mnex_tokens, verified, verified_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        tx.transaction_hash,
        tx.wallet_address,
        tx.sol_amount,
        tx.mnex_tokens,
        tx.verified,
        tx.verified_at
      ]);
      
      return this.mapRowToPresaleTransaction(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // System configuration
  async getConfig(key: string): Promise<string | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT config_value FROM system_config WHERE config_key = $1
      `, [key]);
      
      return result.rows[0]?.config_value || null;
    } finally {
      client.release();
    }
  }

  async setConfig(key: string, value: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO system_config (config_key, config_value) 
        VALUES ($1, $2)
        ON CONFLICT (config_key) 
        DO UPDATE SET config_value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, value]);
    } finally {
      client.release();
    }
  }

  // Log autonomous actions
  async logAutonomousAction(actionType: string, content: string, context: any, success: boolean, errorMessage?: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO autonomous_log (action_type, content, context, success, error_message)
        VALUES ($1, $2, $3, $4, $5)
      `, [actionType, content, JSON.stringify(context), success, errorMessage]);
    } finally {
      client.release();
    }
  }

  // Helper methods to map database rows to objects
  private mapRowToPost(row: any): Post {
    return {
      id: row.id,
      content: row.content,
      personas_used: row.personas_used,
      template_used: row.template_used,
      event_type: row.event_type,
      safety_checked: row.safety_checked,
      posted_to_twitter: row.posted_to_twitter,
      posted_to_telegram: row.posted_to_telegram,
      twitter_post_id: row.twitter_post_id,
      telegram_post_id: row.telegram_post_id,
      created_at: row.created_at,
      posted_at: row.posted_at,
      metadata: row.metadata
    };
  }

  private mapRowToComment(row: any): Comment {
    return {
      id: row.id,
      twitter_comment_id: row.twitter_comment_id,
      parent_post_id: row.parent_post_id,
      author_id: row.author_id,
      content: row.content,
      replied_to: row.replied_to,
      reply_content: row.reply_content,
      created_at: row.created_at,
      replied_at: row.replied_at
    };
  }

  private mapRowToMarketData(row: any): MarketData {
    return {
      id: row.id,
      data_type: row.data_type,
      title: row.title,
      content: row.content,
      source_url: row.source_url,
      relevance_score: row.relevance_score,
      created_at: row.created_at,
      expires_at: row.expires_at
    };
  }

  private mapRowToUserInteraction(row: any): UserInteraction {
    return {
      id: row.id,
      user_id: row.user_id,
      platform: row.platform,
      interaction_type: row.interaction_type,
      content: row.content,
      response_generated: row.response_generated,
      sentiment_score: row.sentiment_score,
      created_at: row.created_at
    };
  }

  private mapRowToPresaleTransaction(row: any): PresaleTransaction {
    return {
      id: row.id,
      transaction_hash: row.transaction_hash,
      wallet_address: row.wallet_address,
      sol_amount: parseFloat(row.sol_amount),
      mnex_tokens: parseFloat(row.mnex_tokens),
      verified: row.verified,
      created_at: row.created_at,
      verified_at: row.verified_at
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
