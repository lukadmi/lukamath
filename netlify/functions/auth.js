// netlify/functions/auth.js
// GitHub OAuth helper for Decap CMS

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI; // e.g. https://YOUR-DOMAIN/.netlify/functions/auth/callback
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // set to your site later for tighter security

export async function handler(event) {
  // Allow CMS to call us
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
    };
  }

  const isCallback = event.path.endsWith("/callback");

  // 1) Start OAuth: redirect to GitHub
  if (!isCallback) {
    const scope = "repo,user:email"; // works for private or public repos
    const authURL =
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(scope)}`;
    return {
      statusCode: 302,
      headers: { Location: authURL },
    };
  }

  // 2) Callback: exchange code for access_token
  const url = new URL(event.rawUrl);
  const code = url.searchParams.get("code");
  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
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
      body: JSON.stringify({ error: "no_token", details: data }),
    };
  }

  // Instead of returning JSON, redirect to Decap CMS with the token in the hash
  const CMS_URL = "https://lukamath.com/admin/#/callback";
  return {
    statusCode: 302,
    headers: {
      Location: `${CMS_URL}?token=${encodeURIComponent(data.access_token)}`,
    },
  };
}
