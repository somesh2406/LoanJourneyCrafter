import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ShieldCheck,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJourneyStore, SaveStatus } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { editorStateToJourney } from '@/domain/journey/mapper';
import { cn } from '@/utils/cn';

export function TopNavbar() {
  const navigate = useNavigate();

  const title = useJourneyStore((s) => s.title);
  const description = useJourneyStore((s) => s.description);
  const status = useJourneyStore((s) => s.status);
  const version = useJourneyStore((s) => s.version);
  const createdAt = useJourneyStore((s) => s.createdAt);
  const updatedAt = useJourneyStore((s) => s.updatedAt);
  const createdBy = useJourneyStore((s) => s.createdBy);
  const updatedBy = useJourneyStore((s) => s.updatedBy);
  const metadata = useJourneyStore((s) => s.metadata);
  const isPinned = useJourneyStore((s) => s.isPinned);
  const journeyId = useJourneyStore((s) => s.journeyId);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);

  const saveStatus = useJourneyStore((s) => s.saveStatus);
  const canUndo = useJourneyStore((s) => s.canUndo);
  const canRedo = useJourneyStore((s) => s.canRedo);
  const undo = useJourneyStore((s) => s.undo);
  const redo = useJourneyStore((s) => s.redo);
  const updateTitle = useJourneyStore((s) => s.updateTitle);
  const saveJourney = useJourneyStore((s) => s.saveJourney);

  const setValidationModalOpen = useUIStore((s) => s.setValidationModalOpen);

  // Inline Title Editing state
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(title);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setTempTitle(title);
  }, [title]);

  React.useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const commitTitle = () => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== title) {
      updateTitle(trimmed);
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitTitle();
    } else if (e.key === 'Escape') {
      cancelTitle();
    }
  };

  const handleExport = () => {
    const domainJourney = editorStateToJourney(nodes, edges, {
      id: journeyId,
      title,
      description,
      version,
      status,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      metadata,
      isPinned,
    });

    const exportPayload = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      journey: domainJourney,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${cleanFileName || 'loan-journey'}-v${version}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSaveStatus = (statusState: SaveStatus) => {
    switch (statusState) {
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            <span>Saving...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Unsaved changes</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-600">
            <AlertCircle className="h-3 w-3 text-rose-500" />
            <span>Save failed</span>
          </span>
        );
      case 'saved':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Saved</span>
          </span>
        );
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shrink-0 select-none z-20">
      {/* Left section: Back + Title */}
      <div className="flex items-center gap-3 min-w-0 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          title="Back to Journey Library"
          aria-label="Back to Journey Library"
          className="h-8 w-8 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Inline editable title */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            className="h-8 rounded-md border border-blue-600 bg-white px-2.5 text-sm font-bold text-slate-900 shadow-2xs focus:outline-none ring-2 ring-blue-500/20"
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-slate-100 cursor-pointer min-w-0"
            title="Click to rename journey"
          >
            <span className="truncate text-sm font-bold text-slate-900">
              {title || 'Untitled Journey'}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-slate-600">
              v{version}
            </span>
            <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
          </div>
        )}
      </div>

      {/* Center / Right actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              'rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
            )}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              'rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
            )}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Validate button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setValidationModalOpen(true)}
          className="gap-1.5 text-xs text-slate-700 hover:text-blue-700 hover:border-blue-300 cursor-pointer"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>Validate</span>
        </Button>

        {/* Save Status Indicator */}
        <div className="mx-1 px-2">{renderSaveStatus(saveStatus)}</div>

        {/* Explicit Save button */}
        <Button
          variant="default"
          size="sm"
          onClick={() => saveJourney(true)}
          className="gap-1.5 text-xs cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save</span>
        </Button>

        {/* Export button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-1.5 text-xs cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>
      </div>
    </header>
  );
}
