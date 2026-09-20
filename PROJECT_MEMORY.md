# Project Memory & Architectural Decision Log (ADR)

This document preserves the institutional knowledge, engineering rationale, architectural decisions, and edge-case solutions discovered during the design and development of **Loan Journey Crafter**. It serves as a persistent guide for human developers and future AI agents.

---

## 1. Architectural Decision Records (ADRs)

### ADR-001: Separation of Domain Journey from Editor Graph State

- **Context**: Canvas libraries like `@xyflow/react` inject internal properties into nodes and edges (e.g., `selected`, `dragging`, `measured`, `internalsSymbol`, `isInsideCollapsed`).
- **Decision**: Maintain a pure domain model (`Journey`, `JourneyNode`, `JourneyEdge`) completely independent of `@xyflow/react`.
- **Rationale**:
  1. Ensures journeys can be stored in any database or transmitted via REST/GraphQL APIs without library-specific noise.
  2. Enables headless testing and validation (e.g., running `validateJourney` in Node.js or serverless functions without React or a DOM).
  3. Avoids vendor lock-in; if React Flow is swapped in the future, domain logic and persistence remain 100% intact.
- **Implementation**: Located in `src/domain/journey/mapper.ts` via `journeyToEditorState()` and `editorStateToJourney()`.

---

### ADR-002: Parent-Child Stage Nesting via Relative Coordinates

- **Context**: Stages act as visual and logical containers for multiple child activities. When moving a stage, all nested activities must move along with it.
- **Decision**: In the editor state, child activities define `parentId: stageId`, and their `position: { x, y }` coordinates are relative to the parent stage's top-left corner `(0, 0)`.
- **Rationale**:
  1. React Flow natively translates child nodes when a parent node moves if `parentId` is set, achieving 60 FPS performance without manually updating every child's coordinates on drag.
  2. Simplifies stage collapsing: Hiding child activities when a stage collapses requires only setting `hidden: true` on nodes where `parentId === stageId`.
- **Implementation**: Handled in `src/features/canvas/hooks/use-reparenting.ts` and `src/domain/journey/mapper.ts`.

---

### ADR-003: Discrete Condition Handles on Decision Nodes

- **Context**: Decision points evaluate underwriting and credit policy rules, branching into distinct outcomes (e.g., _STP Approved_, _Manual Underwriter Review_, _Decline_).
- **Decision**: Instead of a single generic source handle, `decisionNode` dynamically renders an individual source handle for each condition row with the format: `id="condition-{conditionId}"`.
- **Rationale**:
  1. When drawing a connector from a specific condition, the connector immediately inherits that condition's semantic meaning.
  2. The validation engine can verify that each outgoing edge corresponds to a real, valid condition ID on the decision node.
  3. Eliminates user confusion when multiple outgoing lines emerge from a decision node.
- **Implementation**: Handled in `src/features/canvas/nodes/decision-node.tsx` and `onConnect` in `src/stores/journey-store.ts`.

---

### ADR-004: Dual-Store Strategy (`useJourneyStore` vs. `useUIStore`)

- **Context**: The studio contains many ephemeral UI states (sidebar collapse, inspector panel toggle, glance HUD visibility, delete confirmation modals, camera highlight IDs).
- **Decision**: Strictly separate ephemeral UI state into `useUIStore`, keeping `useJourneyStore` reserved exclusively for persistent journey data and undo/redo history.
- **Rationale**:
  1. If UI toggles were stored in `useJourneyStore`, pressing `Ctrl+Z` (Undo) would un-collapse sidebars or re-open modals instead of reverting graph changes.
  2. Isolates component re-renders: Toggling a sidebar does not re-render canvas nodes or recalculate edge paths.

---

### ADR-005: Snapshot-Based Undo/Redo & Debounced Autosave

- **Context**: Financial workflows are complex; users need robust Undo/Redo support, and work must never be lost due to accidental tab closures or crashes.
- **Decision**:
  1. Store a deep copy snapshot (`HistorySnapshot`) of `nodes`, `edges`, `title`, `description`, and `status` on each discrete mutation (capped at 40 snapshots).
  2. Implement an 800ms debounce timer for autosave (`triggerAutosave()`).
- **Rationale**:
  1. Ephemeral mouse movements during dragging (`onNodesChange`) do not trigger snapshots. A snapshot is only committed on `onNodeDragStop`, keeping the history clean and lightweight.
  2. The 800ms debounce batches rapid keyboard strokes (e.g., typing a description or title) into a single save operation, preventing excessive storage writes.

---

## 2. Key Edge Cases Handled & Lessons Learned

### Edge Case 1: Stage Geometry Overflow & Dynamic Bounds

- **Problem**: When an activity was dragged into a stage, it could be dropped near the bottom or right edge, spilling outside the stage boundaries and triggering validation error `CHILD_OUTSIDE_BOUNDS`.
- **Solution**: The `calculateStageChildrenBounds` utility computes the minimum bounding box needed to encompass all children:
  $$\text{minWidth} = \max(\text{child}.x + \text{child}.\text{width}) + 24$$
  $$\text{minHeight} = \max(\text{child}.y + \text{child}.\text{height}) + 24$$
  If the stage's current size is smaller than these bounds, `reparentActivity` automatically enlarges the stage dimensions.

