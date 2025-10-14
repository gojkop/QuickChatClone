// api/test-expert-notification.js
// Complete diagnostic for expert notification chain

import { fetchUserData } from './lib/user-data.js';
import { sendNewQuestionNotification } from './lib/zeptomail.js';

export default async function handler(req, res) {
  const expertHandle = req.query.handle;
  const sendEmail = req.query.send === 'true';
  
  if (!expertHandle) {
    return res.status(400).json({
      error: 'Missing handle parameter',
      usage: '/api/test-expert-notification?handle=EXPERT_HANDLE&send=false'
    });
  }
  
  const result = {
    timestamp: new Date().toISOString(),
    expertHandle,
    sendEmailRequested: sendEmail,
    steps: []
  };

  try {
    // ============================================================
    // STEP 1: Environment Variables Check
    // ============================================================
    result.steps.push({ 
      step: 1, 
      name: 'Environment Variables',
      status: 'checking'
    });
    
    const envVars = {
      XANO_PUBLIC_BASE_URL: {
        exists: !!process.env.XANO_PUBLIC_BASE_URL,
        value: process.env.XANO_PUBLIC_BASE_URL || 'NOT SET (using default)'
      },
      XANO_INTERNAL_API_KEY: {
        exists: !!process.env.XANO_INTERNAL_API_KEY,
        length: process.env.XANO_INTERNAL_API_KEY?.length || 0
      },
      ZEPTOMAIL_TOKEN: {
        exists: !!process.env.ZEPTOMAIL_TOKEN,
        length: process.env.ZEPTOMAIL_TOKEN?.length || 0
      }
    };
    
    result.steps[0].data = envVars;
    
    const missingVars = Object.entries(envVars)
      .filter(([key, val]) => !val.exists)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      result.steps[0].status = 'WARNING';
      result.steps[0].warning = `Missing: ${missingVars.join(', ')}`;
    } else {
      result.steps[0].status = 'PASS';
    }

    // ============================================================
    // STEP 2: Fetch Expert Profile
    // ============================================================
    result.steps.push({ 
      step: 2, 
      name: 'Fetch Expert Profile',
      status: 'fetching'
    });
    
    const XANO_PUBLIC_BASE_URL = process.env.XANO_PUBLIC_BASE_URL || 
                                 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';
    
    const profileUrl = `${XANO_PUBLIC_BASE_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`;
    
    const profileResponse = await fetch(profileUrl);

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      result.steps[1].status = 'FAIL';
      result.steps[1].error = `HTTP ${profileResponse.status}`;
      result.steps[1].errorDetails = errorText.substring(0, 500);
      result.summary = {
        success: false,
        failedAt: 'Step 2: Profile fetch',
        recommendation: 'Check that expert handle exists and profile is public'
      };
      return res.status(200).json(result);
    }

    const profileData = await profileResponse.json();
    result.steps[1].status = 'PASS';
    result.steps[1].data = {
      hasExpertProfile: !!profileData.expert_profile,
      topLevelKeys: Object.keys(profileData),
      expertProfileKeys: profileData.expert_profile ? Object.keys(profileData.expert_profile) : null
    };

    // ============================================================
    // STEP 3: Extract user_id
    // ============================================================
    result.steps.push({ 
      step: 3, 
      name: 'Extract user_id',
      status: 'extracting'
    });
    
    const userId = profileData.expert_profile?.user_id || 
                   profileData.user_id || 
                   profileData.expert_profile?._user?.id ||
                   profileData._user?.id;

    result.steps[2].data = {
      userId,
      type: typeof userId,
      searchedLocations: {
        'expert_profile.user_id': profileData.expert_profile?.user_id,
        'user_id': profileData.user_id,
        'expert_profile._user.id': profileData.expert_profile?._user?.id,
        '_user.id': profileData._user?.id
      }
    };

    if (!userId) {
      result.steps[2].status = 'FAIL';
      result.steps[2].error = 'No user_id found in any expected location';
      result.summary = {
        success: false,
        failedAt: 'Step 3: user_id extraction',
        recommendation: 'Check Xano profile endpoint includes user_id field'
      };
      return res.status(200).json(result);
    }

    result.steps[2].status = 'PASS';

    // ============================================================
    // STEP 4: Fetch User Data (Email)
    // ============================================================
    result.steps.push({ 
      step: 4, 
      name: 'Fetch User Email',
      status: 'fetching'
    });
    
    let expertData;
    try {
      expertData = await fetchUserData(userId);
      
      result.steps[3].data = {
        returned: !!expertData,
        hasEmail: !!expertData?.email,
        hasName: !!expertData?.name,
        email: expertData?.email ? expertData.email.substring(0, 3) + '***' : 'NO EMAIL',
        name: expertData?.name || 'NO NAME'
      };
      
      if (!expertData) {
        result.steps[3].status = 'FAIL';
        result.steps[3].error = 'fetchUserData returned null';
        result.summary = {
          success: false,
          failedAt: 'Step 4: Fetch user email',
          recommendation: 'Check logs above for detailed error from fetchUserData()'
        };
        return res.status(200).json(result);
      }
      
      if (!expertData.email) {
        result.steps[3].status = 'FAIL';
        result.steps[3].error = 'User data has no email field';
        result.summary = {
          success: false,
          failedAt: 'Step 4: User has no email',
          recommendation: 'Check user record in Xano has email populated'
        };
        return res.status(200).json(result);
      }
      
      result.steps[3].status = 'PASS';
      
    } catch (fetchErr) {
      result.steps[3].status = 'FAIL';
      result.steps[3].error = fetchErr.message;
      result.steps[3].stack = fetchErr.stack;
      result.summary = {
        success: false,
        failedAt: 'Step 4: Exception in fetchUserData',
        recommendation: 'Check function logs above for details'
      };
      return res.status(200).json(result);
    }

    // ============================================================
    // STEP 5: Send Email (Optional)
    // ============================================================
    if (sendEmail) {
      result.steps.push({ 
        step: 5, 
        name: 'Send Test Email',
        status: 'sending'
      });
      
      try {
        await sendNewQuestionNotification({
          expertEmail: expertData.email,
          expertName: expertData.name || 'Expert',
          questionTitle: '[TEST] Diagnostic Test Email',
          questionText: 'This is a test email from the diagnostic endpoint.',
          askerEmail: 'diagnostic-test@mindpick.me',
          questionId: 999999,
          slaHours: 48,
          questionCategory: 'default'
        });
        
        result.steps[4].status = 'PASS';
        result.steps[4].data = { 
          emailSentTo: expertData.email.substring(0, 3) + '***',
          message: 'Check inbox for test email'
        };
      } catch (emailErr) {
        result.steps[4].status = 'FAIL';
        result.steps[4].error = emailErr.message;
        result.steps[4].stack = emailErr.stack?.substring(0, 500);
        result.summary = {
          success: false,
          failedAt: 'Step 5: Send email',
          recommendation: 'Check ZEPTOMAIL_TOKEN is set and valid'
        };
        return res.status(200).json(result);
      }
    } else {
      result.steps.push({ 
        step: 5, 
        name: 'Send Email',
        status: 'SKIPPED',
        note: 'Add &send=true to URL to send test email'
      });
    }

    // ============================================================
    // SUCCESS
    // ============================================================
    result.summary = {
      success: true,
      message: '✅ All steps passed! Expert notification should work.',
      expertEmail: expertData.email.substring(0, 3) + '***@' + expertData.email.split('@')[1],
      nextSteps: sendEmail 
        ? ['Check expert inbox for test email']
        : ['Add &send=true to URL to send actual test email', 'Check Vercel logs during real question submission']
    };

    return res.status(200).json(result);

  } catch (error) {
    result.error = {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    };
    result.summary = {
      success: false,
      failedAt: 'Unexpected error',
      recommendation: 'Check error details above'
    };
    return res.status(500).json(result);
  }
}