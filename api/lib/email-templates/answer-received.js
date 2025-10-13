// api/lib/email-templates/answer-received.js
// Email template for answer received notification to asker

export function getAnswerReceivedTemplate(data) {
  const { askerName, expertName, questionTitle, questionId } = data;

  const subject = 'Your Question Has Been Answered on mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0fdf4; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">🎊 Great News!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Hi ${askerName || 'there'},
        </p>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Your question has been answered by <strong>${expertName}</strong>!
        </p>
      </div>

      <div style="background-color: #fff; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin-bottom: 15px; font-size: 20px;">Your Question:</h2>
        <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
          ${questionTitle || 'Untitled Question'}
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Answered by:</strong> ${expertName}
          </p>
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Question ID:</strong> ${questionId}
          </p>
          <p style="font-size: 13px; color: #666;">
            <strong>Answered at:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://mindpick.me/questions/${questionId}"
           style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          View Answer Now
        </a>
      </div>

      <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #075985; margin: 0;">
          💡 <strong>Did this answer help you?</strong> Don't forget to provide feedback to help us improve!
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
    Great News!

    Hi ${askerName || 'there'},

    Your question has been answered by ${expertName}!

    Your Question: ${questionTitle || 'Untitled Question'}

    Answered by: ${expertName}
    Question ID: ${questionId}
    Answered at: ${new Date().toLocaleString()}

    Visit https://mindpick.me/questions/${questionId} to view the answer.

    Did this answer help you? Don't forget to provide feedback to help us improve!

    ---
    mindPick.me
  `;

  return { subject, htmlBody, textBody };
}
