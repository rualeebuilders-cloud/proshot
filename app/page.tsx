"use client";

import React, { useState } from "react";
import UploadCard from "./components/UploadCard";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import PricingModal from "./components/PricingModal";

type GenerationStep = "idle" | "generating" | "success" | "error";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What about copyright for AI-generated images?",
    answer: "You own 100% full ownership of all generated images. You are free to use them for commercial or personal purposes, including LinkedIn, resumes, corporate websites, and social media.",
  },
  {
    question: "How does it preserve my facial features accurately?",
    answer: "We utilize state-of-the-art identity encoding models (`flux-pulid`) powered by fal.ai. It preserves your unique facial structure from a single selfie without requiring lengthy training or model fine-tuning.",
  },
  {
    question: "Is my photo data secure?",
    answer: "Your privacy is our priority. Uploaded selfies and generated headshots are processed strictly for rendering and are never stored or used to train public AI models. Files are purged automatically.",
  },
  {
    question: "What happens after the free trial?",
    answer: "After 2 free trial generations, you can enter your personal fal.ai API Key (FAL_KEY) for unlimited BYOK generation at raw API cost, or purchase official credit packs once payments go live.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I used ProShot for my LinkedIn profile, and colleagues kept asking which professional studio I went to! Got a perfect suit shot in 30 seconds.",
    author: "Alex Kim",
    role: "Product Manager",
  },
  {
    quote: "Saved hundreds of dollars on hair, makeup, and studio bookings. Doing it from home in minutes is absolutely game-changing.",
    author: "Jessica Lee",
    role: "Freelance Designer",
  },
  {
    quote: "Needed a professional photo for job applications. The natural smart casual style turned out amazingly well!",
    author: "David Park",
    role: "Software Engineer",
  },
];

