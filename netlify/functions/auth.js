// netlify/functions/auth.js
// GitHub OAuth helper for Decap (Netlify) CMS

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI; // e.g. https://YOUR-DOMAIN/.netlify/functions/auth/callback
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // Set to your site for security, e.g. "https://lukamath.com"

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
      body: "",
    };
  }

  const isCallback = event.path.endsWith("/callback");

  // 1. Start OAuth: Redirect user to GitHub login
  if (!isCallback) {
    const scope = "repo,user:email";
    const authURL =
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(scope)}`;
    return {
      statusCode: 302,
      headers: { Location: authURL },
    };
  }

  // 2. OAuth Callback: Exchange code for access token
  // Get ?code=... from callback URL
  let code = null;
  try {
    const url = new URL(event.rawUrl || `${ALLOWED_ORIGIN}${event.path}${event.queryStringParameters ? "?" + new URLSearchParams(event.queryStringParameters).toString() : ""}`);
    code = url.searchParams.get("code");
  } catch (e) {
    // fallback if event.rawUrl is undefined
    code = event.queryStringParameters && event.queryStringParameters.code;
  }

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code from GitHub OAuth redirect.",
    };
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ error: "No access_token returned", details: data }),
    };
  }

  // Redirect to Decap CMS admin with token in hash fragment - this is what Decap CMS expects!
  // Try both variants if you still have issues:
  // 1) /admin/#access_token=...&token_type=bearer (most common)
  // 2) /admin/#/callback?token=... (for some custom setups)

  const CMS_URL = "https://lukamath.com/admin/#access_token=" + encodeURIComponent(data.access_token) + "&token_type=bearer";
  // const CMS_URL = "https://lukamath.com/admin/#/callback?token=" + encodeURIComponent(data.access_token);

  return {
    statusCode: 302,
    headers: {
      Location: CMS_URL,
    },
  };
}
