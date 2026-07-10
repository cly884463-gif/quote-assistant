# Quote Miniprogram Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native WeChat Mini Program frontend prototype for daily quotation creation.

**Architecture:** Use standard Mini Program pages and local utility modules. Product mock data simulates the future xlsx parsing result, while quote items are kept in app global state between pages.

**Tech Stack:** WeChat Mini Program `wxml`, `wxss`, `js`, `json`; no npm dependencies.

## Global Constraints

- Write all generated project files inside `F:\Buyto SML`.
- Do not install dependencies.
- Do not implement backend or real xlsx parsing in version 1.
- Use local mock product data.
- Keep the quote summary editable for logistics method, delivery method, and tax rate.

---

### Task 1: Project Shell

**Files:**
- Create: `project.config.json`
- Create: `app.json`
- Create: `app.js`
- Create: `app.wxss`
- Create: `sitemap.json`

**Interfaces:**
- Produces: Mini Program app configuration and global state `globalData.quoteItems`.

- [ ] Create Mini Program config with pages `pages/home/index`, `pages/quote/index`, and `pages/summary/index`.
- [ ] Add global styles for page background, cards, buttons, and safe layout.
- [ ] Verify files are valid JSON/JS/CSS text.

### Task 2: Shared Data And Calculations

**Files:**
- Create: `utils/products.js`
- Create: `utils/quote.js`

**Interfaces:**
- Produces: `products`, `filterProducts(keyword)`, `calculateQuote(items, taxRate)`.

- [ ] Add 8 representative product rows based on the screenshot columns.
- [ ] Implement keyword filtering across model, category, name, and specs.
- [ ] Implement subtotal, tax, and total calculation.

### Task 3: Home Page

**Files:**
- Create: `pages/home/index.json`
- Create: `pages/home/index.wxml`
- Create: `pages/home/index.wxss`
- Create: `pages/home/index.js`
- Create: `assets/interior-bg.png`

**Interfaces:**
- Consumes: `products`.
- Produces: navigation to quote page.

- [ ] Render decoration background and overlay.
- [ ] Render product cards on home.
- [ ] Add top-right create quote button.

### Task 4: Quote Creation Page

**Files:**
- Create: `pages/quote/index.json`
- Create: `pages/quote/index.wxml`
- Create: `pages/quote/index.wxss`
- Create: `pages/quote/index.js`

**Interfaces:**
- Consumes: `filterProducts`.
- Produces: `getApp().globalData.quoteItems`.

- [ ] Add search input.
- [ ] Render filtered product cards.
- [ ] Support spec picker, quantity input, and add button.
- [ ] Show selected item count and navigate to summary.

### Task 5: Quote Summary Page

**Files:**
- Create: `pages/summary/index.json`
- Create: `pages/summary/index.wxml`
- Create: `pages/summary/index.wxss`
- Create: `pages/summary/index.js`

**Interfaces:**
- Consumes: `calculateQuote` and `globalData.quoteItems`.

- [ ] Render spreadsheet-like header and row grid.
- [ ] Add editable logistics method, delivery method, and tax rate.
- [ ] Recalculate subtotal, tax, and total on input changes.
- [ ] Add notes matching the screenshot's quotation conditions in concise form.

### Task 6: Verification

**Files:**
- Read: all created files.

- [ ] Run a file listing to confirm all expected files exist.
- [ ] Read key JSON files to confirm syntax shape.
- [ ] Provide the user with the project path and manual WeChat Developer Tools check steps.

## Self-Review

- Spec coverage: all requested version 1 frontend screens, local product generation, search, add quantity/spec, and quote summary are covered.
- Placeholder scan: no unfinished placeholder requirements remain.
- Type consistency: utility exports and page consumers use matching names.
