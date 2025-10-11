// Dynamic CORS helper that prefers configured origin, falls back to request origin.
// Avoids using '*' with credentials since browsers block that combination.
function resolveOrigin(req) {
  const configured = process.env.CORS_ALLOW_ORIGIN;
  if (configured && configured !== '*') return configured;
  const fromReq = req.headers?.origin;
  if (fromReq) return fromReq;
  return '*';
}

export function allowCors(req, res) {
  const allowOrigin = resolveOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  // Only allow credentials when origin is explicit
  res.setHeader('Access-Control-Allow-Credentials', allowOrigin !== '*' ? 'true' : 'false');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function ok(res, data, req = null) {
  const allowOrigin = req ? resolveOrigin(req) : (process.env.CORS_ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', allowOrigin !== '*' ? 'true' : 'false');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(data));
}

export function err(res, code, message, extra = {}, req = null) {
  const allowOrigin = req ? resolveOrigin(req) : (process.env.CORS_ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', allowOrigin !== '*' ? 'true' : 'false');
  res.setHeader('Content-Type', 'application/json');
  res.status(code).send(JSON.stringify({ error: message, ...extra }));
}
