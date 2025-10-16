/**
 * POST /api/auth/magic-link/verify
 *
 * Verifies magic link token and authenticates user by:
 * 1. Validating token in Xano
 * 2. Creating/finding user account
 * 3. Generating JWT authentication token
 * 4. Sending welcome email if new user
 *
 * Request body:
 * - token: string (required) - UUID token from magic link
 *
 * Response:
 * - token: string (JWT)
 * - email: string
 * - name: string
 * - is_new_user: boolean
 */

import { xanoPost } from '../../lib/xano/client.js';
import { sendWelcomeEmail } from '../../lib/zeptomail.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    // Validate token
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Token is required',
        field: 'token'
      });
    }

    // Get client IP for security logging
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const clientIp = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();

    // Call Xano to verify token and authenticate user
    const xanoResponse = await xanoPost(
      '/auth/magic-link/verify',
      {
        token: token.trim(),
        ip_address: clientIp
      },
      { usePublicApi: true }
    );

    // Unwrap payload if Xano is in debug mode
    let actualResponse = xanoResponse;
    if (xanoResponse.payload) {
      actualResponse = xanoResponse.payload;
    }

    // Handle various error cases
    if (actualResponse.error) {
      const errorMap = {
        'token_not_found': { status: 404, message: 'Invalid or expired link' },
        'token_expired': { status: 410, message: 'This link has expired. Please request a new one.' },
        'token_already_used': { status: 410, message: 'This link has already been used. Please request a new one.' }
      };

      const errorInfo = errorMap[actualResponse.error] || {
        status: 400,
        message: 'Verification failed'
      };

      return res.status(errorInfo.status).json({
        error: errorInfo.message,
        code: actualResponse.error
      });
    }

    // Validate response
    if (!actualResponse.token || !actualResponse.email) {
      throw new Error('Invalid response from Xano');
    }

    const isNewUser = actualResponse.is_new_user === true;

    // Send welcome email for new users
    if (isNewUser) {
      try {
        await sendWelcomeEmail({
          to: actualResponse.email,
          name: actualResponse.name || actualResponse.email.split('@')[0],
          authMethod: 'magic_link'
        });
      } catch (emailError) {
        // Don't fail authentication if welcome email fails
        console.error('[Magic Link] Failed to send welcome email:', emailError);
      }
    }

    // Return JWT token for frontend
    return res.status(200).json({
      token: actualResponse.token,
      email: actualResponse.email,
      name: actualResponse.name || actualResponse.email.split('@')[0],
      is_new_user: isNewUser
    });

  } catch (error) {
    console.error('[Magic Link Verify] Error:', error.message);
    if (error.response?.data) {
      console.error('[Magic Link Verify] Xano error:', error.response.data);
    }

    return res.status(500).json({
      error: 'Verification failed. Please try again or request a new link.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
