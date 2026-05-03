import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

const STORAGE_PREFIX = 'thrft_instructions_dismissed_';

// Willie the Owl character images
export const WILLIE_IMAGES = {
  willie_pointing_down:  'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/47044ac08_image1_edited.png',
  willie_pointing_up:    'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/aa6e53bb5_OwlCharacterPointingUp_edited1.png',
  willie_pointing_left:  'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/2b4570c24_OwlCharacterPointingUp_edited.png',
  willie_both_arms:      'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c1600f160_THRFTowlcharacterbotharms_edited.png',
  willie_pointing_right: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/78b941fdc_THRFTowlcharacterpointing_edited.png',
  willie_thumbs:         'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/40b265baa_THRFTowlcharacterthumbs_edited.png',
  willie_waving:         'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/46254b732_THRFTOwlCharacterWavingUp_edited.png',
  willie_main:           'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/b79e5e786_THRFTowlmain_edited.png',
  willie_reading:        'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/2580041af_Screenshot232_edited.jpg',
  thrft_robot:           'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/af3825e2a_image8.jpg',
  thrft_robot_bag:       'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/7fe6fecc0_image7.jpg',
};

/**
 * WillieSlideshow — replaces InstructionModal
 *
 * Each slide:
 * {
 *   willie: keyof WILLIE_IMAGES,        // which character pose
 *   title: string,
 *   body: string,
 *   williePosition?: 'left' | 'right',  // default 'right'
 *   accent?: string,                    // tailwind bg class, default 'bg-blue-500'
 * }
 */
export default function WillieSlideshow({ slides, instructionKey, onClose }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!instructionKey) { setVisible(true); return; }
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${instructionKey}`);
    if (!dismissed) setVisible(true);
  }, [instructionKey]);

  const handleDismiss = () => {
    if (instructionKey) localStorage.setItem(`${STORAGE_PREFIX}${instructionKey}`, 'true');
    setVisible(false);
    onClose?.();
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(c => c + 1);
    } else {
      handleDismiss();
    }
  };

  if (!visible || !slides?.length) return null;

  const slide = slides[current];
  const willieImg = WILLIE_IMAGES[slide.willie] || WILLIE_IMAGES.willie_main;
  const isLeft = slide.williePosition === 'left';
  const isLast = current === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={handleDismiss}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-3xl overflow-visible shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>

          {/* Colored top bar */}
          <div className={`h-2 w-full rounded-t-3xl ${slide.accent || 'bg-blue-500'}`} />

          {/* Willie character — floats above the card */}
          <div
            className={`absolute -top-24 ${isLeft ? 'left-4' : 'right-4'} w-32 h-32 pointer-events-none`}
            style={{ zIndex: 10 }}
          >
            <img
              src={willieImg}
              alt="Willie"
              className="w-full h-full object-contain drop-shadow-xl"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))' }}
            />
          </div>

          {/* Content */}
          <div className={`px-6 pt-6 pb-5 ${isLeft ? 'pl-36' : 'pr-36'} min-h-[140px] flex flex-col justify-center`}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
              Tip {current + 1} of {slides.length}
            </p>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight mb-2">
              {slide.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {slide.body}
            </p>
          </div>

          {/* Progress dots + button */}
          <div className="px-6 pb-6 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${i === current ? 'w-4 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-200'}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${slide.accent || 'bg-blue-500'} hover:opacity-90`}
            >
              {isLast ? 'Got it!' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pb-4 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}