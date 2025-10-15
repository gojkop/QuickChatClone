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

    console.log(`[Magic Link] Verifying token: ${token.substring(0, 8)}..., IP: ${clientIp}`);

    // Call Xano to verify token and authenticate user
    // This endpoint will be created in Xano Public API
    const xanoResponse = await xanoPost(
      '/auth/magic-link/verify',
      {
        token: token.trim(),
        ip_address: clientIp
      },
      { usePublicApi: true }
    );

    console.log('[Magic Link] Xano response received:', JSON.stringify(xanoResponse, null, 2));
    console.log('[Magic Link] Xano response keys:', Object.keys(xanoResponse));

    // Handle various error cases
    if (xanoResponse.error) {
      const errorMap = {
        'token_not_found': { status: 404, message: 'Invalid or expired link' },
        'token_expired': { status: 410, message: 'This link has expired. Please request a new one.' },
        'token_already_used': { status: 410, message: 'This link has already been used. Please request a new one.' }
      };

      const errorInfo = errorMap[xanoResponse.error] || {
        status: 400,
        message: 'Verification failed'
      };

      return res.status(errorInfo.status).json({
        error: errorInfo.message,
        code: xanoResponse.error
      });
    }

    // Validate response
    if (!xanoResponse.token || !xanoResponse.email) {
      throw new Error('Invalid response from Xano');
    }

    const isNewUser = xanoResponse.is_new_user === true;

    console.log(`[Magic Link] Verified successfully for ${xanoResponse.email}, new user: ${isNewUser}`);

    // Send welcome email for new users
    if (isNewUser) {
      try {
        await sendWelcomeEmail({
          to: xanoResponse.email,
          name: xanoResponse.name || xanoResponse.email.split('@')[0],
          authMethod: 'magic_link'
        });
        console.log(`[Magic Link] Welcome email sent to ${xanoResponse.email}`);
      } catch (emailError) {
        // Don't fail authentication if welcome email fails
        console.error('[Magic Link] Failed to send welcome email:', emailError);
      }
    }

    // Return JWT token for frontend
    return res.status(200).json({
      token: xanoResponse.token,
      email: xanoResponse.email,
      name: xanoResponse.name || xanoResponse.email.split('@')[0],
      is_new_user: isNewUser
    });

  } catch (error) {
    console.error('[Magic Link Verify] Error:', error);
    console.error('[Magic Link Verify] Error message:', error.message);
    console.error('[Magic Link Verify] Error stack:', error.stack);
    console.error('[Magic Link Verify] Error response:', error.response?.data);

    return res.status(500).json({
      error: 'Verification failed. Please try again or request a new link.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
