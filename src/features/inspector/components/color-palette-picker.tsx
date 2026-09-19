import { Check } from 'lucide-react';
import { ThemeColor, COLOR_PALETTE } from '@/config/colors';
import { cn } from '@/utils/cn';

export interface ColorOption {
  id: ThemeColor;
  label: string;
  accent: string;
}

export interface ColorPalettePickerProps {
  colors?: ColorOption[];
  selectedColor: string;
  onChange: (colorId: ThemeColor) => void;
  label?: string;
}

export function ColorPalettePicker({
  colors,
  selectedColor,
  onChange,
  label = 'Card Color Theme',
}: ColorPalettePickerProps) {
  const options = colors || (Object.values(COLOR_PALETTE) as ColorOption[]);

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((c) => {
          const isSelected = selectedColor === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              style={{ backgroundColor: c.accent }}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-transform cursor-pointer',
                isSelected
                  ? 'ring-2 ring-slate-900 ring-offset-2 scale-110'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              )}
              title={c.label}
              aria-label={`Select ${c.label} color`}
            >
              {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
