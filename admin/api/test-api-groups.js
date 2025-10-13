// admin/api/test-api-groups.js
// Quick test to find the right API group

import { allowCors, ok } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  // Get token
  const cookieHeader = req.headers.cookie || '';
  const qcMatch = cookieHeader.match(/(?:^|;\s*)qc_session=([^;]+)/);
  
  if (!qcMatch) {
    return ok(res, {
      error: 'No token found. Log into main app first.',
      instructions: 'Go to www.mindpick.me and sign in, then come back here'
    });
  }

  let token;
  try {
    token = decodeURIComponent(qcMatch[1]).trim();
  } catch {
    token = qcMatch[1].trim();
  }

  const baseUrl = 'https://xlho-4syv-navp.n7e.xano.io';
  const apiGroups = ['3B14WLbJ', 'BQW1GS7L', 'main', 'auth', 'v1'];
  const results = {};

  console.log('[test] Testing API groups with token...');

  for (const group of apiGroups) {
    const testUrl = `${baseUrl}/api:${group}/auth/me`;
    
    try {
      const response = await fetch(testUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      results[group] = {
        url: testUrl,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };

      if (response.ok) {
        try {
          const data = await response.json();
          results[group].success = true;
          results[group].userData = {
            id: data?.user?.id || data?.id,
            email: data?.user?.email || data?.email,
            name: data?.user?.name || data?.name
          };
          console.log(`[test] ✅ ${group} WORKS!`);
        } catch (e) {
          results[group].parseError = 'Response is not JSON';
        }
      } else {
        const errorText = await response.text();
        results[group].error = errorText.substring(0, 200);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (e) {
      results[group] = {
        url: testUrl,
        error: e.message
      };
    }
  }

  // Find working group
  const workingGroup = Object.entries(results)
    .find(([_, result]) => result.success);

  const response = {
    results,
    recommendation: null
  };

  if (workingGroup) {
    const [group, data] = workingGroup;
    response.recommendation = {
      message: `✅ FOUND IT! Use API group: ${group}`,
      xano_base_url: `${baseUrl}/api:${group}`,
      user_data: data.userData,
      instructions: [
        '1. Go to Vercel Dashboard → Admin Project → Settings',
        '2. Update XANO_BASE_URL environment variable:',
        `   ${baseUrl}/api:${group}`,
        '3. Redeploy the admin app',
        '4. Try logging in again'
      ]
    };
  } else {
    response.recommendation = {
      message: '❌ No working API group found',
      instructions: [
        '1. Check your main app code - find where it calls Xano',
        '2. Look for the exact URL it uses for authentication',
        '3. Use that same URL for XANO_BASE_URL',
        '4. Or check Xano dashboard → API → find your auth endpoints'
      ]
    };
  }

  return ok(res, response);
}