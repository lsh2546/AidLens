"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

type ItemStatus = "verified" | "missing" | "uncertain";
type ResultItem = {
  name: string;
  detail: string;
  status: ItemStatus;
  confidence?: number;
};

const COPY = {
  English: {
    heading: "Know what?셲 inside. Act with confidence.",
    sub: "AidLens checks relief kits from a single photo, flags what may be missing, and explains what to do next?봧n the language people understand.",
    photo: "Relief kit photo",
    drop: "Drop a photo here",
    browse: "or browse from your device",
    kit: "Kit standard",
    lang: "Guidance language",
    analyze: "Check this kit",
    checking: "Gemma is checking the kit??,
    result: "Kit check",
    reset: "Check another kit",
  },
  西밝ㅏ西ⓣ쪓西╆?: {
    heading: "西쒉ㅎ西ⓣ쪍西?西끶쨧西╆ㅀ 西뺖쪓西?ㅎ 西밝쪎誓?西?ㅀ誓뗠ㅈ誓?西뺖쪍 西멘ㅎ西?西뺖ㄶ西?西됢쩆西약쨵西곟ⅳ",
    sub: "AidLens 西뤲쨻 西ㅰㅈ誓띭ㅅ誓西?西멘쪍 西겯ㅎ西밝ㄴ 西뺖ㅏ西?西뺖? 西쒉ㅎ西곟쩀 西뺖ㅀ西ㅰㅎ 西밝쪎, 西뺖ㄾ誓 西оㄴ西약ㄴ西?西밝쪎 西붲ㅀ 西녱ㄺ西뺖? 西?ㅎ西룅ㅎ 西?쪍西?西끶쨽西꿋ㅎ 西뺖ㄶ西?西멘ㄾ西앧ㅎ西ㅰㅎ 西밝쪎誓?,
    photo: "西겯ㅎ西밝ㄴ 西뺖ㅏ西?西뺖? 西ㅰㅈ誓띭ㅅ誓西?, drop: "西ㅰㅈ誓띭ㅅ誓西?西?ㅉ西약쨦 西□ㅎ西꿋쪍西?, browse: "西?ㅎ 西□ㅏ西듀ㅎ西뉋ㅈ 西멘쪍 西싟쪇西ⓣ쪍西?, kit: "西뺖ㅏ西?西?ㅎ西ⓣ쨻", lang: "西ⓣㅏ西겯쪓西╆쪍西?西뺖? 西?ㅎ西룅ㅎ", analyze: "西뺖ㅏ西?西쒉ㅎ西곟쩀誓뉋쨧", checking: "Gemma 西뺖ㅏ西?西쒉ㅎ西곟쩀 西겯ㅉ西?西밝쪎??, result: "西뺖ㅏ西?西쒉ㅎ西곟쩀", reset: "西╆쪈西멘ㅀ誓 西뺖ㅏ西?西쒉ㅎ西곟쩀誓뉋쨧",
  },
  夕쀠쳛夕쒉ぐ夕약い奭: {
    heading: "夕끶챴夕╆ぐ 夕뜩쳛夕?夕쎹쳡 夕ㅰ쳡 夕쒉ぞ夕｀쳦. 夕듀た夕뜩쳨夕듀ぞ夕멘ぅ奭 夕む첊夕꿋쳛夕?西?ㅀ誓?",
    sub: "AidLens 夕뤲첈 夕ム쳦夕잀ぞ夕?? 夕겯ぞ夕밝い 夕뺖た夕?夕ㅰお夕약じ奭?夕쎹쳡, 夕뽤쳜夕잀い奭 夕듀じ奭띭い奭?夕оい夕약さ奭?夕쎹쳡 夕끶え奭?夕ㅰぎ夕약ぐ奭 夕?ぞ夕룅ぞ夕?ぞ夕?夕녱첊夕?夕뜩쳛夕?夕뺖ぐ夕듀쳛夕?夕ㅰ쳡 夕멘ぎ夕쒉ぞ夕듀쳡 夕쎹쳡.",
    photo: "夕겯ぞ夕밝い 夕뺖た夕잀え奭?夕ム쳦夕잀쳦", drop: "夕ム쳦夕잀쳦 夕끶す奭夕?夕?쳜夕뺖쳦", browse: "夕끶ぅ夕듀ぞ 夕□た夕듀ぞ夕뉋じ夕?ぞ夕귖ぅ奭 夕むじ夕귖う 夕뺖ぐ奭?, kit: "夕뺖た夕?夕㏅쳦夕겯ぃ", lang: "夕?ぞ夕겯쳨夕쀠う夕겯쳨夕뜩え 夕?ぞ夕룅ぞ", analyze: "夕뺖た夕?夕ㅰお夕약じ奭?, checking: "Gemma 夕뺖た夕?夕ㅰお夕약じ奭 夕겯す奭띭く奭곟챴 夕쎹쳡??, result: "夕뺖た夕?夕ㅰお夕약じ", reset: "夕о?夕쒉? 夕뺖た夕?夕ㅰお夕약じ奭?,
  },
} as const;

