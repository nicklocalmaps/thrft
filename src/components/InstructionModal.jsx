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

  const tapZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: '9%',
    cursor: 'pointer',
    // Debug tap zone — remove when done tuning:
    backgroundColor: 'rgba(255,0,0,0.3)',
  };

  // Determine vertical placement
  const positionStyle = slide.tapTop !== undefined
    ? { top: slide.tapTop }
    : { bottom: slide.tapBottom ?? '18%' };

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
      <div
        style={{ ...tapZoneStyle, ...positionStyle }}
        onClick={handleNext}
        aria-label="Next"
      />
    </div>
  );
}