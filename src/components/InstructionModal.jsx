import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function InstructionModal({ instructionKey, slides, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDismissal = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.[`instruction_${instructionKey}_dismissed`]) {
          setDismissed(true);
        }
      } catch (err) {
        // not logged in or error — still show
      } finally {
        setLoading(false);
      }
    };
    checkDismissal();
  }, [instructionKey]);

  const handleDontShowAgain = async () => {
    try {
      await base44.auth.updateMe({ [`instruction_${instructionKey}_dismissed`]: true });
    } catch (err) {
      // ignore
    }
    setDismissed(true);
    onClose?.();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  };

  if (loading || dismissed) return null;

  const slide = slides[currentSlide];
  // buttonPosition: 'top' | 'bottom' — defaults to 'bottom'
  const buttonPosition = slide.buttonPosition || 'bottom';

  // Tap zone height as % of screen for each button
  // Next button is always above Don't Show Again
  const tapZoneStyle = {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: '8%',
    cursor: 'pointer',
    // uncomment below to debug tap zones:
    // backgroundColor: 'rgba(255,0,0,0.3)',
  };

  const nextTapStyle = {
    ...tapZoneStyle,
    ...(buttonPosition === 'bottom'
      ? { bottom: '18%' }
      : { top: '4%' }),
  };

  const dontShowTapStyle = {
    ...tapZoneStyle,
    ...(buttonPosition === 'bottom'
      ? { bottom: '9%' }
      : { top: '13%' }),
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Full-screen image */}
      <img
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
      <div style={dontShowTapStyle} onClick={handleDontShowAgain} aria-label="Don't Show Again" />
    </div>
  );
}