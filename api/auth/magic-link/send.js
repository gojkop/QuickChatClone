/**
 * POST /api/auth/magic-link/send
 *
 * Initiates magic link authentication by:
 * 1. Generating a unique token in Xano
 * 2. Sending email with magic link
 *
 * Request body:
 * - email: string (required)
 *
 * Response:
 * - success: boolean
 * - message: string
 */

import { xanoPost } from '../../lib/xano/client.js';
import { sendMagicLinkEmail } from '../../lib/zeptomail.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email is required',
        field: 'email'
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        field: 'email'
      });
    }

    // Get client IP for rate limiting and security
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const clientIp = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();

    console.log(`[Magic Link] Initiating for email: ${email}, IP: ${clientIp}`);

    // Call Xano to generate token and check rate limits
    // This endpoint will be created in Xano Public API
    const xanoResponse = await xanoPost(
      '/auth/magic-link/initiate',
      {
        email: email.toLowerCase().trim(),
        ip_address: clientIp
      },
      { usePublicApi: true }
    );

    // Check for rate limit error
    if (xanoResponse.error === 'rate_limit_exceeded') {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: xanoResponse.retry_after || 3600 // seconds
      });
    }

    if (!xanoResponse.token || !xanoResponse.verification_code) {
      throw new Error('Invalid response from Xano');
    }

    // Build magic link URL
    const origin = process.env.CLIENT_PUBLIC_ORIGIN || 'http://localhost:5173';
    const magicLinkUrl = `${origin}/auth/magic-link?token=${xanoResponse.token}`;

    console.log(`[Magic Link] Generated token for ${email}, sending email...`);

    // Send email with magic link
    await sendMagicLinkEmail({
      to: email,
      magicLinkUrl,
      verificationCode: xanoResponse.verification_code,
      expiresInMinutes: 15
    });

    console.log(`[Magic Link] Email sent successfully to ${email}`);

    // Don't reveal whether email exists in system (security best practice)
    return res.status(200).json({
      success: true,
      message: 'If an account exists, you will receive an email with a sign-in link.'
    });

  } catch (error) {
    console.error('[Magic Link Send] Error:', error);

    // Don't expose internal errors to client
    return res.status(500).json({
      error: 'Failed to send magic link. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
