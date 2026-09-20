import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Cloud,
  Download,
  FileText,
  GitFork,
  HelpCircle,
  Plus,
  Redo2,
  Undo2,
  Upload,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useMindmapStore } from "@/stores/mindmap-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function MindmapNavbar() {
  const navigate = useNavigate();

  const title = useMindmapStore((s) => s.title);
  const setTitle = useMindmapStore((s) => s.setTitle);
  const saveStatus = useMindmapStore((s) => s.saveStatus);
  const selectedNodeId = useMindmapStore((s) => s.selectedNodeId);
  const rootId = useMindmapStore((s) => s.rootId);
  const addChildNode = useMindmapStore((s) => s.addChildNode);
  const addSiblingNode = useMindmapStore((s) => s.addSiblingNode);
  const expandAll = useMindmapStore((s) => s.expandAll);
  const collapseAll = useMindmapStore((s) => s.collapseAll);
  const canUndo = useMindmapStore((s) => s.canUndo);
  const canRedo = useMindmapStore((s) => s.canRedo);
  const undo = useMindmapStore((s) => s.undo);
  const redo = useMindmapStore((s) => s.redo);
  const exportMarkdown = useMindmapStore((s) => s.exportMarkdown);
  const importMarkdown = useMindmapStore((s) => s.importMarkdown);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(title);
  const [markdownModalOpen, setMarkdownModalOpen] = React.useState(false);
  const [markdownContent, setMarkdownContent] = React.useState("");
  const [shortcutsModalOpen, setShortcutsModalOpen] = React.useState(false);

  React.useEffect(() => {
    setTitleInput(title);
  }, [title]);

  const handleTitleCommit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== title) {
      setTitle(trimmed);
    } else {
      setTitleInput(title);
    }
    setIsEditingTitle(false);
  };

  const handleOpenMarkdownDialog = () => {
    setMarkdownContent(exportMarkdown());
    setMarkdownModalOpen(true);
  };

  const handleApplyMarkdown = () => {
    if (markdownContent.trim()) {
      importMarkdown(markdownContent);
      setMarkdownModalOpen(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = exportMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${title.toLowerCase().replace(/\s+/g, "-")}.md`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs z-20 shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Library</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <GitFork className="h-4 w-4" />
            </div>

            {isEditingTitle ?
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleCommit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleCommit();
                  if (e.key === "Escape") {
                    setTitleInput(title);
                    setIsEditingTitle(false);
                  }
                }}
                className="rounded border border-blue-500 bg-blue-50/50 px-2 py-0.5 text-sm font-semibold text-slate-900 outline-none"
                autoFocus
              />
            : <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900 hover:text-blue-600"
                title="Click to edit title"
              >
                <span className="truncate">{title}</span>
              </button>
            }
          </div>

          {/* Save Status Badge */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-blue-600 font-medium animate-pulse">
                <Cloud className="h-3.5 w-3.5" /> Saving...
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{" "}
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Center/Right: MindMap Operations & Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Node Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addChildNode(selectedNodeId || rootId)}
            className="h-8 text-xs flex items-center gap-1 cursor-pointer bg-white"
            title="Add Child (Tab)"
          >
            <Plus className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden md:inline">Child</span>
            <kbd className="hidden lg:inline-block ml-1 rounded bg-slate-100 px-1 text-[10px] text-slate-500">
              Tab
            </kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addSiblingNode(selectedNodeId || rootId)}
            className="h-8 text-xs flex items-center gap-1 cursor-pointer bg-white"
            title="Add Sibling (Enter)"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden md:inline">Sibling</span>
            <kbd className="hidden lg:inline-block ml-1 rounded bg-slate-100 px-1 text-[10px] text-slate-500">
              Enter
            </kbd>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {/* Expand/Collapse All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Expand All"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Collapse All"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>

          {/* Undo / Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {/* Markdown Dialog button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenMarkdownDialog}
            className="h-8 text-xs flex items-center gap-1.5 cursor-pointer bg-white"
            title="Import or Export Markdown"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Markdown</span>
          </Button>

          {/* Shortcuts Help */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShortcutsModalOpen(true)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Markdown Import / Export Modal */}
      <Dialog
        open={markdownModalOpen}
        onOpenChange={setMarkdownModalOpen}
        title="MindMap Markdown Tree"
        description="View, export, or edit the indented markdown tree structure."
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <Textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="font-mono text-xs h-72 leading-relaxed"
            placeholder="# Root Title&#10;  - Branch 1&#10;    - Sub-branch 1.1&#10;  - Branch 2"
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className="text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download .md
            </Button>

            <DialogFooter className="mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMarkdownModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyMarkdown}
                className="cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Apply to MindMap
              </Button>
            </DialogFooter>
          </div>
        </div>
      </Dialog>

      {/* Keyboard Shortcuts Modal */}
      <Dialog
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
        title="MindMap Keyboard Shortcuts"
        description="Boost your ideation speed with intuitive keyboard navigation."
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">Add Child Branch</span>
            <kbd className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-700">
              Tab
            </kbd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">
              Add Sibling Branch
            </span>
            <kbd className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-700">
              Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">
              Edit Selected Node
            </span>
            <kbd className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-700">
              Double Click or Space
            </kbd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">
              Delete Branch & Subtree
            </span>
            <kbd className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-700">
              Delete / Backspace
            </kbd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">
              Cancel / Deselect
            </span>
            <kbd className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-700">
              Escape
            </kbd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-700">Undo / Redo</span>
            <div className="flex gap-1">
              <kbd className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-slate-700">
                Ctrl+Z
              </kbd>
              <kbd className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-slate-700">
                Ctrl+Y
              </kbd>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShortcutsModalOpen(false)}
            className="cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
