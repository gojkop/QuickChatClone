import { xanoPost } from './client.js';

/**
 * Create a media asset record
 * @param {Object} data - Media asset data
 * @returns {Promise<Object>} Created media asset
 */
export async function createMediaAsset(data) {
  return xanoPost('/media_asset', {
    owner_type: data.ownerType, // 'question', 'answer', 'user'
    owner_id: data.ownerId,
    provider: data.provider || 'cloudflare_stream',
    asset_id: data.assetId,
    duration_sec: data.duration || 0,
    status: data.status || 'processing',
    url: data.url,
  });
}