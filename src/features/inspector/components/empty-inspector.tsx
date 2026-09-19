import { Info, Layers, Activity, GitBranch, StickyNote, ArrowRightLeft } from 'lucide-react';
import { useJourneyStore } from '@/stores/journey-store';

export function EmptyInspector() {
  const title = useJourneyStore((s) => s.title);
  const status = useJourneyStore((s) => s.status);
  const version = useJourneyStore((s) => s.version);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);

  const stageCount = nodes.filter((n) => n.type === 'stageNode').length;
  const activityCount = nodes.filter((n) => n.type === 'activityNode').length;
  const decisionCount = nodes.filter((n) => n.type === 'decisionNode').length;
  const noteCount = nodes.filter((n) => n.type === 'noteNode').length;

  return (
    <div className="space-y-6 p-4 text-xs select-none">
      {/* Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800">Graph Overview</span>
          <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 border border-slate-200">
            v{version}
          </span>
        </div>
        <p className="font-semibold text-slate-900 truncate">{title}</p>
        <div className="text-[11px] text-slate-500 capitalize">Status: {status.replace('_', ' ')}</div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Journey Composition
        </span>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{stageCount}</div>
              <div className="text-[10px] text-slate-500">Stages</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{activityCount}</div>
              <div className="text-[10px] text-slate-500">Activities</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{decisionCount}</div>
              <div className="text-[10px] text-slate-500">Decisions</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{noteCount}</div>
              <div className="text-[10px] text-slate-500">Notes</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
            <span>Active Connections</span>
          </div>
          <span className="font-bold text-slate-900">{edges.length}</span>
        </div>
      </div>

      {/* Guide Callout */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-[11px] text-blue-900 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold">
          <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>Quick Canvas Tips</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li>Select any component to inspect and edit properties.</li>
          <li>Drag Activity nodes inside/outside Stages to re-parent.</li>
          <li>Hover edges to view condition labels or delete connections.</li>
        </ul>
      </div>
    </div>
  );
}
