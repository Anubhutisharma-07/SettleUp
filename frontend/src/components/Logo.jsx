import React from 'react';
import BrandMark from './BrandMark';

/**
 * SettleUp logo lockup: brand mark + wordmark.
 *
 * Sizes: sm (navbar/footer), md (default), lg (hero/login).
 * `animated` — the mark eases its chevrons inward on hover ("settling").
 */
export default function Logo({ size = 'md', showText = true, animated = true }) {
  const dims = {
    sm: { mark: 26, text: 'text-base' },
    md: { mark: 32, text: 'text-xl' },
    lg: { mark: 44, text: 'text-3xl' },
  }[size] || { mark: 32, text: 'text-xl' };

  return (
    <span className="inline-flex items-center gap-2.5 select-none group/logo">
      <span className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/30 transition-transform duration-300 group-hover/logo:scale-105">
        <BrandMark size={dims.mark} animated={animated} className="text-white" />
      </span>
      {showText && (
        <span className={`${dims.text} font-extrabold tracking-tight text-slate-900 dark:text-white`}>
          Settle<span className="text-brand-500">Up</span>
        </span>
      )}
    </span>
  );
}
