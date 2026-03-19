# Stickyboard — User Stories

A local-only whiteboard app for creating, editing, and arranging sticky notes.
No backend — localStorage only. Think Miro, but stripped to the bone.

**Tech context:** React 19, TypeScript (strict), Tailwind CSS v4, Vite 8.
All state lives in `BoardState` (see `src/types.ts`), persisted to localStorage
via `src/storage.ts`.

---

## Wave 1 — Foundation (parallel)

These stories have ZERO dependencies on each other. All three can be built by
different agents simultaneously. They establish the three pillars: state
management, the canvas surface, and the sticker component.

---

### US-1 · Board state hook

**As a** developer
**I want** a `useBoard` hook that manages the sticker array and viewport state
**So that** all components share a single source of truth backed by localStorage

**Acceptance criteria:**

- [ ] Create `src/hooks/useBoard.ts`.
- [ ] On mount, loads state from localStorage via `loadBoard()`. Falls back to
      empty default if data is missing or corrupt.
- [ ] Exposes the following API:
  ```ts
  stickers: Sticker[]
  viewport: { x: number; y: number; zoom: number }
  addSticker(sticker: Sticker): void
  updateSticker(id: string, patch: Partial<Sticker>): void
  removeSticker(id: string): void
  setViewport(v: Partial<{ x: number; y: number; zoom: number }>): void
  clearAll(): void
  ```
- [ ] Every mutation triggers a **debounced** save to localStorage (~300ms).
      Rapid calls (e.g., drag frames) batch into a single write. The final state
      after a burst is always persisted.
- [ ] No UI — this is a headless hook with unit-testable logic.

**Files:** `src/hooks/useBoard.ts`
**Dependencies:** None
**Size:** Small

---

### US-2 · Canvas surface with dot grid

**As a** user
**I want** to see a full-viewport canvas with a subtle dot grid background
**So that** I have a spatial workspace

**Acceptance criteria:**

- [ ] Create `src/components/Canvas.tsx`.
- [ ] Canvas fills `100vw × 100vh`, no document scrollbars.
- [ ] Background: neutral color (`gray-50` / `#f9fafb`) with a repeating
      dot-grid pattern. Dots are subtle (`#d1d5db`), spaced ~20px apart.
- [ ] The grid is drawn with a CSS `radial-gradient` on the outer container.
      `background-size` and `background-position` are derived from `viewport`
      props so the grid moves with pan and scales with zoom.
- [ ] Canvas accepts `children` (stickers will be rendered inside it later).
- [ ] Inner content container uses CSS transform:
      `translate(${x}px, ${y}px) scale(${zoom})`.
- [ ] Canvas renders `children` inside the transformed container.

**Files:** `src/components/Canvas.tsx`
**Dependencies:** None
**Size:** Small

---

### US-3 · Sticker component (read-only render)

**As a** user
**I want** to see stickers rendered on the canvas
**So that** my ideas are visible on the board

**Acceptance criteria:**

- [ ] Create `src/components/Sticker.tsx`.
- [ ] Renders a single sticker as a positioned `<div>` using absolute
      positioning within the canvas content container.
- [ ] Position and size come from the `Sticker` data: `x`, `y`, `width`,
      `height`.
- [ ] Background color comes from `sticker.color`.
- [ ] Displays `sticker.content` as plain text. Overflow is hidden (clipped,
      not scrollable).
- [ ] `zIndex` applied via inline `style={{ zIndex }}` (this is the one
      acceptable inline style — Tailwind cannot do dynamic z-index).
- [ ] Visual style: rounded corners (`rounded-lg`), subtle shadow (`shadow-md`),
      padding for text content.
- [ ] The component accepts callback props: `onClick`, `onDoubleClick`,
      `onMouseDown` — but does NOT implement any behavior. It just forwards
      events.

**Files:** `src/components/Sticker.tsx`
**Dependencies:** None
**Size:** Small

---

### US-4 · Wire up App shell

**As a** developer
**I want** App.tsx to compose Canvas + useBoard + Sticker rendering
**So that** the three foundation pieces work together

**Acceptance criteria:**

- [ ] `App.tsx` uses the `useBoard` hook for state.
- [ ] Renders `<Canvas>` with viewport props from `useBoard`.
- [ ] Maps `stickers` array to `<Sticker>` components inside the canvas.
- [ ] No interactivity yet — just renders whatever is in localStorage (or
      nothing if empty). This wiring story exists to integrate the three
      independent Wave 1 pieces.

