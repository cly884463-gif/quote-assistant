# 水洗瓷石骨料新增颜色 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing TJ-001 aggregate card with new SCS-coded colors and dynamic dealer/channel pricing.

**Architecture:** Keep the existing aggregate product and selection controls. Add a small frontend mapping for special colors, derive the selected product identity and price at card-read time, and render that same derived identity in the card and quote summary.

**Tech Stack:** Static HTML, vanilla JavaScript, Node.js assertion tests.

## Global Constraints

- Keep XCL001-XCL012 unchanged.
- New colors use `SCS-<four-digit-color-code>`, dealer price 238, channel price 298.
- Preserve the existing 24KG specification and 20目/40目/60目/其他 controls.
- Do not add dependencies.

---

### Task 1: Add failing behavior tests

**Files:**
- Modify: `tests/web-static.test.js`
- Test: `tests/web-static.test.js`

- [ ] Add assertions for the new color names, `SCS-` mapping, dynamic price mapping, and preservation of XCL options.
- [ ] Run `node tests/web-static.test.js` and confirm it fails because the new mapping is absent.

### Task 2: Implement dynamic aggregate identity

**Files:**
- Modify: `web/app.js`

- [ ] Add the 14 special color options and their code/price mapping beside the existing aggregate constants.
- [ ] Add helpers that derive the selected aggregate model and price from quote type and selected color.
- [ ] Apply the derived values when reading a quote card and when rendering/updating its model and price.
- [ ] Keep the existing aggregate color parsing and item-key behavior so different colors remain separate rows.

### Task 3: Verify browser-facing behavior

**Files:**
- Modify: none

- [ ] Run `node --check web/app.js`.
- [ ] Run targeted data and quote tests.
- [ ] Verify the static source includes all new colors and both dynamic prices.

### Task 4: Commit and publish

**Files:**
- Commit only the feature files and tests.

- [ ] Commit with `feat: add special aggregate colors`.
- [ ] Push `master` and deploy the updated `web` directory to Cloudflare Pages when publishing access is available.