export default function Home() {
  const [step, setStep] = useState<GenerationStep>("idle");
  const [selectedStyle, setSelectedStyle] = useState<string>("realtor_sales");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0);
  const [selectedRatio, setSelectedRatio] = useState<"original" | "1:1" | "4:3" | "4:5">("original");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [selectedPricingPackage, setSelectedPricingPackage] = useState<string>("professional");

  const handleSelectStyle = (styleId: string) => {
    setSelectedStyle(styleId);
    const element = document.getElementById("upload-area");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStart = (originalBase64: string) => {
    setOriginalImage(originalBase64);
    setStep("generating");
    setErrorMsg(null);
  };

  const handleSuccess = (primaryUrl: string, allUrls?: string[]) => {
    const urls = allUrls && allUrls.length > 0 ? allUrls : [primaryUrl];
    setGeneratedImage(primaryUrl);
    setGeneratedImages(urls);
    setActiveVariantIndex(0);
    setStep("success");
  };

  const handleError = (error: string) => {
    setErrorMsg(error);
    setStep("error");
  };

  const handleReset = () => {
    setStep("idle");
    setOriginalImage(null);
    setGeneratedImage(null);
    setGeneratedImages([]);
    setErrorMsg(null);
  };

  const handleDownloadSingle = async (url: string, index: number, ratio: "original" | "1:1" | "4:3" | "4:5") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      if (ratio === "original") {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `proshot-variant-${index + 1}-hd.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      const blobUrl = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let targetW = img.naturalWidth;
        let targetH = img.naturalHeight;

        if (ratio === "1:1") {
          targetW = Math.min(img.naturalWidth, img.naturalHeight);
          targetH = targetW;
        } else if (ratio === "4:3") {
          targetW = img.naturalWidth;
          targetH = Math.round((img.naturalWidth * 3) / 4);
          if (targetH > img.naturalHeight) {
            targetH = img.naturalHeight;
            targetW = Math.round((img.naturalHeight * 4) / 3);
          }
        } else if (ratio === "4:5") {
          targetW = img.naturalWidth;
          targetH = Math.round((img.naturalWidth * 5) / 4);
          if (targetH > img.naturalHeight) {
            targetH = img.naturalHeight;
            targetW = Math.round((img.naturalHeight * 4) / 5);
          }
        }

        const startX = Math.round((img.naturalWidth - targetW) / 2);
        const startY = Math.round((img.naturalHeight - targetH) / 2);

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.drawImage(img, startX, startY, targetW, targetH, 0, 0, targetW, targetH);

        canvas.toBlob((croppedBlob) => {
          if (!croppedBlob) return;
          const croppedUrl = URL.createObjectURL(croppedBlob);
          const link = document.createElement("a");
          link.href = croppedUrl;
          link.download = `proshot-variant-${index + 1}-${ratio.replace(":", "x")}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(croppedUrl);
          URL.revokeObjectURL(blobUrl);
        }, "image/png");
      };

      img.src = blobUrl;
    } catch (err) {
      console.error("Download error:", err);
      window.open(url, "_blank");
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 text-neutral-900 font-sans">
      {/* Header / Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ProShot</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            2 Free Trial Credits Left
          </div>
        </div>
      </header>

      {/* Hero Section / Main Interface */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center">
        <div className="space-y-5 max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
            ✨ Powered by Flux-PuLID Studio AI
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-neutral-900">
            Get Perfect AI Headshots<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600">
              From a Single Selfie
            </span>
          </h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium">
            No studio booking. No makeup needed. Receive high-resolution executive LinkedIn & corporate headshots in 30 seconds.
          </p>
        </div>

        {/* Compact Centered Before/After Showcase */}
        {step === "idle" && (
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-4 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 max-w-lg mx-auto mb-8">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Before</span>
                <div className="w-[90px] md:w-[105px] aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                  <img src="/api/demo-image/corporate_before?v=corporate-optical-v1" alt="Before Selfie" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-purple-500 shrink-0 pt-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">After</span>
                <div className="w-[90px] md:w-[105px] aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-purple-200">
                  <img src="/api/demo-image/corporate_after?v=corporate-optical-v1" alt="After Professional" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left pl-2">
                <h4 className="text-xs font-bold text-neutral-800">100% Face Match</h4>
                <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed mt-1">
                  Transforms casual bedroom selfies into stunning corporate headshots instantly.
                </p>
              </div>
            </div>

            {/* 3-Step Instruction Guide (Compact Centered Row) */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest text-center">How it works</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-white border border-neutral-100 rounded-xl w-[130px] md:w-[160px]">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mb-1.5">1</span>
                  <h4 className="text-xs font-bold text-neutral-800 mb-0.5">Upload</h4>
                  <p className="text-[11px] text-neutral-500 leading-tight">Casual selfie</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white border border-neutral-100 rounded-xl w-[130px] md:w-[160px]">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mb-1.5">2</span>
                  <h4 className="text-xs font-bold text-neutral-800 mb-0.5">Select</h4>
                  <p className="text-[11px] text-neutral-500 leading-tight">Pick style</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white border border-neutral-100 rounded-xl w-[130px] md:w-[160px]">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mb-1.5">3</span>
                  <h4 className="text-xs font-bold text-neutral-800 mb-0.5">Download</h4>
                  <p className="text-[11px] text-neutral-500 leading-tight">AI Headshot</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Display Area */}
        <div id="upload-area" className="w-full flex justify-center mb-24 scroll-mt-10">
          {step === "idle" && (
            <UploadCard
              onStart={handleStart}
              onSuccess={handleSuccess}
              onError={handleError}
              isLoading={false}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
          )}

          {step === "generating" && (
            <div className="w-full max-w-md bg-white border border-neutral-100 rounded-3xl p-8 shadow-2xl flex flex-col items-center mx-auto transition-all animate-in fade-in zoom-in duration-300">
              <div className="w-full flex flex-col items-center mb-6">
                {/* Original Selfie Preview during loading */}
                <div className="relative w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-purple-200 mb-6 bg-neutral-900 group">
                  {originalImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent flex items-end justify-center pb-2">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase bg-purple-600/80 backdrop-blur-md px-2 py-0.5 rounded-full">
                      Processing Face
                    </span>
                  </div>
                  {/* Scanning Laser Line Effect */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#a855f7] animate-bounce" style={{ top: '40%' }}></div>
                </div>

                {/* Animated Spinner & Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <h3 className="text-base font-black text-neutral-900">Crafting Studio AI Headshot</h3>
                </div>

                {/* Dynamic Step-by-Step Progress Bar */}
                <div className="w-full bg-neutral-100 rounded-full h-2 mb-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full animate-[pulse_1.5s_infinite] w-4/5 transition-all duration-1000"></div>
                </div>

                <div className="space-y-1.5 text-center">
                  <p className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 inline-block">
                    ✨ Preserving Facial Identity & Studio Lighting...
                  </p>
                  <p className="text-[11px] text-neutral-400 block pt-1">
                    Generating 2 Ultra-HD 8K Variants (~15–20s)
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="w-full max-w-xl bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-500 relative overflow-hidden mx-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-purple-500/10 blur-[80px] pointer-events-none" />

              <div className="text-center mb-6">
                <span className="text-[10px] font-extrabold tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-100/60">
                  Generation Complete
                </span>
                <h3 className="text-xl font-black text-neutral-900 mt-2">
                  2 Professional Headshot Variants Ready
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Compare both styles below and download your preferred headshots
                </p>
              </div>

              {/* Variant Selector Tabs */}
              {generatedImages.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {generatedImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVariantIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        activeVariantIndex === idx
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]"
                          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {idx === 0 ? "Variant 1 (Classic Tone)" : "Variant 2 (Modern Light)"}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center justify-center mb-6">
                <p className="text-[11px] font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                  Drag slider to compare Before & After
                </p>
                {originalImage && (
                  <BeforeAfterSlider
                    beforeImage={originalImage}
                    afterImage={generatedImages[activeVariantIndex] || generatedImages[0]}
                  />
                )}
              </div>

              {/* Aspect Ratio Cropper Options */}
              <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-100/80 text-center">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Select Output Format / Aspect Ratio
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "original", label: "Full HD (Original)" },
                    { id: "1:1", label: "1:1 Square (LinkedIn)" },
                    { id: "4:3", label: "4:3 Portrait (Resume)" },
                    { id: "4:5", label: "4:5 Portrait (Social)" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRatio(r.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 border ${
                        selectedRatio === r.id
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-sm scale-[1.02]"
                          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleDownloadSingle(generatedImages[activeVariantIndex] || generatedImages[0], activeVariantIndex, selectedRatio)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download {selectedRatio === "original" ? "Full HD" : selectedRatio} PNG</span>
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition-all"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="w-full max-w-md bg-white border border-red-100 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center mx-auto">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">Generation Failed</h3>
              <p className="text-xs text-red-600 mb-5 font-medium bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                {errorMsg || "An unexpected error occurred."}
              </p>
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Visual 4-Style Showcase Grid (Placed FIRST above Upload) */}
        {step === "idle" && (
          <div className="w-full max-w-6xl mb-12">
            <div className="text-center mb-8">
              <span className="text-[11px] font-extrabold tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-100/60">
                Visual Showcase
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mt-3">
                Explore 4 Premium AI Headshot Styles
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5">
                Click any style card below to select it & upload your selfie
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 px-2">
              {/* Realtor & Sales */}
              <div
                onClick={() => handleSelectStyle("realtor_sales")}
                className={`flex flex-col text-left group cursor-pointer transition-all duration-300 p-2.5 rounded-3xl ${
                  selectedStyle === "realtor_sales"
                    ? "bg-purple-50/50 ring-2 ring-purple-500 shadow-md"
                    : "hover:bg-neutral-50/50"
                }`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-neutral-200/70 bg-neutral-100 transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.015]">
                  <img src="/api/demo-image/studio_after?v=aurafix-v9" alt="Realtor & Sales" className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src="/api/demo-image/studio_before?v=aurafix-v7" alt="Original Selfie" className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-extrabold text-neutral-900">Realtor & Sales</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                      selectedStyle === "realtor_sales" ? "bg-purple-600 text-white border-purple-600" : "bg-amber-500/10 border-amber-200/60 text-amber-700"
                    }`}>
                      {selectedStyle === "realtor_sales" ? "Selected" : "Realtor"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Bright, confident & trustworthy suit look for real estate & sales pros.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Residential</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Commercial</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Broker</span>
                  </div>
                </div>
              </div>

              {/* Tech & Founder */}
              <div
                onClick={() => handleSelectStyle("tech_startup")}
                className={`flex flex-col text-left group cursor-pointer transition-all duration-300 p-2.5 rounded-3xl ${
                  selectedStyle === "tech_startup"
                    ? "bg-purple-50/50 ring-2 ring-purple-500 shadow-md"
                    : "hover:bg-neutral-50/50"
                }`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-neutral-200/70 bg-neutral-100 transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.015]">
                  <img src="/api/demo-image/smart_after?v=smart-optical-v1" alt="Tech & Founder" className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src="/api/demo-image/smart_before?v=smart-optical-v1" alt="Original Selfie" className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-extrabold text-neutral-900">Tech & Founder</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                      selectedStyle === "tech_startup" ? "bg-purple-600 text-white border-purple-600" : "bg-indigo-500/10 border-indigo-200/60 text-indigo-700"
                    }`}>
                      {selectedStyle === "tech_startup" ? "Selected" : "Tech Founder"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Sleek smart-casual blazer look for founders, software engineers & PMs.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Founder</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Engineer</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">PM</span>
                  </div>
                </div>
              </div>

              {/* Corporate & Law */}
              <div
                onClick={() => handleSelectStyle("corporate_law")}
                className={`flex flex-col text-left group cursor-pointer transition-all duration-300 p-2.5 rounded-3xl ${
                  selectedStyle === "corporate_law"
                    ? "bg-purple-50/50 ring-2 ring-purple-500 shadow-md"
                    : "hover:bg-neutral-50/50"
                }`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-neutral-200/70 bg-neutral-100 transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.015]">
                  <img src="/api/demo-image/corporate_after?v=corporate-optical-v1" alt="Corporate & Law" className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src="/api/demo-image/corporate_before?v=corporate-optical-v1" alt="Original Selfie" className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-extrabold text-neutral-900">Corporate & Law</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                      selectedStyle === "corporate_law" ? "bg-purple-600 text-white border-purple-600" : "bg-purple-500/10 border-purple-200/60 text-purple-700"
                    }`}>
                      {selectedStyle === "corporate_law" ? "Selected" : "Lawyer / Exec"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Executive suit & tie look for attorneys, finance leaders & corporate VPs.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Attorney</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Finance</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Executive</span>
                  </div>
                </div>
              </div>

              {/* Passport & Visa ID */}
              <div
                onClick={() => handleSelectStyle("passport_visa")}
                className={`flex flex-col text-left group cursor-pointer transition-all duration-300 p-2.5 rounded-3xl ${
                  selectedStyle === "passport_visa"
                    ? "bg-purple-50/50 ring-2 ring-purple-500 shadow-md"
                    : "hover:bg-neutral-50/50"
                }`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-neutral-200/70 bg-neutral-100 transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.015]">
                  <img src="/api/demo-image/passport_after?v=us-global-v1" alt="Passport & Visa ID" className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src="/api/demo-image/passport_before?v=us-global-v1" alt="Original Selfie" className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-extrabold text-neutral-900">Passport & Visa</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                      selectedStyle === "passport_visa" ? "bg-purple-600 text-white border-purple-600" : "bg-emerald-500/10 border-emerald-200/60 text-emerald-700"
                    }`}>
                      {selectedStyle === "passport_visa" ? "Selected" : "Official ID"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Official US Passport & Visa standard ID photos with white backdrop.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">Passport</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">US Visa</span>
                    <span className="text-[9px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">ID Card</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 20+ Additional Roles Supported Banner */}
            <div className="mt-8 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-neutral-700">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                20+ Industry Roles Supported:
              </span>
              <span className="text-neutral-400">Consultant, Healthcare, Educator, Author, Recruiter & more.</span>
            </div>
          </div>
        )}

        {/* Pricing Packages Section */}
        <section id="pricing" className="w-full max-w-5xl py-16 border-t border-neutral-100">
          <div className="text-center mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-100/60">
              Simple Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-neutral-900 mt-3">
              Choose Your AI Headshot Package
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 mt-1.5">
              One-time payment. No monthly subscription. Instant download.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Starter Pack */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Starter Pack</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-neutral-900">$9.99</span>
                  <span className="text-xs text-neutral-400">/ one-time</span>
                </div>
                <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                  Perfect for a quick single headshot update for your LinkedIn or Resume.
                </p>
                <ul className="space-y-3 text-xs text-neutral-700 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span><strong>4 HD Headshot Variants</strong> (2 Generations)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>Full HD Resolution PNGs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>1:1 Square & 4:3 Crop Included</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setSelectedPricingPackage("starter");
                  setShowPricing(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl border border-neutral-300 text-neutral-800 font-bold text-xs hover:bg-neutral-50 transition-colors text-center"
              >
                Get Starter Pack
              </button>
            </div>

            {/* Professional Pack - Featured */}
            <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-2xl relative flex flex-col justify-between scale-[1.03]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                Most Popular 🌟
              </div>
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">Professional Pack</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">$19.99</span>
                  <span className="text-xs text-neutral-400">/ one-time</span>
                </div>
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  Best value for realtors, tech founders & executives needing complete profile suits.
                </p>
                <ul className="space-y-3 text-xs text-neutral-300 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span><strong>10 HD Headshot Variants</strong> (5 Generations)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>All 4 Aspect Ratios (LinkedIn, Resume, Social, HD)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>Commercial & Licensing Rights Included</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setSelectedPricingPackage("professional");
                  setShowPricing(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30 text-center"
              >
                Get Professional Pack
              </button>
            </div>

            {/* Executive Pack */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Executive Pack</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-neutral-900">$39.99</span>
                  <span className="text-xs text-neutral-400">/ one-time</span>
                </div>
                <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                  Ideal for team branding, multi-outfit executive suites & full media kits.
                </p>
                <ul className="space-y-3 text-xs text-neutral-700 font-medium mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span><strong>24 HD Headshot Variants</strong> (12 Generations)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>Priority AI Processing Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span>Dedicated Priority Support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setSelectedPricingPackage("executive");
                  setShowPricing(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl border border-neutral-300 text-neutral-800 font-bold text-xs hover:bg-neutral-50 transition-colors text-center"
              >
                Get Executive Pack
              </button>
            </div>
          </div>
        </section>

        {/* Unit Economics Pass */}
        <section className="w-full max-w-4xl py-12 border-t border-neutral-100">
          <span className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase">
            Unit Economics
          </span>
          <h2 className="text-2xl font-bold text-neutral-800 mt-2 mb-8">
            $0.04 Cost per Generation. $19 Pack. 90%+ Profit Margins.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100/70">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Package Price</span>
              <span className="text-2xl font-black text-neutral-800">$19.00</span>
              <span className="text-[11px] text-neutral-400 block mt-1">For 20 AI Headshots</span>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100/70">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">AI Generation Cost</span>
              <span className="text-2xl font-black text-neutral-800">~$0.80</span>
              <span className="text-[11px] text-neutral-400 block mt-1">$0.04 × 20 images</span>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100/70">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Payment Fee</span>
              <span className="text-2xl font-black text-neutral-850">~$0.63</span>
              <span className="text-[11px] text-neutral-400 block mt-1">Stripe fee ~3.3%</span>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <span className="text-xs text-purple-800/80 font-semibold block mb-1">Net Margin</span>
              <span className="text-2xl font-black text-purple-600">92%+</span>
              <span className="text-[11px] text-purple-700/85 block mt-1">~$17.57 Net Profit / Sale</span>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full max-w-4xl py-16 border-t border-neutral-100">
          <span className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl font-black text-neutral-900 mt-2 mb-12">
            Trusted by Professionals Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-6 bg-white border border-neutral-100 rounded-2xl text-left shadow-sm flex flex-col justify-between">
                <p className="text-sm text-neutral-600 italic leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{t.author}</h4>
                  <span className="text-xs text-neutral-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-3xl py-16 border-t border-neutral-100 text-left">
          <div className="text-center mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-neutral-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-neutral-100 bg-white rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm md:text-base hover:bg-neutral-50/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-neutral-400 transform transition-transform duration-200 ${openFaqIndex === idx ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${openFaqIndex === idx ? "max-h-[500px] border-t border-neutral-50 px-6 py-5" : "max-h-0"
                    }`}
                >
                  <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-10 bg-neutral-50/50 text-center">
        <p className="text-xs text-neutral-400 font-semibold tracking-wider">
          PROSHOT &mdash; GLOBAL AI BUSINESS BUILDERS
        </p>
      </footer>

      {showPricing && (
        <PricingModal 
          onClose={() => setShowPricing(false)} 
          onSuccess={() => setShowPricing(false)} 
          initialPackageId={selectedPricingPackage}
        />
      )}
    </div>
  );
}
