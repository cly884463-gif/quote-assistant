# 高浓度 S 系列配比显示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display both workbook-backed ratio values for every high-concentration S-series color during selection and in the final quote.

**Architecture:** Keep the existing S-series catalog data as the source of truth. Add a small display formatter in `web/app.js`, reuse it for the native select labels, the card detail, and quote item names, then style the card detail in `web/styles.css`.

**Tech Stack:** Static HTML, vanilla JavaScript, Node.js assertion tests.

## Global Constraints

- Show both `配比(g:g)` and `配比(g:ml)` values.
- Preserve existing S-series colors, prices, and 清漆/白漆 labels.
- Do not add dependencies or change the workbook source file.

---

### Task 1: Regression coverage

**Files:**
- Create: `tests/s-color-ratios.test.js`

- [x] Verify all 96 S-series options contain both ratio fields.
- [x] Verify the web app contains the ratio formatter and display hooks.

### Task 2: Display and quote synchronization

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`

- [x] Format both ratio fields from the existing option remark.
- [x] Append the ratio to S-series select options.
- [x] Show the selected ratio under the card description and refresh it on color/spec changes.
- [x] Append the selected ratio to the final quote item name.

### Task 3: Verification and release

**Files:**
- None beyond the files above.

- [x] Run syntax, catalog, quote, image, and ratio tests.
- [ ] Commit and push the change to the bound repository.

