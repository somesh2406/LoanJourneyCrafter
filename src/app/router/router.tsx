import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { LibraryPage } from "@/features/journey-library/pages/library-page";
import { CanvasPage } from "@/features/canvas/pages/canvas-page";
import { MindmapPage } from "@/features/mindmap/pages/mindmap-page";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LibraryPage,
});

const journeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journeys/$journeyId",
  component: CanvasPage,
});

const mindmapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mindmaps/$mindmapId",
  component: MindmapPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  journeyRoute,
  mindmapRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
