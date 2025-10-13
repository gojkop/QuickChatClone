// ============================================
// FILE: src/services/emailService.js
// Email service using ZeptoMail API
// ============================================

const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.apiKey = process.env.ZEPTOMAIL_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    this.fromName = process.env.FROM_NAME || 'Your Platform Name';
    this.baseUrl = 'https://api.zeptomail.com/v1.1/email';
  }

  /**
   * Load and populate email template
   */
  async loadTemplate(templateName, variables) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let html = await fs.readFile(templatePath, 'utf-8');
    
    // Simple template variable replacement
    // For production, consider using a proper template engine like Handlebars
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key] || '');
    });
    
    // Handle conditional blocks (basic implementation)
    // {{#if VARIABLE}}...{{/if}}
    html = html.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return variables[variable] ? content : '';
    });
    
    return html;
  }

  /**
   * Generate plain text version from HTML
   */
  htmlToPlainText(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  /**
   * Send email via ZeptoMail API
   */
  async sendEmail({ to, subject, html, text, replyTo }) {
    if (!this.apiKey) {
      throw new Error('ZEPTOMAIL_API_KEY is not configured');
    }

    const payload = {
      from: {
        address: this.fromEmail,
        name: this.fromName
      },
      to: [
        {
          email_address: {
            address: to,
            name: to.split('@')[0] // Extract name from email
          }
        }
      ],
      subject: subject,
      htmlbody: html,
      textbody: text || this.htmlToPlainText(html)
    };

    if (replyTo) {
      payload.reply_to = [{ address: replyTo }];
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ZeptoMail API error: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Send sign-in magic link email
   */
  async sendSignInEmail(email, magicLink) {
    const html = await this.loadTemplate('signin', {
      SIGNIN_LINK: magicLink,
      CURRENT_YEAR: new Date().getFullYear(),
      PLATFORM_NAME: this.fromName
    });

    return this.sendEmail({
      to: email,
      subject: '🔐 Sign in to your account',
      html
    });
  }

  /**
   * Send question created confirmation
   */
  async sendQuestionCreatedEmail(question) {
    const variables = {
      PAYER_NAME: question.payerEmail.split('@')[0],
      EXPERT_NAME: question.expertHandle,
      QUESTION_TITLE: question.title,
      QUESTION_TEXT: question.text || '',
      QUESTION_ID: question.id,
      QUESTION_URL: `${process.env.BASE_URL}/question/${question.id}`,
      HAS_RECORDING: question.recordingUid ? 'true' : '',
      IS_VIDEO: question.recordingMode === 'video' ? 'true' : '',
      RECORDING_TYPE: question.recordingMode === 'video' ? 'Video' : 'Audio',
      RECORDING_DURATION: question.recordingDuration || 0,
      HAS_ATTACHMENTS: question.attachments?.length > 0 ? 'true' : '',
      ATTACHMENT_COUNT: question.attachments?.length || 0,
      SUPPORT_URL: `${process.env.BASE_URL}/support`,
      CURRENT_YEAR: new Date().getFullYear(),
      PLATFORM_NAME: this.fromName
    };

    const html = await this.loadTemplate('question-created', variables);

    return this.sendEmail({
      to: question.payerEmail,
      subject: `✅ Question submitted to ${question.expertHandle}`,
      html
    });
  }

  /**
   * Send answer received notification
   */
  async sendAnswerReceivedEmail(question, answer) {
    const answerPreview = answer.text
      ? answer.text.substring(0, 300)
      : '';

    const variables = {
      PAYER_NAME: question.payerEmail.split('@')[0],
      EXPERT_NAME: question.expertHandle,
      QUESTION_TITLE: question.title,
      QUESTION_ID: question.id,
      HAS_ANSWER_TEXT: answer.text ? 'true' : '',
      ANSWER_TEXT_PREVIEW: answerPreview,
      ANSWER_IS_TRUNCATED: answer.text?.length > 300 ? 'true' : '',
      HAS_ANSWER_RECORDING: answer.recordingUid ? 'true' : '',
      IS_VIDEO_ANSWER: answer.recordingMode === 'video' ? 'true' : '',
      ANSWER_RECORDING_DURATION: answer.recordingDuration || 0,
      HAS_ANSWER_ATTACHMENTS: answer.attachments?.length > 0 ? 'true' : '',
      ANSWER_ATTACHMENT_COUNT: answer.attachments?.length || 0,
      ANSWER_URL: `${process.env.BASE_URL}/question/${question.id}/answer`,
      ANSWER_DATE: new Date(answer.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      ASK_QUESTION_URL: `${process.env.BASE_URL}/ask/${question.expertHandle}`,
      CURRENT_YEAR: new Date().getFullYear(),
      PLATFORM_NAME: this.fromName
    };

    const html = await this.loadTemplate('answer-received', variables);

    return this.sendEmail({
      to: question.payerEmail,
      subject: `🎉 ${question.expertHandle} answered your question!`,
      html
    });
  }

  /**
   * Send new question notification to expert
   */
  async sendExpertNewQuestionEmail(expert, question) {
    const variables = {
      EXPERT_NAME: expert.name || expert.handle,
      PAYER_NAME: question.payerEmail.split('@')[0],
      PAYER_EMAIL: question.payerEmail,
      QUESTION_TITLE: question.title,
      QUESTION_TEXT: question.text || '',
      QUESTION_ID: question.id,
      HAS_RECORDING: question.recordingUid ? 'true' : '',
      IS_VIDEO: question.recordingMode === 'video' ? 'true' : '',
      RECORDING_DURATION: question.recordingDuration || 0,
      HAS_ATTACHMENTS: question.attachments?.length > 0 ? 'true' : '',
      ATTACHMENT_COUNT: question.attachments?.length || 0,
      SUBMITTED_DATE: new Date(question.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ANSWER_QUESTION_URL: `${process.env.BASE_URL}/expert/question/${question.id}/answer`,
      DASHBOARD_URL: `${process.env.BASE_URL}/expert/dashboard`,
      SETTINGS_URL: `${process.env.BASE_URL}/expert/settings`,
      SHOW_STATS: expert.stats ? 'true' : '',
      PENDING_COUNT: expert.stats?.pending || 0,
      ANSWERED_COUNT: expert.stats?.answered || 0,
      CURRENT_YEAR: new Date().getFullYear(),
      PLATFORM_NAME: this.fromName
    };

    const html = await this.loadTemplate('expert-new-question', variables);

    return this.sendEmail({
      to: expert.email,
      subject: `📬 New question from ${question.payerEmail.split('@')[0]}`,
      html,
      replyTo: question.payerEmail
    });
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
