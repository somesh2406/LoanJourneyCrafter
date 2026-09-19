import * as React from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { editorStateToJourney } from '@/domain/journey/mapper';
import { validateJourney, ValidationIssue } from '../engine/validate-journey';
import { cn } from '@/utils/cn';

export function ValidationModal() {
  const { setCenter } = useReactFlow();

  const validationModalOpen = useUIStore((s) => s.validationModalOpen);
  const setValidationModalOpen = useUIStore((s) => s.setValidationModalOpen);
  const setHighlightedNodeId = useUIStore((s) => s.setHighlightedNodeId);
  const setInspectorOpen = useUIStore((s) => s.setInspectorOpen);

  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const journeyId = useJourneyStore((s) => s.journeyId);
  const title = useJourneyStore((s) => s.title);
  const description = useJourneyStore((s) => s.description);
  const version = useJourneyStore((s) => s.version);
  const status = useJourneyStore((s) => s.status);
  const createdAt = useJourneyStore((s) => s.createdAt);
  const updatedAt = useJourneyStore((s) => s.updatedAt);
  const createdBy = useJourneyStore((s) => s.createdBy);
  const updatedBy = useJourneyStore((s) => s.updatedBy);
  const metadata = useJourneyStore((s) => s.metadata);
  const isPinned = useJourneyStore((s) => s.isPinned);

  const selectNode = useJourneyStore((s) => s.selectNode);
  const selectEdge = useJourneyStore((s) => s.selectEdge);

  const [activeTab, setActiveTab] = React.useState('all');

  // Compute validation report
  const report = React.useMemo(() => {
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
    return validateJourney(domainJourney);
  }, [
    nodes,
    edges,
    journeyId,
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
  ]);

  const filteredIssues = React.useMemo(() => {
    if (activeTab === 'errors') {
      return report.issues.filter((i) => i.severity === 'error');
    }
    if (activeTab === 'warnings') {
      return report.issues.filter((i) => i.severity === 'warning');
    }
    return report.issues;
  }, [report.issues, activeTab]);

  const handleInspect = (issue: ValidationIssue) => {
    setValidationModalOpen(false);

    if (issue.targetType === 'node' && issue.targetId) {
      const targetNode = nodes.find((n) => n.id === issue.targetId);
      if (targetNode) {
        selectNode(targetNode.id);
        setInspectorOpen(true);
        setHighlightedNodeId(targetNode.id);

        const w = targetNode.width ?? 280;
        const h = targetNode.height ?? 180;
        setCenter(targetNode.position.x + w / 2, targetNode.position.y + h / 2, {
          zoom: 1.1,
          duration: 450,
        });

        setTimeout(() => {
          setHighlightedNodeId(null);
        }, 3000);
      }
    } else if (issue.targetType === 'edge' && issue.targetId) {
      selectEdge(issue.targetId);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Issues', badge: report.issues.length },
    { id: 'errors', label: 'Errors', badge: report.errorCount, badgeVariant: 'danger' as const },
    { id: 'warnings', label: 'Warnings', badge: report.warningCount, badgeVariant: 'warning' as const },
  ];

  return (
    <Dialog
      open={validationModalOpen}
      onOpenChange={setValidationModalOpen}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              report.isCompliant
                ? 'bg-emerald-100 text-emerald-700'
                : report.errorCount > 0
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            )}
          >
            {report.isCompliant ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Process Validation Report
              </h3>
              <Badge variant={report.isCompliant ? 'success' : report.errorCount > 0 ? 'danger' : 'warning'}>
                {report.isCompliant ? 'COMPLIANT' : 'ISSUES FOUND'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structural graph verification, branch continuity, and banking rule integrity checks.
            </p>
          </div>
        </div>

        {/* Status overview banner */}
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border p-3 text-xs',
            report.isCompliant
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
              : report.errorCount > 0
              ? 'border-rose-200 bg-rose-50/70 text-rose-900'
              : 'border-amber-200 bg-amber-50/70 text-amber-900'
          )}
        >
          <div className="flex items-center gap-2">
            {report.isCompliant ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-600" />
            )}
            <span className="font-semibold">
              {report.isCompliant
                ? 'No Issues Detected: Graph complies with all structure rules.'
                : `Found ${report.errorCount} structural errors and ${report.warningCount} operational warnings.`}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Issues list */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {filteredIssues.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No issues in this category.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-lg border p-3 shadow-2xs transition-all',
                  issue.severity === 'error'
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-amber-200 bg-amber-50/30'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={issue.severity === 'error' ? 'danger' : 'warning'}>
                      {issue.severity}
                    </Badge>
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {issue.title}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {issue.description}
                  </p>

                  {issue.targetId && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="uppercase text-slate-400">{issue.targetType}:</span>
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                        {issue.targetId}
                      </span>
                    </div>
                  )}
                </div>

                {issue.targetId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInspect(issue)}
                    className="gap-1 text-xs h-8 shrink-0 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                  >
                    <Search className="h-3 w-3" />
                    <span>Inspect</span>
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={() => setValidationModalOpen(false)}
            className="cursor-pointer text-xs"
          >
            Close Report
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
