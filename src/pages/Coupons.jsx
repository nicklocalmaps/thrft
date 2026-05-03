import InstructionModal from '@/components/InstructionModal';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useUserTier from '@/hooks/useUserTier';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { Ticket, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CouponScanner from '@/components/coupons/CouponScanner';
import CouponCard from '@/components/coupons/CouponCard';

const COUPONS_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/e304df701_Budget1.jpg', nextTop: '5%', dismissTop: '17%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/6557429b2_Budget2.jpg', nextTop: '76%', dismissTop: '85%' },
];

export default function Coupons() {
  const { isPremium } = useUserTier();
  const [showInstructions, setShowInstructions] = useState(() => !localStorage.getItem('thrft_instructions_dismissed_coupons'));
  const queryClient = useQueryClient();
  const [showScanner, setShowScanner] = useState(false);

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date'),
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['grocery-lists'],
    queryFn: () => base44.entities.GroceryList.list('-created_date'),
  });

  const handleCouponExtracted = () => {
    queryClient.invalidateQueries({ queryKey: ['coupons'] });
    setShowScanner(false);
  };

  const handleAddToList = async (coupon, listId) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const newItem = {
      name: coupon.product_name,
      quantity: 1,
      unit: 'each',
      is_branded: !!coupon.brand,
      search_hint: coupon.brand ? `${coupon.brand} ${coupon.product_name}` : coupon.product_name,
    };
    await base44.entities.GroceryList.update(listId, { items: [...(list.items || []), newItem] });
    await base44.entities.Coupon.update(coupon.id, { status: 'used', added_to_list_id: listId });
    queryClient.invalidateQueries({ queryKey: ['coupons'] });
    queryClient.invalidateQueries({ queryKey: ['grocery-lists'] });
  };

  const handleDelete = async (id) => {
    await base44.entities.Coupon.delete(id);
    queryClient.invalidateQueries({ queryKey: ['coupons'] });
  };

  const active = coupons.filter(c => c.status === 'active');
  const inactive = coupons.filter(c => c.status !== 'active');

  if (!isPremium) {
    return <UpgradePrompt feature="Coupon Scanner" description="Photograph paper coupons and let AI extract the details — then add matching items directly to your grocery list." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showInstructions && (
        <InstructionModal
          instructionKey="coupons"
          slides={COUPONS_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-blue-500" />
            My Coupons
          </h1>
          <p className="text-slate-500 mt-1">Scan paper coupons and add matching items to your lists.</p>
        </div>
        <Button onClick={() => setShowScanner(v => !v)} className="rounded-xl gap-2 shrink-0" style={{ backgroundColor: '#4181ed' }}>
          {showScanner ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showScanner ? 'Cancel' : 'Scan Coupon'}
        </Button>
      </div>

      <AnimatePresence>
        {showScanner && (
          <div className="mb-6">
            <CouponScanner onCouponExtracted={handleCouponExtracted} />
          </div>
        )}
      </AnimatePresence>

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {active.map(c => <CouponCard key={c.id} coupon={c} lists={lists} onAddToList={handleAddToList} onDelete={handleDelete} />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Used / Expired ({inactive.length})</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {inactive.map(c => <CouponCard key={c.id} coupon={c} lists={lists} onAddToList={handleAddToList} onDelete={handleDelete} />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {coupons.length === 0 && !showScanner && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No coupons yet</h3>
          <p className="text-slate-500 max-w-sm mb-5">Scan a paper coupon and AI will extract the details automatically.</p>
          <Button onClick={() => setShowScanner(true)} className="rounded-xl gap-2" style={{ backgroundColor: '#4181ed' }}>
            <Plus className="w-4 h-4" /> Scan Your First Coupon
          </Button>
        </div>
      )}
    </div>
  );
}