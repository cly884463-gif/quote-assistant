# 特调色浆参考颜色及色号 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为陶釉特调色浆增加按规格保存的“参考颜色及色号”输入框，并同步到最终清单和导出图片。

**Architecture:** 在报价条目中新增独立字段 `referenceColor`，保持 `id + spec` 唯一键不变。编辑卡片负责读取、恢复和实时更新字段；清单计算与导出模型只在展示阶段把字段组合进产品名称，避免污染原始产品数据或产生重复条目。

**Tech Stack:** 原生 JavaScript、CommonJS、Node.js `assert` 测试、静态 HTML/CSS、Canvas 图片导出、Netlify。

## Global Constraints

- 输入框只在 `TY-TT-SJ` 陶釉特调色浆卡片显示。
- 标签和占位文字固定为“参考颜色及色号”，字段允许留空。
- `referenceColor` 按规格保存，三种规格互不覆盖。
- 修改字段后实时更新已添加清单，不新增重复产品。
- 最终清单和导出图片在产品名称后追加“（参考颜色及色号：填写内容）”。
- 自动调色费不显示参考颜色，不影响自定义单价、数量或自动费用逻辑。

---

### Task 1: 报价条目字段保存与按规格恢复

**Files:**
- Modify: `tests/quote-selection.test.js`

**Interfaces:**
- Consumes: `upsertQuoteItem(items, product)` 和现有 `id + spec` 唯一键。
- Produces: 带 `referenceColor` 的报价条目；重新构建卡片时恢复当前规格保存的完整条目字段。

- [ ] **Step 1: 写失败测试**

在 `tests/quote-selection.test.js` 增加按规格恢复和同规格更新测试：

```js
const referenceItems = upsertQuoteItem([], {
  id: "custom-tinting-paste",
  selectedSpec: "2.4KG配套",
  quantity: 1,
  dealerPrice: 15,
  referenceColor: "立邦 NN3401-4 灰咖色"
});
const updatedReferenceItems = upsertQuoteItem(referenceItems, {
  id: "custom-tinting-paste",
  selectedSpec: "2.4KG配套",
  quantity: 1,
  dealerPrice: 15,
  referenceColor: "多乐士 00NN 53/000"
});
assert.strictEqual(updatedReferenceItems.length, 1);
assert.strictEqual(updatedReferenceItems[0].referenceColor, "多乐士 00NN 53/000");
const referenceCards = buildQuoteCards([{
  id: "custom-tinting-paste",
  specs: ["2.4KG配套", "5KG配套"],
  specOptions: [
    { spec: "2.4KG配套", dealerPrice: 15 },
    { spec: "5KG配套", dealerPrice: 20 }
  ]
}], updatedReferenceItems);
assert.strictEqual(referenceCards[0].referenceColor, "多乐士 00NN 53/000");
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\quote-selection.test.js`

Expected: FAIL，因为当前 `applyAddedState` 只恢复数量和添加状态，没有恢复 `referenceColor`。

- [ ] **Step 3: 实现完整条目恢复**

在 `utils/quote-selection.js` 中先合并已添加条目，再写入数量和添加状态：

```js
return Object.assign({}, product, addedItem || {}, {
  quantity: addedItem ? addedItem.quantity : 0,
  isAdded: Boolean(addedItem)
});
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `node tests\quote-selection.test.js`

Expected: PASS，同一规格更新保持单条记录，重新构建卡片恢复该规格参考颜色。

### Task 2: 特调色浆编辑输入框与实时同步

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Consumes: `CUSTOM_TINTING_PRODUCT_ID`、`getProductFromCard(card)`、`updateQuoteCard(card, product)`、报价区 `input` 事件。
- Produces: `data-action="reference-color"` 文本输入框和报价条目的 `referenceColor` 字段。

- [ ] **Step 1: 写失败测试**

在 `tests/web-static.test.js` 断言：

```js
assert.ok(js.includes('data-action="reference-color"'));
assert.ok(js.includes('placeholder="参考颜色及色号"'));
assert.ok(js.includes('referenceColor: referenceColorInput ? referenceColorInput.value.trim() : ""'));
assert.ok(js.includes('event.target.dataset.action === "reference-color"'));
assert.ok(css.includes(".custom-reference-control"));
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\web-static.test.js`

Expected: FAIL，因为当前卡片没有该输入框和同步逻辑。

- [ ] **Step 3: 实现输入框、恢复和实时更新**

在 `renderQuoteCard(product)` 的自定义单价控件后增加：

```js
${isCustomTintingProduct(product) ? `
  <label class="custom-reference-control">参考颜色及色号
    <input data-action="reference-color" type="text" maxlength="100" placeholder="参考颜色及色号" value="${escapeHtml(product.referenceColor || "")}">
  </label>
` : ""}
```

`getProductFromCard` 读取并清理文本后写入 `referenceColor`。`updateQuoteCard` 使用合并后的已添加条目恢复当前规格的输入值。报价区 `input` 事件把 `reference-color` 与数量、自定义单价一起交给 `syncAddedProduct`，从而实时更新已添加条目。

CSS 将 `.custom-reference-control` 与 `.custom-price-control` 共用标签、输入框和聚焦样式，保证移动端满宽显示。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node tests\web-static.test.js`

Expected: PASS。

### Task 3: 清单和导出图片展示

**Files:**
- Modify: `web/app.js`
- Modify: `utils/quote-image.js`
- Test: `tests/quote-image.test.js`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Consumes: 报价条目的 `name`、`id`、`referenceColor`。
- Produces: `formatQuoteItemName(item)`，仅为特调色浆且字段非空时返回追加参考信息的展示名称。

- [ ] **Step 1: 写清单和导出失败测试**

在 `tests/quote-image.test.js` 的报价行加入 `id: "custom-tinting-paste"` 和参考颜色，断言导出模型产品名称列为：

```js
assert.strictEqual(model.rows[0][2], "陶釉特调色浆（参考颜色及色号：立邦 NN3401-4 灰咖色）");
```

在 `tests/web-static.test.js` 断言 `web/app.js` 定义并调用 `formatQuoteItemName(item)`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\quote-image.test.js` 和 `node tests\web-static.test.js`

Expected: FAIL，因为产品名称尚未组合参考颜色。

- [ ] **Step 3: 实现展示名称格式化**

在 `utils/quote-image.js` 和 `web/app.js` 使用相同规则：

```js
function formatQuoteItemName(item) {
  const referenceColor = String(item.referenceColor || "").trim();
  if (item.id !== "custom-tinting-paste" || !referenceColor) return item.name;
  return `${item.name}（参考颜色及色号：${referenceColor}）`;
}
```

`utils/quote-image.js` 构造行时使用该名称；`web/app.js` 的 `calculateQuote()` 只在返回的展示行中覆盖 `name`，`state.quoteItems` 的原始名称、规格和唯一键保持不变。网页清单和 Canvas 导出都继续读取 `calculateQuote().rows`，自动获得相同展示结果。

- [ ] **Step 4: 运行针对性测试并确认通过**

Run: `node tests\quote-image.test.js`、`node tests\web-static.test.js`、`node tests\quote-selection.test.js`

Expected: 三项均 PASS。

- [ ] **Step 5: 运行全部测试和 Netlify 构建**

Run: 遍历执行 `tests\*.test.js`，随后执行 `node tools\build_netlify_release.js`。

Expected: 所有测试 PASS，输出 `netlify release generated`。

- [ ] **Step 6: 合并并部署**

Run: `git diff --check`，合并已验证分支到 `master`，再次运行全部测试，推送 GitHub。

Expected: GitHub 推送成功，Netlify 固定链接自动部署新版本。
