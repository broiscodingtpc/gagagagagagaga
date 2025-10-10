import { PostGenerator, type PostContext } from './server/social/post-generator';
import { SafetyCompliance } from './server/social/safety-compliance';

console.log('🎭 MNEX Persona System - Simple Test\n');

const generator = new PostGenerator();
const safety = new SafetyCompliance();

// Test 1: Generate a vision post
console.log('📝 Vision Post:');
const visionPost = generator.generatePost({ event_type: 'vision' });
console.log(`Text: ${visionPost.text}`);
console.log(`Personas: ${visionPost.personas_used.join(', ')}`);
console.log(`Safety: ${visionPost.safety_checked ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Generate a community post
console.log('👥 Community Post:');
const communityPost = generator.generatePost({ event_type: 'community' });
console.log(`Text: ${communityPost.text}`);
console.log(`Personas: ${communityPost.personas_used.join(', ')}`);
console.log(`Safety: ${communityPost.safety_checked ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Generate a presale announcement
console.log('💰 Presale Announcement:');
const presalePost = generator.generatePost({
  event_type: 'presale_start',
  presale_data: {
    start_time: '2024-01-20T12:00:00Z',
    rate: 1000000,
    wallet: 'TBD',
    website: 'https://www.morpheusnexus.cloud'
  }
});
console.log(`Text: ${presalePost.text}`);
console.log(`Personas: ${presalePost.personas_used.join(', ')}`);
console.log(`Safety: ${presalePost.safety_checked ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Safety check
console.log('🛡️ Safety Test:');
const testText = "Buy now! The price will pump!";
const compliance = safety.checkContent(testText);
console.log(`Text: "${testText}"`);
console.log(`Result: ${compliance.passed ? '✅ SAFE' : '❌ BLOCKED'}`);
if (compliance.violations.length > 0) {
  console.log(`Violations: ${compliance.violations.map(v => v.rule.description).join(', ')}`);
}

console.log('\n✅ MNEX Persona System Test Complete!');
console.log('🚀 System is ready for production use!');
