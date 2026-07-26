"use client";

import React, { useState, useRef, useEffect } from "react";

interface Props {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden cursor-ew-resize shadow-2xl group border border-white/20"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <img src={afterImage} alt="After" className="w-full h-full object-cover pointer-events-none" />
      </div>

      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={beforeImage} alt="Before" className="w-full h-full object-cover pointer-events-none" />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center transition-all"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-4 h-4 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l-4 4 4 4m8-8l4 4-4 4" />
          </svg>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        원본
      </div>
      <div className="absolute top-4 right-4 bg-purple-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        AI 헤드샷
      </div>
    </div>
  );
}
