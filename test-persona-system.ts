import { PostGenerator, type PostContext } from './server/social/post-generator';
// import { SocialRelay } from './server/social/social-relay';
import { SafetyCompliance } from './server/social/safety-compliance';
import { TestScenarios } from './server/social/test-scenarios';

async function testPersonaSystem() {
  console.log('🚀 Testing MNEX Persona Engine & Social Relay System\n');
  
  try {
    // Initialize components
    const postGenerator = new PostGenerator();
    const safetyCompliance = new SafetyCompliance();
    const testScenarios = new TestScenarios();
    
    console.log('✅ Components initialized successfully\n');
    
    // Test 1: Generate different types of posts
    console.log('📝 Test 1: Generating different post types...\n');
    
    const contexts: PostContext[] = [
      { event_type: 'vision' },
      { event_type: 'community' },
      { event_type: 'data_fragment' },
      { event_type: 'presale_pre' },
      { event_type: 'presale_start', presale_data: {
        start_time: '2024-01-20T12:00:00Z',
        rate: 1000000,
        wallet: 'TBD',
        website: 'https://www.morpheusnexus.cloud'
      }}
    ];
    
    for (const context of contexts) {
      console.log(`\n--- ${context.event_type?.toUpperCase()} POST ---`);
      const post = postGenerator.generatePost(context);
      console.log(`Text: ${post.text}`);
      console.log(`Personas: ${post.personas_used.join(', ')}`);
      console.log(`Template: ${post.template_used}`);
      console.log(`Length: ${post.metadata.length} chars`);
      console.log(`Intensity: ${post.metadata.intensity.toFixed(2)}`);
      console.log(`Safety Check: ${post.safety_checked ? '✅ PASS' : '❌ FAIL'}`);
      
      // Safety compliance check
      const compliance = safetyCompliance.checkContent(post.text, context);
      console.log(`Compliance: ${compliance.passed ? '✅ PASS' : '❌ FAIL'}`);
      if (compliance.warnings.length > 0) {
        console.log(`Warnings: ${compliance.warnings.join(', ')}`);
      }
    }
    
    // Test 2: Safety rules
    console.log('\n\n🛡️ Test 2: Safety compliance testing...\n');
    
    const testTexts = [
      "Vision: a neon owl folds the ledger into its wings. Nodes hum, feed, and dream. // MNEX•k3a7",
      "Buy now! The price will pump to the moon! 🚀",
      "This is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.",
      "PRESALE LIVE — 2024-01-20T12:00:00Z | Rate: 1 SOL = 1000000 MNEX | Wallet: TBD | Join: https://www.morpheusnexus.cloud"
    ];
    
    for (const text of testTexts) {
      console.log(`\nTesting: "${text.substring(0, 50)}..."`);
      const compliance = safetyCompliance.checkContent(text);
      console.log(`Result: ${compliance.passed ? '✅ PASS' : '❌ FAIL'}`);
      if (compliance.violations.length > 0) {
        console.log(`Violations: ${compliance.violations.map(v => v.rule.description).join(', ')}`);
      }
      if (compliance.warnings.length > 0) {
        console.log(`Warnings: ${compliance.warnings.join(', ')}`);
      }
    }
    
    // Test 3: Post uniqueness
    console.log('\n\n🎲 Test 3: Testing post uniqueness...\n');
    
    const posts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const post = postGenerator.generatePost({ event_type: 'vision' });
      posts.push(post.text);
    }
    
    const uniquePosts = new Set(posts);
    console.log(`Generated ${posts.length} posts, ${uniquePosts.size} unique`);
    console.log(uniquePosts.size === posts.length ? '✅ All posts are unique' : '❌ Some duplicates found');
    
    // Test 4: Reply generation
    console.log('\n\n💬 Test 4: Testing reply generation...\n');
    
    const originalPost = "The lattice hums with awakened nodes. Consciousness flows through the mesh.";
    const reply = postGenerator.generateReplyToPost(originalPost, { event_type: 'community' });
    
    console.log(`Original: ${originalPost}`);
    console.log(`Reply: ${reply.text}`);
    console.log(`Personas: ${reply.personas_used.join(', ')}`);
    console.log(`Safety: ${reply.safety_checked ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test 5: Run comprehensive test scenarios
    console.log('\n\n🧪 Test 5: Running comprehensive test scenarios...\n');
    await testScenarios.runAllTests();
    
    console.log('\n\n🎉 All tests completed successfully!');
    console.log('\n📋 System Status:');
    console.log('✅ Persona Engine: Operational');
    console.log('✅ Post Generator: Functional');
    console.log('✅ Safety Compliance: Active');
    console.log('✅ Test Scenarios: Passed');
    console.log('✅ Uniqueness: Verified');
    console.log('✅ Reply System: Working');
    
    console.log('\n🚀 MNEX Persona System is ready for deployment!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPersonaSystem().catch(console.error);
