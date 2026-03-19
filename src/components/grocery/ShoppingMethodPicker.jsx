import { Store, Car, Truck, LayoutGrid } from 'lucide-react';

export const SHOPPING_METHODS = [
  {
    key: 'instore',
    label: 'In-Store',
    description: 'Shop & checkout at the store',
    icon: Store,
    color: 'blue',
  },
  {
    key: 'pickup',
    label: 'Curbside Pickup',
    description: 'Order online, pick up at the store',
    icon: Car,
    color: 'emerald',
  },
  {
    key: 'delivery',
    label: 'Delivery',
    description: 'Have groceries delivered to your door',
    icon: Truck,
    color: 'purple',
  },
  {
    key: 'all',
    label: 'Compare All',
    description: 'Show in-store, pickup & delivery',
    icon: LayoutGrid,
    color: 'amber',
  },
];

const COLOR_STYLES = {
  blue:    { active: 'bg-blue-50 border-blue-400 text-blue-700',    icon: 'text-blue-500'    },
  emerald: { active: 'bg-emerald-50 border-emerald-400 text-emerald-700', icon: 'text-emerald-500' },
  purple:  { active: 'bg-purple-50 border-purple-400 text-purple-700', icon: 'text-purple-500'  },
  amber:   { active: 'bg-amber-50 border-amber-400 text-amber-700',  icon: 'text-amber-500'   },
};

export default function ShoppingMethodPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SHOPPING_METHODS.map(({ key, label, description, icon: Icon, color }) => {
        const isSelected = value === key;
        const styles = COLOR_STYLES[color];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? `${styles.active} shadow-sm`
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isSelected ? styles.icon : 'text-slate-400'}`} />
            <span className="text-sm font-semibold">{label}</span>
            <span className={`text-xs leading-tight ${isSelected ? '' : 'text-slate-400'}`}>{description}</span>
          </button>
        );
      })}
    </div>
  );
}