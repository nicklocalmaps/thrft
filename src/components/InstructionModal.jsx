import React, { useState } from 'react';

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

  return (
    <>
      <style>{`
        .instruction-modal-overlay {
          display: block;
        }
        @media (min-width: 768px) {
          .instruction-modal-overlay {
            display: none !important;
          }
        }
      `}</style>
      <div className="instruction-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
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
          onClick={handleNext}
          style={{
            position: 'absolute',
            left: '5%',
            width: '90%',
            top: slide.nextTop ?? '5%',
            height: '10%',
            cursor: 'pointer',
          }}
        />
        <div
          onClick={() => onClose?.()}
          style={{
            position: 'absolute',
            left: '5%',
            width: '90%',
            top: slide.dismissTop ?? '20%',
            height: '10%',
            cursor: 'pointer',
          }}
        />
      </div>
    </>
  );
}