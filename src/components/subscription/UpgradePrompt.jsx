import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Shown to free users in place of premium-only content.
 * Props:
 *   feature — name of the feature (string)
 *   description — optional short desc
 */
export default function UpgradePrompt({ feature, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{feature} is a Premium Feature</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        {description || `Upgrade to THRFT Premium to unlock ${feature} and start saving more.`}
      </p>
      <Link to="/Subscribe">
        <Button className="h-11 px-8 rounded-xl font-semibold shadow-md shadow-blue-200" style={{ backgroundColor: '#4181ed' }}>
          Upgrade to Premium →
        </Button>
      </Link>
      <p className="text-xs text-slate-400 mt-3">7-day free trial included</p>
    </div>
  );
}