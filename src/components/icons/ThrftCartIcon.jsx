/**
 * ThrftCartIcon
 * Custom SVG icon matching the THRFT app logo cart shape.
 * Drop-in replacement for Lucide's <ShoppingCart /> — accepts
 * the same className and style props so it works everywhere.
 *
 * Usage:
 *   import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
 *   <ThrftCartIcon className="w-5 h-5 text-blue-500" />
 *   <ThrftCartIcon className="w-5 h-5" style={{ color: '#4181ed' }} />
 */
export default function ThrftCartIcon({ className = '', style = {}, ...props }) {
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
      {/* Handle — hook at top-left, diagonal sweep down to base */}
      <path d="M2 3h2l1 2.5" />
      <path d="M5 5.5 Q6 7 7 10 L10 19" />

      {/* Basket right wall — rises from base, rounded cap */}
      <path d="M10 19 Q18 19 19 14 L18 8 Q17.5 5 15.5 5" />

      {/* Base shelf — horizontal double line */}
      <line x1="8"  y1="20" x2="19" y2="20" />

      {/* Left wheel pair */}
      <circle cx="9"  cy="22.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="22.2" r="1" fill="currentColor" stroke="none" />

      {/* Right wheel pair */}
      <circle cx="16" cy="22.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="22.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}