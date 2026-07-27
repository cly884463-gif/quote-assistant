# Category Order Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to move material category modules up and down on the home preview and quote creation pages, with the order saved locally.

**Architecture:** Keep category ordering in `web/app.js` as a small localStorage-backed helper. Both home and quote category renderers consume the same ordered category list so ordering stays consistent across pages and quote types.

**Tech Stack:** Plain JavaScript, CSS, static HTML app, browser `localStorage`.

## Global Constraints

- Do not add dependencies.
- Use buttons instead of drag-and-drop for reliable mobile WeChat behavior.
- Persist category order in the current browser only.
- Keep category panels collapsed by default.

---

### Task 1: Category Reorder Controls

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`
- Test: manual browser smoke test and existing npm tests

**Interfaces:**
- Produces: `getOrderedCategories(groups) -> string[]`
- Produces: `moveCategory(category, direction) -> void`
- Produces: `CATEGORY_ORDER_STORAGE_KEY`

- [x] **Step 1: Add category order state**

Add a `CATEGORY_ORDER_STORAGE_KEY`, load `state.categoryOrder` from `localStorage`, and provide a save helper.

- [x] **Step 2: Sort categories through one helper**

Change home and quote renderers to call `getOrderedCategories(groups)` instead of raw `Object.keys(groups)`.

- [x] **Step 3: Add controls in category headers**

Render `↑` and `↓` buttons in each category panel header. Add event handlers on home and quote category lists that call `moveCategory`.

- [x] **Step 4: Style controls**

Add compact icon button styling that works on desktop and phone-width layouts.

- [x] **Step 5: Verify**

Run syntax/static checks and relevant existing tests. Full test suite currently has unrelated pre-existing expectation failures in `excel-export.test.js` and `web-static.test.js`.
