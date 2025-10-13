// api/lib/user-data.js
// Utility functions for fetching user data from Xano

/**
 * Fetch user email and name from internal Xano endpoint
 * @param {number} userId - User ID
 * @returns {Promise<{email: string, name: string} | null>}
 */
export async function fetchUserData(userId) {
  if (!userId) {
    console.warn('⚠️ No user_id provided to fetchUserData');
    return null;
  }

  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;
  
  // ✅ FIX: Use Public API base URL for internal endpoints
  // Internal endpoints are in api:BQW1GS7L (Public API), not api:3B14WLbJ (Auth API)
  const XANO_PUBLIC_BASE_URL = process.env.XANO_PUBLIC_BASE_URL || 
                                 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';

  if (!XANO_INTERNAL_API_KEY) {
    console.error('❌ XANO_INTERNAL_API_KEY not configured');
    return null;
  }

  const internalEndpoint = `${XANO_PUBLIC_BASE_URL}/internal/user/${userId}/email?x_api_key=${XANO_INTERNAL_API_KEY}`;

  try {
    console.log('📧 Fetching user data for user_id:', userId);
    const response = await fetch(internalEndpoint);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch user data:', response.status, errorText);
      return null;
    }

    const userData = await response.json();
    console.log('✅ User data retrieved:', { email: userData.email, name: userData.name });

    return {
      email: userData.email || null,
      name: userData.name || null,
    };
  } catch (err) {
    console.error('❌ Error fetching user data:', err.message);
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