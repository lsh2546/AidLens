import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const baseUrl = (process.env.AIDLENS_URL || "http://localhost:3000").replace(/\/$/, "");
const casesPath = process.argv[2] || "evaluation/cases.json";
const cases = JSON.parse(await readFile(casesPath, "utf8"));
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
let visibleTotal = 0, visibleHits = 0, missingTotal = 0, missingHits = 0, uncertain = 0, elapsedTotal = 0;
const runs = [];

for (const test of cases) {
  const imagePath = resolve("evaluation", test.image);
  const bytes = await readFile(imagePath);
  const body = new FormData();
  body.append("image", new Blob([bytes]), basename(imagePath));
  body.append("kit", test.kit || "Flood essentials 쨌 24 hours");
  body.append("language", "English");
  const started = performance.now();
  const response = await fetch(`${baseUrl}/api/analyze`, { method: "POST", body });
  const payload = await response.json();
  const elapsedMs = Math.round(performance.now() - started);
  if (payload.demo) throw new Error(`${test.id}: endpoint returned demo mode; stop and configure GEMMA_API_KEY`);
  const predictions = (payload.items || []).map((item) => ({ ...item, normalized: normalize(item.name) }));
  const match = (name, status) => predictions.some((item) => item.normalized === normalize(name) && item.status === status);
  const visibleCaseHits = test.expectedVisible.filter((name) => match(name, "verified")).length;
  const missingCaseHits = test.expectedMissing.filter((name) => match(name, "missing")).length;
  visibleTotal += test.expectedVisible.length; visibleHits += visibleCaseHits;
  missingTotal += test.expectedMissing.length; missingHits += missingCaseHits;
  uncertain += predictions.filter((item) => item.status === "uncertain").length;
  elapsedTotal += elapsedMs;
  runs.push({ id: test.id, elapsedMs, visibleHits: visibleCaseHits, visibleTotal: test.expectedVisible.length, missingHits: missingCaseHits, missingTotal: test.expectedMissing.length, predictions: payload.items });
}

const report = {
  generatedAt: new Date().toISOString(),
  endpoint: baseUrl,
  photos: cases.length,
  expectedItemConfirmationRecall: visibleTotal ? visibleHits / visibleTotal : null,
  missingItemDetectionRate: missingTotal ? missingHits / missingTotal : null,
  uncertainJudgments: uncertain,
  averageLatencyMs: cases.length ? Math.round(elapsedTotal / cases.length) : null,
  runs,
};
await writeFile("evaluation/results.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, runs: undefined }, null, 2));

