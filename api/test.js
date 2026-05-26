// Visit /api/test in your browser to check if AI keys are working

export default async function handler(req, res) {
  const geminiKey    = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const result = {
    gemini:    { configured: false, working: false, error: null },
    anthropic: { configured: false, working: false, error: null },
  };

  // ── Test Gemini ──────────────────────────────────────────────
  if (geminiKey) {
    result.gemini.configured = true;
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Reply with just the word: WORKING" }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      if (r.ok) {
        const data = await r.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        result.gemini.working  = true;
        result.gemini.response = text.trim();
      } else {
        result.gemini.error = await r.text();
      }
    } catch (e) {
      result.gemini.error = e.message;
    }
  } else {
    result.gemini.error = "GEMINI_API_KEY not set in Vercel environment variables";
  }

  // ── Test Anthropic ───────────────────────────────────────────
  if (anthropicKey) {
    result.anthropic.configured = true;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 10,
          messages: [{ role: "user", content: "Reply with just the word: WORKING" }],
        }),
      });
      if (r.ok) {
        const data = await r.json();
        result.anthropic.working  = true;
        result.anthropic.response = data.content?.[0]?.text?.trim() ?? "";
      } else {
        result.anthropic.error = await r.text();
      }
    } catch (e) {
      result.anthropic.error = e.message;
    }
  } else {
    result.anthropic.error = "ANTHROPIC_API_KEY not set (optional)";
  }

  const anyWorking = result.gemini.working || result.anthropic.working;

  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AI Key Test — AbsoluteLabs Copilot</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f0d16; color: #f3f2ff; padding: 40px; max-width: 600px; margin: 0 auto; }
    h1 { color: #7c6ef5; margin-bottom: 8px; }
    .subtitle { color: #888; margin-bottom: 32px; font-size: 14px; }
    .card { background: #1a1628; border: 1px solid rgba(124,110,245,0.2); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
    .status { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .ok   { color: #52b788; }
    .fail { color: #e05c5c; }
    .warn { color: #f0a500; }
    .detail { font-size: 13px; color: #aaa; background: #111; padding: 10px; border-radius: 8px; word-break: break-all; }
    .big { font-size: 22px; text-align: center; padding: 24px; border-radius: 12px; font-weight: 700; margin-bottom: 24px; }
    .big.ok   { background: rgba(82,183,136,0.1); border: 1px solid #52b788; color: #52b788; }
    .big.fail { background: rgba(224,92,92,0.1);  border: 1px solid #e05c5c; color: #e05c5c; }
  </style>
</head>
<body>
  <h1>🔑 API Key Status</h1>
  <p class="subtitle">AbsoluteLabs AI Delivery Copilot · Live key test</p>

  <div class="big ${anyWorking ? "ok" : "fail"}">
    ${anyWorking ? "✅ AI is live and working!" : "❌ No working AI key found"}
  </div>

  <div class="card">
    <div class="label">Google Gemini (Free)</div>
    <div class="status ${result.gemini.working ? "ok" : result.gemini.configured ? "fail" : "warn"}">
      ${result.gemini.working ? "✅ Working" : result.gemini.configured ? "❌ Key set but failed" : "⚠️ Not configured"}
    </div>
    ${result.gemini.working
      ? `<div class="detail">Model replied: "${result.gemini.response}"</div>`
      : result.gemini.error
        ? `<div class="detail">${result.gemini.error}</div>`
        : ""}
  </div>

  <div class="card">
    <div class="label">Anthropic Claude (Optional)</div>
    <div class="status ${result.anthropic.working ? "ok" : result.anthropic.configured ? "fail" : "warn"}">
      ${result.anthropic.working ? "✅ Working" : result.anthropic.configured ? "❌ Key set but failed" : "⚠️ Not configured"}
    </div>
    ${result.anthropic.working
      ? `<div class="detail">Model replied: "${result.anthropic.response}"</div>`
      : result.anthropic.error
        ? `<div class="detail">${result.anthropic.error}</div>`
        : ""}
  </div>

  <p style="color:#555; font-size:13px; text-align:center; margin-top:24px;">
    Refresh this page after adding/changing keys in Vercel → Settings → Environment Variables → Redeploy
  </p>
</body>
</html>
  `);
}
