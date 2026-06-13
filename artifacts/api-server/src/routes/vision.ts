import { Router, type Request, type Response } from "express";

const router = Router();

// Simple in-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

// Max base64 payload ~5MB (≈ 3.75 MB raw image)
const MAX_BASE64_LEN = 5_000_000;

router.post("/scan", async (req: Request, res: Response): Promise<void> => {
  const ip = String(req.ip ?? req.socket.remoteAddress ?? "unknown");
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many requests — please wait a minute" });
    return;
  }

  const { imageBase64, mimeType = "image/jpeg" } = req.body as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64 || typeof imageBase64 !== "string") {
    res.status(400).json({ error: "imageBase64 required" });
    return;
  }

  if (imageBase64.length > MAX_BASE64_LEN) {
    res.status(413).json({ error: "Image too large — please use a smaller photo" });
    return;
  }

  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseUrl || !apiKey) {
    res.json({ topic: "", confidence: "none" });
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ baseURL: baseUrl, apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a teacher's assistant. Look at this image and identify the main educational topic shown. This might be a textbook page, diagram, or educational material. Respond with ONLY the topic name in Indonesian (Bahasa Indonesia), maximum 5 words. Examples: 'Sel Hewan', 'Fotosintesis', 'Tata Surya', 'Sistem Pencernaan'. If no clear educational topic is visible, respond with empty string.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    const topic = raw.replace(/^["']|["']$/g, "").trim();
    res.json({ topic, confidence: topic.length > 0 ? "high" : "none" });
  } catch (err) {
    console.error("[vision/scan] OpenAI error:", err);
    res.json({ topic: "", confidence: "none" });
  }
});

export default router;
