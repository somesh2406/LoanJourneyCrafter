import * as React from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExportJourneySchema } from '@/schemas/export.schema';
import { Journey } from '@/domain/journey/types';
import { cn } from '@/utils/cn';

export interface ImportJourneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (journey: Journey) => Promise<void> | void;
}

export function ImportJourneyDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportJourneyDialogProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsedJourney, setParsedJourney] = React.useState<Journey | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setFileName(null);
      setParsedJourney(null);
      setErrorMessage(null);
      setIsProcessing(false);
    }
  }, [open]);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    setParsedJourney(null);

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Please upload a valid .json journey export file.');
      return;
    }

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);

      const parsed = ExportJourneySchema.safeParse(rawJson);
      if (!parsed.success) {
        const errorDescriptions = parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        setErrorMessage(`Validation failed: ${errorDescriptions}`);
        return;
      }

      setParsedJourney(parsed.data.journey as unknown as Journey);
    } catch (err) {
      setErrorMessage(`Failed to parse JSON file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedJourney || isProcessing) return;
    try {
      setIsProcessing(true);
      await onImportSuccess(parsedJourney);
      onOpenChange(false);
    } catch (e) {
      setErrorMessage(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Import Journey JSON"
      description="Upload an existing Loan Journey Studio export file (schemaVersion 1.0)."
    >
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer',
            dragActive
              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
            className="hidden"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-blue-600 shadow-xs mb-3">
            <Upload className="h-6 w-6" />
          </div>

          <div className="text-xs font-semibold text-slate-900">
            Click to upload or drag and drop
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Supports standard exported .json files with schemaVersion 1.0
          </p>
        </div>

        {/* Selected file info / validation result */}
        {fileName && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <FileText className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="font-medium text-slate-700 truncate flex-1">{fileName}</span>
            {parsedJourney && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Validated
              </span>
            )}
          </div>
        )}

        {/* Parsed Journey Details */}
        {parsedJourney && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-xs">
            <div className="font-semibold text-emerald-900">{parsedJourney.title}</div>
            <div className="mt-1 text-slate-600">
              Contains {parsedJourney.nodes.length} nodes and {parsedJourney.edges.length} connections (v{parsedJourney.version})
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedJourney || isProcessing}
            className="cursor-pointer"
          >
            {isProcessing ? 'Importing...' : 'Import Journey'}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
