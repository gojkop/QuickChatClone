// server/index.js
// Vercel serverless Express: Xano proxy + Google OAuth (no request_key flow)

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");

const app = express();

// --- ENV (set these in Vercel Project Settings → Environment Variables) ---
const {
  XANO_API_BASE_URL,               // e.g. https://x8ki-letl-twmt.n7.xano.io
  CLIENT_PUBLIC_ORIGIN,            // e.g. https://your-app.vercel.app
  COOKIE_DOMAIN,                   // e.g. your-app.vercel.app   (no protocol)
  OAUTH_REDIRECT_PATH = "/connect_stripe", // matches your router page
  XANO_API_KEY                     // optional
} = process.env;

// --- Middleware ---
app.use(cookieParser());
app.use(express.json());

// CORS for browser calls hitting this function
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === CLIENT_PUBLIC_ORIGIN) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Preflight (if you use custom headers)
app.options("/api/*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || CLIENT_PUBLIC_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.status(204).end();
});

// Utility to forward to Xano
async function forwardToXano(xPath, req, res, extra = {}) {
  try {
    const r = await axios.request({
      url: `${XANO_API_BASE_URL}${xPath}`,
      method: req.method,
      params: req.query,
      data: req.body,
      headers: {
        ...(XANO_API_KEY ? { "X-API-KEY": XANO_API_KEY } : {}),
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      validateStatus: () => true,
      ...extra
    });
    res.status(r.status).set({
      "Access-Control-Allow-Origin": req.headers.origin || CLIENT_PUBLIC_ORIGIN,
      "Access-Control-Allow-Credentials": "true"
    }).send(r.data);
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(502).json({ message: "Bad gateway to Xano" });
  }
}

// -------- Google OAuth (simple GET style; no request_key) --------

// INIT → get authUrl from Xano and return it
app.post("/api/oauth/google/init", async (req, res) => {
  try {
    const redirect_uri = new URL(OAUTH_REDIRECT_PATH, CLIENT_PUBLIC_ORIGIN).toString();
    const r = await axios.get(`${XANO_API_BASE_URL}/api:fALBm5Ej/oauth/google/init`, {
      params: { redirect_uri },
      validateStatus: () => true
    });
    if (r.status !== 200 || !r.data) return res.status(500).json({ message: "Init failed", details: r.data });
    // Your Xano returns a single value; normalize to { authUrl }
    const authUrl = r.data.authUrl || r.data || r.data.url;
    if (!authUrl) return res.status(500).json({ message: "No authUrl from Xano" });
    res.json({ authUrl });
  } catch (e) {
    console.error("OAuth init error:", e.response?.data || e.message);
    res.status(500).json({ message: "OAuth init failed" });
  }
});

// CONTINUE → exchange code at Xano and return token (+user info if present)
app.get("/api/oauth/google/continue", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ message: "Missing code" });

  try {
    const redirect_uri = new URL(OAUTH_REDIRECT_PATH, CLIENT_PUBLIC_ORIGIN).toString();
    const r = await axios.get(`${XANO_API_BASE_URL}/api:fALBm5Ej/oauth/google/continue`, {
      params: { code, redirect_uri },
      validateStatus: () => true
    });

    if (r.status !== 200) return res.status(r.status).json(r.data || { message: "Continue failed" });

    // Your screenshot shows Response keys: token, name, email
    const token = r.data?.token || r.data?.authToken || r.data?.auth_token;
    const name  = r.data?.name;
    const email = r.data?.email;

    if (!token) return res.status(500).json({ message: "No token from Xano continue" });

    // Optionally also set as cookie (keeps future flexibility)
    res.cookie("qc_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: COOKIE_DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({ token, name, email }); // keep shape your client expects
  } catch (e) {
    console.error("OAuth continue error:", e.response?.data || e.message);
    res.status(500).json({ message: "OAuth continue failed" });
  }
});

// Example protected passthrough
app.get("/api/me/bootstrap", (req, res) => {
  forwardToXano(`/api:fALBm5Ej/me/bootstrap`, req, res);
});

// Generic proxy: /api/:workspace/*
app.all("/api/:workspace/*", (req, res) => {
  const { workspace } = req.params;
  const tail = req.path.replace(`/api/${workspace}`, "");
  return forwardToXano(`/api:${workspace}${tail}`, req, res);
});

// NOTE: Do NOT app.listen() on Vercel; just export the app:
module.exports = app;
