"use client";

import React, { useState, useEffect } from "react";
import PricingModal from "./PricingModal";

interface UploadCardProps {
  onStart: (originalBase64: string) => void;
  onSuccess: (generatedUrl: string, generatedUrls?: string[]) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  selectedStyle?: string;
  onStyleChange?: (style: string) => void;
}

const STYLES = [
  {
    id: "realtor_sales",
    label: "Realtor & Sales",
    desc: "Confident, bright, & trustworthy suit look for real estate agents & brokers.",
    image: "/api/demo-image/studio_after?v=us-global-v1",
  },
  {
    id: "tech_startup",
    label: "Tech & Founder",
    desc: "Sleek smart-casual blazer look for tech founders & engineers.",
    image: "/api/demo-image/smart_after?v=us-global-v1",
  },
  {
    id: "corporate_law",
    label: "Corporate & Law",
    desc: "Executive suit & tie look for attorneys & corporate executives.",
    image: "/api/demo-image/corporate_after?v=us-global-v1",
  },
  {
    id: "passport_visa",
    label: "Passport & Visa ID",
    desc: "Official US Passport & Visa standard ID photo with white background.",
    image: "/api/demo-image/passport_after?v=us-global-v1",
  },
];

export default function UploadCard({
  onStart,
  onSuccess,
  onError,
  isLoading,
  selectedStyle,
  onStyleChange,
}: UploadCardProps) {
  const [image, setImage] = useState<string | null>(null);
  const [style, setStyle] = useState<string>(selectedStyle || "realtor_sales");
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [byokKey, setByokKey] = useState<string>("");
  const [hasByok, setHasByok] = useState<boolean>(false);
  const [errorMessage, setLocalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStyle) {
      setStyle(selectedStyle);
    }
  }, [selectedStyle]);

  useEffect(() => {
    const savedKey = localStorage.getItem("proshot_byok");
    if (savedKey) {
      setByokKey(savedKey);
      setHasByok(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setLocalErrorMessage("Image size must not exceed 8MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLocalErrorMessage("Please upload a valid image file.");
      return;
    }

    setLocalErrorMessage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClick = () => {
    if (!image) return;
    setShowPricingModal(true);
  };

  const executeGenerate = async () => {
    if (!image) return;

    const usesStr = localStorage.getItem("proshot_uses") || "0";
    let uses = parseInt(usesStr, 10);

    if (!hasByok) {
      if (uses >= 2) {
        setShowLimitModal(true);
        return;
      }
    }

    onStart(image);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (hasByok && byokKey) {
        headers["x-fal-key"] = byokKey;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          imageBase64: image,
          style,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An unknown error occurred during generation.");
      }

      if (!hasByok) {
        uses += 1;
        localStorage.setItem("proshot_uses", uses.toString());
      }

      onSuccess(data.imageUrl, data.imageUrls || [data.imageUrl]);
    } catch (err: any) {
      onError(err.message || "Something went wrong.");
    }
  };

  const saveByokKey = () => {
    if (!byokKey.trim()) {
      alert("Please enter a valid API key.");
      return;
    }
    localStorage.setItem("proshot_byok", byokKey.trim());
    setHasByok(true);
    setShowLimitModal(false);
    alert("API Key saved! You now have unlimited generations.");
  };

  const removeByokKey = () => {
    localStorage.removeItem("proshot_byok");
    setByokKey("");
    setHasByok(false);
  };

  return (
    <div className="w-full max-w-xl bg-white/80 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-neutral-100/50 transition-all duration-300">
      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Upload Your Selfie
          </label>
          <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 hover:border-purple-400 rounded-2xl p-6 transition-colors duration-200 cursor-pointer bg-neutral-50/50">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            {image ? (
              <div className="relative w-36 h-48 rounded-2xl overflow-hidden shadow-md border border-neutral-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Selfie Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="text-sm font-medium text-neutral-700">
                  Click or drag to select a selfie
                </div>
                <div className="text-xs text-neutral-400">
                  JPEG, PNG (Up to 8MB)
                </div>
              </div>
            )}
          </div>
          {/* Micro Assurance */}
          <div className="flex items-center justify-center space-x-1.5 mt-2.5 text-[11px] text-neutral-500 font-medium bg-purple-50/50 py-1.5 px-3 rounded-lg border border-purple-100/50">
            <svg className="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Instant AI Face Match • Purged in 24h</span>
          </div>
          {errorMessage && (
            <p className="mt-2 text-xs text-red-500 font-medium">{errorMessage}</p>
          )}
        </div>

        {/* Style Selection */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            Select Style
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStyle(s.id);
                  onStyleChange?.(s.id);
                }}
                disabled={isLoading}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  style === s.id
                    ? "bg-purple-600/90 border-purple-400/60 text-white shadow-lg shadow-purple-600/25 scale-[1.02]"
                    : "bg-white/60 hover:bg-white/95 border-white/60 hover:border-purple-300/60 text-neutral-800 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${style === s.id ? "bg-white animate-pulse" : "bg-neutral-300 group-hover:bg-purple-400"}`} />
                  <span className="text-xs font-bold tracking-tight truncate">
                    {s.label}
                  </span>
                </div>
                {style === s.id && (
                  <svg className="w-3.5 h-3.5 text-white shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={!image || isLoading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
            !image
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : isLoading
              ? "bg-neutral-800 text-neutral-200 cursor-wait"
              : "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white hover:from-purple-500 hover:to-indigo-600 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-600/30"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating AI Headshots...</span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              <svg className={`w-4 h-4 text-purple-200 ${image ? "animate-pulse" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM14 2a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0V7h-2a1 1 0 110-2h2V3a1 1 0 011-1zm-4.707 9.293a1 1 0 010 1.414L7.414 14l1.879 1.879a1 1 0 11-1.414 1.414L6 15.414l-1.879 1.879a1 1 0 01-1.414-1.414L4.586 14l-1.879-1.879a1 1 0 011.414-1.414L6 12.586l1.879-1.879a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Generate AI Headshot</span>
            </span>
          )}
        </button>

        {/* BYOK Info Badge */}
        {hasByok && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-800">
            <div className="flex items-center space-x-1">
              <span className="font-semibold">BYOK Mode Active</span>
              <span className="text-[10px] text-purple-600">(Using your personal API Key)</span>
            </div>
            <button
              onClick={removeByokKey}
              className="text-purple-700 hover:underline hover:text-purple-950 font-medium"
            >
              Remove Key
            </button>
          </div>
        )}
      </div>

      {/* Free Limit / BYOK Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative border border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Free Trial Limit Reached (2/2 Used)
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              To manage server costs, free generations are limited to 2 per device. Choose an option below to continue.
            </p>

            <div className="space-y-6">
              {/* Option A: BYOK */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="inline-block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-2">
                  Option A: Use Your fal.ai API Key (BYOK)
                </span>
                <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                  Enter your personal key from fal.ai for unlimited generations at raw API cost. Your key is stored securely in your browser local storage.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="Enter FAL_KEY (FAL_...)"
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  <button
                    onClick={saveByokKey}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Option B: Paid Checkout (disabled) */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 opacity-60">
                <span className="inline-block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-2">
                  Option B: ProShot Package
                </span>
                <p className="text-xs text-neutral-500 mb-3">
                  Purchase a full credit pack with Stripe checkout.
                </p>
                <button
                  disabled
                  className="w-full py-2 bg-neutral-200 text-neutral-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
