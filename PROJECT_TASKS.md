# Project Tasks & Engineering Roadmap

This document serves as the living task board and roadmap for **Loan Journey Crafter**. It tracks completed features, active bug fixes, and prioritized future enhancements.

---

## 1. Task Status Overview

| Status               | Definition                                                                         |
| :------------------- | :--------------------------------------------------------------------------------- |
| **`COMPLETED`**      | Implemented, verified with automated build/lint, and documented in project memory. |
| **`IN_PROGRESS`**    | Currently under active development or testing.                                     |
| **`BACKLOG`**        | Prioritized for immediate upcoming sprints.                                        |
| **`FUTURE_ROADMAP`** | Strategic long-term architectural initiatives.                                     |

---

## 2. Completed Milestones & Features

### Epic 1: Core Canvas & Custom Node Rendering

- [x] Integrate `@xyflow/react` v12 with custom dot-grid background, smooth pan/zoom, and min/max boundaries (`0.2x` to `2.5x`).
- [x] Implement **Stage Node (`stageNode`)**: Container component with stage numbering, title/description, collapse toggle, and droppable interior.
- [x] Implement **Activity Node (`activityNode`)**: Discrete operational card with category icon, status indicator, and left/right connection handles.
- [x] Implement **Decision Node (`decisionNode`)**: Condition-based branching card with dynamic condition list and discrete condition handles (`condition-{id}`).
- [x] Implement **Note Node (`noteNode`)**: Sticky note component for SLA targets and team annotations.
- [x] Implement **Arrow Connector (`journeyEdge`)**: Smooth Bezier paths, directional arrows (`MarkerType.ArrowClosed`), and hover hitboxes.

### Epic 2: Hierarchical Stage Nesting & Reparenting

- [x] Implement `useReparenting` hook for collision detection when dropping activities over stages.
- [x] Implement `calculateStageChildrenBounds` utility for dynamic stage expansion to prevent child overflow.
- [x] Implement stage collapse/expand: Hiding nested children while preserving relative coordinates.
- [x] Cascade deletion: Deleting a stage automatically removes all nested child activities and their connections.

### Epic 3: Journey Library & Template Catalog

- [x] Build Library dashboard (`/`) displaying saved journeys with stage/node/edge counters and status pills.
- [x] Build industry template fixtures:
  - _Instant Personal Loan_ (`personal-loan.json`)
  - _Secured Vehicle Loan_ (`vehicle-loan.json`)
  - _MSME Working Capital Loan_ (`msme-loan.json`)
- [x] Build JSON import and export system with Zod schema validation.
- [x] Journey pinning and real-time keyword search filtering.

### Epic 4: Real-time Validation Engine

- [x] Build pure validation engine (`validate-journey.ts`) evaluating 10 structural and banking rules:
  - Duplicate Node IDs, Missing Titles, Orphaned Activities, Invalid Parent Types.
  - Geometry bounds overflow (`CHILD_OUTSIDE_BOUNDS`).
  - Empty stages, Decision nodes without outgoing branches, Invalid conditions.
  - Broken connection pointers and disconnected stages/activities.
- [x] Build `ValidationModal` diagnostic drawer with one-click camera focus on offending nodes/edges.

### Epic 5: Right Inspector Panel Suite

- [x] Context-aware inspector sidebar (`InspectorPanel`) displaying specific properties based on selection.
- [x] `StageInspector`: Title, description, status, stage number, color theme, collapse toggle.
- [x] `ActivityInspector`: Title, description, category, stage assignment, color theme.
- [x] `DecisionInspector`: Title, branch condition manager (add, edit, remove conditions).
- [x] `NoteInspector`: Title, rich text content, color theme.
- [x] `ColorPalettePicker`: 7-theme palette selector (`blue`, `green`, `amber`, `cyan`, `purple`, `red`, `neutral`).

### Epic 6: Ephemeral UI Overlays & Productivity

- [x] Build `GlanceView`: Floating statistics HUD displaying stage count, activity count, decisions, connections, and validation status.
- [x] Build `JourneyOverview`: Canvas minimap with live viewport bounds indicator.
- [x] Build `FloatingToolbar`: Canvas controls for zoom in, zoom out, fit view, and fullscreen toggle.
- [x] Build `DeleteConfirmDialog`: Warning dialog displaying impact before deleting nodes with connections or stages with children.

### Epic 7: Persistence & Undo/Redo Transactions

- [x] Implement snapshot-based history (`past`, `future`, `canUndo`, `canRedo`) capped at 40 transactions.
- [x] Implement 800ms debounced autosave saving to `LocalStorageJourneyRepository`.
- [x] Keyboard shortcuts (`Ctrl+S`, `Ctrl+Z`, `Ctrl+Y`, `Delete`, `Backspace`, `Escape`, `F`).

