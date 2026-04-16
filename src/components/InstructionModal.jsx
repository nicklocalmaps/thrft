import React, { useState } from 'react';

/**
 * InstructionModal
 *
 * Each slide can define an explicit tap zone via:
 *   tapTop    — CSS top value for the tap zone (e.g. '75%', '200px')
 *   tapBottom — CSS bottom value for the tap zone (e.g. '18%')
 *
 * If neither is provided, defaults to bottom: '18%'.
 */
export default function InstructionModal({ slides, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  };

  const slide = slides[currentSlide];

  // Two tap zones per slide:
  // Zone 1 (Next): top 5–15%
  // Zone 2 (Don't Show Again): top 20–25%
  const nextZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    top: slide.nextTop ?? '5%',
    height: '10%',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,0,0,0.3)',
  };

  const dismissZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    top: slide.dismissTop ?? '20%',
    height: '7%',
    cursor: 'pointer',
    backgroundColor: 'rgba(0,0,255,0.3)',
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
      {/* Next button zone (red) */}
      <div
        style={nextZoneStyle}
        onClick={handleNext}
        aria-label="Next"
      />
      {/* Don't Show Again zone (blue) */}
      <div
        style={dismissZoneStyle}
        onClick={() => onClose?.()}
        aria-label="Don't Show Again"
      />
    </div>
  );
}