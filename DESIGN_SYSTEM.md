# Design System & UI Specifications

The **Loan Journey Crafter** design system provides a cohesive, high-density visual language tailored for complex enterprise financial workflows. It combines crisp slate and neutral surfaces with deliberate semantic color accents to provide immediate visual clarity across complex multi-stage origination graphs.

---

## 1. Color System & Theme Palette

Colors in Loan Journey Crafter are defined centrally in `src/config/colors.ts`. Every node type, condition branch, badge, and handle maps directly to this palette.

### 1.1 The 7 Core Theme Palettes

| Theme         | Accent Hex | Header / Badge Bg   | Text / Accent Class | Semantic Usage                                                                            |
| :------------ | :--------- | :------------------ | :------------------ | :---------------------------------------------------------------------------------------- |
| **`blue`**    | `#2563eb`  | `bg-blue-100/70`    | `text-blue-800`     | Primary theme; Authentication, KYC verification, active selection rings, primary buttons. |
| **`green`**   | `#059669`  | `bg-emerald-100/70` | `text-emerald-800`  | Disbursement, auto-debit (e-NACH), approval states, compliant validation.                 |
| **`amber`**   | `#d97706`  | `bg-amber-100/70`   | `text-amber-800`    | Decision nodes, condition branches, validation warnings, underwriting gates.              |
| **`cyan`**    | `#0891b2`  | `bg-cyan-100/70`    | `text-cyan-800`     | Documentation, Account Aggregator (AA), open banking statements, financial data.          |
| **`purple`**  | `#7c3aed`  | `bg-purple-100/70`  | `text-purple-800`   | Collateral valuation, asset inspection, legal verification, credit committee.             |
| **`red`**     | `#e11d48`  | `bg-rose-100/70`    | `text-rose-800`     | Rejection paths, destructive delete actions, critical validation errors.                  |
| **`neutral`** | `#64748b`  | `bg-slate-100`      | `text-slate-800`    | Default connectors, generic notes, unassigned activities, canvas background.              |

### 1.2 ColorScheme Object Structure

```ts
export interface ColorScheme {
  id: ThemeColor;
  label: string;
  bg: string; // e.g. 'bg-blue-50/50'
  border: string; // e.g. 'border-blue-300'
  borderHover: string; // e.g. 'hover:border-blue-400'
  headerBg: string; // e.g. 'bg-blue-100/70'
  badgeBg: string; // e.g. 'bg-blue-100'
  badgeText: string; // e.g. 'text-blue-800'
  accent: string; // Hex '#2563eb'
  handleColor: string; // Hex '#2563eb'
}
```

---

## 2. Typography & Text Hierarchy

Loan Journey Crafter uses a modern system sans-serif font stack with tight tracking and high contrast.

| Style / Element          | Size                   | Weight                     | Line Height | Usage                                                      |
| :----------------------- | :--------------------- | :------------------------- | :---------- | :--------------------------------------------------------- |
| **Display / Hero**       | `24px` (`text-2xl`)    | Bold (`font-bold`)         | `1.2`       | Hero banner titles, primary page headers                   |
| **Section Header**       | `14px` (`text-sm`)     | Bold (`font-bold`)         | `1.3`       | Uppercase tracking-wider section titles, dialog headers    |
| **Card / Node Title**    | `13px` (`text-[13px]`) | Semibold (`font-semibold`) | `1.4`       | Stage headers, Activity card titles, Decision titles       |
| **Body / Input**         | `12px` (`text-xs`)     | Regular / Medium           | `1.5`       | Form inputs, descriptions, inspector labels, button labels |
| **Caption / Subtitle**   | `11px` (`text-[11px]`) | Regular (`font-normal`)    | `1.4`       | Card descriptions, timestamp footers, helper text          |
| **Micro Badge / Handle** | `10px` (`text-[10px]`) | Semibold (`font-semibold`) | `1.0`       | Connector labels, condition tags, stage number badges      |

---

## 3. UI Component Primitives (`src/components/ui/`)

### 3.1 Buttons (`Button`)

- **Variants**:
  - `default`: Solid `#2563eb` with white text and subtle hover darkening. Used for primary calls-to-action ("Create Journey", "Save Changes").
  - `secondary`: Light slate background (`bg-slate-100 text-slate-900`) for non-primary actions.
  - `outline`: Border `border-slate-200 bg-white text-slate-700 hover:bg-slate-50`.
  - `ghost`: Transparent background with text hover (`text-slate-600 hover:bg-slate-100`).
  - `danger`: Red styling (`bg-rose-600 text-white hover:bg-rose-700`) for permanent deletions.
