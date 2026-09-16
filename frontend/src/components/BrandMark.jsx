import React from 'react';

/**
 * SettleUp brand mark.
 *
 * The symbol: two chevrons converging on a center point — two sides of a
 * debt coming together until the transaction closes. The dot is the moment
 * the balance reaches zero.
 *
 * Pure inline SVG (no external assets). The `animated` variant makes the
 * chevrons ease inward toward the dot on hover — the mark "settles".
 */
export default function BrandMark({ size = 40, animated = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`settle-mark ${animated ? 'settle-mark-animated' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* left chevron */}
      <path
        className="settle-mark-left"
        d="M11 13l11 11-11 11"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* right chevron */}
      <path
        className="settle-mark-right"
        d="M37 13L26 24l11 11"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* the settling point — the balance reaching zero */}
      <circle className="settle-mark-dot" cx="24" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}
