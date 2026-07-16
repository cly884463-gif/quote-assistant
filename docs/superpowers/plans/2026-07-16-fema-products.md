# 菲玛产品卡片组 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页材料预览、经销商报价和渠道合作报价中新增四款可搜索、可加入清单的菲玛产品。

**Architecture:** 新建独立的 `utils/fema-products.js` 维护菲玛产品基础字段及经销商、渠道两套整数价格，通过 `utils/extra-products.js` 合并进现有目录。同步更新 `web/data.js`，继续复用现有分类、卡片、搜索、数量、清单和导出流程。

**Tech Stack:** CommonJS、原生 JavaScript、Node.js `assert` 测试、静态 HTML/JS、Netlify。

## Global Constraints

- 分类名称固定为“菲玛”。
- 四款产品使用独立编号 `FEMA-001` 至 `FEMA-004`，不合并为多规格卡片。
- 经销商价固定为 `350、265、295、336`。
- 渠道合作价固定为经销商价上浮 20% 后四舍五入的 `420、318、354、403`。
- 单位均为“套”，不增加产品图片或新的界面逻辑。

---

### Task 1: 菲玛目录数据与防回归测试

**Files:**
- Create: `utils/fema-products.js`
- Modify: `utils/extra-products.js`
- Test: `tests/catalogs.test.js`
- Test: `tests/home-products.test.js`

**Interfaces:**
- Produces: `dealerFemaProducts: Product[]` 和 `channelFemaProducts: Product[]`。
- Consumes: `extraDealerProducts`、`extraChannelProducts` 现有目录合并接口。

- [ ] **Step 1: 写目录和首页卡片的失败测试**

在 `tests/catalogs.test.js` 中断言经销商和渠道目录各包含四个 `category === "菲玛"` 的产品，并断言价格分别为 `[350, 265, 295, 336]` 和 `[420, 318, 354, 403]`。在 `tests/home-products.test.js` 中断言 `FEMA-001` 的规格、单位、涂布量及两套价格正确。

```js
const dealerFemaProducts = dealerCatalogView.products.filter((item) => item.category === "菲玛");
const channelFemaProducts = channelCatalogView.products.filter((item) => item.category === "菲玛");
assert.deepStrictEqual(dealerFemaProducts.map((item) => item.dealerPrice), [350, 265, 295, 336]);
assert.deepStrictEqual(channelFemaProducts.map((item) => item.dealerPrice), [420, 318, 354, 403]);
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `node tests\catalogs.test.js` 和 `node tests\home-products.test.js`

Expected: FAIL，因为目录中尚无“菲玛”分类。

- [ ] **Step 3: 新增最小产品数据模块并接入目录**

在 `utils/fema-products.js` 定义四行基础数据：

```js
const rows = [
  ["FEMA-001", "短流平耐磨地坪实色面漆", "A+B组份 7KG/组", 3.5, 350, 420],
  ["FEMA-002", "墙瓷（粗粉）套装", "套装 14.35KG/组", 11, 265, 318],
  ["FEMA-003", "墙瓷（细粉）套装", "套装 21KG/组", 17.5, 295, 354],
  ["FEMA-004", "墙瓷实色面漆套装", "A+B组份 3KG/组", 12, 336, 403]
];
```

将每行映射为现有 `Product` 结构，`category` 为“菲玛”、`unit` 为“套”、`workTimes` 为空、每个产品只有一个 `specOptions`。分别导出经销商价和渠道价数组，并在 `utils/extra-products.js` 中展开加入两套额外产品数组。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node tests\catalogs.test.js` 和 `node tests\home-products.test.js`

Expected: 两项均 PASS。

### Task 2: 网页静态目录同步与完整验证

**Files:**
- Modify: `web/data.js`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Consumes: `window.__QUOTE_CATALOGS__.dealer` 和 `window.__QUOTE_CATALOGS__.channel`。
- Produces: 浏览器可直接读取的四款菲玛产品及两套价格。

- [ ] **Step 1: 写网页静态数据的失败测试**

在 `tests/web-static.test.js` 中解析或检查 `web/data.js`，断言包含 `FEMA-001` 至 `FEMA-004`、分类“菲玛”以及渠道价格 `403`。

```js
assert.ok(data.includes('"model": "FEMA-001"'));
assert.ok(data.includes('"model": "FEMA-004"'));
assert.ok(data.includes('"category": "菲玛"'));
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `node tests\web-static.test.js`

Expected: FAIL，因为 `web/data.js` 尚无菲玛产品。

- [ ] **Step 3: 同步两套网页数据**

把 Task 1 的四款产品按现有 JSON 结构加入 `web/data.js` 的 `dealer` 和 `channel` 数组；经销商使用 `[350, 265, 295, 336]`，渠道使用 `[420, 318, 354, 403]`，其他字段保持一致。

- [ ] **Step 4: 运行全部测试和 Netlify 构建**

Run: 遍历执行 `tests\*.test.js`，随后执行 `node tools\build_netlify_release.js`。

Expected: 所有测试 PASS，输出 `netlify release generated`。

- [ ] **Step 5: 检查变更并提交部署**

Run: `git diff --check`、`git status --short`，提交产品与测试文件并推送 `master`。

Expected: GitHub 推送成功，Netlify 从固定链接自动部署新版本。
