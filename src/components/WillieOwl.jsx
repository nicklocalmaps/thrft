import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Willie the Wise Savings Owl — dismissible page-specific hint box.
 * Props:
 *   pageKey  — unique string key for this hint (stored in owl_hints_dismissed)
 *   hint     — the hint text to display
 */
export default function WillieOwl({ pageKey, hint }) {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const dismissed = u?.owl_hints_dismissed || [];
      if (!dismissed.includes(pageKey)) {
        setVisible(true);
      }
    }).catch(() => {});
  }, [pageKey]);

  const dismiss = async (permanent) => {
    setVisible(false);
    if (permanent && user) {
      const dismissed = user?.owl_hints_dismissed || [];
      if (!dismissed.includes(pageKey)) {
        await base44.auth.updateMe({
          owl_hints_dismissed: [...dismissed, pageKey]
        }).catch(() => {});
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3"
        >
          <span className="text-2xl shrink-0">🦉</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-0.5">Willie says:</p>
            <p className="text-sm text-amber-700">{hint}</p>
            <button
              onClick={() => dismiss(true)}
              className="text-xs text-amber-500 hover:text-amber-700 mt-1.5 underline transition-colors"
            >
              Don't show again
            </button>
          </div>
          <button
            onClick={() => dismiss(false)}
            className="shrink-0 text-amber-400 hover:text-amber-600 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}