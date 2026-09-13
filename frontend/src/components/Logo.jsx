import React from 'react';

export default function Logo({ size = 'md', showText = true }) {
  const dims = {
    sm: { box: 'w-8 h-8', text: 'text-base', icon: 14 },
    md: { box: 'w-10 h-10', text: 'text-xl', icon: 18 },
    lg: { box: 'w-14 h-14', text: 'text-3xl', icon: 26 },
  }[size] || { box: 'w-10 h-10', text: 'text-xl', icon: 18 };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${dims.box} rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/30`}
      >
        <svg
          width={dims.icon}
          height={dims.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-2" />
          <path d="M9 12h11" />
          <path d="M16 8.5L19.5 12 16 15.5" />
        </svg>
      </div>
      {showText && (
        <span className={`${dims.text} font-extrabold tracking-tight text-slate-900 dark:text-white`}>
          Settle<span className="text-brand-500">Up</span>
        </span>
      )}
    </div>
  );
}
