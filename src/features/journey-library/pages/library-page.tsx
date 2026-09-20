import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Pin,
  Clock,
  LayoutTemplate,
  Plus,
  Search,
  GitFork,
} from "lucide-react";
import {
  JourneySummary,
  JourneyTemplate,
  Journey,
} from "@/domain/journey/types";
import { MindmapSummary } from "@/domain/mindmap/types";
import { getJourneyRepository } from "@/services/journey/repository-factory";
import { getMindmapRepository } from "@/services/mindmap/repository-factory";
import { LibraryNavbar } from "../components/library-navbar";
import { HeroBanner } from "../components/hero-banner";
import { JourneyCard } from "../components/journey-card";
import { MindmapCard } from "../components/mindmap-card";
import { TemplateCard } from "../components/template-card";
import {
  CreateJourneyDialog,
  CreationType,
} from "../components/create-journey-dialog";
import { ImportJourneyDialog } from "../components/import-journey-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LibraryPage() {
  const navigate = useNavigate();
  const repo = React.useMemo(() => getJourneyRepository(), []);
  const mindmapRepo = React.useMemo(() => getMindmapRepository(), []);

  const [journeys, setJourneys] = React.useState<JourneySummary[]>([]);
  const [templates, setTemplates] = React.useState<JourneyTemplate[]>([]);
  const [mindmaps, setMindmaps] = React.useState<MindmapSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] =
    React.useState<string | undefined>();

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [allJourneys, allTemplates, allMindmaps] = await Promise.all([
        repo.list(),
        repo.listTemplates(),
        mindmapRepo.list(),
      ]);
      setJourneys(allJourneys);
      setTemplates(allTemplates);
      setMindmaps(allMindmaps);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, [repo, mindmapRepo]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenJourney = (id: string) => {
    navigate({ to: "/journeys/$journeyId", params: { journeyId: id } });
  };

  const handleOpenMindmap = (id: string) => {
    navigate({ to: "/mindmaps/$mindmapId", params: { mindmapId: id } });
  };

  const handleTogglePin = async (id: string) => {
    await repo.togglePin(id);
    await loadData();
  };

  const handleTogglePinMindmap = async (id: string) => {
    await mindmapRepo.togglePin(id);
    await loadData();
  };

  const handleDeleteJourney = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this journey? This action cannot be undone.",
      )
    ) {
      await repo.delete(id);
      await loadData();
    }
  };

  const handleDeleteMindmap = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this mindmap? This action cannot be undone.",
      )
    ) {
      await mindmapRepo.delete(id);
      await loadData();
    }
  };

  const handleCreateJourney = async (data: {
    title: string;
    description: string;
    type: CreationType;
    templateId?: string;
  }) => {
    if (data.type === "mindmap") {
      const created = await mindmapRepo.create({
        title: data.title,
        description: data.description,
      });
      navigate({
        to: "/mindmaps/$mindmapId",
        params: { mindmapId: created.id },
      });
    } else {
      const created = await repo.create(data);
      navigate({
        to: "/journeys/$journeyId",
        params: { journeyId: created.id },
      });
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateForCreate(templateId);
    setCreateDialogOpen(true);
  };

  const handleImportSuccess = async (importedJourney: Journey) => {
    const existing = await repo.get(importedJourney.id);
    const targetId =
      existing ? `journey-import-${Date.now()}` : importedJourney.id;
    const finalJourney: Journey = {
      ...importedJourney,
      id: targetId,
      title:
        existing ?
          `${importedJourney.title} (Imported)`
        : importedJourney.title,
      updatedAt: new Date().toISOString(),
    };

    const created = await repo.create({
      title: finalJourney.title,
      description: finalJourney.description,
    });
    await repo.update(created.id, {
      nodes: finalJourney.nodes,
      edges: finalJourney.edges,
      metadata: finalJourney.metadata,
      status: finalJourney.status,
      version: finalJourney.version,
    });

    navigate({ to: "/journeys/$journeyId", params: { journeyId: created.id } });
  };

  const filteredJourneys = journeys.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredMindmaps = mindmaps.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedJourneys = filteredJourneys.filter((j) => j.isPinned);
  const recentJourneys = filteredJourneys;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LibraryNavbar
        onCreateClick={() => {
          setSelectedTemplateForCreate(undefined);
          setCreateDialogOpen(true);
        }}
        onImportClick={() => setImportDialogOpen(true)}
      />

      <HeroBanner
        onCreateClick={() => {
          setSelectedTemplateForCreate(undefined);
          setCreateDialogOpen(true);
        }}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Search bar & count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Journey & MindMap Repositories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {journeys.length} {journeys.length === 1 ? "journey" : "journeys"}{" "}
              · {mindmaps.length}{" "}
              {mindmaps.length === 1 ? "mindmap" : "mindmaps"} in local
              repository
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter journeys & mindmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Section 1: Pinned Journeys */}
        {pinnedJourneys.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Pin className="h-3.5 w-3.5 fill-blue-700" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Pinned Journeys
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pinnedJourneys.map((j) => (
                <JourneyCard
                  key={j.id}
                  journey={j}
                  onOpen={handleOpenJourney}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDeleteJourney}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Recent Journeys */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-slate-700">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Recent Journeys
              </h3>
            </div>
            {recentJourneys.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplateForCreate(undefined);
                  setCreateDialogOpen(true);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Journey
              </Button>
            )}
          </div>

          {loading ?
            <div className="flex h-40 items-center justify-center text-xs text-slate-400">
              Loading journeys...
            </div>
          : recentJourneys.length === 0 ?
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                No journeys found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {searchQuery ?
                  "No journeys match your search query."
                : "Get started by creating a new loan journey or using an enterprise template below."
                }
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-4 text-xs"
              >
                Create Journey
              </Button>
            </div>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentJourneys.map((j) => (
                <JourneyCard
                  key={j.id}
                  journey={j}
                  onOpen={handleOpenJourney}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDeleteJourney}
                />
              ))}
            </div>
          }
        </section>

        {/* Section 3: MindMaps Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                <GitFork className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  MindMaps & Architecture Trees
                </h3>
                <p className="text-xs text-slate-500">
                  Visual ideation trees, domain decompositions, and
                  microservices maps
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTemplateForCreate(undefined);
                setCreateDialogOpen(true);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New MindMap
            </Button>
          </div>

          {loading ?
            <div className="flex h-32 items-center justify-center text-xs text-slate-400">
              Loading mindmaps...
            </div>
          : filteredMindmaps.length === 0 ?
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No mindmaps found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Create a mindmap to start brainstorming microservices, journeys,
                or workflows.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Create MindMap
              </Button>
            </div>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMindmaps.map((m) => (
                <MindmapCard
                  key={m.id}
                  mindmap={m}
                  onOpen={handleOpenMindmap}
                  onTogglePin={handleTogglePinMindmap}
                  onDelete={handleDeleteMindmap}
                />
              ))}
            </div>
          }
        </section>

        {/* Section 4: Templates */}
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <LayoutTemplate className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Industry Templates
              </h3>
              <p className="text-xs text-slate-500">
                Pre-built origination graphs following banking standards
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                onUseTemplate={handleUseTemplate}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Dialogs */}
      <CreateJourneyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateJourney}
        preselectedTemplateId={selectedTemplateForCreate}
      />

      <ImportJourneyDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
