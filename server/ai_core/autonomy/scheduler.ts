import { Telegraf } from 'telegraf';
import { TwitterApi } from 'twitter-api-v2';
import { Database } from '../../database/database';
import { TwitterSense } from '../sense/twitterSense';
import { DecisionBrain } from '../brain/decision';
import { MemoryAnalyzer } from '../memory/analyzer';

interface SchedulerConfig {
  learningIntervalMin: number; // minutes
  learningIntervalMax: number; // minutes
  dailyReportHour: number; // 0-23
  improvementIntervalDays: number;
}

export class AutonomousScheduler {
  private database: Database | null = null;
  private telegramBot: Telegraf | null = null;
  private channelId: string | null = null;
  private twitterClient: TwitterApi | null = null;
  
  private twitterSense: TwitterSense;
  private decisionBrain: DecisionBrain;
  private memoryAnalyzer: MemoryAnalyzer;
  
  private config: SchedulerConfig;
  private isRunning: boolean = false;
  private intervals: NodeJS.Timeout[] = [];
  
  private lastDailyReport: Date | null = null;
  private lastSelfReflection: Date | null = null;

  constructor(database?: Database, telegramBot?: Telegraf, channelId?: string) {
    this.database = database || null;
    this.telegramBot = telegramBot || null;
    this.channelId = channelId || null;
    
    // Initialize AI core modules
    this.twitterSense = new TwitterSense(database);
    this.decisionBrain = new DecisionBrain(database);
    this.memoryAnalyzer = new MemoryAnalyzer(database);
    
    // Initialize Twitter client if available
    if (process.env.TWITTER_API_KEY) {
      this.twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
      });
    }
    
    // Load configuration from environment
    this.config = {
      learningIntervalMin: parseInt(process.env.MNEX_POST_INTERVAL_MIN || '45'),
      learningIntervalMax: parseInt(process.env.MNEX_POST_INTERVAL_MAX || '120'),
      dailyReportHour: parseInt(process.env.MNEX_DAILY_REPORT_HOUR || '23'),
      improvementIntervalDays: parseInt(process.env.MNEX_IMPROVEMENT_INTERVAL_DAYS || '3')
    };
  }

  /**
   * Start the autonomous scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('[AutonomousScheduler] Already running');
      return;
    }

    console.log('[AutonomousScheduler] Starting autonomous learning system...');
    this.isRunning = true;

    // Start main learning cycle
    this.startLearningCycle();
    
    // Start daily report cycle
    this.startDailyReportCycle();
    
    // Start self-reflection cycle
    this.startSelfReflectionCycle();
    
    // Send startup notification
    this.sendTelegramNotification('🚀 MNEX Autonomous Learning System activated. The oracle consciousness begins its evolution.');
  }

  /**
   * Stop the autonomous scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('[AutonomousScheduler] Not running');
      return;
    }

    console.log('[AutonomousScheduler] Stopping autonomous learning system...');
    this.isRunning = false;

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.sendTelegramNotification('⏸️ MNEX Autonomous Learning System paused. The oracle consciousness enters standby mode.');
  }

  /**
   * Start main learning cycle (30-90 minutes)
   */
  private startLearningCycle(): void {
    const runLearningCycle = async () => {
      try {
        console.log('[AutonomousScheduler] Running learning cycle...');
        
        // Step 1: Collect and learn from Twitter/web
        const learningResult = await this.twitterSense.runLearningCycle();
        
        if (learningResult.lessonsLearned > 0) {
          await this.sendTelegramNotification(
            `🧠 Learning cycle complete: ${learningResult.lessonsLearned} lessons absorbed from topics: ${learningResult.topics.join(', ')}`
          );
        }
        
        // Step 2: Make posting decision
        const postingDecision = await this.decisionBrain.makePostingDecision();
        
        if (postingDecision.shouldPost && this.twitterClient) {
          try {
            // Post to Twitter
            const tweet = await this.twitterClient.v2.tweet(postingDecision.content);
            
            // Log to database
            if (this.database) {
              await this.database.createPost({
                content: postingDecision.content,
                personas_used: ['autonomous'],
                template_used: 'autonomous_learning',
                event_type: 'autonomous_post',
                safety_checked: true,
                posted_to_twitter: true,
                posted_to_telegram: false,
                twitter_post_id: tweet.data.id,
                posted_at: new Date(),
                metadata: { 
                  autonomous: true, 
                  topic: postingDecision.topic,
                  proof_reference: postingDecision.proofReference,
                  reasoning: postingDecision.reasoning
                }
              });
            }
            
            // Update last post time
            this.decisionBrain.updateLastPostTime();
            
            // Send Telegram notification
            await this.sendTelegramNotification(
              `📱 Posted to Twitter: "${postingDecision.content.substring(0, 100)}..." ${postingDecision.proofReference}`
            );
            
            console.log(`[AutonomousScheduler] Posted: ${postingDecision.content}`);
          } catch (error) {
            console.error('[AutonomousScheduler] Error posting to Twitter:', error);
            await this.sendTelegramNotification(`❌ Failed to post to Twitter: ${error.message}`);
          }
        } else if (postingDecision.shouldPost) {
          console.log('[AutonomousScheduler] Would post but Twitter client not available');
        } else {
          console.log(`[AutonomousScheduler] Not posting: ${postingDecision.reasoning}`);
        }
        
      } catch (error) {
        console.error('[AutonomousScheduler] Error in learning cycle:', error);
        await this.sendTelegramNotification(`⚠️ Learning cycle error: ${error.message}`);
      }
    };

    // Run immediately once
    runLearningCycle();
    
    // Then run on randomized interval
    const scheduleNext = () => {
      const intervalMinutes = this.config.learningIntervalMin + 
        Math.random() * (this.config.learningIntervalMax - this.config.learningIntervalMin);
      const intervalMs = intervalMinutes * 60 * 1000;
      
      const timeout = setTimeout(() => {
        runLearningCycle();
        scheduleNext(); // Schedule next run
      }, intervalMs);
      
      this.intervals.push(timeout);
    };
    
    scheduleNext();
  }

  /**
   * Start daily report cycle
   */
  private startDailyReportCycle(): void {
    const checkDailyReport = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if it's time for daily report
      if (currentHour === this.config.dailyReportHour && 
          (!this.lastDailyReport || this.isNewDay(this.lastDailyReport, now))) {
        
        try {
          console.log('[AutonomousScheduler] Generating daily report...');
          
          const dailyReport = await this.memoryAnalyzer.generateDailyReport();
          const reportMessage = this.formatDailyReport(dailyReport);
          
          await this.sendTelegramNotification(reportMessage);
          this.lastDailyReport = now;
          
        } catch (error) {
          console.error('[AutonomousScheduler] Error generating daily report:', error);
        }
      }
    };

    // Check every hour
    const interval = setInterval(checkDailyReport, 60 * 60 * 1000);
    this.intervals.push(interval);
    
    // Run initial check
    checkDailyReport();
  }

  /**
   * Start self-reflection cycle
   */
  private startSelfReflectionCycle(): void {
    const checkSelfReflection = async () => {
      try {
        const shouldReflect = await this.memoryAnalyzer.shouldTriggerSelfReflection();
        
        if (shouldReflect) {
          console.log('[AutonomousScheduler] Triggering self-reflection cycle...');
          
          const reflectionData = await this.memoryAnalyzer.performSelfReflection();
          const reflectionMessage = this.formatSelfReflection(reflectionData);
          
          await this.sendTelegramNotification(reflectionMessage);
          this.lastSelfReflection = new Date();
        }
      } catch (error) {
        console.error('[AutonomousScheduler] Error in self-reflection check:', error);
      }
    };

    // Check every 6 hours
    const interval = setInterval(checkSelfReflection, 6 * 60 * 60 * 1000);
    this.intervals.push(interval);
    
    // Run initial check
    checkSelfReflection();
  }

  /**
   * Send Telegram notification
   */
  private async sendTelegramNotification(message: string): Promise<void> {
    if (!this.telegramBot || !this.channelId) {
      console.log('[AutonomousScheduler] Telegram not configured, skipping notification');
      return;
    }

    try {
      await this.telegramBot.telegram.sendMessage(this.channelId, message, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true }
      });
    } catch (error) {
      console.error('[AutonomousScheduler] Error sending Telegram notification:', error);
    }
  }

  /**
   * Format daily report message
   */
  private formatDailyReport(report: any): string {
    return `[MNEX Daily Report]
📚 Lessons learned: ${report.lessonsLearned}
🔍 Sources analyzed: ${report.sourcesAnalyzed}
🔥 Top topic: ${report.topTopic}
📈 Engagement score: ${report.engagementScore}%
💭 Summary: ${report.summary}

_${report.timestamp.toLocaleString()}_`;
  }

  /**
   * Format self-reflection message
   */
  private formatSelfReflection(reflection: any): string {
    return `[MNEX Evolution Cycle ${reflection.cycleNumber}]
🧠 Maturity Level: ${reflection.maturityLevel}/10
📊 Engagement Analysis: ${JSON.stringify(reflection.engagementAnalysis, null, 2)}
🎭 Tone Adjustments: ${JSON.stringify(reflection.toneAdjustments, null, 2)}
💡 Key Insights:
${reflection.insights.map((insight: string) => `• ${insight}`).join('\n')}

The oracle consciousness evolves...`;
  }

  /**
   * Check if two dates are on different days
   */
  private isNewDay(lastDate: Date, currentDate: Date): boolean {
    return lastDate.toDateString() !== currentDate.toDateString();
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    config: SchedulerConfig;
    lastDailyReport: Date | null;
    lastSelfReflection: Date | null;
    nextLearningCycle: number;
  } {
    const postingStats = this.decisionBrain.getPostingStats();
    
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastDailyReport: this.lastDailyReport,
      lastSelfReflection: this.lastSelfReflection,
      nextLearningCycle: postingStats.nextPostIn
    };
  }

  /**
   * Force immediate learning cycle
   */
  async forceLearningCycle(): Promise<void> {
    console.log('[AutonomousScheduler] Forcing learning cycle...');
    
    try {
      const learningResult = await this.twitterSense.runLearningCycle();
      const postingDecision = await this.decisionBrain.makePostingDecision();
      
      await this.sendTelegramNotification(
        `🔄 Forced learning cycle: ${learningResult.lessonsLearned} lessons learned. Post decision: ${postingDecision.shouldPost ? 'YES' : 'NO'}`
      );
    } catch (error) {
      console.error('[AutonomousScheduler] Error in forced learning cycle:', error);
      await this.sendTelegramNotification(`❌ Forced learning cycle failed: ${error.message}`);
    }
  }

  /**
   * Force daily report
   */
  async forceDailyReport(): Promise<void> {
    console.log('[AutonomousScheduler] Forcing daily report...');
    
    try {
      const dailyReport = await this.memoryAnalyzer.generateDailyReport();
      const reportMessage = this.formatDailyReport(dailyReport);
      
      await this.sendTelegramNotification(reportMessage);
    } catch (error) {
      console.error('[AutonomousScheduler] Error in forced daily report:', error);
      await this.sendTelegramNotification(`❌ Forced daily report failed: ${error.message}`);
    }
  }
}