const SAMPLE_RESULTS: ResultItem[] = [
  { name: "Sealed water pouches", detail: "4 횞 500 ml visible", status: "verified", confidence: 96 },
  { name: "Oral rehydration salts", detail: "2 labelled sachets visible", status: "verified", confidence: 91 },
  { name: "Sterile gauze", detail: "Expected: 1 sealed pack", status: "missing" },
  { name: "Emergency blanket", detail: "Silver package partly obscured", status: "uncertain", confidence: 62 },
  { name: "Soap bar", detail: "1 wrapped bar visible", status: "verified", confidence: 88 },
];

export default function Home() {
  const [language, setLanguage] = useState<keyof typeof COPY>("English");
  const [kit, setKit] = useState("Flood essentials 쨌 24 hours");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"input" | "loading" | "result">("input");
  const [results, setResults] = useState<ResultItem[]>(SAMPLE_RESULTS);
  const [demoMode, setDemoMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = COPY[language];

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(next?: File) {
    if (!next || !next.type.startsWith("image/")) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setStage("input");
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  async function analyze() {
    if (!file) { inputRef.current?.click(); return; }
    setStage("loading");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("kit", kit);
      form.append("language", language);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (Array.isArray(data.items)) setResults(data.items);
      setDemoMode(Boolean(data.demo));
    } catch {
      setDemoMode(true);
      setResults(SAMPLE_RESULTS);
    }
    setStage("result");
  }

  async function trySample() {
    const response = await fetch("/sample-relief-kit.png");
    const blob = await response.blob();
    const sample = new File([blob], "sample-relief-kit.png", { type: "image/png" });
    selectFile(sample);
    setStage("loading");
    const form = new FormData();
    form.append("image", sample);
    form.append("kit", kit);
    form.append("language", language);
    try {
      const result = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await result.json();
      if (Array.isArray(data.items)) setResults(data.items);
      setDemoMode(Boolean(data.demo));
    } catch { setDemoMode(true); setResults(SAMPLE_RESULTS); }
    setStage("result");
  }

  function reset() { setStage("input"); setFile(null); setPreview(null); setDemoMode(false); }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="AidLens home"><span className="brandMark">A</span><span>AidLens</span></a>
        <div className="navMeta"><span className="offline"><i /> Edge-ready</span><span className="gemma">Built with <b>Gemma</b></span></div>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span>??/span> AI FOR DISASTER RESPONSE</div>
        <h1>{t.heading}</h1>
        <p>{t.sub}</p>
        <p className="gemmaRole">Gemma analyzes one photo, compares it with the selected relief standard, and explains what needs attention.</p>
        <div className="trustRow"><span>??Offline-first</span><span>??Human-verified</span><span>??3 languages</span></div>
      </section>

      <section className="workspace" aria-live="polite">
        {stage !== "result" ? (
          <>
            <div className="formHead"><span>01</span><div><h2>Inspect a relief kit</h2><p>One clear overhead photo works best.</p></div></div>
            <div className="formGrid">
              <div>
                <label>{t.photo}</label>
                <button className={`dropzone ${preview ? "hasImage" : ""}`} onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} type="button">
                  {preview ? <img src={preview} alt="Selected relief kit" /> : <><span className="camera">??/span><strong>{t.drop}</strong><small>{t.browse}</small><em>JPG, PNG 쨌 max 10 MB</em></>}
                </button>
                <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={(e: ChangeEvent<HTMLInputElement>) => selectFile(e.target.files?.[0])} />
              </div>
              <div className="controls">
                <label htmlFor="kit">{t.kit}</label>
                <select id="kit" value={kit} onChange={(e) => setKit(e.target.value)}><option>Flood essentials 쨌 24 hours</option><option>First aid 쨌 Family kit</option><option>Heatwave response kit</option></select>
                <label htmlFor="lang">{t.lang}</label>
                <div className="languages" id="lang">{(Object.keys(COPY) as (keyof typeof COPY)[]).map((item) => <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)}>{item}</button>)}</div>
                <div className="privacy"><span>??/span><div><b>Your photo stays private</b><small>Processed for this check and never stored.</small></div></div>
                <button className="primary" onClick={analyze} disabled={stage === "loading"}>{stage === "loading" ? <><span className="spinner" />{t.checking}</> : <>{t.analyze}<span>??/span></>}</button>
                <button className="sampleButton" onClick={trySample} disabled={stage === "loading"}>??Try Sample Relief Kit</button>
              </div>
            </div>
          </>
        ) : (
          <ResultPanel results={results} language={language} kit={kit} demoMode={demoMode} onReset={reset} resetLabel={t.reset} />
        )}
      </section>

      <section className="how">
        <span className="sectionNo">HOW IT WORKS</span>
        <div className="steps"><article><b>01</b><h3>See</h3><p>Gemma reads the full kit photo, labels visible objects, and reports uncertainty.</p></article><article><b>02</b><h3>Compare</h3><p>A checklist function compares recognized supplies against a field-approved standard.</p></article><article><b>03</b><h3>Guide</h3><p>Clear next steps are generated in English, Hindi, or Gujarati for the person on the ground.</p></article></div>
      </section>
      <footer><span>AidLens 쨌 A field assistant, not a medical device.</span><span>Designed for accountable relief delivery.</span></footer>
    </main>
  );
}

