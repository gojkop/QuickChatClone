// admin/api/_lib/jira.js
// Complete Jira API client wrapper for ticket creation and sync
// FIXED VERSION - Uses ADF format for descriptions

const JIRA_CONFIG = {
  baseUrl: process.env.JIRA_BASE_URL || 'https://mindpick.atlassian.net',
  email: process.env.JIRA_EMAIL,
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY || 'MINDPICK',
};

// Basic auth header
function getAuthHeader() {
  const credentials = Buffer.from(
    `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`
  ).toString('base64');
  return `Basic ${credentials}`;
}

// ============================================================================
// MAP FEEDBACK TO JIRA FIELDS
// ============================================================================

function mapFeedbackTypeToJiraIssueType(type) {
  const mapping = {
    bug: 'Bug',
    feature: 'Story',
    feedback: 'Task',
    question: 'Task',
    other: 'Task',
  };
  return mapping[type] || 'Task';
}

function mapPriorityToJira(priority) {
  const mapping = {
    critical: 'Highest',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return mapping[priority] || 'Medium';
}

function buildJiraDescription(feedback) {
  const adminUrl = process.env.ADMIN_BASE_URL || 'https://admin.mindpick.me';
  
  // Build ADF (Atlassian Document Format) content
  const content = [
    // Heading: Reported by
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Reported by' }]
    },
    // User details
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'User: ', marks: [{ type: 'strong' }] },
        { type: 'text', text: feedback.email || 'Anonymous' },
        { type: 'hardBreak' },
        { type: 'text', text: 'Date: ', marks: [{ type: 'strong' }] },
        { type: 'text', text: new Date(feedback.created_at).toLocaleString() },
        { type: 'hardBreak' },
        { type: 'text', text: 'Feedback ID: ', marks: [{ type: 'strong' }] },
        { type: 'text', text: feedback.id },
        { type: 'hardBreak' },
        { type: 'text', text: 'Priority: ', marks: [{ type: 'strong' }] },
        { type: 'text', text: feedback.priority }
      ]
    },
    // Heading: User Message
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'User Message' }]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: feedback.message }]
    },
    // Heading: Context
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Context' }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Page: ', marks: [{ type: 'strong' }] },
              { type: 'text', text: feedback.page_url }
            ]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Device: ', marks: [{ type: 'strong' }] },
              { type: 'text', text: feedback.device_type || 'unknown' }
            ]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: 'User Role: ', marks: [{ type: 'strong' }] },
              { type: 'text', text: feedback.user_role || 'guest' }
            ]
          }]
        }
      ]
    }
  ];

  // Add journey stage if present
  if (feedback.journey_stage) {
    content[content.length - 1].content.push({
      type: 'listItem',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Journey Stage: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.journey_stage }
        ]
      }]
    });
  }

  // Add rating if present
  if (feedback.rating) {
    content[content.length - 1].content.push({
      type: 'listItem',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Rating: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: '⭐'.repeat(feedback.rating) }
        ]
      }]
    });
  }

  // Add bug details if present
  if (feedback.expected_behavior || feedback.actual_behavior) {
    content.push(
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Bug Details' }]
      }
    );
    
    if (feedback.expected_behavior) {
      content.push({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Expected: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.expected_behavior }
        ]
      });
    }
    
    if (feedback.actual_behavior) {
      content.push({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Actual: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.actual_behavior }
        ]
      });
    }
    
    if (feedback.reproduction_steps) {
      content.push({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Steps: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.reproduction_steps }
        ]
      });
    }
  }

  // Add feature request details if present
  if (feedback.problem_statement) {
    content.push(
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Feature Request Details' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Problem: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.problem_statement }
        ]
      }
    );
    
    if (feedback.current_workaround) {
      content.push({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Workaround: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: feedback.current_workaround }
        ]
      });
    }
  }

  // Add separator and links
  content.push(
    {
      type: 'rule'
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Link to feedback: ', marks: [{ type: 'strong' }] },
        { 
          type: 'text', 
          text: `${adminUrl}/feedback?id=${feedback.id}`,
          marks: [{ 
            type: 'link', 
            attrs: { href: `${adminUrl}/feedback?id=${feedback.id}` } 
          }]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Admin panel: ', marks: [{ type: 'strong' }] },
        { 
          type: 'text', 
          text: `${adminUrl}/feedback`,
          marks: [{ 
            type: 'link', 
            attrs: { href: `${adminUrl}/feedback` } 
          }]
        }
      ]
    }
  );

  // Return ADF format (Atlassian Document Format)
  return {
    type: 'doc',
    version: 1,
    content: content
  };
}