---

## 3. Current Sprint: Targeted Fixes & Documentation

### Targeted Fixes

- [x] **Fix 1: Create Journey Dialog Architecture Selection**:
  - **Issue**: Selecting an architecture template auto-filled title/description for the first time, but selecting another template afterwards failed to update.
  - **Resolution**: Updated `onClick` handlers in `create-journey-dialog.tsx` so selecting any template always updates title to `${tmpl.journey.title} Copy` and description to `tmpl.journey.description`, and selecting Blank Canvas resets them cleanly.
- [x] **Fix 2: Canvas Connector (Arrow) Name Modification**:
  - **Issue**: Connectors could be created, but users had no way to modify or give names to connector arrows.
  - **Resolution**: Added `updateEdgeLabel` store action; added inline editing (double-click or pencil icon) and `+ Add Name` button on `JourneyEdge`; created `ConnectorInspector` in the inspector panel for full property editing. Preserved 100% of the existing arrow connector design.
- [x] **Fix 3: GlanceView MiniMap Canvas Rendering**:
  - **Issue**: MiniMap inside GlanceView was not rendering the canvas view due to string width/height (`'100%'`) producing `NaN` in SVG `viewBox`.
  - **Resolution**: Replaced string dimensions with concrete numeric dimensions (`width={dimensions.width}` and `height={dimensions.height}`) from a container ref (`206px x 126px`), and added `maskStrokeColor="#2563eb"` with `maskStrokeWidth={2}` for clear viewport synchronization.
- [x] **Fix 4: Stage Plus / Options Menu Stacking Context (Portal)**:
  - **Issue**: The dropdown menu inside `StageNode` opened underneath child activity components due to React Flow DOM node stacking contexts.
  - **Resolution**: Added `usePortal={true}` to `DropdownMenu` using `createPortal` to `document.body` with fixed positioning (`zIndex: 9999`). The menu opens at the exact same location, but renders on top of all child activities. Updated trigger button to Plus icon.
- [x] **Fix 5: Connector Repositioning on Stage Collapse & Expand**:
  - **Issue**: When stages collapsed, connector arrows remained floating at the old 280px midpoint because `node.height` was not updated in the store and handle positions were not recalculated.
  - **Resolution**: Updated `toggleStageCollapse`, `collapseAllStages`, and `expandAllStages` in `useJourneyStore` to sync `height: 56` and track `expandedHeight`. In `StageNode`, called `useUpdateNodeInternals` so React Flow recalculates handle positions (`left`/`right` at `y = 28px`), properly moving connector arrows.

### Documentation Suite

- [x] `PRODUCT_REQUIREMENT_DOCUMENT.md`: Complete PRD covering personas, features, lifecycle states, and acceptance criteria.
- [x] `ARCHITECTURE_DOCUMENT.md`: Technical architecture, DDD separation, Zustand stores, coordinate systems, and repository layer.
- [x] `DEVELOPMENT_RULES.md`: Code style, state mutation protocols, vibe-coding discipline, and verification rules.
- [x] `DESIGN_SYSTEM.md`: Color tokens, typography, component primitives, and canvas node/edge visual specs.
- [x] `PROJECT_TASKS.md`: Living task backlog, completed epics, and future roadmap.
- [x] `PROJECT_MEMORY.md`: Institutional knowledge, architectural decisions, and edge case resolutions.

---

## 4. Short-Term Backlog

- [ ] **Canvas Image Exporter**: Add "Export as PNG" and "Export as SVG" buttons to the canvas top navbar for presentations and executive review.
- [ ] **Multi-Node Selection & Dragging**: Allow box-selection (marquee select) to move multiple stages and activities simultaneously.
- [ ] **Duplicate Node Action**: Add quick "Duplicate" button in node inspectors and context menus to clone an activity or stage with all its configuration.
- [ ] **SLA & Policy Timer Annotations**: Allow credit policy architects to attach SLA time limits (e.g., "Max 4 hours") directly to activity cards.

---

## 5. Long-Term Architectural Roadmap

- [ ] **Real-Time Collaboration**: Multi-user concurrent editing using WebSockets / CRDT (Yjs) with live user cursors.
- [ ] **Backend Microservice Sync**: Connect `ApiJourneyRepository` to an enterprise database (PostgreSQL) with JWT authentication and RBAC.
- [ ] **BPMN 2.0 & Orchestration Exporter**: Translate loan journeys directly into BPMN XML for execution on Camunda or Temporal.
- [ ] **Audit Trail & Diff Viewer**: Side-by-side visual diff tool showing changes between journey version `1.0.0` and `1.1.0`.
