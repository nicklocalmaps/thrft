/**
 * ThrftListIcon
 * A notepad / lined-paper icon representing a shopping list.
 * Replaces the cart icon everywhere in THRFT — reinforcing that
 * users are making a list first, not a cart.
 *
 * Drop-in replacement for ThrftCartIcon and Lucide ShoppingCart.
 * Accepts className and style props identically.
 *
 * Usage:
 *   import ThrftListIcon from '@/components/icons/ThrftListIcon';
 *   <ThrftListIcon className="w-6 h-6 text-blue-500" />
 */
export default function ThrftListIcon({ className = '', style = {}, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {/* Notepad body */}
      <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />

      {/* Spiral binding at top */}
      <line x1="8"  y1="3" x2="8"  y2="1" />
      <line x1="12" y1="3" x2="12" y2="1" />
      <line x1="16" y1="3" x2="16" y2="1" />

      {/* Lined rows — like a real shopping list */}
      <line x1="8"  y1="9"  x2="16" y2="9"  />
      <line x1="8"  y1="13" x2="16" y2="13" />
      <line x1="8"  y1="17" x2="13" y2="17" />

      {/* Checkmark on first line — shows it's a list being checked off */}
      <polyline points="6 9 7 10 9 8" strokeWidth="1.5" />
    </svg>
  );
}