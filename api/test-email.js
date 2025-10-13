// api/test-email.js
// Test endpoint to verify ZeptoMail is working
import { sendEmail, sendNewQuestionNotification } from './lib/zeptomail.js';

export default async function handler(req, res) {
  try {
    // Check if environment variables are set
    const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN;
    const FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL;
    const FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME;

    console.log('Environment check:');
    console.log('ZEPTOMAIL_TOKEN:', ZEPTOMAIL_TOKEN ? '✅ Set' : '❌ Not set');
    console.log('ZEPTOMAIL_FROM_EMAIL:', FROM_EMAIL || '❌ Not set');
    console.log('ZEPTOMAIL_FROM_NAME:', FROM_NAME || '❌ Not set');

    if (!ZEPTOMAIL_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'ZEPTOMAIL_TOKEN environment variable is not set',
        help: 'Add this to your Vercel environment variables',
      });
    }

    // Get test email from query parameter or use default
    const testEmail = req.query.email || 'your-email@example.com';
    const testType = req.query.type || 'simple';

    console.log('Sending test email to:', testEmail);
    console.log('Test type:', testType);

    let result;

    if (testType === 'question') {
      // Test question notification
      result = await sendNewQuestionNotification({
        expertEmail: testEmail,
        expertName: 'Test Expert',
        questionTitle: 'Test Question - Is ZeptoMail Working?',
        questionText: 'This is a test question to verify that email notifications are working correctly.',
        askerEmail: 'test-asker@example.com',
        questionId: 999,
      });
    } else {
      // Simple test email
      result = await sendEmail({
        to: testEmail,
        toName: 'Test Recipient',
        subject: 'ZeptoMail Test - QuickChat Integration',
        htmlBody: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="background-color: #f0f9ff; border-radius: 10px; padding: 30px;">
              <h1 style="color: #2c3e50;">✅ ZeptoMail is Working!</h1>
              <p style="font-size: 16px;">
                Your ZeptoMail integration is configured correctly and sending emails.
              </p>
              <p style="font-size: 14px; color: #666;">
                <strong>Test Details:</strong><br>
                Environment: ${process.env.VERCEL_ENV || 'Local'}<br>
                Timestamp: ${new Date().toLocaleString()}<br>
                From: ${FROM_EMAIL}
              </p>
            </div>
          </body>
          </html>
        `,
        textBody: `
          ZeptoMail is Working!

          Your ZeptoMail integration is configured correctly and sending emails.

          Test Details:
          Environment: ${process.env.VERCEL_ENV || 'Local'}
          Timestamp: ${new Date().toLocaleString()}
          From: ${FROM_EMAIL}
        `,
      });
    }

    console.log('✅ Test email sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      result,
      config: {
        fromEmail: FROM_EMAIL,
        fromName: FROM_NAME,
        toEmail: testEmail,
        type: testType,
      },
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
