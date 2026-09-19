# Product Requirement Document (PRD)

## 1. Executive Summary & Vision

**Loan Journey Crafter** (marketed as _Loan Journey Studio - Enterprise V1_) is a domain-specific visual workflow modeling and governance platform designed for retail, SME, and commercial lending institutions.

Modern lending architectures require complex orchestration across identity verification (KYC/AML), fraud scoring, bureau pulls, automated decision engines, collateral evaluations, manual credit underwriting, and payment disbursement rails. Traditionally, these processes are either documented in static, out-of-date flowcharts (Visio, Miro) or buried directly inside microservice orchestration engines (Camunda, Temporal), creating a massive disconnect between Credit Risk Officers, Product Managers, and Engineering Teams.

**Loan Journey Crafter** bridges this gap by providing an enterprise-grade, canvas-based studio where product architects and risk engineers can:

- Visually model multi-stage loan origination flows with strict hierarchical nesting.
- Define decision logic, condition branching, and STP (Straight-Through-Processing) paths.
- Enforce institutional credit policy and structural graph validity via an automated **Validation Engine**.
- Maintain versioned, auditable journey definitions that serialize cleanly into deterministic JSON schemas ready for deployment or system execution.

---

## 2. Target User Personas

| Persona                             | Role                          | Core Goals & Needs                                                                                                                                                                                                         |
| :---------------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lending Product Manager (PM)**    | Product Owner / Business Lead | Rapidly design, iterate, and launch new credit products (e.g., Instant Digital Personal Loan, Green Vehicle Finance, MSME Working Capital); ensure optimal customer conversion and minimal drop-off across journey stages. |
| **Credit Risk Architect**           | Risk & Policy Strategist      | Model credit policy rules, bureau decisioning cut-offs, KYC verification gates, and collateral valuation paths; verify that no loan can be disbursed without mandatory regulatory checks.                                  |
| **Fintech Systems Engineer**        | Integration Architect         | Export structured journey schemas into orchestration microservices; ensure deterministic node IDs, conditions, and connection routing.                                                                                     |
| **Compliance & Operations Auditor** | Regulatory & Audit Officer    | Review the entire end-to-end origination journey, inspect approval thresholds, ensure compliance with national lending regulations (e.g., RBI, CFPB, EBA), and verify that all stages have SLA benchmarks.                 |

---

## 3. Product Architecture & Lifecycle States

### 3.1 Journey Lifecycle States

Every loan journey transitions through four formal lifecycle states:

1. **`draft`**: Work in progress. Graph mutations, additions, and structural experiments are permitted. May contain validation warnings or non-blocking errors.
2. **`in_review`**: Submitted for cross-functional review between Product, Risk, and Compliance. Highlighted for peer inspection and validation compliance.
3. **`published`**: Golden master version approved for production or core-banking orchestration.
4. **`archived`**: Deprecated or legacy journey retained strictly for audit and historical analysis.

### 3.2 Key Product Modules

