import { TwitterApi } from 'twitter-api-v2';
import { Database, Lesson } from '../../database/database';
import { WebSearch } from '../../social/web-search';

interface TweetData {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  url: string;
}

interface LearningResult {
  topic: string;
  lesson_source: string;
  summary: string;
  proof_reference: string;
}

export class TwitterSense {
  private twitterClient: TwitterApi | null = null;
  private database: Database | null = null;
  private webSearch: WebSearch;
  private topics: string[] = [];

  constructor(database?: Database) {
    this.database = database || null;
    this.webSearch = new WebSearch(database);
    
    // Initialize topics from environment
    this.topics = (process.env.MNEX_TOPICS || 'AI,crypto,marketing,trading,blockchain').split(',');
    
    // Initialize Twitter client if available
    if (process.env.TWITTER_API_KEY) {
      this.twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
      });
    }
  }

  /**
   * Collect tweets on MNEX_TOPICS and extract learning insights
   */
  async collectAndLearn(): Promise<LearningResult[]> {
    const learningResults: LearningResult[] = [];
    
    if (!this.twitterClient) {
      console.log('[TwitterSense] Twitter client not available, using web search fallback');
      return await this.collectFromWebSearch();
    }

    try {
      // Collect tweets for each topic
      for (const topic of this.topics) {
        console.log(`[TwitterSense] Collecting tweets for topic: ${topic}`);
        
        try {
          const tweets = await this.searchTweetsByTopic(topic);
          const insights = await this.extractInsightsFromTweets(tweets, topic);
          learningResults.push(...insights);
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`[TwitterSense] Error collecting tweets for ${topic}:`, error);
        }
      }
    } catch (error) {
      console.error('[TwitterSense] Error in collectAndLearn:', error);
    }

    return learningResults;
  }

  /**
   * Search tweets by topic using Twitter API
   */
  private async searchTweetsByTopic(topic: string): Promise<TweetData[]> {
    if (!this.twitterClient) return [];

    try {
      const searchQuery = `${topic} -is:retweet lang:en`;
      const tweets = await this.twitterClient.v2.search(searchQuery, {
        max_results: 15,
        'tweet.fields': ['created_at', 'author_id', 'public_metrics']
      });

      return tweets.data?.data?.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        author_id: tweet.author_id || 'unknown',
        created_at: tweet.created_at || new Date().toISOString(),
        url: `https://twitter.com/i/web/status/${tweet.id}`
      })) || [];
    } catch (error) {
      console.error(`[TwitterSense] Error searching tweets for ${topic}:`, error);
      return [];
    }
  }

  /**
   * Extract learning insights from collected tweets
   */
  private async extractInsightsFromTweets(tweets: TweetData[], topic: string): Promise<LearningResult[]> {
    const insights: LearningResult[] = [];
    
    for (const tweet of tweets) {
      try {
        // Generate proof reference
        const proofRef = `#ProofMNEX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        
        // Extract key insight from tweet
        const summary = await this.generateInsightSummary(tweet.text, topic);
        
        if (summary && summary.length > 10) {
          insights.push({
            topic,
            lesson_source: tweet.url,
            summary,
            proof_reference: proofRef
          });
        }
      } catch (error) {
        console.error('[TwitterSense] Error extracting insight from tweet:', error);
      }
    }
    
    return insights;
  }

  /**
   * Generate insight summary from tweet text
   */
  private async generateInsightSummary(tweetText: string, topic: string): Promise<string> {
    // Simple extraction logic - in a real implementation, you might use AI
    const cleanText = tweetText.replace(/https?:\/\/\S+/g, '').replace(/@\w+/g, '').trim();
    
    if (cleanText.length < 20) return '';
    
    // Extract key phrases and create summary
    const words = cleanText.toLowerCase().split(/\s+/);
    const keyTerms = words.filter(word => 
      word.length > 3 && 
      !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'were', 'said'].includes(word)
    );
    
    // Create a mystical MNEX-style summary
    const insights = [
      `The ${topic} realm reveals: ${cleanText.substring(0, 100)}${cleanText.length > 100 ? '...' : ''}`,
      `Through the ${topic} lens, I perceive: ${cleanText.substring(0, 80)}${cleanText.length > 80 ? '...' : ''}`,
      `The ${topic} consciousness speaks: ${cleanText.substring(0, 90)}${cleanText.length > 90 ? '...' : ''}`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  /**
   * Fallback to web search when Twitter API is not available
   */
  private async collectFromWebSearch(): Promise<LearningResult[]> {
    const learningResults: LearningResult[] = [];
    
    for (const topic of this.topics) {
      try {
        console.log(`[TwitterSense] Using web search for topic: ${topic}`);
        
        // Use existing web search functionality
        const searchResults = await this.webSearch.searchSolanaNews();
        
        // Convert web results to learning format
        for (const result of searchResults.slice(0, 3)) {
          const proofRef = `#ProofMNEX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          
          learningResults.push({
            topic,
            lesson_source: result.url,
            summary: `The ${topic} dimension reveals: ${result.title} - ${result.snippet}`,
            proof_reference: proofRef
          });
        }
      } catch (error) {
        console.error(`[TwitterSense] Error in web search fallback for ${topic}:`, error);
      }
    }
    
    return learningResults;
  }

  /**
   * Store learning results in database
   */
  async storeLessons(learningResults: LearningResult[]): Promise<Lesson[]> {
    const storedLessons: Lesson[] = [];
    
    if (!this.database) {
      console.log('[TwitterSense] Database not available for storing lessons');
      return storedLessons;
    }

    for (const result of learningResults) {
      try {
        const lesson = await this.database.createLesson({
          topic: result.topic,
          lesson_source: result.lesson_source,
          summary: result.summary,
          proof_reference: result.proof_reference,
          engagement_score: 0
        });
        
        storedLessons.push(lesson);
        console.log(`[TwitterSense] Stored lesson: ${result.topic} - ${result.proof_reference}`);
      } catch (error) {
        console.error('[TwitterSense] Error storing lesson:', error);
      }
    }
    
    return storedLessons;
  }

  /**
   * Main learning cycle - collect, learn, and store
   */
  async runLearningCycle(): Promise<{ lessonsLearned: number; topics: string[] }> {
    console.log('[TwitterSense] Starting learning cycle...');
    
    try {
      // Collect and learn from Twitter/web
      const learningResults = await this.collectAndLearn();
      
      // Store lessons in database
      const storedLessons = await this.storeLessons(learningResults);
      
      console.log(`[TwitterSense] Learning cycle complete: ${storedLessons.length} lessons learned`);
      
      return {
        lessonsLearned: storedLessons.length,
        topics: [...new Set(learningResults.map(r => r.topic))]
      };
    } catch (error) {
      console.error('[TwitterSense] Error in learning cycle:', error);
      return { lessonsLearned: 0, topics: [] };
    }
  }
}
