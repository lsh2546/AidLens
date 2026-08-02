# AidLens

**See what is inside. Act with confidence.**

AidLens is a multilingual disaster-relief field assistant built for the Build with Gemma hackathon. A responder photographs an open relief kit; Gemma extracts visible supplies, deterministic logic flags missing or uncertain items, and AidLens explains the next action in English, Hindi, or Gujarati.

## Live demo

**[Try AidLens without a login](https://aidlens-relief-check.ljs2546.chatgpt.site/)**

Select **Try Sample Relief Kit** for a one-click walkthrough. When a Gemma API key is not configured, the result is explicitly labelled **Demo Mode** so simulated output cannot be mistaken for live inference.

## Why it matters

Relief kits are packed and repacked under pressure. A missing gauze pack or water pouch can be discovered too late, while printed instructions may not match the recipient's language. AidLens makes a quick, accountable second check possible with one photo?봢ven in an edge-first deployment.

## Demo flow

1. Upload, photograph, or select the included sample relief kit.
2. Choose a kit standard and guidance language.
3. Select **Check this kit**.
4. Review **Confirmed**, **Missing**, and **Needs human review** items.
5. Follow the localized guidance and complete the final human check.

Live inference defaults to Google's hosted `gemma-4-26b-a4b-it` model.

## Why Gemma

This problem cannot be solved reliably with OCR alone. Supplies vary in shape, orientation, packaging, and branding; several objects may overlap and readable text may be absent. Gemma performs whole-scene multimodal inspection and returns constrained, structured observations.

The server prompt requires the model to:

- report only visually supported observations;
- attach confidence to visible items;
- label obscured objects as `uncertain`;
- never claim medical safety or product authenticity.

Deterministic application logic then compares those observations with the selected kit standard. This keeps Gemma central to perception and multilingual explanation while making the final checklist auditable.

```text
Relief-kit photo
       ??Gemma 4 multimodal inspection
       ??structured observations
Deterministic checklist comparison
       ??Confirmed 쨌 Missing 쨌 Needs human review
       ??English 쨌 Hindi 쨌 Gujarati guidance
```

## Safety

AidLens is a field assistant, not a medical device. It does not certify package integrity, sterility, medicine authenticity, or suitability. Uncertain results always request human verification.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Configure these environment variables for live inference:

```bash
GEMMA_API_KEY=your_key
GEMMA_MODEL=gemma-4-26b-a4b-it
```

Without `GEMMA_API_KEY`, the application remains usable in clearly labelled demonstration mode.

## Stack

- Next-compatible React UI on vinext
- Cloudflare Workers-compatible server route
- Gemma multimodal inference with structured JSON output
- Responsive, accessible upload and localized guidance flow

## Reproducible evaluation

Place manually labelled kit images in `evaluation/images`, copy `evaluation/cases.example.json` to `evaluation/cases.json`, and run:

```bash
AIDLENS_URL=https://your-deployment.example node evaluation/evaluate.mjs
```

The evaluator reports item-confirmation recall, missing-item detection rate, uncertainty count, and average end-to-end latency. It writes the raw report to `evaluation/results.json` and stops if the endpoint returns demo-mode data, preventing simulated output from being published as measured performance.

## Project structure

```text
app/page.tsx               Product UI and multilingual workflow
app/api/analyze/route.ts   Gemma inference and safe demo fallback
evaluation/                Reproducible evaluation harness
public/                    Sample relief-kit asset
```

## License

Released for hackathon demonstration and evaluation. Add your preferred open-source license before reuse outside the event.

