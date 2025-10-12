// ============================================
// FILE: api/lib/xano/media.js
// Xano media_asset operations
// ============================================

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';

/**
 * Create media_asset record in Xano
 * ⭐ UPDATED: Now supports segmentIndex and metadata
 */
export async function createMediaAsset({
  ownerType,
  ownerId,
  provider,
  assetId,
  duration = 0,
  status = 'processing',
  url,
  segmentIndex = 0,  // ⭐ NEW
  metadata = null,    // ⭐ NEW
}) {
  try {
    const payload = {
      owner_type: ownerType,
      owner_id: ownerId,
      provider,
      asset_id: assetId,
      duration_sec: duration,
      status,
      url,
      segment_index: segmentIndex,  // ⭐ NEW
      metadata: metadata ? JSON.stringify(metadata) : null,  // ⭐ NEW
    };

    console.log('Creating media_asset in Xano:', payload);

    const response = await fetch(`${XANO_BASE_URL}/media_asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Xano media_asset creation failed:', errorText);
      throw new Error(`Failed to create media_asset: ${response.status}`);
    }

    const result = await response.json();
    console.log('Media_asset created:', result.id);
    return result;
  } catch (error) {
    console.error('Error creating media_asset:', error);
    throw error;
  }
}

/**
 * Get media_asset by ID
 */
export async function getMediaAsset(id) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/media_asset/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get media_asset: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting media_asset:', error);
    throw error;
  }
}

/**
 * Get all media_assets for an owner
 * ⭐ NEW: Fetch all segments for a question
 */
export async function getMediaAssetsByOwner(ownerType, ownerId) {
  try {
    const response = await fetch(
      `${XANO_BASE_URL}/media_asset?owner_type=${ownerType}&owner_id=${ownerId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get media_assets: ${response.status}`);
    }

    const assets = await response.json();
    
    // Sort by segment_index
    return assets.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0));
  } catch (error) {
    console.error('Error getting media_assets:', error);
    throw error;
  }
}

/**
 * Update media_asset
 */
export async function updateMediaAsset(id, updates) {
  try {
    const payload = {};
    
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.duration !== undefined) payload.duration_sec = updates.duration;
    if (updates.url !== undefined) payload.url = updates.url;
    if (updates.segmentIndex !== undefined) payload.segment_index = updates.segmentIndex;
    if (updates.metadata !== undefined) {
      payload.metadata = updates.metadata ? JSON.stringify(updates.metadata) : null;
    }

    const response = await fetch(`${XANO_BASE_URL}/media_asset/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update media_asset: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating media_asset:', error);
    throw error;
  }
}

/**
 * Delete media_asset
 */
export async function deleteMediaAsset(id) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/media_asset/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete media_asset: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting media_asset:', error);
    throw error;
  }
}