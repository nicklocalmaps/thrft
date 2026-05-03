/**
 * WillieSlideshow
 *
 * Replaces InstructionModal entirely.
 * - Real visible Next and Don't Show Again buttons
 * - Blue highlight ring points to the relevant UI element
 * - Willie (warm pages) or Robot (technical pages) character
 * - Character position adapts: bottom (pointing up) or middle (pointing down)
 * - localStorage "Don't Show Again" per instructionKey
 * - Slide dot progress indicator
 * - Fully responsive — no hardcoded tap zones
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_PREFIX = 'thrft_slideshow_dismissed_';

const WILLIE_IMAGES = {
  pointing_down:  'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/1112f5f36_image1_edited.png',
  pointing_up:    'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/48a1b8e55_OwlCharacterPointingUp_edited1.png',
  pointing_left:  'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/3315afd48_OwlCharacterPointingUp_edited.png',
  both_arms:      'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/d3f9fbead_THRFTowlcharacterbotharms_edited.png',
  pointing_right: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/64cf1c020_THRFTowlcharacterpointing_edited.png',
  thumbs:         'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/46ef34dc0_THRFTowlcharacterthumbs_edited.png',
  waving:         'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/5f17ab451_THRFTOwlCharacterWavingUp_edited.png',
  main:           'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/192bc5a90_THRFTowlmain_edited.png',
  reading:        'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/192bc5a90_THRFTowlmain_edited.png',
};

const ROBOT_IMAGES = {
  robot:     'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/af3825e2a_image8.jpg',
  robot_bag: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/7fe6fecc0_image7.jpg',
};

const ALL_IMAGES = { ...WILLIE_IMAGES, ...ROBOT_IMAGES };

function Arrow({ direction }) {
  if (direction === 'none' || !direction) return null;
  const isUp = direction === 'up';
  return (
    <svg width="24" height="40" viewBox="0 0 24 40" style={{ display: 'block' }}>
      <defs>
        <marker id="ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <polygon
            points={isUp ? '0,10 5,0 10,10' : '0,0 5,10 10,0'}
            fill="#4181ed"
          />
        </marker>
      </defs>
      <line
        x1="12" y1={isUp ? 36 : 4}
        x2="12" y2={isUp ? 8 : 32}
        stroke="#4181ed"
        strokeWidth="2.5"
        markerEnd="url(#ah)"
      />
    </svg>
  );
}

function HighlightRing({ top, height = '52px' }) {
  if (!top) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 12,
        right: 12,
        height,
        borderRadius: 12,
        border: '2.5px solid #4181ed',
        background: 'rgba(65,129,237,0.1)',
        boxShadow: '0 0 0 4px rgba(65,129,237,0.15)',
        zIndex: 11,
        pointerEvents: 'none',
      }}
    />
  );
}

function CharacterCard({ slide, onNext, onDismiss, isLast }) {
  const imgSrc = ALL_IMAGES[slide.pose] || WILLIE_IMAGES.main;
  const name = slide.character === 'robot'
    ? 'THRFT Robot'
    : 'Willie the Wise Savings Owl';

  const isBottom = slide.characterPosition !== 'center';
  const arrowDir = slide.arrowDirection || 'none';

  return (
    <div
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: isBottom ? 80 : undefined,
        top: !isBottom ? '50%' : undefined,
        transform: !isBottom ? 'translateY(-50%)' : undefined,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {arrowDir === 'up' && (
        <div style={{ alignSelf: 'center' }}>
          <Arrow direction="up" />
        </div>
      )}

      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '14px 14px 14px 12px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          width: '100%',
        }}
      >
        <img
          src={imgSrc}
          alt={name}
          style={{ width: 76, height: 76, objectFit: 'contain', flexShrink: 0 }}
          onError={e => { e.target.style.opacity = '0.3'; }}
        />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#4181ed', marginBottom: 4 }}>
            {name}
          </p>
          <p style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.55 }}>
            {slide.message}
          </p>
        </div>
      </div>

      {arrowDir === 'down' && (
        <div style={{ alignSelf: 'center' }}>
          <Arrow direction="down" />
        </div>
      )}
    </div>
  );
}

export default function WillieSlideshow({ slides = [], instructionKey, onClose }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!instructionKey) { setVisible(true); return; }
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${instructionKey}`);
    if (!dismissed) setVisible(true);
  }, [instructionKey]);

  const dismiss = () => {
    if (instructionKey) {
      localStorage.setItem(`${STORAGE_PREFIX}${instructionKey}`, 'true');
    }
    setVisible(false);
    onClose?.();
  };

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(c => c + 1);
    } else {
      dismiss();
    }
  };

  if (!visible || !slides.length) return null;

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="slideshow-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
        }}
      >
        <HighlightRing top={slide.highlightTop} height={slide.highlightHeight} />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CharacterCard
              slide={slide}
              onNext={next}
              onDismiss={dismiss}
              isLast={isLast}
            />
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 128,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
              zIndex: 21,
            }}
          >
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === current ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 10,
            zIndex: 22,
          }}
        >
          <button
            onClick={next}
            style={{
              flex: 1,
              background: '#4181ed',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '13px 0',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {isLast ? "Let's go!" : 'Next ›'}
          </button>
          <button
            onClick={dismiss}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 14,
              padding: '13px 0',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Don't show again
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}