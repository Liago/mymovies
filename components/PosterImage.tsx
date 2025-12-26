"use client";

import { useState, useEffect } from "react";
import { X, Maximize2, ZoomIn } from "lucide-react";

interface PosterImageProps {
  src: string;
  alt: string;
}

export default function PosterImage({ src, alt }: PosterImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const openModal = () => setIsOpen(true);
  const closeModal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
  };

  // High-res image logic: try to get 'original' if it's a tmdb image
  const highResSrc = src.includes("w500") 
    ? src.replace("w500", "original") 
    : src;

  return (
    <>
      {/* Trigger Image */}
      <div 
        className="relative w-full h-full cursor-zoom-in group"
        onClick={openModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Hover Overlay with Icon */}
        <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
          <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
             <ZoomIn className="text-white w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Modal Portal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
            
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 md:-right-12 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X size={32} />
            </button>

            {/* Image */}
            <img
              src={highResSrc}
              alt={alt}
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-black/50 select-none"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            />
          </div>
        </div>
      )}
    </>
  );
}
