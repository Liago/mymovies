"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export default function BackButton({ 
  fallbackHref = "/discovery", 
  label = "Back to Discovery" 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if we can go back. 
    // Since we can't reliably check history length in all environments,
    // and specifically ensuring we go 'back' if possible is the goal:
    // We try router.back().
    // Note: If opened in a new tab, router.back() does nothing.
    // Ideally we would detect this, but for now router.back() is the best proxy for "return to results".
    
    // Simple heuristic: if referrer exists and is same origin, go back.
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.origin)) {
       router.back();
    } else {
       router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
      type="button"
    >
      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
