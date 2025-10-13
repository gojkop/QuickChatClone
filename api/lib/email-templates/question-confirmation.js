// api/lib/email-templates/question-confirmation.js
// Email template for question confirmation to payer/asker

export function getQuestionConfirmationTemplate(data) {
  const { askerName, questionTitle, questionText, expertName, questionId, slaHours } = data;

  const subject = 'Question Submitted Successfully - mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0f9ff; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">✅ Question Submitted Successfully!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Hi ${askerName || 'there'},
        </p>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Your question has been successfully submitted to ${expertName || 'the expert'} on mindPick.me!
        </p>
      </div>

      <div style="background-color: #fff; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin-bottom: 15px; font-size: 20px;">Your Question</h2>
        <p style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px;">
          ${questionTitle || 'Untitled Question'}
        </p>
        <p style="font-size: 14px; color: #555; margin-bottom: 15px; white-space: pre-wrap;">
          ${questionText || 'No description provided.'}
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Question ID:</strong> ${questionId}
          </p>
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Submitted:</strong> ${new Date().toLocaleString()}
          </p>
          ${slaHours ? `<p style="font-size: 13px; color: #666;">
            <strong>Expected Response Time:</strong> Within ${slaHours} hours
          </p>` : ''}
        </div>
      </div>

      <div style="background-color: #e8f5e9; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #1b5e20; margin: 0;">
          🔔 <strong>What's Next?</strong> ${expertName || 'The expert'} has been notified and will answer your question soon. We'll send you an email notification when your answer is ready!
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://mindpick.me/dashboard"
           style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          View Your Questions
        </a>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated confirmation from mindPick.me
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    Question Submitted Successfully!

    Hi ${askerName || 'there'},

    Your question has been successfully submitted to ${expertName || 'the expert'} on mindPick.me!

    Your Question:
    ${questionTitle || 'Untitled Question'}

    ${questionText || 'No description provided.'}

    Question ID: ${questionId}
    Submitted: ${new Date().toLocaleString()}
    ${slaHours ? `Expected Response Time: Within ${slaHours} hours` : ''}

    What's Next?
    ${expertName || 'The expert'} has been notified and will answer your question soon. We'll send you an email notification when your answer is ready!

    Visit https://mindpick.me/dashboard to view your questions.

    ---
    mindPick.me
  `;

  return { subject, htmlBody, textBody };
}
