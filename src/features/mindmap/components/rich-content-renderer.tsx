import * as React from "react";
import { Copy, Check, Code, Table, Calculator, FileText } from "lucide-react";
import { MindmapContentType } from "@/domain/mindmap/types";

interface RichContentRendererProps {
  content: string;
  contentType?: MindmapContentType;
  color?: string;
}

export function RichContentRenderer({
  content,
  contentType = "text",
  color = "#3b82f6",
}: RichContentRendererProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Table Renderer
  if (contentType === "table") {
    const lines = content.split("\n").filter((l) => l.trim().startsWith("|"));
    if (lines.length >= 2) {
      const headerLine = lines[0];
      const headers = headerLine
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // skip separator line (line 1)
      const bodyLines = lines.slice(2);

      return (
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-2 py-1 text-[10px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Table className="h-3 w-3 text-slate-400" />
              <span>Rate / Decision Table</span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
              title="Copy Table"
            >
              {copied ?
                <Check className="h-3 w-3 text-emerald-600" />
              : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-1 font-semibold text-slate-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bodyLines.map((rowLine, rIdx) => {
                const cells = rowLine
                  .split("|")
                  .map((c) => c.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                return (
                  <tr key={rIdx} className="hover:bg-blue-50/30">
                    {cells.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-2 py-1 text-slate-600 font-mono text-[9.5px]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // 2. Code Block Renderer
  if (contentType === "code") {
    // extract language if present
    const firstLine = content.split("\n")[0];
    const matchLang = firstLine.match(/```(\w+)?/);
    const lang = matchLang?.[1]?.toUpperCase() || "JSON";
    const cleanCode = content
      .replace(/^```\w*\r?\n/, "")
      .replace(/```$/, "")
      .trim();

    return (
      <div className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xs text-left">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] font-mono font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Code className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">{lang}</span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white cursor-pointer p-0.5"
            title="Copy Code"
          >
            {copied ?
              <Check className="h-3 w-3 text-emerald-400" />
            : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <pre className="p-2 font-mono text-[9.5px] leading-tight text-emerald-300 overflow-x-auto max-h-36">
          <code>{cleanCode}</code>
        </pre>
      </div>
    );
  }

  // 3. Mathematical Formula Renderer
  if (contentType === "formula") {
    const cleanFormula = content.replace(/\$\$/g, "").trim();

    return (
      <div
        className="mt-2 rounded-lg border p-2 text-center shadow-2xs"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
      >
        <div className="flex items-center justify-between pb-1 text-[10px] font-semibold text-slate-500 border-b border-slate-200/60 mb-1.5">
          <span className="flex items-center gap-1">
            <Calculator className="h-3 w-3 text-indigo-500" />
            <span>Formula</span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            title="Copy Formula"
          >
            {copied ?
              <Check className="h-3 w-3 text-emerald-600" />
            : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <div className="font-serif italic text-xs text-slate-900 font-medium py-1 tracking-wide selection:bg-indigo-100">
          {cleanFormula}
        </div>
      </div>
    );
  }

  // 4. Default Descriptive Text
  return (
    <div className="mt-2 rounded-md bg-slate-50 p-2 text-[10px] text-slate-600 border border-slate-200/80 leading-relaxed text-left">
      <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        <FileText className="h-2.5 w-2.5" /> Note
      </div>
      <p className="line-clamp-3">{content}</p>
    </div>
  );
}
