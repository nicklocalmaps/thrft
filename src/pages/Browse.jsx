import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Search, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductBrowser from '@/components/grocery/ProductBrowser';
import InstructionModal from '@/components/InstructionModal';

const BROWSE_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/72d67b3cb_BrowseProducts1.jpg' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/09fd5ca9f_BrowseProducts2.jpg' },
];

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('listId');
  const [showInstructions, setShowInstructions] = useState(true);

  const handleAdd = (item) => {
    const encoded = encodeURIComponent(JSON.stringify(item));
    if (listId) {
      navigate(`/ListDetail?id=${listId}&addItem=${encoded}`);
    } else {
      navigate(`/NewList?addItem=${encoded}`);
    }
  };

  const handleClose = () => {
    if (listId) {
      navigate(`/ListDetail?id=${listId}`);
    } else {
      navigate('/NewList');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showInstructions && (
        <InstructionModal
          instructionKey="browse"
          slides={BROWSE_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Browse Products</h1>
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Done
          </button>
        </div>
      </div>
      <ProductBrowser onAdd={handleAdd} onClose={handleClose} isFullPage={true} />
    </div>
  );
}