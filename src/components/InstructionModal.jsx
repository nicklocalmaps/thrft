import React, { useState, useEffect } from 'react';

function isActualMobileDevice() {
  // window.screen.width is the PHYSICAL screen width, unaffected by iframe sizing
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const smallerDimension = Math.min(screenWidth, screenHeight);

  // User agent check for tablets and non-phone devices
  const ua = navigator.userAgent.toLowerCase();
  const isTabletUA = /ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua));

  // Touch check — phones have touch but so do tablets, so combine with screen size
  const isSmallScreen = smallerDimension < 480;

  return isSmallScreen && !isTabletUA;
}

export default function InstructionModal({ slides, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isActualMobileDevice());
  }, []);

  if (!show) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
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
      {/* Next zone */}
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
      {/* Dismiss zone */}
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
  );
}