// ============================================================================
// CREATE JIRA TICKET
// ============================================================================

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
      || JSON.stringify(errorData.errors)
      || errorText.substring(0, 200);
    
    throw new Error(`Jira error: ${errorMessage}`);
  }

  const result = await createResponse.json();
  console.log('[jira] Issue created successfully:', result.key);
  
  return {
    key: result.key,
    id: result.id,
    url: `${JIRA_CONFIG.baseUrl}/browse/${result.key}`,
  };
}

// ============================================================================
// UPLOAD ATTACHMENTS TO JIRA
// ============================================================================

export async function uploadAttachmentsToJira(issueKey, attachments) {
  const uploaded = [];

  for (const attachment of attachments) {
    try {
      // Download file from storage (R2, etc.)
      const fileResponse = await fetch(attachment.storage_url);
      const fileBuffer = await fileResponse.arrayBuffer();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), attachment.file_name);
      
      // Upload to Jira
      const uploadResponse = await fetch(
        `${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issueKey}/attachments`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'X-Atlassian-Token': 'no-check',
          },
          body: formData,
        }
      );

      if (uploadResponse.ok) {
        uploaded.push(attachment.id);
        console.log('[jira] Attachment uploaded:', attachment.file_name);
      } else {
        console.error('[jira] Failed to upload attachment:', attachment.file_name);
      }
    } catch (error) {
      console.error(`[jira] Failed to upload attachment ${attachment.id}:`, error);
    }
  }

  return uploaded;
}

// ============================================================================
// UPDATE JIRA TICKET
// ============================================================================

export async function updateJiraTicket(issueKey, updates) {
  const updateData = {
    fields: {},
    update: {},
  };

  // Status transition
  if (updates.status) {
    const transitionId = await getTransitionId(issueKey, updates.status);
    if (transitionId) {
      await fetch(
        `${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transition: { id: transitionId },
          }),
        }
      );
      console.log('[jira] Status transitioned:', updates.status);
    }
  }

  // Add comment
  if (updates.comment) {
    updateData.update.comment = [
      {
        add: {
          body: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: updates.comment,
                  },
                ],
              },
            ],
          },
        },
      },
    ];
  }

  // Update priority
  if (updates.priority) {
    updateData.fields.priority = { name: mapPriorityToJira(updates.priority) };
  }

  if (Object.keys(updateData.fields).length > 0 || Object.keys(updateData.update).length > 0) {
    const response = await fetch(
      `${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issueKey}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[jira] Update failed:', errorText);
      throw new Error('Failed to update Jira ticket');
    }
    
    console.log('[jira] Ticket updated successfully');
  }
}

// Helper: Get transition ID for status change
async function getTransitionId(issueKey, targetStatus) {
  const response = await fetch(
    `${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
    {
      headers: {
        'Authorization': getAuthHeader(),
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const statusMapping = {
    new: 'To Do',
    in_progress: 'In Progress',
    resolved: 'Done',
  };

  const targetStatusName = statusMapping[targetStatus];
  const transition = data.transitions.find(t => t.to.name === targetStatusName);
  
  return transition?.id || null;
}

// ============================================================================
// GET JIRA TICKET
// ============================================================================

export async function getJiraTicket(issueKey) {
  const response = await fetch(
    `${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issueKey}`,
    {
      headers: {
        'Authorization': getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Jira ticket');
  }

  const data = await response.json();
  
  return {
    key: data.key,
    status: data.fields.status.name,
    priority: data.fields.priority.name,
    assignee: data.fields.assignee?.displayName || null,
    updated: data.fields.updated,
    url: `${JIRA_CONFIG.baseUrl}/browse/${data.key}`,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createJiraTicket,
  uploadAttachmentsToJira,
  updateJiraTicket,
  getJiraTicket,
};