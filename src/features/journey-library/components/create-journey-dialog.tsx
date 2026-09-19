import * as React from "react";
import { Layers, Sparkles } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/data/templates";
import { cn } from "@/utils/cn";

export interface CreateJourneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    templateId?: string;
  }) => Promise<void>;
  preselectedTemplateId?: string;
}

export function CreateJourneyDialog({
  open,
  onOpenChange,
  onSubmit,
  preselectedTemplateId,
}: CreateJourneyDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<
    string | undefined
  >(preselectedTemplateId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (preselectedTemplateId) {
        setSelectedTemplateId(preselectedTemplateId);
        const tmpl = TEMPLATES.find((t) => t.id === preselectedTemplateId);
        if (tmpl) {
          setTitle(`${tmpl.journey.title} Copy`);
          setDescription(tmpl.journey.description);
        }
      } else {
        setTitle("");
        setDescription("");
        setSelectedTemplateId(undefined);
      }
    }
  }, [open, preselectedTemplateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        templateId: selectedTemplateId,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Loan Journey"
      description="Configure your new journey canvas. Start blank or scaffold from enterprise templates."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Journey Title <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Retail Auto Loan Origination V2"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the lending product, target segment, or regulatory guidelines..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Baseline Architecture
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              onClick={() => {
                setSelectedTemplateId(undefined);
                setTitle("");
                setDescription("");
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all cursor-pointer",
                !selectedTemplateId ?
                  "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                : "border-slate-200 hover:border-slate-300",
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700">
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900">
                  Blank Canvas
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Start from an empty canvas
                </div>
              </div>
            </div>

            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    setTitle(`${tmpl.journey.title} Copy`);
                    setDescription(tmpl.journey.description || "");
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all cursor-pointer",
                    isSelected ?
                      "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {tmpl.badge} Template
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create & Open Studio"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
