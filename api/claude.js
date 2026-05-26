// Vercel Serverless Function — AI proxy
// Uses Google Gemini (free) with Anthropic as optional fallback

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, type } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const geminiKey    = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return res.status(500).json({ error: "No AI API key configured. Add GEMINI_API_KEY to Vercel environment variables." });
  }

  const systemPrompt = type === "chat"
    ? `You are an AI Delivery Copilot for AbsoluteLabs, an enterprise platform management assistant.
You have access to live data from: MuleSoft CloudHub (41 APIs, 99.99% uptime), Jira (current sprint),
Zoho Desk (10 open tickets), Datadog (6 monitors), Azure DevOps (deployments).
Current platform health: 94.3%. Active alerts: Order API SLA breach (critical), Salesforce latency (warning).
Be concise, professional, and actionable. Answer in 2-4 sentences unless asked for detail.`
    : `You are an enterprise integration platform analyst for AbsoluteLabs.
Analyse the provided change event and respond with EXACTLY this structure (no markdown, no bullet asterisks, use • for bullets):

WHAT CHANGED
[1-2 sentences describing the technical change]

BUSINESS IMPACT
[2-3 sentences on downstream effects and business risk]

IMPACTED DOCUMENTS
- [document 1]
- [document 2]
- [document 3]

RECOMMENDED ACTION
• [action 1]
• [action 2]
• [action 3]

RISK LEVEL: [CRITICAL / HIGH / WARNING / SUCCESS]

Be specific, technical, and actionable. Reference real system names from the event.`;

  // ── Try Gemini first (free tier) ─────────────────────────────
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return res.json({ text, model: "gemini-1.5-flash" });
      }

      const errText = await response.text();
      console.error("Gemini error:", errText);
      // Fall through to Anthropic if Gemini fails
    } catch (e) {
      console.error("Gemini fetch error:", e.message);
    }
  }

  // ── Fallback: Anthropic Claude ───────────────────────────────
  if (anthropicKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 600,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text ?? "";
        return res.json({ text, model: "claude-haiku" });
      }

      const errText = await response.text();
      console.error("Anthropic error:", errText);
    } catch (e) {
      console.error("Anthropic fetch error:", e.message);
    }
  }

  return res.status(500).json({ error: "All AI providers failed. Check your API keys." });
}
