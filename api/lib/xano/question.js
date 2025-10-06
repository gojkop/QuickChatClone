import { xanoPost, xanoPatch } from './client.js';

/**
 * Create a new question record
 * @param {Object} data - Question data
 * @returns {Promise<Object>} Created question
 */
export async function createQuestion(data) {
  return xanoPost('/question', {
    expert_profile_id: data.expertProfileId,
    title: data.title,
    text: data.text || '',
    attachments: data.attachments ? JSON.stringify(data.attachments) : null,
    payer_email: data.payerEmail,
    price_cents: data.priceCents,
    currency: data.currency,
    status: data.status || 'pending_payment',
    sla_hours_snapshot: data.slaHours || 48,
  });
}

/**
 * Update a question record
 * @param {number} questionId
 * @param {Object} updates
 * @returns {Promise<Object>} Updated question
 */
export async function updateQuestion(questionId, updates) {
  const payload = {};
  
  if (updates.status) payload.status = updates.status;
  if (updates.paidAt) payload.paid_at = updates.paidAt;
  if (updates.mediaAssetId) payload.media_asset_id = updates.mediaAssetId;
  if (updates.answeredAt) payload.answered_at = updates.answeredAt;
  
  return xanoPatch(`/question/${questionId}`, payload);
}