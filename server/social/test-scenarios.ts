import { PostGenerator, type PostContext } from './post-generator';
// import { SocialRelay } from './social-relay';

class TestScenarios {
  private postGenerator: PostGenerator;
  // private socialRelay: SocialRelay;

  constructor() {
    this.postGenerator = new PostGenerator();
    // this.socialRelay = new SocialRelay();
  }

  async simulatePresalePre(now: Date): Promise<void> {
    console.log('🧪 Simulating presale pre-launch event...');
    
    const context: PostContext = {
      event_type: 'presale_pre',
      timestamp: new Date(now.getTime() + 50 * 60 * 1000) // 50 minutes from now
    };
    
    const post = this.postGenerator.generatePost(context);
    console.log('Generated pre-launch post:');
    console.log(post.text);
    console.log(`Personas: ${post.personas_used.join(', ')}`);
    console.log(`Template: ${post.template_used}`);
    console.log(`Safety checked: ${post.safety_checked}`);
    
    // Log locally, don't post to X unless admin flag is true
    console.log('✅ Post generated and logged locally (not posted to X)');
  }

  async simulatePresaleStart(presaleStart: Date): Promise<void> {
    console.log('🧪 Simulating presale start event...');
    
    const context: PostContext = {
      event_type: 'presale_start',
      timestamp: presaleStart,
      presale_data: {
        start_time: presaleStart.toISOString(),
        rate: 1000000,
        wallet: 'TBD', // Replace with actual wallet
        website: 'https://www.morpheusnexus.cloud'
      }
    };
    
    const post = this.postGenerator.generatePost(context);
    console.log('Generated launch post:');
    console.log(post.text);
    console.log(`Personas: ${post.personas_used.join(', ')}`);
    console.log(`Template: ${post.template_used}`);
    console.log(`Safety checked: ${post.safety_checked}`);
    
    // This would normally post to X and Telegram
    console.log('✅ Post generated (would post to X and Telegram)');
  }

  async simulateTxVerification(txHash: string): Promise<void> {
    console.log('🧪 Simulating transaction verification...');
    
    // Simulate on-chain verification
    const verified = await this.verifyTransaction(txHash);
    
    if (verified) {
      const context: PostContext = {
        event_type: 'tx_verification',
        timestamp: new Date(),
        tx_hash: txHash
      };
      
      const post = this.postGenerator.generatePost(context);
      console.log('Generated verification post:');
      console.log(post.text);
      console.log(`Personas: ${post.personas_used.join(', ')}`);
      console.log(`Template: ${post.template_used}`);
      console.log(`Safety checked: ${post.safety_checked}`);
      
      console.log('✅ Transaction verified and post generated');
    } else {
      console.log('❌ Transaction verification failed');
    }
  }

  private async verifyTransaction(txHash: string): Promise<boolean> {
    // Simulate on-chain verification
    console.log(`Verifying transaction: ${txHash}`);
    
    // Mock verification - in real implementation, check Solana blockchain
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 90% success rate
    return Math.random() > 0.1;
  }

  async testPersonaBlending(): Promise<void> {
    console.log('🧪 Testing persona blending...');
    
    const contexts: PostContext[] = [
      { event_type: 'vision' },
      { event_type: 'community' },
      { event_type: 'data_fragment' }
    ];
    
    for (const context of contexts) {
      const post = this.postGenerator.generatePost(context);
      console.log(`\nContext: ${context.event_type}`);
      console.log(`Post: ${post.text}`);
      console.log(`Personas: ${post.personas_used.join(', ')}`);
      console.log(`Intensity: ${post.metadata.intensity.toFixed(2)}`);
    }
  }

  async testSafetyRules(): Promise<void> {
    console.log('🧪 Testing safety rules...');
    
    // Test forbidden phrases
    const testPosts = [
      "Buy now! The price will pump!",
      "Sell everything, dump incoming!",
      "Guaranteed returns of 1000%!",
      "Vision: a neon owl folds the ledger into its wings. Nodes hum, feed, and dream."
    ];
    
    for (const testText of testPosts) {
      const context: PostContext = { event_type: 'vision' };
      const post = this.postGenerator.generatePost(context);
      
      // Override text for testing
      const testPost = { ...post, text: testText };
      const safetyChecked = this.postGenerator['safetyCheck'](testText);
      
      console.log(`\nText: "${testText}"`);
      console.log(`Safety check: ${safetyChecked ? '✅ PASS' : '❌ FAIL'}`);
    }
  }

  async testUniqueness(): Promise<void> {
    console.log('🧪 Testing post uniqueness...');
    
    const posts: string[] = [];
    const context: PostContext = { event_type: 'vision' };
    
    for (let i = 0; i < 5; i++) {
      const post = this.postGenerator.generatePost(context);
      posts.push(post.text);
    }
    
    const uniquePosts = new Set(posts);
    console.log(`Generated ${posts.length} posts, ${uniquePosts.size} unique`);
    
    if (uniquePosts.size === posts.length) {
      console.log('✅ All posts are unique');
    } else {
      console.log('❌ Some posts are duplicates');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Running all test scenarios...\n');
    
    try {
      await this.simulatePresalePre(new Date());
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.simulatePresaleStart(new Date(Date.now() + 24 * 60 * 60 * 1000));
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.simulateTxVerification('mock_tx_hash_12345');
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.testPersonaBlending();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.testSafetyRules();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.testUniqueness();
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const scenarios = new TestScenarios();
  scenarios.runAllTests().catch(console.error);
}

export { TestScenarios };
