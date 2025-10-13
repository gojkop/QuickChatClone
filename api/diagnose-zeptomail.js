// api/diagnose-zeptomail.js
// Diagnostic endpoint to troubleshoot ZeptoMail configuration

export default async function handler(req, res) {
  try {
    const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN;
    const FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL;
    const FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME;

    console.log('=== ZEPTOMAIL DIAGNOSTICS ===');

    // Check 1: Environment variables
    const checks = {
      tokenExists: !!ZEPTOMAIL_TOKEN,
      tokenLength: ZEPTOMAIL_TOKEN?.length || 0,
      tokenPrefix: ZEPTOMAIL_TOKEN?.substring(0, 20) || 'NOT SET',
      hasZohoPrefix: ZEPTOMAIL_TOKEN?.startsWith('Zoho-enczapikey') || false,
      fromEmail: FROM_EMAIL || 'NOT SET',
      fromName: FROM_NAME || 'NOT SET',
    };

    console.log('Environment checks:', checks);

    // Check 2: Try to make actual API call with minimal payload
    if (!ZEPTOMAIL_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'ZEPTOMAIL_TOKEN not set',
        checks,
      });
    }

    const testPayload = {
      from: {
        address: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: [
        {
          email_address: {
            address: req.query.email || 'test@example.com',
            name: 'Test Recipient',
          },
        },
      ],
      subject: 'ZeptoMail Diagnostic Test',
      htmlbody: '<div>This is a diagnostic test email from mindPick.me</div>',
    };

    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    console.log('Authorization header preview:', ZEPTOMAIL_TOKEN.substring(0, 30) + '...');

    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_TOKEN,
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    console.log('ZeptoMail raw response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    console.log('ZeptoMail status:', response.status);
    console.log('ZeptoMail response:', responseData);

    if (!response.ok) {
      return res.status(200).json({
        success: false,
        message: 'ZeptoMail API returned an error',
        checks,
        apiResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
        suggestions: getSuggestions(responseData, checks),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'ZeptoMail is configured correctly and working!',
      checks,
      apiResponse: {
        status: response.status,
        data: responseData,
      },
    });

  } catch (error) {
    console.error('Diagnostic error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}

function getSuggestions(errorResponse, checks) {
  const suggestions = [];

  // Check for common error codes
  if (errorResponse?.error?.code === 'TM_4001') {
    suggestions.push('ERROR TM_4001 - Access Denied. This usually means:');
    suggestions.push('1. The API token is invalid or expired');
    suggestions.push('2. The "from" email address is not verified in your ZeptoMail account');
    suggestions.push('3. The Mail Agent associated with this token is inactive');
    suggestions.push('');
    suggestions.push('TO FIX:');
    suggestions.push('- Go to ZeptoMail Dashboard → Mail Agents');
    suggestions.push('- Check if your Mail Agent is active');
    suggestions.push('- Go to Sender Addresses and verify "noreply@mindpick.me" is listed and verified');
    suggestions.push('- If sender is not verified, add it: Sender Address → Add sender address');
    suggestions.push('- Verify your domain has correct DKIM/SPF records');
  }

  if (!checks.hasZohoPrefix) {
    suggestions.push('WARNING: Token does not start with "Zoho-enczapikey"');
    suggestions.push('The token should be in format: Zoho-enczapikey <token_value>');
  }

  if (checks.fromEmail === 'NOT SET') {
    suggestions.push('WARNING: ZEPTOMAIL_FROM_EMAIL environment variable is not set');
  }

  if (checks.tokenLength < 50) {
    suggestions.push('WARNING: Token seems too short. Make sure you copied the complete token from ZeptoMail');
  }

  return suggestions;
}
