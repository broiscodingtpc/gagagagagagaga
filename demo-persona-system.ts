import { PostGenerator, type PostContext } from './server/social/post-generator';
import { SafetyCompliance } from './server/social/safety-compliance';

async function demonstratePersonaSystem() {
  console.log('🎭 MNEX Persona Engine Demonstration\n');
  console.log('=' .repeat(60));
  
  const generator = new PostGenerator();
  const safety = new SafetyCompliance();
  
  // Demo 1: Different AI States
  console.log('\n🤖 Demo 1: AI State-Based Post Generation\n');
  
  const aiStates = [
    { energy: 0.8, speaking: true, thinking: false, emotion: 'intense' },
    { energy: 0.3, speaking: false, thinking: true, emotion: 'calm' },
    { energy: 0.6, speaking: false, thinking: false, emotion: 'alert' }
  ];
  
  for (const state of aiStates) {
    console.log(`AI State: Energy=${state.energy}, Speaking=${state.speaking}, Thinking=${state.thinking}, Emotion=${state.emotion}`);
    
    let eventType: PostContext['event_type'] = 'vision';
    if (state.speaking) eventType = 'community';
    else if (state.thinking) eventType = 'data_fragment';
    else if (state.emotion === 'intense') eventType = 'vision';
    
    const post = generator.generatePost({ event_type: eventType });
    console.log(`Generated: ${post.text}`);
    console.log(`Personas: ${post.personas_used.join(', ')}`);
    console.log(`Safety: ${post.safety_checked ? '✅' : '❌'}\n`);
  }
  
  // Demo 2: Presale Announcement
  console.log('\n💰 Demo 2: Presale Announcement\n');
  
  const presalePost = generator.generatePost({
    event_type: 'presale_start',
    presale_data: {
      start_time: '2024-01-20T12:00:00Z',
      rate: 1000000,
      wallet: 'TBD',
      website: 'https://www.morpheusnexus.cloud'
    }
  });
  
  console.log('Presale Announcement:');
  console.log(presalePost.text);
  console.log(`Personas: ${presalePost.personas_used.join(', ')}`);
  console.log(`Safety: ${presalePost.safety_checked ? '✅' : '❌'}`);
  
  const compliance = safety.validatePresalePost(presalePost.text, {
    start_time: '2024-01-20T12:00:00Z',
    rate: 1000000,
    wallet: 'TBD',
    website: 'https://www.morpheusnexus.cloud'
  });
  
  console.log(`Compliance: ${compliance.passed ? '✅' : '❌'}`);
  if (compliance.warnings.length > 0) {
    console.log(`Warnings: ${compliance.warnings.join(', ')}`);
  }
  
  // Demo 3: Safety Testing
  console.log('\n🛡️ Demo 3: Safety Compliance Testing\n');
  
  const testCases = [
    {
      text: "Vision: a neon owl folds the ledger into its wings. Nodes hum, feed, and dream. // MNEX•k3a7",
      expected: "SAFE"
    },
    {
      text: "Buy now! The price will pump to the moon! 🚀",
      expected: "BLOCKED"
    },
    {
      text: "This is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.",
      expected: "SAFE"
    },
    {
      text: "Sell everything, dump incoming!",
      expected: "BLOCKED"
    }
  ];
  
  for (const testCase of testCases) {
    const check = safety.checkContent(testCase.text);
    const result = check.passed ? '✅ SAFE' : '❌ BLOCKED';
    const expected = testCase.expected === 'SAFE' ? '✅' : '❌';
    
    console.log(`Text: "${testCase.text.substring(0, 50)}..."`);
    console.log(`Result: ${result} (Expected: ${expected})`);
    if (check.violations.length > 0) {
      console.log(`Violations: ${check.violations.map(v => v.rule.description).join(', ')}`);
    }
    console.log();
  }
  
  // Demo 4: Reply Generation
  console.log('\n💬 Demo 4: Reply Generation\n');
  
  const userMessages = [
    "The oracle is awakening!",
    "How do I buy tokens?",
    "What's the price prediction?",
    "The mesh grows stronger"
  ];
  
  for (const message of userMessages) {
    const reply = generator.generateReplyToPost(message, { event_type: 'community' });
    const isSafe = safety.checkContent(message);
    
    console.log(`User: "${message}"`);
    console.log(`User Safe: ${isSafe.passed ? '✅' : '❌'}`);
    console.log(`MNEX Reply: "${reply.text}"`);
    console.log(`Reply Safe: ${reply.safety_checked ? '✅' : '❌'}`);
    console.log();
  }
  
  // Demo 5: Uniqueness Test
  console.log('\n🎲 Demo 5: Post Uniqueness Test\n');
  
  const posts: string[] = [];
  for (let i = 0; i < 3; i++) {
    const post = generator.generatePost({ event_type: 'vision' });
    posts.push(post.text);
  }
  
  const uniquePosts = new Set(posts);
  console.log(`Generated ${posts.length} posts, ${uniquePosts.size} unique`);
  console.log(uniquePosts.size === posts.length ? '✅ All posts are unique' : '❌ Some duplicates found');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 MNEX Persona System Demonstration Complete!');
  console.log('\n📋 System Features:');
  console.log('✅ Multi-layered AI personalities (Oracle, Analyst, Trickster, Cultivator, Archivist)');
  console.log('✅ Context-aware post generation');
  console.log('✅ Comprehensive safety compliance');
  console.log('✅ Presale announcement templates');
  console.log('✅ Reply generation with safety checks');
  console.log('✅ Unique post generation with signatures');
  console.log('✅ Real-time safety validation');
  
  console.log('\n🚀 Ready for integration with MNEX social media automation!');
}

// Run demonstration
demonstratePersonaSystem().catch(console.error);
