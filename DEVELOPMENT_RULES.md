# Development Rules & Engineering Standards

This document establishes the official engineering guidelines, code style, state mutation protocols, and collaboration rules for **Loan Journey Crafter**. All human contributors and autonomous AI agents working on this codebase must adhere strictly to these rules.

---

## 1. General Principles & "Vibe-Coding" Discipline

When developing rapidly or "vibe coding", it is easy for architecture to erode and tribal knowledge to evaporate. To prevent this:

1. **Targeted Modifications Only**: Never modify, refactor, or rewrite existing files that are outside the scope of your assigned task. If a bug fix requires touching `create-journey-dialog.tsx`, do not reformat or reorganize `top-navbar.tsx` or unrelated files.
2. **Preserve Comments & Rationale**: Retain all existing docstrings, TypeScript types, and architectural comments. Do not delete explanatory notes during edits.
3. **Documentation in Lockstep**: Any change to domain models, canvas nodes, store actions, or validation rules must be immediately documented in `PROJECT_MEMORY.md` and `PROJECT_TASKS.md`.
4. **Zero Regressions**: Before concluding any development session, always execute:
   ```powershell
   npm run build
   npm run lint
   ```
   Both checks must pass with zero TypeScript errors.

---

## 2. TypeScript & Code Standards

- **Strict Type Checking**: TypeScript strict mode is enabled. Do not disable strict flags.
- **No Implicit or Explicit `any`**:
  - Prefer `unknown` combined with type guards or Zod parsing over `any`.
  - Use generic parameters or indexed access types when dealing with dynamic metadata (`Record<string, unknown>`).
- **Discriminated Unions**:
  - Node types must use the `NodeType` union (`'STAGE' | 'ACTIVITY' | 'DECISION' | 'NOTE'`).
  - Journey lifecycle states must use `JourneyStatus` (`'draft' | 'in_review' | 'published' | 'archived'`).
  - Node statuses must use `JourneyNodeStatus` (`'draft' | 'in_progress' | 'review' | 'completed' | 'deprecated'`).
- **Path Aliases**: Always use `@/` for imports from `src/` (e.g., `@/domain/journey/types`, `@/stores/journey-store`). Never use messy relative paths like `../../../stores`.

---

## 3. State Management & Graph Mutation Rules

### 3.1 Store Separation

The application utilizes two distinct Zustand stores:

1. **`useJourneyStore`**: Manages the domain graph, canvas nodes/edges, selection, and transaction history.
2. **`useUIStore`**: Manages ephemeral UI state (e.g., panel collapse, active modals, glance view visibility, delete confirmations).

**Rule**: Never mix ephemeral UI state into `useJourneyStore`. UI toggles should never pollute the undo/redo past history stack.

### 3.2 The Graph Mutation Protocol

Every modification to the canvas graph (adding nodes, moving nodes, deleting nodes, adding/updating edges, modifying node properties) **must** follow this protocol:

1. **Capture Snapshot**: Call `get().pushSnapshot()` before applying the mutation. This pushes the previous state onto `past` (capped at 40 snapshots) and clears `future`.
2. **Apply State Immutably**: Update the `nodes` or `edges` array using pure array functions (`.map()`, `.filter()`, spread operator). Never mutate an object or array in place.
3. **Trigger Autosave**: Call `triggerAutosave()`, which debounces a background save to the repository by 800ms.

```ts
// EXAMPLE: Correct mutation pattern
updateEdgeLabel: (edgeId: string, label: string) => {
  get().pushSnapshot(); // 1. Snapshot for Undo
  set({
    edges: get().edges.map((e) => {
      if (e.id === edgeId) {
        return {
          ...e,
          data: { ...e.data, label: label.trim() || null }, // 2. Pure immutable update
        };
      }
      return e;
    }),
  });
  triggerAutosave(); // 3. Debounced Autosave
};
```

### 3.3 Node & Edge Deletion Rules

- When deleting a `STAGE` node, you **must** also delete all child activities nested inside that stage (`parentId === stageId`).
- When deleting any node, all connected edges (where `source === nodeId` or `target === nodeId`) **must** be pruned simultaneously to prevent dangling edges.
- When deleting a condition from a `DECISION` node, any edge originating from that condition handle (`condition-{id}`) **must** be removed.

---

## 4. Canvas & React Flow (`@xyflow/react`) Guidelines

1. **Custom Node Types**:
   - Registered in `src/features/canvas/nodes/index.ts`:
     - `stageNode`: Container node with collapse support and child rendering.
     - `activityNode`: Standard operational card with category icon.
     - `decisionNode`: Condition evaluation card with dynamic output handles.
     - `noteNode`: Sticky note annotation component.
   - Do not register ad-hoc node types without updating `domain/nodes/types.ts` and `domain/journey/mapper.ts`.
2. **Custom Edge Types**:
   - Registered in `src/features/canvas/edges/index.ts`:
     - `journeyEdge`: Custom bezier curve with label pill, inline name editing, and hover delete button.
   - Do not alter the arrow connector design (marker, stroke width, bezier curvature) unless specifically directed.
3. **Handle Naming Discipline**:
   - Normal nodes use `'left'` (target) and `'right'` (source).
   - Decision condition handles **must** use the format: `condition-{conditionId}` so the connection handler can accurately link branch conditions.
4. **Coordinate Space Discipline**:
   - Root nodes (Stages, standalone Activities, Decisions, Notes) use absolute coordinates.
   - Nested activities use coordinates relative to the top-left of their parent Stage `(0, 0)`.
   - Never assign negative coordinates to nested activities.

---

## 5. UI, Component & Styling Rules

1. **Tailwind CSS v4 Usage**:
   - Use standard Tailwind utility classes.
   - When merging classes dynamically, always use the `cn(...)` utility (`clsx` + `tailwind-merge`) from `@/utils/cn`.
2. **Design Tokens & Colors**:
   - Always reference colors from `src/config/colors.ts` (`COLOR_PALETTE`) to maintain design consistency across stages, activities, badges, and handles.
   - The supported theme color union is: `'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan'`.
3. **Interactive Affordances**:
   - Every clickable button, card, and handle must have `cursor-pointer`.
   - Interactive icons must feature accessible `title` and `aria-label` attributes.
   - Dangerous actions (e.g., deleting a stage with multiple activities) must prompt the `DeleteConfirmDialog`.

---

## 6. Validation Engine Protocol

The validation engine in `src/features/validation/engine/validate-journey.ts` is the single source of truth for journey graph health:

- Validation is a **pure function**: `validateJourney(journey: Journey): ValidationReport`.
- Issues are categorized as:
  - `'error'`: Critical structural flaws (duplicate IDs, orphaned children, broken edge pointers, child outside stage bounds). A journey with errors cannot be published.
  - `'warning'`: Best practice recommendations (missing titles, empty notes, disconnected milestones).
- When adding new validation rules, always assign a unique issue `code` (e.g., `MISSING_SLA_BENCHMARK`) and ensure `targetId` and `targetType` are set to enable camera auto-focusing in the canvas.
