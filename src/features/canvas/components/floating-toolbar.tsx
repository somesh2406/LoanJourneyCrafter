import * as React from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronsUpDown,
  ChevronsDownUp,
  Map,
  GripHorizontal,
  Scan,
} from 'lucide-react';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/utils/cn';

export function FloatingToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const expandAllStages = useJourneyStore((s) => s.expandAllStages);
  const collapseAllStages = useJourneyStore((s) => s.collapseAllStages);

  const overviewOpen = useUIStore((s) => s.overviewOpen);
  const setOverviewOpen = useUIStore((s) => s.setOverviewOpen);
  const fullscreen = useUIStore((s) => s.fullscreen);
  const setFullscreen = useUIStore((s) => s.setFullscreen);

  // Position state for repositioning by dragging
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position ? position.x : rect.left,
      startY: position ? position.y : rect.top,
    };
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy)),
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const style: React.CSSProperties = position
    ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px` }
    : { position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      style={style}
      className="z-30 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xs select-none"
    >
      {/* Drag handle for repositioning */}
      <div
        onMouseDown={onMouseDown}
        className="flex h-7 w-5 items-center justify-center rounded cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
        title="Drag to reposition toolbar"
      >
        <GripHorizontal className="h-4 w-4" />
      </div>

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Zoom controls */}
      <button
        type="button"
        onClick={() => zoomOut({ duration: 200 })}
        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span className="min-w-[42px] text-center font-mono text-xs font-semibold text-slate-700">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={() => zoomIn({ duration: 200 })}
        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Fit view */}
      <button
        type="button"
        onClick={() => fitView({ padding: 0.2, duration: 350 })}
        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title="Fit View to Canvas"
        aria-label="Fit View to Canvas"
      >
        <Scan className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Expand / Collapse All */}
      <button
        type="button"
        onClick={expandAllStages}
        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title="Expand All Stages"
        aria-label="Expand All Stages"
      >
        <ChevronsUpDown className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={collapseAllStages}
        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        title="Collapse All Stages"
        aria-label="Collapse All Stages"
      >
        <ChevronsDownUp className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Journey Overview toggle */}
      <button
        type="button"
        onClick={() => setOverviewOpen(!overviewOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors cursor-pointer',
          overviewOpen
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        )}
        title="Toggle Journey Overview"
        aria-label="Toggle Journey Overview"
      >
        <Map className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Overview</span>
      </button>

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={() => setFullscreen(!fullscreen)}
        className={cn(
          'rounded-md p-1.5 transition-colors cursor-pointer',
          fullscreen
            ? 'bg-blue-100 text-blue-800'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
        title={fullscreen ? 'Exit Fullscreen (F / Esc)' : 'Enter Fullscreen (F)'}
        aria-label={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
