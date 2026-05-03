import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, Camera, Image, CheckCircle, ChevronRight, X } from 'lucide-react';

const THRFT_BLUE = '#4181ed';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

const STORAGE_KEY = 'thrft_permissions_asked';

const PERMISSIONS = [
  {
    key:        'location',
    icon:       MapPin,
    color:      '#10b981',
    bg:         '#ecfdf5',
    label:      'Location',
    description:'Find nearby stores & compare prices in your area automatically.',
    why:        'Used for nearby store finder and delivery address auto-fill.',
  },
  {
    key:        'notifications',
    icon:       Bell,
    color:      '#f59e0b',
    bg:         '#fffbeb',
    label:      'Notifications',
    description:'Get price drop alerts and coupon expiry reminders.',
    why:        'We\'ll only notify you about things that save you money.',
  },
  {
    key:        'camera',
    icon:       Camera,
    color:      THRFT_BLUE,
    bg:         '#eff6ff',
    label:      'Camera',
    description:'Scan product barcodes to instantly add items, and scan paper coupons.',
    why:        'Barcode scanner + coupon scanner — both use one permission.',
  },
  {
    key:        'photos',
    icon:       Image,
    color:      '#8b5cf6',
    bg:         '#f5f3ff',
    label:      'Photo Library',
    description:'Upload photos of paper coupons and grocery receipts.',
    why:        'Never manually typed — just snap a photo of your coupon.',
  },
];

async function requestLocation() {
  if (!navigator.geolocation) return 'unsupported';
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      () => resolve('granted'),
      () => resolve('denied'),
      { timeout: 8000 }
    );
  });
}

async function requestNotifications() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

async function requestCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop());
    return 'granted';
  } catch {
    return 'denied';
  }
}

async function requestPhotos() {
  return 'granted';
}

const REQUESTERS = {
  location:      requestLocation,
  notifications: requestNotifications,
  camera:        requestCamera,
  photos:        requestPhotos,
};

function PermissionCard({ permission, status, index }) {
  const Icon = permission.icon;
  const isGranted = status === 'granted';
  const isDenied  = status === 'denied';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
      style={{
        background:   isGranted ? permission.bg : '#fff',
        borderColor:  isGranted ? permission.color + '40' : '#e2e8f0',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: permission.bg }}
      >
        <Icon className="w-5 h-5" style={{ color: permission.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{permission.label}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{permission.description}</p>
      </div>
      <div className="shrink-0">
        {isGranted ? (
          <CheckCircle className="w-5 h-5" style={{ color: permission.color }} />
        ) : isDenied ? (
          <X className="w-5 h-5 text-slate-300" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
        )}
      </div>
    </motion.div>
  );
}

export default function PermissionsPrompt({ onComplete }) {
  const [statuses, setStatuses]       = useState({});
  const [requesting, setRequesting]   = useState(false);
  const [allDone, setAllDone]         = useState(false);
  const [currentPerm, setCurrentPerm] = useState(null);

  useEffect(() => {
    const alreadyAsked = localStorage.getItem(STORAGE_KEY);
    if (alreadyAsked) { onComplete?.(); }
  }, []);

  const handleAllowAll = async () => {
    setRequesting(true);
    const results = {};

    for (const perm of PERMISSIONS) {
      setCurrentPerm(perm.key);
      const result = await REQUESTERS[perm.key]();
      results[perm.key] = result;
      setStatuses(prev => ({ ...prev, [perm.key]: result }));
      await new Promise(r => setTimeout(r, 600));
    }

    setCurrentPerm(null);
    setAllDone(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ asked: true, results, date: new Date().toISOString() }));
    setTimeout(() => onComplete?.(), 1500);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ asked: true, skipped: true, date: new Date().toISOString() }));
    onComplete?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg">
              <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">
              THRFT needs a few permissions
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              These help us save you the most money. You can change them anytime in your phone settings.
            </p>
          </motion.div>

          <div className="space-y-2.5 mb-6">
            {PERMISSIONS.map((perm, i) => (
              <PermissionCard
                key={perm.key}
                permission={perm}
                status={statuses[perm.key]}
                index={i}
              />
            ))}
          </div>

          <AnimatePresence>
            {requesting && currentPerm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mb-4"
              >
                <p className="text-xs font-semibold text-slate-400">
                  Requesting {PERMISSIONS.find(p => p.key === currentPerm)?.label} access…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-4 py-3 rounded-2xl"
                style={{ background: '#ecfdf5' }}
              >
                <p className="text-sm font-bold text-emerald-700">
                  ✅ All set! Taking you to THRFT…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!allDone && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={handleAllowAll}
                disabled={requesting}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[.98] mb-3"
                style={{
                  backgroundColor: requesting ? '#94a3b8' : THRFT_BLUE,
                  boxShadow: requesting ? 'none' : '0 4px 20px rgba(65,129,237,.4)',
                }}
              >
                {requesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Requesting permissions…
                  </>
                ) : (
                  <>
                    Allow All
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleSkip}
                disabled={requesting}
                className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Maybe later
              </motion.button>
            </>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-xs text-slate-300 mt-4 leading-relaxed"
          >
            🔒 THRFT never sells your data. Location is only used to find nearby stores.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}