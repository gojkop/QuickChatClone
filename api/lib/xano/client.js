import axios from 'axios';

const XANO_BASE_URL = process.env.XANO_BASE_URL;

if (!XANO_BASE_URL) {
  throw new Error('XANO_BASE_URL not configured');
}

/**
 * Base Xano API client
 */
const xanoClient = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⭐ ADD THIS EXPORT
export { xanoClient };

/**
 * Generic GET request
 */
export async function xanoGet(endpoint, params = {}) {
  try {
    const response = await xanoClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Xano GET ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

/**
 * Generic POST request
 */
export async function xanoPost(endpoint, data) {
  try {
    const response = await xanoClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Xano POST ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

/**
 * Generic PATCH request
 */
export async function xanoPatch(endpoint, data) {
  try {
    const response = await xanoClient.patch(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Xano PATCH ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

/**
 * Generic DELETE request
 */
export async function xanoDelete(endpoint) {
  try {
    const response = await xanoClient.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Xano DELETE ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

// ⭐ OR export as default
export default {
  get: xanoGet,
  post: xanoPost,
  patch: xanoPatch,
  delete: xanoDelete,
  client: xanoClient
};