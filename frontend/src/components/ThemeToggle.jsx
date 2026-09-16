import { useTheme } from '../ThemeContext';
import { IconSun, IconMoon } from './Icons';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="rounded-xl p-2.5 text-slate-500 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  );
}