### Edge Case 2: Cascading Node & Edge Deletion

- **Problem**: Deleting a stage could leave orphaned child activities on the canvas, and deleting an activity or decision could leave dangling edges pointing to deleted node IDs.
- **Solution**: `deleteNode` in `useJourneyStore` identifies all child activities (`parentId === nodeId`), combines them into a deletion set, and filters out all edges connected to any node in that set. Similarly, `removeCondition` on a decision node automatically purges any edges originating from that condition's handle.

### Edge Case 3: Architecture Selection Auto-fill & Reset

- **Problem**: In the Create Journey dialog, selecting an architecture template auto-filled the title and description only if `title` was empty (`!title.trim()`). Selecting another template afterwards did not update the values because the title was already populated.
- **Solution**: Updated the selection handler to always overwrite title and description with the selected template's copy, and updated Blank Canvas to reset them to empty strings cleanly.

### Edge Case 4: Connector Arrow Renaming without Modifying Visual Design

- **Problem**: Connectors could be connected between nodes, but users had no mechanism to modify or give names to connector arrows.
- **Solution**:
  1. Added `updateEdgeLabel(edgeId, label)` to `useJourneyStore`.
  2. Enhanced `JourneyEdge` with an inline input (double-click label or click pencil icon), and added an `+ Add Name` button when hovered/selected if unlabelled.
  3. Added `ConnectorInspector` in the right inspector panel for full property editing when an edge is clicked.
  4. Preserved 100% of the existing arrow connector design (bezier path, markers, and styling).

### Edge Case 5: MiniMap String Dimensions Causing NaN in SVG viewBox

- **Problem**: In `GlanceView`, passing `style={{ width: '100%', height: '100%' }}` to `@xyflow/react`'s `<MiniMap>` caused the internal calculation `boundingRect.width / style.width` to evaluate to `NaN` in JavaScript. This resulted in an invalid SVG `viewBox="NaN NaN NaN NaN"`, preventing the canvas overview from rendering.
- **Solution**: Measured the container element dynamically using a ref and supplied concrete numeric dimensions (`width={dimensions.width}` and `height={dimensions.height}`), along with `maskStrokeColor="#2563eb"` and `maskStrokeWidth={2}` so the active viewport mask is clearly visible and synchronized.

### Edge Case 6: React Flow Stacking Context & Dropdown Menus Inside Nodes

- **Problem**: In React Flow, child activities (`activityNode`) render after parent stages (`stageNode`) in the DOM and have a higher stacking order. A dropdown menu rendered directly inside `StageNode` was trapped inside the parent's lower stacking context, rendering underneath the child activities.
- **Solution**: Implemented `usePortal={true}` support in `DropdownMenu`. The trigger's screen position is measured via `getBoundingClientRect()`, and the menu is portaled directly into `document.body` with `position: fixed` and `zIndex: 9999`. It opens at the exact same location as before, but renders on top of all child activities.

### Edge Case 7: Node Dimensions & Handle Recalculation on Collapse / Expand

- **Problem**: Collapsing a stage visually shrank it to 56px, but `node.height` remained 280px in React Flow's store. React Flow cached handle positions based on 280px (`y = 140px`). Consequently, connector arrows remained floating at the old 280px midpoint instead of moving to the collapsed stage.
- **Solution**:
  1. In `useJourneyStore`, `toggleStageCollapse`, `collapseAllStages`, and `expandAllStages` were updated to set `height: 56` (saving `expandedHeight`) when collapsed, and restore `height: expandedHeight` when expanded.
  2. In `StageNode`, `useUpdateNodeInternals(id)` is called on collapse/expand so React Flow recalculates handle positions (`left` and `right` snap to `y = 28px`), properly repositioning all connected arrows.
  3. In `mapper.ts`, `expandedHeight` is preserved during domain serialization so saved/loaded collapsed stages maintain their expanded dimensions.

---

## 3. Practical Guidance for Future Agents & Developers

1. **Adding a New Node Type**:
   - Define data interface in `src/domain/nodes/types.ts`.
   - Update `NodeType` union and `JourneyNodeData` union.
   - Update mapping in `src/domain/journey/mapper.ts` (`NODE_TYPE_DOMAIN_TO_FLOW` and `NODE_TYPE_FLOW_TO_DOMAIN`).
   - Create the React Flow node component in `src/features/canvas/nodes/`.
   - Register it in `nodeTypes` in `src/features/canvas/nodes/index.ts`.
   - Create a corresponding inspector in `src/features/inspector/components/`.

2. **Adding a New Validation Rule**:
   - Open `src/features/validation/engine/validate-journey.ts`.
   - Add rule logic inside `validateJourney()`.
   - Assign a distinct `code` (e.g., `MISSING_SLA_BENCHMARK`), appropriate `severity` (`'error'` vs `'warning'`), and always provide `targetId` and `targetType` so clicking the issue in `ValidationModal` focuses the camera directly on the target.

3. **Verifying Code Changes**:
   - Always run `npm run build` and `npm run lint`.
   - Never consider a task complete without automated build verification.
