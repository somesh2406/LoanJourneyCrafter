# Architecture Document

## 1. Architectural Philosophy & Principles

The **Loan Journey Crafter** architecture adheres to **Domain-Driven Design (DDD)** and **Clean Architecture** principles. The application strictly decouples core business domain models from graphical canvas rendering libraries, UI component libraries, and browser persistence mechanisms.

```
+-------------------------------------------------------------------------+
|                         PRESENTATION LAYER                              |
|   TanStack Router  |  React 19 Components  |  Tailwind CSS v4           |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------+------------------------------------+
|                         STATE & ORCHESTRATION                           |
|   useJourneyStore (Zustand)         |  useUIStore (Zustand)             |
|   - Snapshot History (Undo/Redo)    |  - Panel visibility               |
|   - Debounced Autosave (800ms)      |  - Selection & Dialog state       |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------+------------------------------------+
|                         MAPPING / ADAPTER LAYER                         |
|   journeyToEditorState()  <=======>  editorStateToJourney()             |
|   (Pure Domain Journey)   <=======>  (@xyflow/react Editor Nodes/Edges) |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------+------------------------------------+
|                         CORE DOMAIN LAYER                               |
|   - Journey, JourneySummary, JourneyTemplate (types.ts)                 |
|   - JourneyNode, StageData, ActivityData, DecisionData, NoteData        |
|   - JourneyEdge, Condition                                              |
|   - Zod Validation Schemas (schemas.ts)                                 |
|   - Validation Engine (validate-journey.ts)                             |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------+------------------------------------+
|                         INFRASTRUCTURE / REPOSITORY                     |
|   JourneyRepository (Interface)                                         |
|   ├── LocalStorageJourneyRepository (Active Local Storage)              |
|   └── ApiJourneyRepository (REST API Microservice Ready)                |
+-------------------------------------------------------------------------+
```

### Core Tenets:

1. **Zero Library Leaks in Domain Layer**: The domain entities (`Journey`, `JourneyNode`, `JourneyEdge`) know nothing about `@xyflow/react`, DOM events, or canvas positions beyond basic `{ x, y }` coordinates.
2. **Deterministic Serialization**: A journey can be serialized into pure JSON, stored in any database or passed through an API, and deserialized without loss of semantic meaning or layout structure.
3. **Transactional Mutation History**: Every state mutation that alters the graph creates a deep copy snapshot in the undo/redo past stack before triggering a debounced background save.
4. **Resilient Graph Constraints**: Dangling edges and orphaned child nodes are guarded against at both the store level and the validation engine level.

---

## 2. Technology Stack & Key Decisions

| Category                    | Technology                            | Rationale                                                                                                                                                                  |
| :-------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime & Core**          | React 19, TypeScript 6, Vite 8        | Bleeding-edge React capabilities, high-performance module bundling, and strict static type checking.                                                                       |
| **Canvas Engine**           | `@xyflow/react` (React Flow v12)      | Industry standard for node-based editors. Provides smooth pan/zoom virtualization, customizable handles, custom edge renderers, and robust sub-flow (nested node) support. |
| **State Management**        | Zustand v5                            | Minimal boilerplate, unopinionated, zero React Context re-render cascades, and seamless integration with non-React asynchronous triggers.                                  |
| **Routing**                 | TanStack Router v1                    | Type-safe URL navigation, robust route matching, and search param management.                                                                                              |
| **Styling & Design System** | Tailwind CSS v4 + `@tailwindcss/vite` | Next-generation CSS engine with lightning-fast builds, modern CSS variables, and consistent design tokens.                                                                 |
| **Schema Validation**       | Zod v4                                | Runtime schema parsing for JSON imports, template validation, and domain contracts.                                                                                        |
| **Icons & UI Primitives**   | Lucide React                          | Clean, scalable enterprise iconography.                                                                                                                                    |

---

## 3. Directory & Module Structure

```
src/
├── app/                        # Application entry points & routing setup
│   ├── providers/              # React context providers (AppProviders)
│   └── router/                 # TanStack Router configuration (root, library, canvas)
├── assets/                     # Static images, hero banners, and SVG assets
├── components/                 # Shared UI primitives
│   └── ui/                     # Button, Dialog, Input, Textarea, Badge, Tabs, Tooltip
├── config/                     # Configuration and constants
│   └── colors.ts               # Theme color palette tokens and color mappings
├── data/                       # Built-in template fixtures
│   └── templates/              # MSME, Personal, and Vehicle loan default graphs
├── domain/                     # Pure domain layer (no React/Flow dependencies)
│   ├── edges/                  # Edge interfaces (JourneyEdge)
│   ├── nodes/                  # Node interfaces (Stage, Activity, Decision, Note)
│   └── journey/                # Journey entities, Zod schemas, and bidirectional mappers
├── features/                   # Feature-driven slices
│   ├── canvas/                 # Visual studio canvas
│   │   ├── components/         # CanvasLayout, TopNavbar, ComponentSidebar, etc.
│   │   ├── edges/              # JourneyEdge custom edge renderer
│   │   ├── hooks/              # useCanvasDragDrop, useReparenting, useKeyboardShortcuts
│   │   ├── nodes/              # StageNode, ActivityNode, DecisionNode, NoteNode
│   │   └── pages/              # CanvasPage route container
│   ├── inspector/              # Right sidebar property editors
│   │   └── components/         # Stage, Activity, Decision, Note, Connector Inspectors
│   ├── journey-library/        # Library management & template selection
│   │   ├── components/         # LibraryNavbar, HeroBanner, Create/Import Dialogs
│   │   └── pages/              # LibraryPage route container
│   └── validation/             # Graph verification engine & validation modal
│       ├── components/         # ValidationModal diagnostic drawer
│       └── engine/             # Pure rule evaluation engine (validateJourney)
├── services/                   # Infrastructure and repository implementations
│   └── journey/                # LocalStorage and API repository implementations
├── stores/                     # Global Zustand state stores
│   ├── journey-store.ts        # Graph data, history, and mutations
│   └── ui-store.ts             # Ephemeral UI states (panels, modals, confirmations)
└── utils/                      # Helper utilities (geometry, cn, id generators)
```

