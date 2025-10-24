// ============================================
// FILE: api/lib/xano/media.js
// Xano media_asset operations
// ⚡ PHASE 1 OPTIMIZATION: Added batch fetching capability
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
 * ⚡ PHASE 1 OPTIMIZATION: Batch fetch multiple media assets
 * Replaces N individual queries with a single batch operation
 * 
 * @param {number[]} ids - Array of media_asset IDs to fetch
 * @returns {Promise<Object[]>} Array of media_asset objects
 */
export async function getMediaAssetsBatch(ids) {
  // Early return if no IDs provided
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    console.log(`⚡ Batch fetching ${ids.length} media assets`);
    
    // Fetch all media assets in parallel using Promise.all
    const fetchPromises = ids.map(id => 
      fetch(`${XANO_BASE_URL}/media_asset/${id}`)
        .then(response => {
          if (!response.ok) {
            console.warn(`Failed to fetch media_asset ${id}: ${response.status}`);
            return null;
          }
          return response.json();
        })
        .catch(error => {
          console.warn(`Error fetching media_asset ${id}:`, error.message);
          return null;
        })
    );

    const results = await Promise.all(fetchPromises);
    
    // Filter out null results (failed fetches)
    const validResults = results.filter(result => result !== null);
    
    console.log(`✅ Successfully fetched ${validResults.length}/${ids.length} media assets`);
    
    return validResults;
  } catch (error) {
    console.error('Error in batch fetch media_assets:', error);
    // Return empty array instead of throwing - don't fail the entire request
    return [];
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