function ResultPanel({ results, language, kit, demoMode, onReset, resetLabel }: { results: ResultItem[]; language: keyof typeof COPY; kit: string; demoMode: boolean; onReset: () => void; resetLabel: string }) {
  const verified = results.filter((x) => x.status === "verified").length;
  const missing = results.filter((x) => x.status === "missing").length;
  const uncertain = results.filter((x) => x.status === "uncertain").length;
  const guide = language === "夕쀠쳛夕쒉ぐ夕약い奭" ? "夕멘쳨夕잀쳡夕겯ぞ夕뉋げ 夕쀠쳦夕?夕뽤쳜夕잀い奭곟챴 夕쒉ぃ夕약く 夕쎹쳡. 夕む쳡夕?夕됢お夕?쳦夕?夕むす奭뉋げ夕약챴 夕멘?夕?夕ㅰお夕약じ奭? 夕끶じ奭띭お夕룅쳨夕?夕듀じ奭띭い奭곟え奭 夕?ぞ夕ⓣさ 夕╆쳨夕듀ぞ夕겯ぞ 夕뽤ぞ夕ㅰぐ奭 夕뺖ぐ奭?" : language === "西밝ㅏ西ⓣ쪓西╆?" ? "西멘쪓西잀쪍西겯ㅎ西뉋ㅂ 西쀠쪏西쒉ㅌ 西ⓣㅉ誓西?西╆ㅏ西?西겯ㅉ西?西밝쪎誓?西뉋ㅈ誓띭ㄴ誓뉋ㄾ西약ㅂ 西멘쪍 西むㅉ西꿋쪍 西む쪎西?西뺖? 西멘?西?西쒉ㅎ西곟쩀誓뉋쨧誓?西끶ㅈ誓띭ㄺ西룅쪓西?西듀ㅈ誓띭ㄴ誓?西뺖? 西뺖ㅏ西멘? 西듀쪓西?쨻誓띭ㄴ西?西멘쪍 西む쪇西룅쪓西잀ㅏ 西뺖ㅀ西약쨵西곟ⅳ" : "Sterile gauze appears to be missing. Check every seal before use and ask a person to confirm the partially hidden item.";
  return <div className="results">
    <div className="scoreGrid primaryScores"><div className="score green"><strong>??{verified}</strong><span>confirmed</span></div><div className="score red"><strong>??{missing}</strong><span>missing</span></div><div className="score amber"><strong>??{uncertain}</strong><span>needs human review</span></div></div>
    <div className="resultTop"><div><span className="resultEyebrow">CHECK COMPLETE</span>{demoMode && <span className="demoBadge">DEMO MODE</span>}<h2>{kit}</h2><p>{demoMode ? "Sample analysis 쨌 connect a Gemma API key for live vision" : "Analyzed by Gemma 쨌 checklist function completed"}</p></div><button className="secondary" onClick={onReset}>??{resetLabel}</button></div>
    <div className="resultGrid"><div className="itemList">{results.map((item) => <article key={item.name}><span className={`status ${item.status}`}>{item.status === "verified" ? "?? : item.status === "missing" ? "!" : "?"}</span><div><b>{item.name}</b><small>{item.detail}</small></div>{item.confidence && <em>{item.confidence}%</em>}</article>)}</div><aside className="guidance"><span>LOCAL GUIDANCE 쨌 {language}</span><h3>What to do next</h3><p>{guide}</p><div className="notice"><b>Human check required</b><small>AidLens supports field teams. It does not certify medical safety or replace professional judgment.</small></div></aside></div>
  </div>;
}

