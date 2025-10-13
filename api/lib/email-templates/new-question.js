// api/lib/email-templates/new-question.js
// Email template for new question notification to expert

export function getNewQuestionTemplate(data) {
  const { expertName, questionTitle, questionText, askerEmail, questionId } = data;

  const subject = 'New Question Received on mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0f9ff; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">🎉 New Question for You!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Hi ${expertName || 'there'},
        </p>
        <p style="font-size: 16px; margin-bottom: 15px;">
          You've received a new question on mindPick.me!
        </p>
      </div>

      <div style="background-color: #fff; border: 2px solid #3498db; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #3498db; margin-bottom: 15px; font-size: 20px;">${questionTitle || 'Untitled Question'}</h2>
        <p style="font-size: 14px; color: #555; margin-bottom: 15px; white-space: pre-wrap;">
          ${questionText || 'No description provided.'}
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>From:</strong> ${askerEmail}
          </p>
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Question ID:</strong> ${questionId}
          </p>
          <p style="font-size: 13px; color: #666;">
            <strong>Received:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://mindpick.me/expert"
           style="display: inline-block; background-color: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          View & Answer Question
        </a>
      </div>

      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #856404; margin: 0;">
          ⏱️ <strong>Reminder:</strong> Remember to respond within your SLA timeframe to maintain your expert rating!
        </p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from mindPick.me
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    New Question for You!

    Hi ${expertName || 'there'},

    You've received a new question on mindPick.me!

    Title: ${questionTitle || 'Untitled Question'}

    Question:
    ${questionText || 'No description provided.'}

    From: ${askerEmail}
    Question ID: ${questionId}
    Received: ${new Date().toLocaleString()}

    Visit https://mindpick.me/expert to view and answer the question.

    Reminder: Remember to respond within your SLA timeframe to maintain your expert rating!

    ---
    mindPick.me
  `;

  return { subject, htmlBody, textBody };
}
