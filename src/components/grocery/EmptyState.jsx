import { ShoppingBasket } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
        <ShoppingBasket className="w-10 h-10 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Your list is empty</h3>
      <p className="text-slate-500 max-w-sm">
        Start adding grocery items above to build your shopping list and compare prices across stores.
      </p>
    </div>
  );
}