**Files:** `src/App.tsx`
**Dependencies:** US-1, US-2, US-3
**Size:** Tiny

---

## Wave 2 — Core Interactions (parallel)

These stories all depend on Wave 1 being complete but are independent of each
other. Four agents can work these simultaneously.

---

### US-5 · Create sticker on double-click

**As a** user
**I want** to double-click on empty canvas space to create a new sticker
**So that** I can quickly capture an idea

**Acceptance criteria:**

- [ ] Double-clicking on the canvas background creates a new sticker at the
      world-coordinate position of the click.
- [ ] Screen-to-world conversion:
      `worldX = (screenX - viewport.x) / viewport.zoom`
- [ ] Sticker is centered on the click point (offset by half default size).
- [ ] Default sticker: `200×150`, yellow (`#fef08a`), empty content, highest
      z-index + 1, id from `crypto.randomUUID()`.
- [ ] Double-clicking on an existing sticker does NOT create a new sticker
      (stop propagation on sticker's `dblclick`).
- [ ] Calls `addSticker()` from `useBoard` — persists automatically.

**Files:** `src/App.tsx` (event handler)
**Dependencies:** US-4
**Size:** Small

---

### US-6 · Select and deselect stickers

**As a** user
**I want** to click a sticker to select it and click empty space to deselect
**So that** I can target actions at a specific sticker

**Acceptance criteria:**

- [ ] Clicking a sticker selects it: visible ring/border (2px, `blue-500`
      `#3b82f6`).
- [ ] Only one sticker selected at a time.
- [ ] Clicking empty canvas deselects.
- [ ] Clicking a different sticker switches selection.
- [ ] Selection is visual-only — does NOT persist to localStorage.
- [ ] Track as `selectedStickerId: string | null` in `App` state.
- [ ] Stop propagation on sticker click so canvas click handler doesn't
      immediately deselect.

**Files:** `src/App.tsx`, `src/components/Sticker.tsx` (selected style)
**Dependencies:** US-4
**Size:** Small

---

### US-7 · Pan the canvas

**As a** user
**I want** to click-drag on empty canvas space to pan the view
**So that** I can navigate around the board

**Acceptance criteria:**

- [ ] Create `src/hooks/usePan.ts`.
- [ ] Left-click drag on empty canvas pans the viewport. Updates in real time
      during drag — no lag.
- [ ] Does NOT trigger when drag starts on a sticker element.
- [ ] Dot grid background moves in sync.
- [ ] No hard boundaries — infinite panning.
- [ ] Final position saves via `setViewport()` on mouseup.
- [ ] Cursor: `grab` on hover, `grabbing` during drag.
- [ ] Use refs (not state) for drag tracking to avoid per-frame re-renders.

**Files:** `src/hooks/usePan.ts`, `src/App.tsx` (wire up)
**Dependencies:** US-4
**Size:** Small

---

### US-8 · Zoom the canvas

**As a** user
**I want** to zoom with the scroll wheel, centered on my cursor
**So that** I can focus on details or see the overview

**Acceptance criteria:**

- [ ] Create `src/hooks/useZoom.ts`.
- [ ] Scroll wheel up = zoom in, down = zoom out.
- [ ] Zoom is cursor-centered:
      ```
      newZoom = clamp(oldZoom * factor, 0.25, 4.0)
      newX = cursorX - (cursorX - oldX) * (newZoom / oldZoom)
      newY = cursorY - (cursorY - oldY) * (newZoom / oldZoom)
      ```
- [ ] Multiplicative factor: `*= 1.1` per wheel tick (smooth, not stepped).
- [ ] Zoom clamped: `0.25` to `4.0`.
- [ ] Dot grid scales with zoom.
- [ ] `preventDefault()` on wheel to suppress native scroll.
- [ ] Saves via `setViewport()`.

**Files:** `src/hooks/useZoom.ts`, `src/App.tsx` (wire up)
**Dependencies:** US-4
**Size:** Small

---

## Wave 3 — Sticker Manipulation (parallel)

These all require selection (US-6) to exist. They are independent of each other.

---

### US-9 · Edit sticker content

**As a** user
**I want** to double-click a sticker to edit its text inline
**So that** I can write and refine my ideas

**Acceptance criteria:**

- [ ] Double-click a sticker → enters edit mode: content area becomes a
      `<textarea>`.
- [ ] Textarea auto-focused, cursor at end of existing content.
- [ ] `Escape` exits edit mode, commits text.
- [ ] Clicking outside the sticker exits edit mode, commits text.
- [ ] Plain text, multiline. No rich text.
- [ ] Textarea visually matches sticker: same background, same font, no foreign
      border, `resize: none`, fills content area.
- [ ] Empty content is fine — sticker just appears blank.
- [ ] Track `editingStickerId: string | null` in App.
- [ ] Changes persist via `updateSticker()` on edit exit.
- [ ] `dblclick` on sticker must NOT propagate to canvas (would create a new
      sticker).

**Files:** `src/components/Sticker.tsx`, `src/App.tsx`
**Dependencies:** US-6
**Size:** Medium

---

### US-10 · Drag sticker to move

**As a** user
**I want** to drag a sticker to reposition it
**So that** I can organize ideas spatially

**Acceptance criteria:**

- [ ] Create `src/hooks/useDrag.ts`.
- [ ] Click-drag on sticker moves it in real time.
- [ ] Movement in world coords: `deltaWorld = deltaScreen / zoom`.
- [ ] Does NOT pan the canvas.
- [ ] Dragging selects the sticker if not already selected.
- [ ] Attach `mousemove`/`mouseup` to `window` during drag so it continues even
      if cursor leaves the sticker.
- [ ] Distance threshold: 3px before movement starts (prevents accidental
      repositioning on click).
- [ ] Cursor: `move` while dragging.
- [ ] Final position saves via `updateSticker()` on mouseup.

**Files:** `src/hooks/useDrag.ts`, `src/App.tsx`
**Dependencies:** US-6
**Size:** Medium

---

### US-11 · Delete sticker (button)

**As a** user
**I want** a delete button on a selected sticker
**So that** I can remove stickers I no longer need

**Acceptance criteria:**

- [ ] When a sticker is selected (not editing), a × button appears at the
      top-right corner.
- [ ] Clicking it removes the sticker immediately via `removeSticker()`.
- [ ] No confirmation dialog — this is a lightweight app.
- [ ] The button is positioned absolutely relative to the sticker, slightly
      outside or overlapping the corner.
- [ ] The button does NOT appear during edit mode.

**Files:** `src/components/Sticker.tsx`
**Dependencies:** US-6
**Size:** Tiny

---

### US-12 · Change sticker color

**As a** user
**I want** to pick a color for a selected sticker
**So that** I can visually categorize ideas

**Acceptance criteria:**

- [ ] Create `src/components/ColorPicker.tsx`.
- [ ] When a sticker is selected, a color palette appears near the sticker
      (below or beside it, not obscuring content).
- [ ] 6 preset colors:
      | Yellow `#fef08a` | Blue `#bfdbfe` | Green `#bbf7d0` |
      | Pink `#fbcfe8` | Purple `#e9d5ff` | Orange `#fed7aa` |
- [ ] Clicking a swatch changes the sticker's `color` immediately.
- [ ] Active color shows a visual indicator (checkmark or thicker border).
- [ ] Palette hides when sticker is deselected.
- [ ] Define colors in `src/constants.ts` — not as scattered magic strings.
- [ ] Persists via `updateSticker()`.

**Files:** `src/components/ColorPicker.tsx`, `src/constants.ts`, `src/App.tsx`
**Dependencies:** US-6
**Size:** Small

---

### US-13 · Bring sticker to front on interact

**As a** user
**I want** the sticker I click/drag/edit to come to the front
**So that** overlapping stickers don't block what I'm working on

**Acceptance criteria:**

- [ ] Clicking, dragging, or editing a sticker sets its `zIndex` to
      `max(all zIndexes) + 1`.
- [ ] Other stickers keep their relative order.
- [ ] New stickers always get the highest z-index.
- [ ] Z-order persists to localStorage.
- [ ] Utility: `bringToFront(stickers, id)` → returns the new zIndex value.
      Can live in `src/utils.ts`.

**Files:** `src/utils.ts`, integration in `src/App.tsx`
**Dependencies:** US-6
**Size:** Tiny

---

## Wave 4 — Polish (parallel)

These are all independent of each other. They depend on various Wave 2/3
stories but not on each other.

---

### US-14 · Resize sticker

**As a** user
**I want** to resize a sticker by dragging its corner handle
**So that** I can adjust stickers to fit their content

**Acceptance criteria:**

- [ ] Create `src/hooks/useResize.ts`.
- [ ] Selected sticker shows a resize handle at bottom-right corner (~12px
      square or triangle).
- [ ] Dragging the handle resizes width/height in real time.
- [ ] Minimum size: `120×80` px. Cannot go smaller.
- [ ] Resize is in world coords: `deltaWorld = deltaScreen / zoom`.
- [ ] Top-left corner stays fixed — only bottom-right moves.
- [ ] Cursor: `nwse-resize` on the handle.
- [ ] Resize handle's `mousedown` must NOT trigger sticker drag (stop
      propagation).
