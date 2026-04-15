import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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
        console.error('Error checking instruction dismissal:', err);
      } finally {
        setLoading(false);
      }
    };
    checkDismissal();
  }, [instructionKey]);

  const handleDontShowAgain = async () => {
    try {
      await base44.auth.updateMe({ [`instruction_${instructionKey}_dismissed`]: true });
      setDismissed(true);
      onClose?.();
    } catch (err) {
      console.error('Error saving instruction dismissal:', err);
    }
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
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 32px)' }}>

        {/* Image area — constrained to fit screen with all content visible */}
        <div className="w-full flex items-center justify-center pt-4 px-4" style={{ maxHeight: '60vh' }}>
          <div className="w-full rounded-2xl overflow-hidden bg-white flex items-center justify-center" style={{ maxHeight: '60vh' }}>
            <img
              src={slide.imageUrl}
              alt="Instruction"
              className="w-full h-auto"
              style={{ maxHeight: '60vh', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="flex gap-1.5 justify-center pt-3 pb-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-blue-500 w-6' : 'bg-slate-200 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Buttons — always visible in white panel */}
        <div className="px-5 pb-5 pt-2 space-y-2.5 border-t border-slate-100">
          <Button
            onClick={handleNext}
            className="w-full h-11 rounded-xl text-base font-bold gap-2"
            style={{ backgroundColor: '#4181ed' }}
          >
            {isLastSlide ? 'Got It ✓' : 'Next'}
            {!isLastSlide && <ChevronRight className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleDontShowAgain}
            variant="ghost"
            className="w-full h-10 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            Don't Show Again
          </Button>
        </div>
      </div>
    </div>
  );
}