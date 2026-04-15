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
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Image fills entire screen */}
      <div className="absolute inset-0">
        <img src={slide.imageUrl} alt="Instruction" className="w-full h-full object-cover" />
      </div>

      {/* Buttons pinned to bottom, overlaying the image */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        {/* Slide indicator */}
        {slides.length > 1 && (
          <div className="flex gap-1 justify-center mb-4">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleNext}
            className="w-full h-12 rounded-xl text-base font-bold gap-2"
            style={{ backgroundColor: '#4181ed' }}
          >
            {isLastSlide ? 'Got It' : 'Next'}
            {!isLastSlide && <ChevronRight className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleDontShowAgain}
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-bold border-white/40 gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            Don't Show Again
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}