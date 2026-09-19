import * as React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { getJourneyRepository } from '@/services/journey/repository-factory';
import { useJourneyStore } from '@/stores/journey-store';
import { CanvasLayout } from '../components/canvas-layout';
import { Button } from '@/components/ui/button';

export function CanvasPage() {
  const { journeyId } = useParams({ strict: false }) as { journeyId: string };
  const navigate = useNavigate();
  const initJourney = useJourneyStore((s) => s.initJourney);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function fetchJourney() {
      try {
        setLoading(true);
        setError(null);

        const repo = getJourneyRepository();
        const journey = await repo.get(journeyId);

        if (!active) return;

        if (!journey) {
          setError(`Loan journey '${journeyId}' was not found in the local repository.`);
          return;
        }

        initJourney(journey);
      } catch (err) {
        if (!active) return;
        setError(`Failed to load journey: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (journeyId) {
      fetchJourney();
    }

    return () => {
      active = false;
    };
  }, [journeyId, initJourney]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-sm font-semibold tracking-wide">Initializing Journey Canvas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Journey Not Found</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{error}</p>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mt-5 gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Journey Library</span>
        </Button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <CanvasLayout />
    </ReactFlowProvider>
  );
}
