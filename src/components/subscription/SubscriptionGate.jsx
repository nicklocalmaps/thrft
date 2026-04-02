import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

// Statuses that allow access
const ACTIVE_STATUSES = ['trialing', 'active'];

export default function SubscriptionGate({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me().then((user) => {
      const status = user?.subscription_status;
      if (!status || !ACTIVE_STATUSES.includes(status)) {
        navigate('/Subscribe');
      } else {
        setChecking(false);
      }
    }).catch(() => {
      navigate('/Subscribe');
    });
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  return children;
}