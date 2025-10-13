// admin/api/_lib/jira.js - IMPROVED ERROR HANDLING
// Replace the createJiraTicket function with this version

export async function createJiraTicket(feedback) {
  if (!JIRA_CONFIG.email || !JIRA_CONFIG.apiToken) {
    throw new Error('Jira credentials not configured');
  }

  const issueData = {
    fields: {
      project: {
        key: JIRA_CONFIG.projectKey,
      },
      summary: `[FEEDBACK-${feedback.id.slice(0, 8)}] ${feedback.message.slice(0, 100)}`,
      description: buildJiraDescription(feedback),
      issuetype: {
        name: mapFeedbackTypeToJiraIssueType(feedback.type),
      },
      priority: {
        name: mapPriorityToJira(feedback.priority),
      },
      labels: [
        'user-feedback',
        feedback.type,
        feedback.journey_stage ? `journey-${feedback.journey_stage}` : null,
        feedback.device_type,
        feedback.is_authenticated ? 'authenticated' : 'anonymous',
      ].filter(Boolean),
    },
  };

  console.log('[jira] Creating issue with data:', JSON.stringify(issueData, null, 2));

  // Create issue
  const createResponse = await fetch(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issueData),
  });

  console.log('[jira] Create response status:', createResponse.status);

  if (!createResponse.ok) {
    // Get detailed error
    const errorText = await createResponse.text();
    console.error('[jira] Full error response:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      console.error('[jira] Could not parse error as JSON');
      throw new Error(`Jira API error (${createResponse.status}): ${errorText.substring(0, 500)}`);
    }
    
    // Log detailed errors
    console.error('[jira] Parsed error data:', JSON.stringify(errorData, null, 2));
    
    // Extract meaningful error message
    const errorMessage = errorData.errorMessages?.[0] 
      || errorData.errors 
      || errorText.substring(0, 200);
    
    throw new Error(`Jira error: ${JSON.stringify(errorMessage)}`);
  }

  const result = await createResponse.json();
  console.log('[jira] Issue created successfully:', result.key);
  
  return {
    key: result.key,
    id: result.id,
    url: `${JIRA_CONFIG.baseUrl}/browse/${result.key}`,
  };
}