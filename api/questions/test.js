// api/questions/test.js
// Simple test endpoint to verify API is working

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      hasCloudflareAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      hasCloudflareStreamToken: !!process.env.CLOUDFLARE_STREAM_API_TOKEN,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
    }
  });
}