export type ThemeColor = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';

export interface ColorScheme {
  id: ThemeColor;
  label: string;
  bg: string;
  border: string;
  borderHover: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  handleColor: string;
}

export const COLOR_PALETTE: Record<ThemeColor, ColorScheme> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    borderHover: 'hover:border-slate-400',
    headerBg: 'bg-slate-100',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    accent: '#64748b',
    handleColor: '#64748b',
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    bg: 'bg-blue-50/50',
    border: 'border-blue-300',
    borderHover: 'hover:border-blue-400',
    headerBg: 'bg-blue-100/70',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    accent: '#2563eb',
    handleColor: '#2563eb',
  },
  green: {
    id: 'green',
    label: 'Green',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-300',
    borderHover: 'hover:border-emerald-400',
    headerBg: 'bg-emerald-100/70',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accent: '#059669',
    handleColor: '#059669',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    bg: 'bg-amber-50/50',
    border: 'border-amber-300',
    borderHover: 'hover:border-amber-400',
    headerBg: 'bg-amber-100/70',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    accent: '#d97706',
    handleColor: '#d97706',
  },
  red: {
    id: 'red',
    label: 'Red',
    bg: 'bg-rose-50/50',
    border: 'border-rose-300',
    borderHover: 'hover:border-rose-400',
    headerBg: 'bg-rose-100/70',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    accent: '#e11d48',
    handleColor: '#e11d48',
  },
  purple: {
    id: 'purple',
    label: 'Purple',
    bg: 'bg-purple-50/50',
    border: 'border-purple-300',
    borderHover: 'hover:border-purple-400',
    headerBg: 'bg-purple-100/70',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    accent: '#7c3aed',
    handleColor: '#7c3aed',
  },
  cyan: {
    id: 'cyan',
    label: 'Cyan',
    bg: 'bg-cyan-50/50',
    border: 'border-cyan-300',
    borderHover: 'hover:border-cyan-400',
    headerBg: 'bg-cyan-100/70',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    accent: '#0891b2',
    handleColor: '#0891b2',
  },
};

export function getColorScheme(color?: string): ColorScheme {
  if (!color || !(color in COLOR_PALETTE)) {
    return COLOR_PALETTE.blue;
  }
  return COLOR_PALETTE[color as ThemeColor];
}
