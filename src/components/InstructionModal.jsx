import React, { useState } from 'react';

export default function InstructionModal({ slides, onClose, headerOffset = 0 }) {
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
      <div style={nextTapStyle} onClick={handleNext} aria-label="Next" />
    </div>
  );
}