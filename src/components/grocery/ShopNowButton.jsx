import { ExternalLink } from 'lucide-react';
import { getAffiliateUrl, trackAffiliateClick } from '@/lib/affiliateConfig';
import { base44 } from '@/api/base44Client';

export default function ShopNowButton({ storeKey, storeName, items = [] }) {
  const itemNames = items.map(i => i.item_name || i.name).filter(Boolean);
  const url = getAffiliateUrl(storeKey, itemNames);

  if (!url) return null;

  const handleClick = () => {
    base44.analytics.track({
      eventName: 'affiliate_link_clicked',
      properties: { store_key: storeKey, store_name: storeName },
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
      style={{ backgroundColor: '#4181ed' }}
    >
      <ExternalLink className="w-3 h-3" />
      Shop Now
    </button>
  );
}