import { xanoGet } from './client.js';

/**
 * Get expert profile by handle
 * @param {string} handle - Expert handle (e.g., "gojko")
 * @returns {Promise<Object>} Expert profile
 */
export async function getExpertByHandle(handle) {
  const profiles = await xanoGet('/expert_profile');
  const expert = profiles.find(p => p.handle === handle);
  
  if (!expert) {
    throw new Error(`Expert with handle '${handle}' not found`);
  }
  
  return expert;
}