- [ ] Final size saves via `updateSticker()` on mouseup.

**Files:** `src/hooks/useResize.ts`, `src/components/Sticker.tsx`
**Dependencies:** US-10 (drag pattern to reuse), US-6
**Size:** Medium

---

### US-15 · Zoom indicator

**As a** user
**I want** to see the current zoom level and click to reset it
**So that** I can orient myself and quickly return to 100%

**Acceptance criteria:**

- [ ] Create `src/components/ZoomIndicator.tsx`.
- [ ] Small pill in the bottom-left corner of the viewport. Fixed position —
      does not pan/zoom with canvas.
- [ ] Displays zoom as percentage: "100%", "250%", etc.
- [ ] Clicking it resets to zoom `1.0` and viewport `(0, 0)`.
- [ ] Styled: semi-transparent bg, backdrop blur, rounded, monospace number.
- [ ] `pointer-events: auto` only on itself, not a blocking overlay.

**Files:** `src/components/ZoomIndicator.tsx`, `src/App.tsx`
**Dependencies:** US-8
**Size:** Tiny

---

### US-16 · Toolbar

**As a** user
**I want** a floating toolbar with the app name and board-level actions
**So that** I can access features without memorizing shortcuts

**Acceptance criteria:**

- [ ] Create `src/components/Toolbar.tsx`.
- [ ] Floating pill pinned to top-center of viewport. Fixed position.
- [ ] Contains: "Stickyboard" wordmark + "Clear board" button.
- [ ] ~48px height, does not block canvas interaction.
- [ ] Styled: semi-transparent white bg, backdrop blur, rounded, subtle shadow.
- [ ] "Clear board" receives an `onClear` callback prop (wired in US-17).

