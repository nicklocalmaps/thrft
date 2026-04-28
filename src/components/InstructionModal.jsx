import React, { useState } from 'react';

/**
 * InstructionModal
 * Slideshow overlay for page-specific instructions.
 * Uses localStorage keyed by `instructionKey` to remember dismissal
 * permanently — so "Don't Show Again" actually works across sessions.
 */
export default function InstructionModal({ slides, onClose, instructionKey }) {
  const storageKey = instructionKey ? `thrft_instructions_dismissed_${instructionKey}` : null;

  // If already dismissed, don't render at all
  const alreadyDismissed = storageKey
    ? localStorage.getItem(storageKey) === 'true'
    : false;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(!alreadyDismissed);

  if (!visible) return null;

  const handleDismiss = () => {
    if (storageKey) {
      try { localStorage.setItem(storageKey, 'true'); } catch (_) {}
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

  const slide = slides[currentSlide];

  return (
    <>
      <style>{`
        .instruction-modal-overlay {
          display: block;
        }
        @media (min-width: 431px) {
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
            position:       'absolute',
            inset:          0,
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'top',
          }}
        />
        {/* Next / advance tap zone */}
        <div
          onClick={handleNext}
          style={{
            position: 'absolute',
            left:     '5%',
            width:    '90%',
            top:      slide.nextTop ?? '5%',
            height:   '10%',
            cursor:   'pointer',
          }}
        />
        {/* Dismiss / Don't Show Again tap zone */}
        <div
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            left:     '5%',
            width:    '90%',
            top:      slide.dismissTop ?? '20%',
            height:   '10%',
            cursor:   'pointer',
          }}
        />
      </div>
    </>
  );
}