import { NextResponse } from "next/server";

const DEMO_ITEMS = [
  { name: "Sealed water pouches", detail: "4 횞 500 ml visible", status: "verified", confidence: 96 },
  { name: "Oral rehydration salts", detail: "2 labelled sachets visible", status: "verified", confidence: 91 },
  { name: "Sterile gauze", detail: "Expected: 1 sealed pack", status: "missing" },
  { name: "Emergency blanket", detail: "Silver package partly obscured", status: "uncertain", confidence: 62 },
  { name: "Soap bar", detail: "1 wrapped bar visible", status: "verified", confidence: 88 },
];

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image");
  const kit = String(form.get("kit") || "Flood essentials 쨌 24 hours");
  const language = String(form.get("language") || "English");
  const key = process.env.GEMMA_API_KEY;
  const model = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
  if (!(image instanceof File) || !key) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return NextResponse.json({ items: DEMO_ITEMS, demo: true });
  }

  const raw = new Uint8Array(await image.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < raw.length; offset += 0x8000) {
    binary += String.fromCharCode(...raw.subarray(offset, offset + 0x8000));
  }
  const bytes = btoa(binary);
  const prompt = `You are AidLens, a cautious disaster-relief kit inspection assistant. Inspect this image against the ${kit} standard. Return JSON only with an items array. Each item must have name, detail, status (verified, missing, or uncertain), and confidence from 0-100 when visible. Never infer medical safety or authenticity. Treat obscured objects as uncertain. Guidance language: ${language}.`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: image.type, data: bytes } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1, thinkingConfig: { thinkingLevel: "minimal" } } }),
    });
    if (!response.ok) throw new Error("Model request failed");
    const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ items: parsed.items || DEMO_ITEMS, demo: false });
  } catch {
    return NextResponse.json({ items: DEMO_ITEMS, demo: true });
  }
}

