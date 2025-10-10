import { PostGenerator, type PostContext } from './server/social/post-generator';
import { SafetyCompliance } from './server/social/safety-compliance';

async function quickTest() {
  console.log('🚀 Quick MNEX Persona Test\n');
  
  const generator = new PostGenerator();
  const safety = new SafetyCompliance();
  
  // Test 1: Vision post
  console.log('📝 Vision Post:');
  const visionPost = generator.generatePost({ event_type: 'vision' });
  console.log(`Text: ${visionPost.text}`);
  console.log(`Personas: ${visionPost.personas_used.join(', ')}`);
  console.log(`Safety: ${visionPost.safety_checked ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // Test 2: Community post
  console.log('👥 Community Post:');
  const communityPost = generator.generatePost({ event_type: 'community' });
  console.log(`Text: ${communityPost.text}`);
  console.log(`Personas: ${communityPost.personas_used.join(', ')}`);
  console.log(`Safety: ${communityPost.safety_checked ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // Test 3: Safety check
  console.log('🛡️ Safety Test:');
  const testText = "Buy now! The price will pump!";
  const compliance = safety.checkContent(testText);
  console.log(`Text: "${testText}"`);
  console.log(`Result: ${compliance.passed ? '✅ PASS' : '❌ FAIL'}`);
  if (compliance.violations.length > 0) {
    console.log(`Violations: ${compliance.violations.map(v => v.rule.description).join(', ')}`);
  }
  
  console.log('\n✅ Quick test completed!');
}

quickTest().catch(console.error);
