# Ceramic Product Price Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the names and dealer/channel prices for YC-231+YC-Y, TN-304, and YC-232+YC-Y everywhere the website reads product data.

**Architecture:** Treat `utils/products.js` and `utils/channel-products.js` as the source catalogs and keep the two matching sections in `web/data.js` synchronized. Tests assert exact specification-to-price mappings so previews, quote cards, images, and Excel exports inherit one consistent dataset.

**Tech Stack:** Plain JavaScript catalog modules, browser data bundle, Node `assert` tests.

## Global Constraints

- Channel prices equal dealer prices multiplied by 1.25 and rounded to the nearest integer.
- YC-231+YC-Y must be named `陶釉哑光白漆罩面（A组份）+（B组份）`.
- Do not add runtime price overrides.

---

### Task 1: Lock the New Product Values in Tests

**Files:**
- Modify: `tests/products-data.test.js`
- Modify: `tests/home-products.test.js`

**Interfaces:**
- Consumes: dealer and channel catalog products.
- Produces: exact assertions for names, specifications, and dealer/channel prices.

- [ ] **Step 1: Add failing dealer and home-card assertions**

Assert YC-231+YC-Y name and prices `[406, 768, 2498]`, TN-304 prices `[100, 426]`, and YC-232+YC-Y prices `[358, 704, 2106]`. Assert home-card channel prices `[508, 960, 3123]`, `[125, 533]`, and `[448, 880, 2633]`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node tests/products-data.test.js; node tests/home-products.test.js`

Expected: FAIL against the old names or prices.

### Task 2: Synchronize Dealer and Channel Catalogs

**Files:**
- Modify: `utils/products.js`
- Modify: `utils/channel-products.js`
- Modify: `web/data.js`

**Interfaces:**
- Produces: identical product names/specifications across catalogs with quote-type-specific prices.

- [ ] **Step 1: Update dealer catalog values**

Set YC-231+YC-Y to the approved name and `[406, 768, 2498]`; TN-304 to `[100, 426]`; YC-232+YC-Y to `[358, 704, 2106]`.

- [ ] **Step 2: Update channel catalog values**

Set YC-231+YC-Y to `[508, 960, 3123]`; TN-304 to `[125, 533]`; YC-232+YC-Y to `[448, 880, 2633]`, and use the approved YC-231+YC-Y name.

- [ ] **Step 3: Update both catalog sections in `web/data.js`**

Apply the same dealer and channel mappings to the browser bundle without changing unrelated products.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node tests/products-data.test.js; node tests/home-products.test.js`

Expected: `products data ok` and `home product cards ok`.

- [ ] **Step 5: Commit the data update**

```powershell
git add tests/products-data.test.js tests/home-products.test.js utils/products.js utils/channel-products.js web/data.js
git commit -m "Update ceramic coating product prices"
```

### Task 3: Full Regression, Build, and Deployment

**Files:**
- Verify: `tests/*.test.js`
- Verify: `release/quote-assistant-site/data.js`

**Interfaces:**
- Confirms all quote surfaces receive the updated catalog.

- [ ] **Step 1: Run all Node tests**

Run every `tests/*.test.js` file and stop on the first failure.

Expected: all test files pass.

- [ ] **Step 2: Build the Netlify release**

Run: `node tools/build_netlify_release.js`

Expected: `netlify release generated`, with the approved names and prices present in `release/quote-assistant-site/data.js`.

- [ ] **Step 3: Check Git integrity**

Run: `git diff --check; git status --short`.

Expected: no whitespace errors and only intentional files before commit.

- [ ] **Step 4: Merge and deploy**

Merge the feature branch into `master`, repeat full verification, and push `master` to GitHub to trigger the fixed Netlify URL deployment.
