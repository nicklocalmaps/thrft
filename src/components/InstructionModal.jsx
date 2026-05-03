import React, { useState, useEffect } from 'react';

const STORAGE_PREFIX = 'thrft_instructions_dismissed_';

export default function InstructionModal({ slides, instructionKey, onClose }) {
  const [visible, setVisible]           = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!instructionKey) { setVisible(true); return; }
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${instructionKey}`);
    if (!dismissed) setVisible(true);
  }, [instructionKey]);

  const handleDismiss = () => {
    if (instructionKey) {
      localStorage.setItem(`${STORAGE_PREFIX}${instructionKey}`, 'true');
    }
    setVisible(false);
    onClose?.();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleDismiss();
    }
  };

  if (!visible || !slides?.length) return null;

  const slide = slides[currentSlide];

  return (
    <>
      <style>{`
        .instruction-modal-overlay { display: block; }
        @media (min-width: 431px) {
          .instruction-modal-overlay { display: none !important; }
        }
      `}</style>
      <div className="instruction-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <img
          key={slide.imageUrl}
          src={slide.imageUrl}
          alt="Willie instruction slide"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
        <div onClick={handleNext} style={{ position: 'absolute', left: '5%', width: '90%', top: slide.nextTop ?? '5%', height: '10%', cursor: 'pointer' }} />
        <div onClick={handleDismiss} style={{ position: 'absolute', left: '5%', width: '90%', top: slide.dismissTop ?? '20%', height: '10%', cursor: 'pointer' }} />
      </div>
    </>
  );
}