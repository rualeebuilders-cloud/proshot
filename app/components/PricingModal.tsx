"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, Check } from "lucide-react";

interface PricingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    price: "4.99",
    features: [
      "1 Professional AI Headshot",
      "High-Resolution Download",
      "Standard Priority Generation",
    ],
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: "9.99",
    features: [
      "4 Different Variations",
      "4K Ultra-HD Downloads",
      "Priority Queue Generation",
      "All Background Colors",
    ],
    recommended: true,
  },
];

export default function PricingModal({ onClose, onSuccess }: PricingModalProps) {
  const [selectedPack, setSelectedPack] = useState(PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);

  // We use "test" for the sandbox environment clientId during development.
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
          {/* Left: Pricing Options */}
          <div className="w-full md:w-3/5 p-8 md:p-12 bg-neutral-50">
            <h2 className="text-3xl font-black text-neutral-900 mb-2">Get Your High-Res AI Headshots</h2>
            <p className="text-neutral-500 mb-6 text-sm">
              One-time payment. No subscription. Money-back guarantee if not 100% satisfied.
            </p>

            <div className="space-y-4">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPack(pkg)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPack.id === pkg.id
                      ? "border-purple-600 bg-purple-50/60 shadow-md"
                      : "border-neutral-200 bg-white hover:border-purple-300"
                  }`}
                >
                  {pkg.recommended && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Best Value
                    </span>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-lg font-extrabold ${selectedPack.id === pkg.id ? "text-purple-950" : "text-neutral-900"}`}>
                      {pkg.name}
                    </h3>
                    <div className="text-2xl font-black text-neutral-900">
                      ${pkg.price}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs font-medium text-neutral-700">
                        <Check className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-neutral-200/60 font-medium">
              <span className="flex items-center gap-1">
                🔒 256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                ⚡ Instant 30s Delivery
              </span>
              <span className="flex items-center gap-1">
                🚫 No Subscription
              </span>
            </div>
          </div>

          {/* Right: Payment Gateway */}
          <div className="w-full md:w-2/5 p-8 md:p-12 bg-white flex flex-col justify-between border-l border-neutral-100">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Order Summary</h3>
              <div className="flex justify-between text-neutral-600 text-sm mb-2">
                <span>{selectedPack.name}</span>
                <span>${selectedPack.price}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xl text-neutral-900 border-t border-neutral-100 pt-4 mt-4">
                <span>Total</span>
                <span>${selectedPack.price} USD</span>
              </div>
            </div>

            <div className="relative min-h-[150px] my-6">
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 rounded-xl">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-bold text-purple-900">Unlocking HD Downloads...</p>
                </div>
              )}
              
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  style={{ layout: "vertical", shape: "rect", color: "blue" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          description: `ProShot AI - ${selectedPack.name}`,
                          amount: {
                            currency_code: "USD",
                            value: selectedPack.price,
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    setIsProcessing(true);
                    return actions.order!.capture().then(() => {
                      setTimeout(() => {
                        setIsProcessing(false);
                        onSuccess();
                      }, 1200);
                    });
                  }}
                  onError={(err) => {
                    console.error("PayPal Checkout onError", err);
                    alert("Payment cancelled or sandbox test error.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
            
            <div className="text-[11px] text-center text-neutral-400 space-y-1">
              <p className="font-semibold text-neutral-600">Safe & Secure PayPal Checkout</p>
              <p>One-time charge. No recurring fees ever.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