- **Interactive Rules**: All buttons use `cursor-pointer transition-colors select-none`.

### 3.2 Inputs & Textareas (`Input`, `Textarea`)

- Border: `border-slate-200` with `focus:border-blue-600 focus:ring-1 focus:ring-blue-600`.
- Padding: `px-3 py-1.5` for compact high-density inputs.
- Radius: `rounded-md` (`6px`).

### 3.3 Dialogs & Modals (`Dialog`)

- Backdrop: `bg-slate-900/40 backdrop-blur-xs`.
- Container: Centered, `rounded-xl border border-slate-200 bg-white shadow-xl max-w-lg`.
- Standard structure: `DialogHeader` (with title and close button), scrollable body, and `DialogFooter` (Cancel + Submit buttons).

---

## 4. Canvas Elements & Node Visual Specifications

### 4.1 Stage Container (`StageNode`)

- **Dimensions**: Default `340px x 280px` (dynamically expandable).
- **Surface**: Translucent tinted background (`bg-blue-50/30`), `border-2 border-blue-300 rounded-xl`.
- **Header**:
  - Stage Number badge (`#1`, `#2`, etc.) in solid theme color.
  - Title and subtitle description.
  - Collapse / Expand chevron button.
  - Status pill (`draft`, `in_progress`, `completed`).
- **Interior**: Droppable container area for child activities. When collapsed, nested activities are hidden and the stage height shrinks to `56px`.

### 4.2 Activity Card (`ActivityNode`)

- **Dimensions**: Default `220px x 74px`.
- **Surface**: Solid white background with theme-colored left accent border (`border-l-4`), `rounded-lg shadow-xs border border-slate-200`.
- **Content**:
  - Category icon (e.g., Shield for verification, FileText for documentation, DollarSign for disbursement).
  - Activity Title (`text-xs font-semibold text-slate-900`).
  - Subtitle description (`text-[10px] text-slate-500 truncate`).
- **Handles**:
  - Left handle (`type="target"`): Inward connection point.
  - Right handle (`type="source"`): Outward connection point.

### 4.3 Decision Node (`DecisionNode`)

- **Dimensions**: Default `240px x 160px`.
- **Surface**: Amber-tinted card (`border-amber-300 bg-amber-50/40 rounded-xl`).
- **Header**: GitBranch icon with "Decision Point" label and editable title.
- **Condition List**:
  - Each condition renders an individual row with condition label and expression.
  - Each condition row features its own dedicated right-side handle (`id="condition-{conditionId}"`) colored in amber (`#d97706`).

### 4.4 Sticky Note (`NoteNode`)

- **Dimensions**: Default `220px x 140px`.
- **Surface**: Soft yellow/blue pastel styling (`bg-amber-50 border-amber-200 text-amber-950`).
- **Content**: Header with Note icon + multiline content area for team commentary or SLA targets.

---

## 5. Arrow Connectors (`JourneyEdge`)

Connectors represent directed workflow execution paths between nodes.

### 5.1 Geometry & Line Styling

- **Path**: Smooth Bezier curve (`getBezierPath`).
- **Default Stroke**: `2px` solid `#64748b` (Slate).
- **Decision Condition Stroke**: `2px` solid `#d97706` (Amber).
- **Selected Stroke**: `3px` solid `#2563eb` (Blue) with focus halo.
- **Marker**: Closed arrow (`MarkerType.ArrowClosed`, 16x16px) matching stroke color.
- **Hitbox**: An invisible `20px` transparent stroke path overlays the line to ensure effortless hover and click detection.

### 5.2 Connector Labels & Rename Affordance

- **Pill Badge**: Rendered via `EdgeLabelRenderer` at the exact path midpoint `(labelX, labelY)`:
  - Default Label: White background, slate border, `text-[10px] font-semibold text-slate-700`.
  - Condition Label: Amber background (`bg-amber-50 text-amber-800 border-amber-300`).
  - Selected State: Ring-1 ring-blue-600.
- **Add Name Button**: If a connector has no label, hovering or selecting displays a dashed `+ Add Name` button.
- **Inline Editing**: Double-clicking the label or clicking the rename pencil button transforms the pill into an inline `<input>` with autoFocus, committing on `Enter` or `blur`.
- **Hover Actions**: Small circular buttons appear on hover/selection for:
  - Rename (`Pencil` icon).
  - Quick Delete (`X` icon).
