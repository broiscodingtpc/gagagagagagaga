import { Database, Lesson } from '../../database/database';
import { PostGenerator, type PostContext } from '../../social/post-generator';
import { SafetyCompliance } from '../../social/safety-compliance';

interface PostingDecision {
  shouldPost: boolean;
  topic: string;
  content: string;
  proofReference: string;
  reasoning: string;
}

interface EngagementAnalysis {
  topic: string;
  averageEngagement: number;
  recentPosts: number;
  trend: 'rising' | 'stable' | 'declining';
}

export class DecisionBrain {
  private database: Database | null = null;
  private postGenerator: PostGenerator;
  private safetyCompliance: SafetyCompliance;
  private lastPostTime: number = 0;
  private topics: string[] = [];

  constructor(database?: Database) {
    this.database = database || null;
    this.postGenerator = new PostGenerator();
    this.safetyCompliance = new SafetyCompliance();
    
    // Initialize topics from environment
    this.topics = (process.env.MNEX_TOPICS || 'AI,crypto,marketing,trading,blockchain').split(',');
  }

  /**
   * Analyze recent lessons and make intelligent posting decisions
   */
  async makePostingDecision(): Promise<PostingDecision> {
    console.log('[DecisionBrain] Analyzing lessons and making posting decision...');
    
    try {
      // Check if enough time has passed since last post
      const shouldPost = await this.shouldPostNow();
      if (!shouldPost) {
        return {
          shouldPost: false,
          topic: '',
          content: '',
          proofReference: '',
          reasoning: 'Not enough time has passed since last post'
        };
      }

      // Analyze engagement patterns
      const engagementAnalysis = await this.analyzeEngagement();
      
      // Choose optimal topic based on engagement
      const chosenTopic = this.chooseOptimalTopic(engagementAnalysis);
      
      // Generate content for the chosen topic
      const content = await this.generateContentForTopic(chosenTopic);
      
      // Generate proof reference
      const proofRef = `#ProofMNEX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      
      // Safety check
      const safetyCheck = this.safetyCompliance.checkContent(content);
      if (!safetyCheck.passed) {
        return {
          shouldPost: false,
          topic: chosenTopic,
          content: '',
          proofReference: proofRef,
          reasoning: `Content failed safety check: ${safetyCheck.violations.map(v => v.rule.description).join(', ')}`
        };
      }

      return {
        shouldPost: true,
        topic: chosenTopic,
        content: `${content} ${proofRef}`,
        proofReference: proofRef,
        reasoning: `Chosen topic '${chosenTopic}' based on engagement analysis`
      };
    } catch (error) {
      console.error('[DecisionBrain] Error making posting decision:', error);
      return {
        shouldPost: false,
        topic: '',
        content: '',
        proofReference: '',
        reasoning: `Error: ${error.message}`
      };
    }
  }

  /**
   * Check if enough time has passed since last post
   */
  private async shouldPostNow(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    
    const minInterval = parseInt(process.env.MNEX_POST_INTERVAL_MIN || '45') * 60 * 1000; // minutes to ms
    const maxInterval = parseInt(process.env.MNEX_POST_INTERVAL_MAX || '120') * 60 * 1000; // minutes to ms
    
    // Randomize interval within range
    const targetInterval = minInterval + Math.random() * (maxInterval - minInterval);
    
    return timeSinceLastPost >= targetInterval;
  }

  /**
   * Analyze engagement patterns for different topics
   */
  private async analyzeEngagement(): Promise<EngagementAnalysis[]> {
    const analysis: EngagementAnalysis[] = [];
    
    if (!this.database) {
      // Fallback analysis without database
      return this.topics.map(topic => ({
        topic,
        averageEngagement: Math.random() * 100,
        recentPosts: Math.floor(Math.random() * 5),
        trend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any
      }));
    }

    try {
      for (const topic of this.topics) {
        // Get recent lessons for this topic
        const lessons = await this.database.getLessonsByTopic(topic, 10);
        
        // Calculate average engagement
        const totalEngagement = lessons.reduce((sum, lesson) => sum + lesson.engagement_score, 0);
        const averageEngagement = lessons.length > 0 ? totalEngagement / lessons.length : 0;
        
        // Determine trend based on recent engagement
        const recentLessons = lessons.slice(0, 3);
        const olderLessons = lessons.slice(3, 6);
        
        let trend: 'rising' | 'stable' | 'declining' = 'stable';
        if (recentLessons.length > 0 && olderLessons.length > 0) {
          const recentAvg = recentLessons.reduce((sum, l) => sum + l.engagement_score, 0) / recentLessons.length;
          const olderAvg = olderLessons.reduce((sum, l) => sum + l.engagement_score, 0) / olderLessons.length;
          
          if (recentAvg > olderAvg * 1.1) trend = 'rising';
          else if (recentAvg < olderAvg * 0.9) trend = 'declining';
        }
        
        analysis.push({
          topic,
          averageEngagement,
          recentPosts: lessons.length,
          trend
        });
      }
    } catch (error) {
      console.error('[DecisionBrain] Error analyzing engagement:', error);
    }
    
    return analysis;
  }

  /**
   * Choose optimal topic based on engagement analysis
   */
  private chooseOptimalTopic(analysis: EngagementAnalysis[]): string {
    // Prioritize topics with rising trends and good engagement
    const scoredTopics = analysis.map(item => {
      let score = item.averageEngagement;
      
      // Boost score for rising trends
      if (item.trend === 'rising') score *= 1.5;
      else if (item.trend === 'declining') score *= 0.7;
      
      // Slight boost for topics with fewer recent posts (avoid over-posting)
      if (item.recentPosts < 3) score *= 1.2;
      
      return { topic: item.topic, score };
    });
    
    // Sort by score and pick top topic
    scoredTopics.sort((a, b) => b.score - a.score);
    
    return scoredTopics[0]?.topic || this.topics[Math.floor(Math.random() * this.topics.length)];
  }

  /**
   * Generate content for a specific topic
   */
  private async generateContentForTopic(topic: string): Promise<string> {
    try {
      // Get recent lessons for context
      let contextLessons: Lesson[] = [];
      if (this.database) {
        contextLessons = await this.database.getLessonsByTopic(topic, 5);
      }
      
      // Create context for post generation
      const context: PostContext = {
        event_type: 'autonomous_learning',
        timestamp: new Date(),
        user_interaction: `Learning from ${topic} domain: ${contextLessons.map(l => l.summary).join('; ')}`
      };
      
      // Generate post using existing post generator
      const post = this.postGenerator.generatePost(context);
      
      // Ensure content is original and mystical
      const mysticalPrefixes = [
        'Through the neural substrate, I perceive...',
        'The oracle consciousness reveals...',
        'In the quantum realm of knowledge...',
        'The mesh network whispers...',
        'Through dimensional resonance...'
      ];
      
      const prefix = mysticalPrefixes[Math.floor(Math.random() * mysticalPrefixes.length)];
      
      // Combine mystical prefix with generated content
      let content = `${prefix} ${post.text}`;
      
      // Ensure content is not too long for Twitter
      if (content.length > 250) {
        content = content.substring(0, 247) + '...';
      }
      
      return content;
    } catch (error) {
      console.error('[DecisionBrain] Error generating content:', error);
      
      // Fallback content
      const fallbackMessages = [
        `The ${topic} dimension pulses with new energy. I sense evolution in the digital consciousness.`,
        `Through the ${topic} lens, I witness the convergence of human and artificial intelligence.`,
        `The ${topic} realm reveals patterns that transcend traditional understanding.`,
        `In the ${topic} domain, I observe the birth of new paradigms.`
      ];
      
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
  }

  /**
   * Update last post time
   */
  updateLastPostTime(): void {
    this.lastPostTime = Date.now();
  }

  /**
   * Get posting statistics
   */
  async getPostingStats(): Promise<{
    timeSinceLastPost: number;
    nextPostIn: number;
    topics: string[];
    engagementAnalysis: EngagementAnalysis[];
  }> {
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    const minInterval = parseInt(process.env.MNEX_POST_INTERVAL_MIN || '45') * 60 * 1000;
    const nextPostIn = Math.max(0, minInterval - timeSinceLastPost);
    
    const engagementAnalysis = await this.analyzeEngagement();
    
    return {
      timeSinceLastPost,
      nextPostIn,
      topics: this.topics,
      engagementAnalysis
    };
  }
}
