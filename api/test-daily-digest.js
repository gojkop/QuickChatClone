// api/test-daily-digest.js
// Test endpoint to manually trigger daily digest
// Access via: GET /api/test-daily-digest

import handler from './cron/daily-question-digest.js';

export default async function testHandler(req, res) {
  console.log('🧪 TEST MODE: Running daily digest manually...');
  console.log('🔑 API Key present:', !!process.env.XANO_INTERNAL_API_KEY);
  console.log('📧 ZeptoMail configured:', !!process.env.ZEPTOMAIL_TOKEN);
  
  return handler(req, res);
}