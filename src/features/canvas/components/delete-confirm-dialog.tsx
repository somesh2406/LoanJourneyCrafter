import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { useJourneyStore } from '@/stores/journey-store';

export function DeleteConfirmDialog() {
  const deleteConfirm = useUIStore((s) => s.deleteConfirm);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const deleteNode = useJourneyStore((s) => s.deleteNode);

  if (!deleteConfirm) return null;

  const handleConfirm = () => {
    if (deleteConfirm.nodeId) {
      deleteNode(deleteConfirm.nodeId);
    }
    setDeleteConfirm(null);
  };

  return (
    <Dialog
      open={!!deleteConfirm}
      onOpenChange={(open) => !open && setDeleteConfirm(null)}
      title={deleteConfirm.title}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900">
              {deleteConfirm.isStageWithChildren
                ? `This stage contains ${deleteConfirm.childCount} activities.`
                : `This component has ${deleteConfirm.connectionCount} connections.`}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {deleteConfirm.isStageWithChildren
                ? 'Deleting this stage container will permanently remove all child activities nested inside it, along with all associated connections.'
                : 'Deleting it will remove those connections. Dangling edges will be cleaned up automatically.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(null)}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            className="cursor-pointer text-xs"
          >
            {deleteConfirm.isStageWithChildren
              ? 'Delete Stage + Activities'
              : 'Confirm Delete'}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