```
+-----------------------------------------------------------------------------------+
|                            LOAN JOURNEY STUDIO SUITE                              |
+-----------------------------------------------------------------------------------+
|  1. JOURNEY LIBRARY             2. VISUAL CANVAS STUDIO     3. COMPLIANCE ENGINE  |
|  - Template Catalog             - Multi-Stage Container     - Graph Linter        |
|  - Search, Filter & Pinning     - Activity Nodes            - Geometry Enforcer   |
|  - JSON Import / Export         - Decision Condition Logic  - Banking Policy Gate |
|  - Metadata & Audit History     - Labeled Connectors        - Issue Fixer Focus   |
+-----------------------------------------------------------------------------------+
|  4. INSPECTOR PANEL             5. NAVIGATION OVERLAYS      6. REPOSITORY LAYER   |
|  - Node Properties              - Glance View (Statistics)  - LocalStorage Engine |
|  - Connector / Edge Renaming    - MiniMap / Overview Nav    - REST API Adapter    |
|  - Color Palette Customizer     - Floating Toolbar          - Auto-save & Undo    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Functional Specifications

### 4.1 Journey Library & Template Catalog

- **Library Dashboard (`/`)**: Displays all saved journeys in a grid layout with quick stats (stage count, total node count, edge count, version, updated timestamp, and status badges).
- **Pinning**: Important or active journeys can be pinned to the top of the dashboard for one-click access.
- **Search & Filtering**: Real-time fuzzy keyword search filtering journeys by title or description.
- **Industry Templates**: Pre-packaged, production-grade baseline architectures ready to be scaffolded:
  - _Instant Personal Loan_: High-velocity STP consumer loan flow with instant decisioning (<10 minutes).
  - _Secured Vehicle Loan_: Multi-party origination flow involving dealer invoicing, hypothecation, and asset inspection.
  - _MSME Working Capital_: Complex commercial lending flow with GSTN verification, financial statement underwriting, and committee sign-offs.
- **Creation Dialog**: Modal allowing the user to provide Title, Description, and select an initial architecture (Blank Canvas or pre-built template). Selecting an architecture automatically syncs title and description values.
- **JSON Import / Export**: Users can upload `.json` journey definitions conforming to the Zod schema or export current canvases for external backup or API consumption.

### 4.2 Visual Canvas Studio (`/journeys/:journeyId`)

- **Interactive Infinite Canvas**: Pan, zoom (0.2x to 2.5x), grid snapping (16px increments), dot-grid background.
- **Component Palette (Left Sidebar)**: Drag-and-drop or click-to-add nodes:
  - **Stage Node**: Top-level container representing a major business milestone (e.g., _Authentication & KYC_, _Underwriting_, _Disbursement_).
  - **Activity Node**: Discrete operational or user action (e.g., _Mobile OTP_, _Aadhaar KYC_, _Bank Statement Fetch_).
  - **Decision Node**: Rule branching point evaluating risk conditions (e.g., _Credit Score >= 750_, _Bureau DTI < 40%_).
  - **Annotation / Note Node**: Freeform sticky note for compliance commentary, SLA benchmarks, and team documentation.

### 4.3 Node Hierarchy & Geometry

- **Stage Containment (Parent-Child Reparenting)**:
  - Stages act as physical geometric boundaries for child activities.
  - Dropping an Activity onto a Stage automatically reparents the activity inside the stage and adjusts stage dimensions dynamically via `calculateStageChildrenBounds`.
  - Stages can be collapsed to hide nested activities, decluttering large origination graphs.
- **Color Themes**: Nodes support 7 corporate theme colors (`neutral`, `blue`, `green`, `amber`, `red`, `purple`, `cyan`) to visually differentiate lending categories (e.g., verification vs. disbursement).

### 4.4 Connectors & Branching Logic

- **Arrow Connectors (`journeyEdge`)**: Directional smooth bezier curves connecting stages, activities, and decisions.
- **Decision Condition Handles**: Decision nodes generate discrete source handles (`condition-{id}`) for each configured branch condition (e.g., _STP Approved_, _Manual Review_, _Reject_).
- **Connector Renaming & Labeling**:
  - Every connector arrow can be named or renamed either directly on the canvas via double-click / inline edit button, or through the **Connector Inspector** in the right sidebar.
  - Connectors originating from decision conditions automatically display condition tags in distinct amber styling.
- **Connector Quick Actions**: Quick delete button appears on hover or selection.

### 4.5 Journey Validation Engine

- Real-time diagnostic engine evaluating the canvas graph against 10 critical banking and structural rules:
  1. `DUPLICATE_NODE_ID`: Ensures all node IDs are globally unique.
  2. `MISSING_TITLE`: Warns when components lack descriptive business names.
  3. `INVALID_PARENT`: Detects orphaned activities pointing to nonexistent parent stages.
  4. `INVALID_PARENT_TYPE`: Ensures child activities can only be nested inside `STAGE` nodes.
  5. `CHILD_OUTSIDE_BOUNDS`: Flags activities geometrically placed outside their parent stage container.
  6. `EMPTY_STAGE`: Warns when a stage contains zero activities.
  7. `DECISION_NO_BRANCH`: Detects decision nodes without outgoing paths.
  8. `INVALID_CONDITION`: Flags conditions with empty labels or missing expressions.
  9. `BROKEN_EDGE_SOURCE` / `BROKEN_EDGE_TARGET`: Flags connections pointing to deleted nodes.
  10. `DISCONNECTED_STAGE` / `DISCONNECTED_ACTIVITY`: Warns when major milestones are disconnected from the primary flow.
- **Validation Modal**: Lists all errors and warnings. Clicking an issue focuses and centers the camera directly on the offending node or edge.

### 4.6 Right Inspector Panel

- Contextual property inspector that dynamically adapts based on the active selection:
  - **Stage Inspector**: Stage number, title, description, identifier, status, color palette, collapse toggle, child count, delete stage.
  - **Activity Inspector**: Title, description, category (verification, documentation, underwriting, disbursement, servicing, custom), status, stage assignment, color palette, delete activity.
  - **Decision Inspector**: Title, description, color, dynamic branch condition list (add, edit label, edit expression, remove condition), delete decision.
  - **Note Inspector**: Note title, rich text content, color, delete note.
  - **Connector Inspector**: Connector name / label input, connection flow summary (Source Node -> Target Node), decision condition linkage, delete connector.

### 4.7 Persistence & History Transactions

- **Debounced Autosave**: Automatic background persistence (800ms debounce) to local storage or API backend whenever changes occur.
- **Undo / Redo (Snapshot Transactions)**: 40-step history stack capturing full graph snapshots for all discrete user actions (`Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z`).

---

## 5. Non-Functional Requirements

- **Performance**: Canvas maintains 60 FPS rendering during panning and zooming with 100+ nodes and connectors.
- **Reliability & Data Integrity**: All graph states serialize to JSON validated by Zod schemas. Dangling edges are automatically pruned upon node deletion.
- **Accessibility & UX**: Clear keyboard shortcuts (`F` for fullscreen, `Del`/`Backspace` for deletion with confirmation dialogs, `Esc` to exit modal/clear selection). All interactive buttons feature explicit ARIA attributes.
- **Extensibility**: Pluggable repository layer (`JourneyRepository`) enabling seamless swap from `LocalStorageJourneyRepository` to enterprise REST/GraphQL backends without modifying UI code.
