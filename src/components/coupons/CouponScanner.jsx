import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CouponScanner({ onCouponExtracted }) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    setExtracting(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a grocery coupon scanner. Analyze this coupon image and extract all relevant details.
      
      Extract:
      - product_name: the main product name (be specific, e.g. "Tide Pods Laundry Detergent")
      - brand: the brand name only (e.g. "Tide")
      - discount_amount: dollar amount off as a number (null if percent-based)
      - discount_percent: percentage off as a number (null if dollar-based)
      - discount_description: full human-readable discount text (e.g. "$1.00 off 2 boxes")
      - expiry_date: expiration date in YYYY-MM-DD format (null if not found)
      - store_restriction: store restriction if mentioned (null if any store)
      - raw_text: all the text you can read from the coupon
      
      Be accurate. If something is not visible or unclear, use null.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          product_name: { type: 'string' },
          brand: { type: 'string' },
          discount_amount: { type: 'number' },
          discount_percent: { type: 'number' },
          discount_description: { type: 'string' },
          expiry_date: { type: 'string' },
          store_restriction: { type: 'string' },
          raw_text: { type: 'string' },
        },
      },
    });

    const coupon = await base44.entities.Coupon.create({
      ...result,
      image_url: file_url,
      status: 'active',
    });

    setExtracting(false);
    setPreview(null);
    onCouponExtracted(coupon);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isLoading = uploading || extracting;

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isLoading && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isLoading ? 'border-blue-300 bg-blue-50 cursor-default' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 bg-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
              <div className="relative">
                {preview && <img src={preview} alt="coupon" className="w-20 h-20 object-cover rounded-xl opacity-40" />}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-blue-600">
                {uploading ? 'Uploading photo...' : 'Extracting coupon details with AI...'}
              </p>
              <p className="text-xs text-slate-400">This takes a few seconds</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Camera className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Upload a Coupon Photo</p>
                <p className="text-sm text-slate-400 mt-1">Take a photo or upload from your gallery</p>
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="rounded-xl gap-1.5 text-xs" style={{ backgroundColor: '#4181ed' }}>
                  <Camera className="w-3.5 h-3.5" /> Take Photo
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs" onClick={(e) => {
                  e.stopPropagation();
                  const inp = document.createElement('input');
                  inp.type = 'file';
                  inp.accept = 'image/*';
                  inp.onchange = (ev) => ev.target.files[0] && handleFile(ev.target.files[0]);
                  inp.click();
                }}>
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}