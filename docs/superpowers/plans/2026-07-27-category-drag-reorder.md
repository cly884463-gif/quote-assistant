# Category Drag Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace category up/down buttons with drag-to-reorder handles while keeping saved category order.

**Architecture:** Reuse the existing category order state and localStorage key in `web/app.js`. Render draggable category panels with a handle, add pointer-based drag/drop logic for desktop and mobile, and save the new order after drop.

**Tech Stack:** Plain JavaScript pointer events, CSS, static HTML app.

## Global Constraints

- Do not add dependencies.
- Remove the up/down button interaction from the UI.
- Dragging must work with mouse and mobile touch through pointer events.
- Home preview, dealer quote, and channel quote categories must share the same saved order.

---

### Task 1: Replace Button Reorder With Drag Reorder

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`

**Interfaces:**
- Produces: `handleCategoryDragStart(event, category) -> void`
- Produces: `handleCategoryDragMove(event) -> void`
- Produces: `handleCategoryDragEnd() -> void`

- [x] **Step 1: Render drag handles**

Replace `↑ / ↓` controls with a compact handle button and mark category panels with `data-category-name`.

- [x] **Step 2: Add drag behavior**

Use pointer events from the handle, detect the category panel under the pointer, reorder `state.categoryOrder`, and rerender after release.

- [x] **Step 3: Update styles**

Style the handle, dragging state, and mobile touch behavior.

- [x] **Step 4: Verify**

Run syntax/static checks and relevant category tests, then deploy to Cloudflare Pages.
