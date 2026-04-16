import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import ListCard from '@/components/grocery/ListCard';
import FeatureTour from '@/components/onboarding/FeatureTour';
import StorePriceDashboard from '@/components/grocery/StorePriceDashboard';
import ReferralBanner from '@/components/rewards/ReferralBanner';
import InstructionModal from '@/components/InstructionModal';

const HOME_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/e782a8866_Home1.jpg', nextTop: '5%', dismissTop: '20%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/466760f21_Home2.jpg', nextTop: '5%', dismissTop: '20%' },
];

export default function Home() {
  const queryClient = useQueryClient();
  const [showTour, setShowTour] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user && !user.tour_completed) {
        setShowTour(true);
      }
    }).catch(() => {});
  }, []);

  const handleTourComplete = async () => {
    setShowTour(false);
    await base44.auth.updateMe({ tour_completed: true }).catch(() => {});
  };

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['grocery-lists'],
    queryFn: () => base44.entities.GroceryList.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GroceryList.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grocery-lists'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {showTour && <FeatureTour onComplete={handleTourComplete} />}
      {showInstructions && (
        <InstructionModal
          instructionKey="home"
          slides={HOME_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Grocery Lists</h1>
        <p className="text-slate-900 mt-1">Compare prices across all of your favorite local grocery stores</p>
        <Link to="/NewList" className="inline-block mt-4">
          <Button className="h-11 px-5 rounded-xl shadow-md shadow-blue-200 gap-2" style={{ backgroundColor: '#4181ed' }}>
            <Plus className="w-4 h-4" />
            New List
          </Button>
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 shadow-md">
            <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No lists yet</h3>
          <p className="text-slate-900 max-w-sm mb-6">
            Create your first grocery list to start comparing prices across stores.
          </p>
          <Link to="/NewList">
            <Button className="rounded-xl gap-2" style={{ backgroundColor: '#4181ed' }}>
              <Plus className="w-4 h-4" />
              Create Your First List
            </Button>
          </Link>
        </div>
      ) : (
        <>
        <StorePriceDashboard lists={lists} />
        <div className="mb-4">
          <ReferralBanner variant="card" />
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {lists.map((list, i) => (
              <ListCard
                key={list.id}
                list={list}
                index={i}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
        </>
      )}
    </div>
  );
}