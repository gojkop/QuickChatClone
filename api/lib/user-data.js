// api/lib/user-data.js
// Utility functions for fetching user data from Xano

/**
 * Fetch user email and name from internal Xano endpoint
 * @param {number} userId - User ID
 * @returns {Promise<{email: string, name: string} | null>}
 */
export async function fetchUserData(userId) {
  if (!userId) {
    console.warn('⚠️ [fetchUserData] No user_id provided');
    return null;
  }

  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;
  const XANO_PUBLIC_BASE_URL = process.env.XANO_PUBLIC_BASE_URL || 
                                 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';

  console.log('📧 [fetchUserData] Starting fetch for user_id:', userId);
  console.log('📧 [fetchUserData] Environment check:', {
    hasApiKey: !!XANO_INTERNAL_API_KEY,
    apiKeyLength: XANO_INTERNAL_API_KEY?.length || 0,
    baseUrl: XANO_PUBLIC_BASE_URL
  });

  if (!XANO_INTERNAL_API_KEY) {
    console.error('❌ [fetchUserData] XANO_INTERNAL_API_KEY not configured in Vercel');
    console.error('❌ [fetchUserData] Set it with: vercel env add XANO_INTERNAL_API_KEY');
    return null;
  }

  const internalEndpoint = `${XANO_PUBLIC_BASE_URL}/internal/user/${userId}/email?x_api_key=${XANO_INTERNAL_API_KEY}`;
  
  // Don't log the full URL with API key - security risk
  console.log('📧 [fetchUserData] Calling endpoint:', `${XANO_PUBLIC_BASE_URL}/internal/user/${userId}/email`);

  try {
    const response = await fetch(internalEndpoint);

    console.log('📧 [fetchUserData] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [fetchUserData] HTTP', response.status, 'error');
      console.error('❌ [fetchUserData] Response body:', errorText.substring(0, 500));
      
      if (response.status === 401) {
        console.error('❌ [fetchUserData] 401 Unauthorized - API key is invalid or missing');
        console.error('❌ [fetchUserData] Check XANO_INTERNAL_API_KEY in Vercel matches Xano');
      } else if (response.status === 404) {
        console.error('❌ [fetchUserData] 404 Not Found - Endpoint or user does not exist');
        console.error('❌ [fetchUserData] Check Xano has /internal/user/{id}/email endpoint');
      } else if (response.status === 500) {
        console.error('❌ [fetchUserData] 500 Server Error - Xano endpoint logic error');
        console.error('❌ [fetchUserData] Check Xano endpoint function stack');
      }
      
      return null;
    }

    const responseData = await response.json();
    
    // ✅ FIX: Xano wraps response in "result" object
    const userData = responseData.result || responseData;
    
    console.log('✅ [fetchUserData] Success! User data retrieved:', {
      hasEmail: !!userData.email,
      hasName: !!userData.name,
      email: userData.email || 'NO EMAIL',
      name: userData.name || 'NO NAME'
    });

    if (!userData.email) {
      console.warn('⚠️ [fetchUserData] User data has no email field');
      console.warn('⚠️ [fetchUserData] User data keys:', Object.keys(userData));
      console.warn('⚠️ [fetchUserData] Full response:', JSON.stringify(responseData, null, 2));
    }

    return {
      email: userData.email || null,
      name: userData.name || null,
    };
  } catch (err) {
    console.error('❌ [fetchUserData] Exception thrown:', err.name);
    console.error('❌ [fetchUserData] Error message:', err.message);
    console.error('❌ [fetchUserData] Stack trace:', err.stack);
    return null;
  }
}

/**
 * Construct full name from question payer data
 * @param {Object} questionData - Question object with payer fields
 * @returns {string} - Full name or fallback
 */
export function getAskerName(questionData) {
  if (!questionData) {
    return 'there';
  }

  // Try full name (first + last)
  if (questionData.payer_first_name && questionData.payer_last_name) {
    return `${questionData.payer_first_name} ${questionData.payer_last_name}`;
  }

  // Try first name only
  if (questionData.payer_first_name) {
    return questionData.payer_first_name;
  }

  // Fallback to email username
  if (questionData.payer_email) {
    return questionData.payer_email.split('@')[0];
  }

  return 'there';
}

/**
 * Get asker email from question data
 * @param {Object} questionData - Question object
 * @returns {string | null}
 */
export function getAskerEmail(questionData) {
  return questionData?.payer_email || null;
}