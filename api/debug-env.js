export default function handler(req, res) {
  return res.status(200).json({
    hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY,
    hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_KEY,
    hasBucket: !!process.env.CLOUDFLARE_R2_BUCKET,
    hasPublicUrl: !!process.env.CLOUDFLARE_R2_PUBLIC_URL,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
  });
}