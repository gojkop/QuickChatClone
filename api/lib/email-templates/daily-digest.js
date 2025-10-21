// api/lib/email-templates/daily-digest.js
// Email template for daily question digest

/**
 * Generate daily digest email template
 * @param {Object} data - Digest data
 * @param {string} data.expertName - Expert's name
 * @param {string} data.expertEmail - Expert's email
 * @param {string} data.expertHandle - Expert's profile handle
 * @param {Array} data.questions - Array of pending questions
 * @param {number} data.totalPending - Total number of pending questions
 * @param {number} data.urgentCount - Number of urgent questions (< 2hr left)
 * @param {number} data.totalEarningsCents - Total potential earnings
 * @returns {Object} - Email subject and body
 */
export function getDailyDigestTemplate(data) {
  const { 
    expertName,
    expertEmail,
    expertHandle,
    questions = [],
    totalPending = 0,
    urgentCount = 0,
    totalEarningsCents = 0
  } = data;

  // Extract first name intelligently
  let firstName = 'there';
  if (expertName && expertName.trim()) {
    // If name contains spaces, it's likely a real name (e.g., "John Doe")
    if (expertName.includes(' ')) {
      firstName = expertName.split(' ')[0].trim();
    }
    // If it looks like an email prefix (has @ or .), it's a fallback
    else if (!expertName.includes('@') && !expertName.includes('.')) {
      firstName = expertName.trim();
    }
    // Otherwise use generic greeting
  }
  const subject = `Your mindPick Daily Digest - ${totalPending} Pending Question${totalPending !== 1 ? 's' : ''}`;

  // Sort questions by urgency (most urgent first)
  const sortedQuestions = [...questions].sort((a, b) => {
    const remainingA = a.time_remaining_seconds || Infinity;
    const remainingB = b.time_remaining_seconds || Infinity;
    return remainingA - remainingB;
  });

  // Show top 7 questions
  const displayQuestions = sortedQuestions.slice(0, 7);
  const hasMoreQuestions = totalPending > 7;

  // Format currency
  const formatPrice = (cents) => {
    const amount = (cents || 0) / 100;
    return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds < 0) return '<span style="color: #DC2626; font-weight: bold;">Overdue</span>';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `<span style="color: ${hours < 48 ? '#F59E0B' : '#6B7280'};">${days}d ${hours % 24}h</span>`;
    }
    
    if (hours > 0) {
      return `<span style="color: ${hours < 2 ? '#DC2626' : hours < 6 ? '#F59E0B' : '#6B7280'}; font-weight: ${hours < 2 ? 'bold' : 'normal'};">${hours}h ${minutes}m</span>`;
    }
    
    return `<span style="color: #DC2626; font-weight: bold;">${minutes}m</span>`;
  };

  // Get payer name
  const getPayerName = (question) => {
    const firstName = question.payer_first_name?.trim() || '';
    const lastName = question.payer_last_name?.trim() || '';
    
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return 'Anonymous';
  };

  // Truncate text
  const truncate = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9FAFB;">
      <!-- Preheader -->
      <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
        You have ${totalPending} pending question${totalPending !== 1 ? 's' : ''} waiting${urgentCount > 0 ? ` (${urgentCount} urgent)` : ''} - Total potential earnings: ${formatPrice(totalEarningsCents)}
      </div>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              
              <!-- Logo -->
              <tr>
                <td style="padding: 32px 0 24px 0;">
                  <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px;">
                    <span style="color: #1F2937;">mind</span><span style="color: #4F46E5;">Pick</span>
                  </div>
                </td>
              </tr>
              
              <!-- Hero Section -->
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Icon -->
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                          📬
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Your Daily Digest
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          ${totalPending} question${totalPending !== 1 ? 's' : ''} waiting for your expertise
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- Greeting -->
                        <p style="font-size: 16px; color: #111827; margin: 0 0 24px 0;">
                          Howdy, ${firstName}! 👋
                        </p>
                        
                        <!-- Summary Stats -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                          <tr>
                            <td style="width: 33.33%; text-align: center; padding: 0 8px;">
                              <div style="font-size: 28px; font-weight: 800; color: #4F46E5; margin-bottom: 4px;">${totalPending}</div>
                              <div style="font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Pending</div>
                            </td>
                            <td style="width: 33.33%; text-align: center; padding: 0 8px; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
                              <div style="font-size: 28px; font-weight: 800; color: ${urgentCount > 0 ? '#DC2626' : '#10B981'}; margin-bottom: 4px;">${urgentCount}</div>
                              <div style="font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Urgent</div>
                            </td>
                            <td style="width: 33.33%; text-align: center; padding: 0 8px;">
                              <div style="font-size: 28px; font-weight: 800; color: #10B981; margin-bottom: 4px;">${formatPrice(totalEarningsCents)}</div>
                              <div style="font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Potential</div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Questions List -->
                        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">
                          Questions Waiting for You
                        </h3>
                        
                        ${displayQuestions.map((q, index) => {
                          const isUrgent = q.time_remaining_seconds < 7200; // < 2 hours
                          const borderColor = isUrgent ? '#FEE2E2' : '#F3F4F6';
                          const bgColor = isUrgent ? '#FEF2F2' : '#FFFFFF';
                          
                          return `
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: 12px; overflow: hidden;">
                              <tr>
                                <td style="padding: 16px 20px;">
                                  <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                                    <div style="flex: 1; min-width: 0;">
                                      <div style="font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 6px; line-height: 1.4;">
                                        ${truncate(q.title || 'Untitled Question', 60)}
                                      </div>
                                      <div style="font-size: 13px; color: #6B7280;">
                                        From: <span style="font-weight: 600; color: #4B5563;">${getPayerName(q)}</span>
                                      </div>
                                    </div>
                                    ${isUrgent ? `
                                      <div style="flex-shrink: 0; margin-left: 12px;">
                                        <span style="display: inline-block; padding: 4px 10px; background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                                          ⚠️ Urgent
                                        </span>
                                      </div>
                                    ` : ''}
                                  </div>
                                  
                                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-top: 12px; border-top: 1px solid ${isUrgent ? '#FEE2E2' : '#F3F4F6'};">
                                    <tr>
                                      <td style="padding: 8px 12px 8px 0; vertical-align: middle; width: 80px;">
                                        <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 4px;">Price</div>
                                        <div style="font-size: 16px; font-weight: 700; color: #10B981; white-space: nowrap;">${formatPrice(q.price_cents)}</div>
                                      </td>
                                      <td style="padding: 8px 12px; vertical-align: middle; width: 100px;">
                                        <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 4px;">Time Left</div>
                                        <div style="font-size: 14px; font-weight: 600; white-space: nowrap;">${formatTimeRemaining(q.time_remaining_seconds)}</div>
                                      </td>
                                      <td style="padding: 8px 0 8px 12px; vertical-align: middle; text-align: right;">
                                        <a href="https://mindpick.me/expert#question-${q.id}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3); white-space: nowrap;">
                                          Answer Now →
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          `;
                        }).join('')}
                        
                        ${hasMoreQuestions ? `
                          <div style="text-align: center; margin-top: 20px;">
                            <a href="https://mindpick.me/expert" style="display: inline-block; padding: 12px 28px; background: #F3F4F6; color: #4B5563; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid #E5E7EB;">
                              View All ${totalPending} Questions →
                            </a>
                          </div>
                        ` : ''}
                        
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center; border-top: 2px solid #F3F4F6;">
                  <p style="font-size: 13px; color: #6B7280; margin: 24px 0 8px 0; line-height: 1.6;">
                    You're receiving this daily digest because you have pending questions.
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 4px 0;">
                    Questions? Contact us: <a href="mailto:support@mindpick.me" style="color: #4F46E5; text-decoration: none;">support@mindpick.me</a>
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 4px 0 0 0;">
                    © 2025 mindPick • Amsterdam, NL
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
YOUR MINDPICK DAILY DIGEST

Howdy, ${firstName}!

You have ${totalPending} question${totalPending !== 1 ? 's' : ''} waiting for your expertise!

SUMMARY:
• Pending Questions: ${totalPending}
• Urgent (< 2hr): ${urgentCount}
• Potential Earnings: ${formatPrice(totalEarningsCents)}

QUESTIONS WAITING FOR YOU:

${displayQuestions.map((q, index) => {
  const timeText = q.time_remaining_seconds < 7200 
    ? `⚠️ URGENT - ${Math.floor(q.time_remaining_seconds / 60)}m left`
    : `${Math.floor(q.time_remaining_seconds / 3600)}h left`;
  
  return `${index + 1}. ${truncate(q.title || 'Untitled Question', 60)}
   From: ${getPayerName(q)}
   Price: ${formatPrice(q.price_cents)} | Time Left: ${timeText}
   Answer: https://mindpick.me/expert#question-${q.id}
`;
}).join('\n')}

${hasMoreQuestions ? `\n+ ${totalPending - 7} more questions waiting` : ''}

View all questions: https://mindpick.me/expert

---
© 2025 mindPick • Amsterdam, NL
Questions? support@mindpick.me
  `;

  return { subject, htmlBody, textBody };
}