**Files:** `src/components/Toolbar.tsx`, `src/App.tsx`
**Dependencies:** US-4
**Size:** Tiny

---

### US-17 · Clear board with confirmation

**As a** user
**I want** to clear all stickers and reset the viewport
**So that** I can start a fresh session

**Acceptance criteria:**

- [ ] Create `src/components/ConfirmDialog.tsx`.
- [ ] "Clear board" button (in Toolbar, US-16) opens a confirmation dialog.
- [ ] Dialog text: "Clear the entire board? This cannot be undone."
- [ ] "Cancel" dismisses with no side effects. "Clear" calls `clearAll()`.
- [ ] Dialog is a styled modal (not `window.confirm`). Rendered via portal to
      `document.body`.
- [ ] Traps focus. Closes on `Escape`.
- [ ] Tailwind-styled, consistent with the rest of the UI.

**Files:** `src/components/ConfirmDialog.tsx`, `src/App.tsx`
**Dependencies:** US-16
**Size:** Small

---

### US-18 · Delete sticker via keyboard

**As a** user
**I want** to press Delete/Backspace to remove a selected sticker
**So that** I can work quickly without reaching for a button

**Acceptance criteria:**

- [ ] `Delete` or `Backspace` removes the selected sticker.
- [ ] Only fires when a sticker is selected AND not in edit mode (in edit mode,
      these keys delete text).
- [ ] `preventDefault()` on `Backspace` to prevent browser back-navigation.
- [ ] Uses `removeSticker()` from `useBoard`.

**Files:** `src/hooks/useKeyboard.ts`, `src/App.tsx`
**Dependencies:** US-6, US-11
**Size:** Tiny

---

### US-19 · Escape to deselect / exit edit

