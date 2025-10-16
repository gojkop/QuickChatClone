// api/cron/daily-question-digest.js
// Daily digest email for experts with pending questions

import { xanoGet } from '../lib/xano/client.js';
import { sendDailyDigestEmail } from '../lib/zeptomail.js';

/**
 * Sleep helper for batching
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Chunk array helper
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Calculate remaining time in seconds
 */
const getRemainingTime = (question) => {
  if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
    return -1; // Overdue
  }

  const now = Date.now() / 1000;
  const createdAtSeconds = question.created_at > 4102444800 
    ? question.created_at / 1000 
    : question.created_at;
  
  const elapsed = now - createdAtSeconds;
  const slaSeconds = question.sla_hours_snapshot * 3600;
  const remaining = slaSeconds - elapsed;
  
  return Math.floor(remaining);
};

/**
 * Main cron handler
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    console.log('🌅 Starting daily question digest (8:00 AM UTC)');
    
    // Step 1: Fetch all pending questions with expert data (single query)
    console.log('📦 Fetching all pending questions with expert data...');
    
    const questions = await xanoGet('/questions', {
      status: 'paid',
      include_expert: true // Assumes Xano can include expert_profile data
    });
    
    // Filter only unanswered questions
    const pendingQuestions = questions.filter(q => !q.answered_at);
    
    console.log(`✅ Found ${pendingQuestions.length} pending questions across experts`);
    
    if (pendingQuestions.length === 0) {
      console.log('✨ No pending questions - skipping digest');
      return res.json({
        success: true,
        message: 'No pending questions',
        sent: 0,
        failed: 0
      });
    }
    
    // Step 2: Group questions by expert in memory (fast!)
    console.log('🔄 Grouping questions by expert...');
    
    const expertGroups = {};
    
    for (const question of pendingQuestions) {
      const expertId = question.expert_id;
      
      if (!expertId) {
        console.warn(`⚠️ Question ${question.id} has no expert_id, skipping`);
        continue;
      }
      
      // Initialize expert group if not exists
      if (!expertGroups[expertId]) {
        expertGroups[expertId] = {
          expert_id: expertId,
          expert_email: question.expert_profile?.user?.email || question.expert_email,
          expert_name: question.expert_profile?.user?.name || question.expert_name || 'Expert',
          expert_handle: question.expert_profile?.handle || null,
          questions: [],
          total_pending: 0,
          urgent_count: 0,
          total_earnings_cents: 0
        };
      }
      
      // Calculate time remaining
      const timeRemaining = getRemainingTime(question);
      
      // Add question to expert's group
      expertGroups[expertId].questions.push({
        id: question.id,
        title: question.title,
        payer_first_name: question.payer_first_name,
        payer_last_name: question.payer_last_name,
        payer_email: question.payer_email,
        price_cents: question.price_cents,
        created_at: question.created_at,
        sla_hours_snapshot: question.sla_hours_snapshot,
        time_remaining_seconds: timeRemaining
      });
      
      // Update aggregates
      expertGroups[expertId].total_pending++;
      expertGroups[expertId].total_earnings_cents += (question.price_cents || 0);
      
      // Count urgent questions (< 2 hours remaining)
      if (timeRemaining >= 0 && timeRemaining < 7200) {
        expertGroups[expertId].urgent_count++;
      }
    }
    
    // Convert to array
    const digests = Object.values(expertGroups);
    
    console.log(`✅ Grouped into ${digests.length} expert digests`);
    
    // Step 3: Send emails in batches
    console.log('📧 Sending digest emails in batches of 50...');
    
    const batches = chunkArray(digests, 50);
    let totalSent = 0;
    let totalFailed = 0;
    const errors = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📮 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)...`);
      
      const results = await Promise.allSettled(
        batch.map(digest => sendDailyDigestEmail(digest))
      );
      
      // Count results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          totalSent++;
        } else {
          totalFailed++;
          errors.push(result.reason?.message || 'Unknown error');
        }
      }
      
      // Pause between batches (except last batch)
      if (i < batches.length - 1) {
        await sleep(1000); // 1 second pause
      }
    }
    
    const executionTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log(`✅ Daily digest complete in ${executionTime}s`);
    console.log(`   ✓ Sent: ${totalSent}`);
    console.log(`   ✗ Failed: ${totalFailed}`);
    
    // Log errors if any
    if (totalFailed > 0) {
      console.error(`❌ Failed emails (${totalFailed}):`, errors.slice(0, 5));
    }
    
    // Return success response
    return res.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      total: digests.length,
      execution_time_seconds: executionTime,
      errors: totalFailed > 0 ? errors.slice(0, 5) : []
    });
    
  } catch (error) {
    const executionTime = Math.round((Date.now() - startTime) / 1000);
    
    console.error('❌ Daily digest failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      execution_time_seconds: executionTime
    });
  }
}