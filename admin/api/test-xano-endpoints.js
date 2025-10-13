// admin/api/test-xano-endpoints.js
// Temporary endpoint to discover available Xano APIs for experts

import { allowCors, ok, err } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  const xanoBase = process.env.XANO_BASE_URL;
  
  if (!xanoBase) {
    return err(res, 500, 'XANO_BASE_URL not configured');
  }

  const results = {
    xano_base: xanoBase,
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Get admin token from cookie for authenticated requests
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  
  if (!match) {
    return err(res, 401, 'Admin authentication required - please log in first');
  }

  // ========================================================================
  // TEST 1: List all users (should include experts)
  // ========================================================================
  try {
    const usersUrl = `${xanoBase}/user`;
    console.log('[test] Trying:', usersUrl);
    
    const response = await fetch(usersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    results.tests.list_users = {
      url: usersUrl,
      method: 'GET',
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.list_users.response = {
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) ? data.slice(0, 2) : data,
        structure: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []
      };
    } else {
      const errorText = await response.text();
      results.tests.list_users.error = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.list_users = {
      error: error.message,
      type: 'connection_error'
    };
  }

  // ========================================================================
  // TEST 2: Try filtering users by role (experts)
  // ========================================================================
  try {
    const expertsUrl = `${xanoBase}/user?role=expert`;
    console.log('[test] Trying:', expertsUrl);
    
    const response = await fetch(expertsUrl);

    results.tests.filter_experts = {
      url: expertsUrl,
      method: 'GET',
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.filter_experts.response = {
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) ? data.slice(0, 2) : data
      };
    } else {
      const errorText = await response.text();
      results.tests.filter_experts.error = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.filter_experts = {
      error: error.message
    };
  }

  // ========================================================================
  // TEST 3: Try /expert_profile endpoint
  // ========================================================================
  try {
    const profileUrl = `${xanoBase}/expert_profile`;
    console.log('[test] Trying:', profileUrl);
    
    const response = await fetch(profileUrl);

    results.tests.expert_profiles = {
      url: profileUrl,
      method: 'GET',
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.expert_profiles.response = {
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) ? data.slice(0, 2) : data,
        structure: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []
      };
    } else {
      const errorText = await response.text();
      results.tests.expert_profiles.error = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.expert_profiles = {
      error: error.message
    };
  }

  // ========================================================================
  // TEST 4: Try getting questions (to see expert activity)
  // ========================================================================
  try {
    const questionsUrl = `${xanoBase}/question?_limit=10`;
    console.log('[test] Trying:', questionsUrl);
    
    const response = await fetch(questionsUrl);

    results.tests.questions = {
      url: questionsUrl,
      method: 'GET',
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.questions.response = {
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) ? data.slice(0, 1) : data,
        structure: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []
      };
    } else {
      const errorText = await response.text();
      results.tests.questions.error = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.questions = {
      error: error.message
    };
  }

  // ========================================================================
  // TEST 5: Try getting answers (to see expert responses)
  // ========================================================================
  try {
    const answersUrl = `${xanoBase}/answer?_limit=10`;
    console.log('[test] Trying:', answersUrl);
    
    const response = await fetch(answersUrl);

    results.tests.answers = {
      url: answersUrl,
      method: 'GET',
      status: response.status,
      ok: response.ok
    };

    if (response.ok) {
      const data = await response.json();
      results.tests.answers.response = {
        count: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) ? data.slice(0, 1) : data,
        structure: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []
      };
    } else {
      const errorText = await response.text();
      results.tests.answers.error = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.answers = {
      error: error.message
    };
  }

  // ========================================================================
  // ANALYSIS: What works?
  // ========================================================================
  const workingEndpoints = [];
  const failedEndpoints = [];

  Object.entries(results.tests).forEach(([key, test]) => {
    if (test.ok) {
      workingEndpoints.push({
        name: key,
        url: test.url,
        count: test.response?.count
      });
    } else {
      failedEndpoints.push({
        name: key,
        url: test.url,
        status: test.status,
        error: test.error?.substring(0, 100)
      });
    }
  });

  results.summary = {
    working: workingEndpoints,
    failed: failedEndpoints,
    recommendation: workingEndpoints.length > 0 
      ? `✅ Found ${workingEndpoints.length} working endpoint(s). Use these in your admin UI.`
      : `❌ No working endpoints found. Check XANO_BASE_URL and Xano permissions.`
  };

  // ========================================================================
  // SUGGESTED QUERIES
  // ========================================================================
  results.suggested_queries = {
    get_all_experts: {
      description: 'Get all expert users',
      options: [
        `${xanoBase}/user?role=expert`,
        `${xanoBase}/expert_profile`
      ]
    },
    get_expert_questions: {
      description: 'Get questions for a specific expert',
      example: `${xanoBase}/question?expert_id={expert_id}`
    },
    get_expert_stats: {
      description: 'Calculate expert metrics',
      note: 'May need custom Xano function or client-side aggregation',
      data_needed: [
        'Count questions by expert_id',
        'Calculate avg response time',
        'Get SLA compliance rate'
      ]
    }
  };

  return ok(res, results);
}