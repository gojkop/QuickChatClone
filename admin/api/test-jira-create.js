// admin/api/test-jira-create.js
// Create this file to test Jira ticket creation with detailed logging

import { allowCors, ok, err } from './_lib/respond.js';

const JIRA_CONFIG = {
  baseUrl: process.env.JIRA_BASE_URL || 'https://mindpick.atlassian.net',
  email: process.env.JIRA_EMAIL,
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY || 'MINDPICK',
};

function getAuthHeader() {
  const credentials = Buffer.from(
    `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`
  ).toString('base64');
  return `Basic ${credentials}`;
}

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  const results = {
    step1_config: null,
    step2_auth: null,
    step3_project: null,
    step4_issuetypes: null,
    step5_create: null,
    diagnosis: []
  };

  // Step 1: Check configuration
  results.step1_config = {
    baseUrl: JIRA_CONFIG.baseUrl,
    email: JIRA_CONFIG.email,
    token: JIRA_CONFIG.apiToken ? '✓ Set' : '✗ Missing',
    projectKey: JIRA_CONFIG.projectKey
  };

  if (!JIRA_CONFIG.email || !JIRA_CONFIG.apiToken) {
    results.diagnosis.push('❌ JIRA_EMAIL or JIRA_API_TOKEN not configured');
    return ok(res, results);
  }

  try {
    // Step 2: Test authentication
    const authResp = await fetch(`${JIRA_CONFIG.baseUrl}/rest/api/3/myself`, {
      headers: { Authorization: getAuthHeader() }
    });

    results.step2_auth = {
      status: authResp.status,
      ok: authResp.ok
    };

    if (!authResp.ok) {
      results.diagnosis.push('❌ Authentication failed - check email and API token');
      return ok(res, results);
    }

    const user = await authResp.json();
    results.step2_auth.user = {
      accountId: user.accountId,
      email: user.emailAddress,
      displayName: user.displayName
    };
    results.diagnosis.push('✅ Authentication successful');

    // Step 3: Test project access
    const projectResp = await fetch(
      `${JIRA_CONFIG.baseUrl}/rest/api/3/project/${JIRA_CONFIG.projectKey}`,
      { headers: { Authorization: getAuthHeader() } }
    );

    results.step3_project = {
      status: projectResp.status,
      ok: projectResp.ok
    };

    if (!projectResp.ok) {
      const errorText = await projectResp.text();
      results.step3_project.error = errorText;
      results.diagnosis.push(`❌ Cannot access project ${JIRA_CONFIG.projectKey}`);
      return ok(res, results);
    }

    const project = await projectResp.json();
    results.step3_project.project = {
      key: project.key,
      name: project.name
    };
    results.diagnosis.push('✅ Project access OK');

    // Step 4: Check issue types
    const issueTypesResp = await fetch(
      `${JIRA_CONFIG.baseUrl}/rest/api/3/project/${JIRA_CONFIG.projectKey}`,
      { headers: { Authorization: getAuthHeader() } }
    );

    if (issueTypesResp.ok) {
      const projectDetails = await issueTypesResp.json();
      results.step4_issuetypes = {
        available: projectDetails.issueTypes?.map(it => it.name) || []
      };

      const hasTask = results.step4_issuetypes.available.includes('Task');
      const hasBug = results.step4_issuetypes.available.includes('Bug');
      const hasStory = results.step4_issuetypes.available.includes('Story');

      if (!hasTask || !hasBug || !hasStory) {
        results.diagnosis.push('⚠️ Missing issue types: Task, Bug, or Story');
      } else {
        results.diagnosis.push('✅ All required issue types available');
      }
    }

    // Step 5: Try creating a test issue
    const testIssue = {
      fields: {
        project: {
          key: JIRA_CONFIG.projectKey,
        },
        summary: 'Test issue from admin console',
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is a test issue to verify API integration. You can delete this.'
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Task',
        },
        labels: ['test', 'admin-console']
      },
    };

    console.log('[test-jira] Attempting to create test issue...');
    console.log('[test-jira] Payload:', JSON.stringify(testIssue, null, 2));

    const createResp = await fetch(
      `${JIRA_CONFIG.baseUrl}/rest/api/3/issue`,
      {
        method: 'POST',
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testIssue),
      }
    );

    results.step5_create = {
      status: createResp.status,
      ok: createResp.ok
    };

    if (!createResp.ok) {
      const errorText = await createResp.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }

      results.step5_create.error = errorData;
      results.diagnosis.push('❌ Failed to create issue - see error details below');
      
      // Provide specific fixes based on error
      if (errorText.includes('priority')) {
        results.diagnosis.push('💡 Fix: Issue with priority field - check priority names');
      }
      if (errorText.includes('issuetype')) {
        results.diagnosis.push('💡 Fix: Issue type not found - verify Task/Bug/Story exist');
      }
      if (errorText.includes('description')) {
        results.diagnosis.push('💡 Fix: Description format issue - using ADF format');
      }
      
    } else {
      const issue = await createResp.json();
      results.step5_create.issue = {
        key: issue.key,
        id: issue.id,
        url: `${JIRA_CONFIG.baseUrl}/browse/${issue.key}`
      };
      results.diagnosis.push('✅ Successfully created test issue!');
      results.diagnosis.push(`🎉 Test issue created: ${issue.key}`);
      results.diagnosis.push('💡 You can delete this test issue in Jira');
    }

  } catch (error) {
    results.error = error.message;
    results.diagnosis.push(`❌ Error: ${error.message}`);
  }

  return ok(res, results);
}