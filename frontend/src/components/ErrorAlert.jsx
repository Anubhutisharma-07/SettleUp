import React from 'react';
import { IconAlert } from './Icons';

export default function ErrorAlert({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-rose-700 dark:text-rose-300 animate-fade-in">
      <IconAlert size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
