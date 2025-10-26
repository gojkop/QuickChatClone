/**
 * Test Data Cleanup Script
 *
 * Removes all test data created during security validation test runs.
 * Should be run after tests complete to keep database clean.
 *
 * Usage:
 *   node cleanup-test-data.cjs
 *
 * Or via npm script:
 *   npm run test:cleanup
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const CONFIG = {
  XANO_PUBLIC_API: process.env.XANO_PUBLIC_API,
  XANO_INTERNAL_API_KEY: process.env.XANO_INTERNAL_API_KEY,
};

// Validate configuration
if (!CONFIG.XANO_PUBLIC_API) {
  console.error('❌ Error: XANO_PUBLIC_API not set in .env file');
  process.exit(1);
}

if (!CONFIG.XANO_INTERNAL_API_KEY) {
  console.error('❌ Error: XANO_INTERNAL_API_KEY not set in .env file');
  process.exit(1);
}

/**
 * Call the Xano cleanup endpoint
 */
async function cleanupTestData() {
  console.log('\n🧹 Starting test data cleanup...\n');

  try {
    const response = await fetch(`${CONFIG.XANO_PUBLIC_API}/internal/test-data/cleanup`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x_api_key: CONFIG.XANO_INTERNAL_API_KEY,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Test data cleanup completed successfully!\n');
      console.log('📊 Deleted:');
      console.log(`   • Questions: ${data.deleted.questions}`);
      console.log(`   • Answers: ${data.deleted.answers}`);
      console.log(`   • Media Assets: ${data.deleted.media_assets}`);
      console.log(`   • Payment Records: ${data.deleted.payments}`);
      console.log('');
      return true;
    } else {
      console.error('❌ Cleanup failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    return false;
  }
}

// Run cleanup
cleanupTestData()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
