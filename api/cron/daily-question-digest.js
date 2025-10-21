// api/cron/daily-question-digest.js
// Daily digest email for experts with pending questions
// Runs daily at 8:00 AM UTC

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
    return -1; // Overdue or no SLA
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
    console.log('📅 Date:', new Date().toISOString());
    
    // Step 1: Fetch all pending questions with expert data (single optimized query)
    console.log('📦 Fetching pending questions from Xano...');
    
    const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
    const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;
    
    if (!XANO_PUBLIC_API_URL) {
      throw new Error('XANO_PUBLIC_API_URL not configured');
    }
    
    if (!XANO_INTERNAL_API_KEY) {
      throw new Error('XANO_INTERNAL_API_KEY not configured');
    }
    
    const internalEndpoint = `${XANO_PUBLIC_API_URL}/internal/digest/pending-questions?x_api_key=${XANO_INTERNAL_API_KEY}`;
    
    console.log('📡 Calling endpoint:', `${XANO_PUBLIC_API_URL}/internal/digest/pending-questions`);
    
    const response = await fetch(internalEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Xano response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Xano error response:', errorText);
      throw new Error(`Failed to fetch pending questions from Xano: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // Debug: Log response structure to understand Xano's format
    console.log('🔍 Response data type:', typeof responseData);
    console.log('🔍 Response is array:', Array.isArray(responseData));
    console.log('🔍 Response keys:', Object.keys(responseData || {}));
    console.log('🔍 Sample response:', JSON.stringify(responseData).substring(0, 500));
    
    // Handle different Xano response formats
    let questions;
    if (Array.isArray(responseData)) {
      // Direct array response
      questions = responseData;
    } else if (responseData.result && Array.isArray(responseData.result)) {
      // Wrapped in { result: [...] }
      questions = responseData.result;
    } else if (responseData.questions && Array.isArray(responseData.questions)) {
      // Wrapped in { questions: [...] }
      questions = responseData.questions;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Wrapped in { data: [...] }
      questions = responseData.data;
    } else {
      console.error('❌ Unexpected response format:', responseData);
      throw new Error('Unexpected Xano response format - expected array of questions');
    }
    
    console.log(`✅ Fetched ${questions.length} pending questions from database`);
    
    if (questions.length === 0) {
      console.log('✨ No pending questions - skipping digest');
      return res.json({
        success: true,
        message: 'No pending questions to send',
        sent: 0,
        failed: 0,
        execution_time_seconds: Math.round((Date.now() - startTime) / 1000)
      });
    }
    
    // Step 2: Group questions by expert in memory (fast!)
    console.log('🔄 Grouping questions by expert...');
    
    const expertGroups = {};
    let skippedQuestions = 0;
    
    for (const item of questions) {
      const question = item.question;
      const expertEmail = item.user_email;
      const expertName = item.user_name;
      const expertHandle = item.expert_handle;
      const expertId = question.expert_profile_id;
      
      // Validate expert ID exists
      if (!expertId) {
        console.warn(`⚠️ Question ${question.id} has no expert_profile_id, skipping`);
        skippedQuestions++;
        continue;
      }
      
      // Validate expert has email
      if (!expertEmail) {
        console.warn(`⚠️ Question ${question.id} has no user_email, skipping`);
        skippedQuestions++;
        continue;
      }
      
      // Initialize expert group if not exists
      if (!expertGroups[expertId]) {
        expertGroups[expertId] = {
          expert_id: expertId,
          expert_email: expertEmail,
          expert_name: expertName || expertEmail.split('@')[0],
          expert_handle: expertHandle || null,
          questions: [],
          total_pending: 0,
          urgent_count: 0,
          total_earnings_cents: 0
        };
      }
      
      // Calculate time remaining for this question
      const timeRemaining = getRemainingTime(question);
      
      // Add question to expert's group
      expertGroups[expertId].questions.push({
        id: question.id,
        title: question.title || 'Untitled Question',
        payer_first_name: question.payer_first_name,
        payer_last_name: question.payer_last_name,
        payer_email: question.payer_email,
        price_cents: question.price_cents || 0,
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
    if (skippedQuestions > 0) {
      console.log(`⚠️ Skipped ${skippedQuestions} questions (missing expert_profile_id or user_email)`);
    }
    
    // Log some stats
    const totalUrgent = digests.reduce((sum, d) => sum + d.urgent_count, 0);
    const totalEarnings = digests.reduce((sum, d) => sum + d.total_earnings_cents, 0);
    console.log(`📊 Stats: ${totalUrgent} urgent questions, $${(totalEarnings / 100).toFixed(2)} potential earnings`);
    
    // Step 3: Send emails in batches
    console.log('📧 Sending digest emails in batches of 50...');
    
    const batches = chunkArray(digests, 50);
    let totalSent = 0;
    let totalFailed = 0;
    const errors = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📮 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)...`);
      
      // Send all emails in batch concurrently
      const results = await Promise.allSettled(
        batch.map(digest => sendDailyDigestEmail(digest))
      );
      
      // Count results
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled') {
          totalSent++;
        } else {
          totalFailed++;
          const expertEmail = batch[j].expert_email;
          const errorMsg = result.reason?.message || 'Unknown error';
          errors.push({ email: expertEmail, error: errorMsg });
          console.error(`❌ Failed to send to ${expertEmail}:`, errorMsg);
        }
      }
      
      // Pause between batches (except last batch)
      if (i < batches.length - 1) {
        console.log('⏸️  Pausing 1 second before next batch...');
        await sleep(1000);
      }
    }
    
    const executionTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ Daily digest complete!');
    console.log(`⏱️  Execution time: ${executionTime}s`);
    console.log(`✓  Sent successfully: ${totalSent}`);
    console.log(`✗  Failed: ${totalFailed}`);
    console.log(`📊 Total digests: ${digests.length}`);
    console.log('═══════════════════════════════════════');
    
    // Log sample of errors if any
    if (totalFailed > 0) {
      console.error(`❌ Failed emails (showing first 5):`);
      errors.slice(0, 5).forEach(({ email, error }) => {
        console.error(`   • ${email}: ${error}`);
      });
    }
    
    // Return success response
    return res.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      total: digests.length,
      execution_time_seconds: executionTime,
      stats: {
        urgent_questions: totalUrgent,
        potential_earnings_usd: (totalEarnings / 100).toFixed(2)
      },
      errors: totalFailed > 0 ? errors.slice(0, 5) : []
    });
    
  } catch (error) {
    const executionTime = Math.round((Date.now() - startTime) / 1000);
    
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('❌ Daily digest FAILED');
    console.error(`⏱️  Execution time: ${executionTime}s`);
    console.error(`💥 Error: ${error.message}`);
    console.error('═══════════════════════════════════════');
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      execution_time_seconds: executionTime
    });
  }
}