import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Image */}
        <div className="relative w-full bg-slate-100">
          <img src={slide.imageUrl} alt="Instruction" className="w-full h-auto block" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Slide indicator */}
          {slides.length > 1 && (
            <div className="flex gap-1 justify-center">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-blue-500 w-6' : 'bg-slate-200 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleNext}
              className="w-full h-11 rounded-xl text-base font-bold gap-2"
              style={{ backgroundColor: '#4181ed' }}
            >
              {isLastSlide ? 'Got It' : 'Next'}
              {!isLastSlide && <ChevronRight className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleDontShowAgain}
              variant="outline"
              className="w-full h-11 rounded-xl text-base font-bold border-slate-200 gap-2"
            >
              Don't Show Again
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}