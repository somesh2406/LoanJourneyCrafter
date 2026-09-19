import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
  usePortal?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
  usePortal = false,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  React.useEffect(() => {
    if (open && usePortal && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (align === "right") {
        setCoords({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      } else {
        setCoords({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    }
  }, [open, usePortal, align]);

  React.useEffect(() => {
    if (!open || !usePortal) return;
    const handleScrollOrResize = () => {
      setOpen(false);
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open, usePortal]);

  const menuContent = open && (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={
        usePortal && coords ?
          {
            position: "fixed",
            top: coords.top,
            ...(coords.right !== undefined ? { right: coords.right } : {}),
            ...(coords.left !== undefined ? { left: coords.left } : {}),
            zIndex: 9999,
          }
        : undefined
      }
      className={cn(
        usePortal ? "fixed z-[9999]" : "absolute z-50 mt-1",
        "min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95",
        !usePortal && (align === "right" ? "right-0" : "left-0"),
        className,
      )}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          role="menuitem"
          disabled={item.disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.disabled) {
              item.onClick();
              setOpen(false);
            }
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            item.danger ?
              "text-rose-600 hover:bg-rose-50"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {usePortal && typeof document !== "undefined" ?
        menuContent && createPortal(menuContent, document.body)
      : menuContent}
    </div>
  );
}
