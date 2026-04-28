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
      viewBox="0 0 48 48"
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
      {/* Handle: curves down from top-left */}
      <path d="M7 10 C7 10 10 10 11 12 L17 32" strokeWidth="2.2" />

      {/* Basket body: angled right side, no top bar */}
      <path d="M17 32 L36 32 L40 18" strokeWidth="2.2" />

      {/* Wheels */}
      <circle cx="20" cy="38" r="3" fill="currentColor" stroke="none" />
      <circle cx="33" cy="38" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}