---

## 4. State Management & Data Flow

### 4.1 Store Architecture (`useJourneyStore`)

`useJourneyStore` is the central source of truth for the active canvas. It manages:

- **Active Metadata**: `journeyId`, `title`, `description`, `version`, `status`, `createdAt`, `updatedAt`, `isPinned`.
- **Active Graph**: `nodes: EditorNode[]`, `edges: EditorEdge[]`.
- **Selection**: `selectedNodeId: string | null`, `selectedEdgeId: string | null`.
- **Transaction History**: `past: HistorySnapshot[]`, `future: HistorySnapshot[]`, `canUndo`, `canRedo` (capped at 40 snapshots).
- **Autosave Pipeline**: 800ms debounce timer that automatically commits graph mutations to the repository without freezing UI interactions.

### 4.2 Ephemeral UI Store (`useUIStore`)

Separated from the canvas graph to avoid invalidating the undo/redo stack during transient UI actions:

- `sidebarCollapsed`, `inspectorOpen`, `overviewOpen`, `glanceOpen`, `fullscreen`.
- `validationModalOpen`, `deleteConfirm` data, and `highlightedNodeId` for cross-component focus.

---

## 5. Domain Modeling & Bidirectional Mapping

### 5.1 Domain Entities vs. Editor Entities

- **Domain Node (`JourneyNode`)**:
  ```ts
  export interface JourneyNode<TData = JourneyNodeData> {
    id: string;
    type: "STAGE" | "ACTIVITY" | "DECISION" | "NOTE";
    position: { x: number; y: number };
    size: { width: number; height: number };
    parentId?: string | null;
    data: TData;
    style?: Record<string, unknown>;
  }
  ```
- **Editor Node (`EditorNode`)**:
  - Typed `@xyflow/react` `Node<EditorNodeData>` where `type` maps to `stageNode`, `activityNode`, `decisionNode`, `noteNode`.
  - Nested children inherit `parentId`, and hidden flags are automatically evaluated if a parent stage is collapsed.

### 5.2 Bidirectional Mapping Functions

Located in `src/domain/journey/mapper.ts`:

- **`journeyToEditorState(journey)`**: Maps domain nodes and edges to `@xyflow/react` compliant structures. Calculates collapsed stage states and sets child `hidden` flags.
- **`editorStateToJourney(nodes, edges, meta)`**: Reconstitutes pure domain JSON, stripping React Flow ephemeral flags and resolving final measured bounds.

---

## 6. Hierarchical Stage Nesting & Geometry Engine

Stages serve as logical and physical grouping containers for activities.

1. **Coordinate Systems**:
   - Stage positions are **absolute** to the root canvas coordinate space.
   - Child activity positions are **relative** to their parent stage's top-left origin `(0, 0)`.
2. **Reparenting (`useReparenting`)**:
   - When an activity is dragged and released, collision detection evaluates whether its center intersects any `stageNode`.
   - If dropped into a stage, the store converts the absolute drop coordinates into parent-relative coordinates and updates `parentId`.
   - `calculateStageChildrenBounds` calculates the minimum bounding box required to contain all children:
     $$\text{minWidth} = \max(\text{child}.x + \text{child}.\text{width}) + 24$$
     $$\text{minHeight} = \max(\text{child}.y + \text{child}.\text{height}) + 24$$
   - If the stage's current size is smaller than the required bounds, the stage is automatically resized.

---

## 7. Connectors & Decision Condition Architecture

Connectors are rendered by `JourneyEdge`:

- **Smooth Bezier Curves**: Generated via `getBezierPath` connecting node source/target handles.
- **Decision Outgoing Branches**:
  - Decision nodes dynamically render handles for each condition in their data array using the format: `id="condition-{conditionId}"`.
  - When connecting from a condition handle, `onConnect` extracts `conditionId` and stores it directly on `edge.data.conditionId`.
- **Connector Renaming**:
  - Connectors support custom labels (`edge.data.label`).
  - Labels can be modified via inline canvas editing or via the `ConnectorInspector`.
  - The domain mapper preserves `edge.label` and `edge.conditionId` cleanly.

---

## 8. Repository Pattern & Storage Abstraction

```ts
export interface JourneyRepository {
  list(): Promise<JourneySummary[]>;
  get(id: string): Promise<Journey | null>;
  create(input: CreateJourneyInput): Promise<Journey>;
  update(id: string, input: UpdateJourneyInput): Promise<Journey>;
  delete(id: string): Promise<boolean>;
  togglePin(id: string): Promise<boolean>;
  listTemplates(): Promise<JourneyTemplate[]>;
}
```

- **`LocalStorageJourneyRepository`**: Uses `localStorage` with seed initialization from `src/data/templates`. Implements automatic JSON parsing, fallback error handling, and mock latency simulation for realistic UI testing.
- **`ApiJourneyRepository`**: Drop-in implementation ready for connecting to enterprise backend services via `fetch`/`axios`.
- **`repository-factory.ts`**: Provides a single dependency injection point (`getJourneyRepository()`). Switching persistence across the entire app requires changing only one environment variable or factory return.
