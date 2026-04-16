import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function InstructionModal({ instructionKey, slides, onClose, headerOffset = 0 }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  };

  const slide = slides[currentSlide];
  const buttonPosition = slide.buttonPosition || 'bottom';

  // Tap zone covers the "Next" button drawn in the image.
  // For 'top' positions, we offset from the top of the image (below any header).
  // For 'bottom' positions, we offset from the bottom of the viewport.
  const tapZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: '9%',
    cursor: 'pointer',
    // Uncomment to debug:
    // backgroundColor: 'rgba(255,0,0,0.3)',
  };

  const nextTapStyle = {
    ...tapZoneStyle,
    ...(buttonPosition === 'bottom'
      ? { bottom: '18%' }
      : { top: `calc(${headerOffset}px + 2%)` }),
  };

  const dontShowTapStyle = {
    ...tapZoneStyle,
    ...(buttonPosition === 'bottom'
      ? { bottom: '9%' }
      : { top: `calc(${headerOffset}px + 11%)` }),
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Full-screen image */}
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

      {/* Invisible tap zones over the drawn buttons */}
      <div style={nextTapStyle} onClick={handleNext} aria-label="Next" />
      <div style={dontShowTapStyle} onClick={onClose} aria-label="Close" />
    </div>
  );
}