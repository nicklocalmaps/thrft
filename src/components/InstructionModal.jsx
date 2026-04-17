import React, { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      // Also check user agent to catch tablets that report narrow widths
      const ua = navigator.userAgent.toLowerCase();
      const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(ua);
      setIsMobile(width < 768 && !isTablet);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function InstructionModal({ slides, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();

  // Only show on mobile phones, not tablets or desktops
  if (!isMobile) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  };

  const slide = slides[currentSlide];

  const nextZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    top: slide.nextTop ?? '5%',
    height: '10%',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  };

  const dismissZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    top: slide.dismissTop ?? '20%',
    height: '10%',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <img
        key={slide.imageUrl}
        src={slide.imageUrl}
        alt="Instruction"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top',
        }}
      />
      <div style={nextZoneStyle} onClick={handleNext} aria-label="Next" />
      <div style={dismissZoneStyle} onClick={() => onClose?.()} aria-label="Don't Show Again" />
    </div>
  );
}