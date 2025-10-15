import axios from 'axios';

const XANO_BASE_URL = process.env.XANO_BASE_URL;
const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;

if (!XANO_BASE_URL) {
  throw new Error('XANO_BASE_URL not configured');
}

if (!XANO_PUBLIC_API_URL) {
  throw new Error('XANO_PUBLIC_API_URL not configured');
}

/**
 * Base Xano API client (Authentication API)
 */
const xanoClient = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Public Xano API client (Public API)
 */
const xanoPublicClient = axios.create({
  baseURL: XANO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⭐ ADD THIS EXPORT
export { xanoClient, xanoPublicClient };

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters
 * @param {object} options - Additional options
 * @param {boolean} options.usePublicApi - Use Public API instead of Auth API
 */
export async function xanoGet(endpoint, params = {}, options = {}) {
  try {
    const client = options.usePublicApi ? xanoPublicClient : xanoClient;
    const response = await client.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Xano GET ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Additional options
 * @param {boolean} options.usePublicApi - Use Public API instead of Auth API
 */
export async function xanoPost(endpoint, data, options = {}) {
  try {
    const client = options.usePublicApi ? xanoPublicClient : xanoClient;
    const response = await client.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Xano POST ${endpoint} error:`, error.response?.data || error.message);

    // Preserve original error information
    const enhancedError = new Error(`Xano API error: ${error.message}`);
    enhancedError.response = error.response;
    enhancedError.xanoData = error.response?.data;
    throw enhancedError;
  }
}

/**
 * Generic PATCH request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Additional options
 * @param {boolean} options.usePublicApi - Use Public API instead of Auth API
 */
export async function xanoPatch(endpoint, data, options = {}) {
  try {
    const client = options.usePublicApi ? xanoPublicClient : xanoClient;
    const response = await client.patch(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Xano PATCH ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(`Xano API error: ${error.message}`);
  }
}

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional options
 * @param {boolean} options.usePublicApi - Use Public API instead of Auth API
 */
export async function xanoDelete(endpoint, options = {}) {
  try {
    const client = options.usePublicApi ? xanoPublicClient : xanoClient;
    const response = await client.delete(endpoint);
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
  client: xanoClient,
  publicClient: xanoPublicClient
};