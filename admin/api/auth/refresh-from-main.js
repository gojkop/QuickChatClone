// admin/api/auth/refresh-from-main.js
// Redirects user to main app to get fresh token, then back to admin

import { allowCors, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  // Get the URL to return to after auth
  const returnUrl = req.query.return || 'https://admin.mindpick.me/dashboard';
  
  // URL encode the return path
  const encodedReturn = encodeURIComponent(returnUrl);
  
  // Redirect to main app's auth page with return URL
  const mainAppAuthUrl = `https://www.mindpick.me/auth/revalidate?return=${encodedReturn}`;
  
  // Set headers for redirect
  res.setHeader('Location', mainAppAuthUrl);
  res.status(307).end(); // 307 = Temporary Redirect
}