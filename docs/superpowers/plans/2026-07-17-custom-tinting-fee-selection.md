# Selectable Tinting Fees by Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users opt into a 50 yuan tinting fee per distinct reference color while preserving previously added colors as independent quote requirements.

**Architecture:** Extend the existing pure quote-selection utilities with custom-product identity and fee synchronization, then consume those helpers from the browser UI. The quote list remains the single source for the on-screen table, image export, and protected Excel export.

**Tech Stack:** Plain JavaScript, DOM APIs, Node `assert` tests, existing HTML/CSS quote application.

## Global Constraints

- The checkbox label is `需要调色（+¥50/颜色）` and defaults to unchecked.
- Custom tinting records are identified by product, specification, and trimmed reference color.
- One distinct color produces at most one 50 yuan fee, even across multiple specifications.
- Changing the reference color must preserve prior quote rows and present a fresh unadded card state.
- Existing image and protected Excel exports must consume the synchronized quote rows without separate fee logic.

---

### Task 1: Quote Identity and Fee Synchronization

**Files:**
- Modify: `utils/quote-selection.js`
- Test: `tests/quote-selection.test.js`

**Interfaces:**
- Produces: `getQuoteItemKey(item)` including reference color for `custom-tinting-paste`.
- Produces: `syncCustomTintingFees(items, feeTemplate)` returning product rows plus one fee row per selected color.

- [ ] **Step 1: Write failing tests for distinct custom colors and fee grouping**

Add assertions proving that two different colors with the same specification remain separate, the same color across two specifications produces one fee, unchecked colors produce no fee, and different checked colors produce two fees.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node tests/quote-selection.test.js`

Expected: FAIL because custom color identity and `syncCustomTintingFees` do not yet exist.

- [ ] **Step 3: Implement minimal pure helpers**

Normalize reference colors with `String(value || "").trim().toLocaleLowerCase()`. Keep normal product keys unchanged, append the normalized color only for `custom-tinting-paste`, remove existing `fee-custom-tinting` rows before rebuilding fees, and create one fee row for every unique checked nonempty color.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node tests/quote-selection.test.js`

Expected: `quote selection behavior ok`.

- [ ] **Step 5: Commit the pure behavior**

```powershell
git add utils/quote-selection.js tests/quote-selection.test.js
git commit -m "Support tinting fees by reference color"
```

### Task 2: Card Checkbox and Fresh Color State

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Consumes: custom product key and fee synchronization behavior from Task 1.
- Produces: `needsTintingFee` on each custom tinting quote item.

- [ ] **Step 1: Write failing static UI assertions**

Assert that the custom card renders `type="checkbox"`, `data-action="needs-tinting"`, and `需要调色（+¥50/颜色）`; that card extraction reads `.checked`; that fee synchronization is conditional; and that changing reference color resets price, quantity, and checkbox for a new unmatched color.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node tests/web-static.test.js`

Expected: FAIL because the checkbox and conditional state are absent.

- [ ] **Step 3: Add the checkbox and state flow**

Render the checkbox only for `custom-tinting-paste`. Store its checked state as `needsTintingFee`, restore it when an exact color/spec record is selected, and update fees after add, update, checkbox changes, and deletion. On a reference-color input that does not match an existing custom row, retain the typed color but clear custom price, set quantity to `0`, uncheck the fee, and remove the added-card styling without changing prior quote rows.

- [ ] **Step 4: Add restrained checkbox styling**

Use a native checkbox with a compact horizontal label inside the custom controls; preserve the existing responsive width and avoid adding card-like wrappers.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node tests/web-static.test.js; node tests/quote-selection.test.js`

Expected: both tests print their existing success messages.

- [ ] **Step 6: Commit the browser interaction**

```powershell
git add web/app.js web/styles.css tests/web-static.test.js
git commit -m "Add optional tinting fee checkbox"
```

### Task 3: Full Regression and Release Verification

**Files:**
- Verify: `tests/*.test.js`
- Verify: `tools/build_netlify_release.js`
- Verify: `release/quote-assistant-site/`

**Interfaces:**
- Confirms the shared quote list reaches the summary, image export, Excel export, and Netlify release unchanged.

- [ ] **Step 1: Run syntax checks**

Run: `node --check web/app.js; node --check utils/quote-selection.js`

Expected: exit code `0`.

- [ ] **Step 2: Run every test file**

Run each `tests/*.test.js` with Node and stop on the first nonzero exit.

Expected: all test files pass.

- [ ] **Step 3: Build and inspect the release**

Run: `node tools/build_netlify_release.js`

Expected: `netlify release generated`; the release `app.js` and `styles.css` contain the checkbox behavior and styling.

- [ ] **Step 4: Check repository integrity**

Run: `git diff --check; git status --short`

Expected: no whitespace errors and only intentional changes before the final commit.

- [ ] **Step 5: Merge and deploy**

Merge the feature branch into `master`, rerun the full verification on the merged result, and push `master` to GitHub so Netlify updates the fixed URL.
