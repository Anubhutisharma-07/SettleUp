import React from 'react';

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-brand-500 to-emerald-500',
  'from-amber-400 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
  'from-teal-400 to-cyan-500',
];

function hashString(str) {
  let h = 0;
  const s = String(str);
  for (let stringIndex = 0; stringIndex < s.length; stringIndex++) {
    h = (h * 31 + s.charCodeAt(stringIndex)) & 0x7fffffff;
  }
  return h;
}

export function initialsOf(name) {
  if (!name) return '?';
  return String(name)
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Avatar({ id, name, size = 'md', className = '' }) {
  const gradients = AVATAR_GRADIENTS;
  const gradient =
    gradients[(typeof id === 'number' ? Math.abs(id) : hashString(String(id ?? name ?? '?'))) % gradients.length];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={name ? String(name) : undefined}
    >
      {initialsOf(name) || '#'}
    </div>
  );
}
