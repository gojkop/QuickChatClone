// admin/api/_lib/jira.js
// Jira API client wrapper for ticket creation and sync

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
  
  let description = `h3. Reported by\n`;
  description += `*User:* ${feedback.email || 'Anonymous'}\n`;
  description += `*Date:* ${new Date(feedback.created_at).toLocaleString()}\n`;
  description += `*Feedback ID:* ${feedback.id}\n`;
  description += `*Priority:* ${feedback.priority}\n\n`;
  
  description += `h3. User Message\n`;
  description += `${feedback.message}\n\n`;
  
  description += `h3. Context\n`;
  description += `* *Page:* ${feedback.page_url}\n`;
  description += `* *Device:* ${feedback.device_type || 'unknown'}\n`;
  description += `* *User Role:* ${feedback.user_role || 'guest'}\n`;
  if (feedback.journey_stage) {
    description += `* *Journey Stage:* ${feedback.journey_stage}\n`;
  }
  if (feedback.rating) {
    description += `* *Rating:* ${'⭐'.repeat(feedback.rating)}\n`;
  }
  
  if (feedback.expected_behavior || feedback.actual_behavior) {
    description += `\nh3. Bug Details\n`;
    if (feedback.expected_behavior) {
      description += `*Expected:* ${feedback.expected_behavior}\n`;
    }
    if (feedback.actual_behavior) {
      description += `*Actual:* ${feedback.actual_behavior}\n`;
    }
    if (feedback.reproduction_steps) {
      description += `*Steps:* ${feedback.reproduction_steps}\n`;
    }
  }
  
  if (feedback.problem_statement) {
    description += `\nh3. Feature Request Details\n`;
    description += `*Problem:* ${feedback.problem_statement}\n`;
    if (feedback.current_workaround) {
      description += `*Workaround:* ${feedback.current_workaround}\n`;
    }
  }
  
  description += `\n---\n`;
  description += `*Link to feedback:* ${adminUrl}/feedback?id=${feedback.id}\n`;
  description += `*Admin panel:* ${adminUrl}/feedback\n`;
  
  return description;
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

  // Create issue
  const createResponse = await fetch(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issueData),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(error.errorMessages?.[0] || 'Failed to create Jira ticket');
  }

  const result = await createResponse.json();
  
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
      }
    } catch (error) {
      console.error(`Failed to upload attachment ${attachment.id}:`, error);
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

  // Update fields
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
      throw new Error('Failed to update Jira ticket');
    }
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

export default {
  createJiraTicket,
  uploadAttachmentsToJira,
  updateJiraTicket,
  getJiraTicket,
};