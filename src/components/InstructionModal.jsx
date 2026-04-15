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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">

        {/* Image area — fixed aspect ratio so it never grows too tall */}
        <div className="w-full bg-slate-100" style={{ aspectRatio: '4/3' }}>
          <img
            src={slide.imageUrl}
            alt="Instruction"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="flex gap-1.5 justify-center pt-4 pb-1">
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
        <div className="px-5 pb-5 pt-3 space-y-2.5">
          <Button
            onClick={handleNext}
            className="w-full h-12 rounded-xl text-base font-bold gap-2"
            style={{ backgroundColor: '#4181ed' }}
          >
            {isLastSlide ? 'Got It ✓' : 'Next'}
            {!isLastSlide && <ChevronRight className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleDontShowAgain}
            variant="ghost"
            className="w-full h-11 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            Don't Show Again
          </Button>
        </div>
      </div>
    </div>
  );
}