**As a** user
**I want** Escape to deselect a sticker or exit edit mode
**So that** I have a consistent "cancel" gesture

**Acceptance criteria:**

- [ ] If editing: `Escape` exits edit mode (commits text, closes textarea).
- [ ] If a sticker is selected (not editing): `Escape` deselects it.
- [ ] If nothing selected: `Escape` does nothing.
- [ ] Can share the `useKeyboard` hook with US-18.

**Files:** `src/hooks/useKeyboard.ts`
**Dependencies:** US-6, US-9
**Size:** Tiny

---

### US-20 · Reset zoom shortcut

**As a** user
**I want** Ctrl+0 / Cmd+0 to reset zoom to 100%
**So that** I can quickly return to the default view

**Acceptance criteria:**

- [ ] `Ctrl+0` (Windows/Linux) or `Cmd+0` (Mac) resets zoom to `1.0` and
      viewport to `(0, 0)`.
- [ ] `preventDefault()` to override the browser's native zoom reset.
- [ ] Can share the `useKeyboard` hook with US-18 and US-19.

**Files:** `src/hooks/useKeyboard.ts`
**Dependencies:** US-8
**Size:** Tiny

---

### US-21 · Empty state hint

**As a** user
**I want** to see guidance when the board is empty
**So that** I know how to get started

**Acceptance criteria:**

- [ ] When `stickers.length === 0`, a centered message appears on the canvas:
      "Double-click anywhere to add a sticker".
- [ ] Muted text color, subtle styling — feels like a hint, not a UI element.
- [ ] `pointer-events: none` so clicks pass through to the canvas.
- [ ] Disappears as soon as the first sticker exists.

**Files:** `src/components/Canvas.tsx` (conditional render)
**Dependencies:** US-5
**Size:** Tiny

---

## Parallelism Map

```
WAVE 1 (all parallel — 0 dependencies)
┌────────┐  ┌────────┐  ┌────────┐
│ US-1   │  │ US-2   │  │ US-3   │
│ Board  │  │ Canvas │  │Sticker │
│ hook   │  │surface │  │ render │
└───┬────┘  └───┬────┘  └───┬────┘
    └───────────┼───────────┘
                ▼
           ┌────────┐
           │ US-4   │  (tiny integration — could be done by any of the 3)
           │App wire│
           └───┬────┘
               │
WAVE 2 (all parallel — depend only on US-4)
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ US-5   │  │ US-6   │  │ US-7   │  │ US-8   │  │ US-16  │
│Create  │  │Select  │  │ Pan    │  │ Zoom   │  │Toolbar │
│sticker │  │deselect│  │        │  │        │  │        │
└───┬────┘  └───┬────┘  └────────┘  └───┬────┘  └───┬────┘
    │           │                        │           │
WAVE 3 (all parallel — depend on US-6)  │           │
┌────────┐  ┌────────┐  ┌────────┐     │           │
│ US-9   │  │ US-10  │  │ US-11  │     │           │
│ Edit   │  │ Drag   │  │Delete  │     │           │
│content │  │ move   │  │button  │     │           │
└────────┘  └───┬────┘  └────────┘     │           │
                │                       │           │
┌────────┐  ┌────────┐                 │           │
│ US-12  │  │ US-13  │                 │           │
│ Color  │  │Z-order │                 │           │
│picker  │  │        │                 │           │
└────────┘  └────────┘                 │           │
                                        │           │
WAVE 4 (all parallel — various deps)   │           │
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ US-14  │  │ US-15  │  │ US-17  │  │ US-18  │  │ US-19  │
│Resize  │  │Zoom    │  │Clear   │  │KB del  │  │KB esc  │
│        │  │indicat.│  │board   │  │        │  │        │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
┌────────┐  ┌────────┐
│ US-20  │  │ US-21  │
│KB zoom │  │Empty   │
│reset   │  │state   │
└────────┘  └────────┘
```

## Size Summary

| Size   | Stories | IDs                                          |
|--------|---------|----------------------------------------------|
| Tiny   | 10      | US-4, US-11, US-13, US-15, US-16, US-18–21   |
| Small  | 8       | US-1, US-2, US-3, US-5, US-6, US-7, US-8, US-17 |
| Medium | 3       | US-9, US-10, US-14                           |

21 stories total. No story is larger than "medium". At any point in the
project, 3–7 stories can be worked in parallel.
