# 液态瓷砖产品卡片组 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页材料预览、经销商报价和渠道合作报价中新增三款可搜索、可加入清单的液态瓷砖产品。

**Architecture:** 新建 `utils/liquid-tile-products.js`，参考菲玛模块生成经销商和渠道两套产品数组，通过 `utils/extra-products.js` 合并进现有目录。为缺失涂布量增加统一格式化处理，并同步 `web/data.js`，继续复用现有分类、搜索、数量、清单和导出流程。

**Tech Stack:** CommonJS、原生 JavaScript、Node.js `assert` 测试、静态 HTML/JS、Netlify。

## Global Constraints

- 分类名称固定为“液态瓷砖”。
- 产品编号固定为 `DP-1021`、`DP-1022`、`DP-1023`，每款独立成卡。
- 经销商价固定为 `56、56、308`。
- 渠道合作价固定为上浮 20% 后四舍五入的 `67、67、370`。
- 单位均为“组”，施工次数均为 `1`。
- DP-1021 和 DP-1022 的涂布量显示“未提供”；DP-1023 显示 `3.5㎡/组`。
- 不增加产品图片或新的交互控件。

---

### Task 1: 缺失涂布量格式化

**Files:**
- Modify: `utils/home-products.js`
- Modify: `web/app.js`
- Test: `tests/home-products.test.js`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Produces: `formatCoverage(option)`，输入产品规格对象，返回首页和报价卡片使用的显示文本。
- Consumes: `option.packageSpec`、`option.coverage`、`option.unit`。

- [ ] **Step 1: 写失败测试**

在 `tests/home-products.test.js` 添加一个 `coverage: "未提供"` 的产品，断言卡片第二列为“未提供”。在 `tests/web-static.test.js` 断言 `web/app.js` 定义 `formatCoverage`，并在首页卡片和报价卡片中调用。

```js
const missingCoverageCards = buildHomeProductCards([{
  id: "missing-coverage",
  model: "MISSING-001",
  category: "测试",
  name: "缺失涂布量",
  specs: ["1KG"],
  specOptions: [{ spec: "1KG", coverage: "未提供", unit: "组", dealerPrice: 1 }]
}], []);
assert.strictEqual(missingCoverageCards[0].specRows[0].coverageText, "未提供");
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\home-products.test.js` 和 `node tests\web-static.test.js`

Expected: FAIL，因为当前逻辑会把缺失值拼成“未提供㎡/组”，且网页没有统一格式化函数。

- [ ] **Step 3: 实现最小格式化函数**

在两个运行环境中使用相同规则：

```js
function formatCoverage(option) {
  if (option.packageSpec) return option.packageSpec;
  if (option.coverage === "" || option.coverage == null || option.coverage === "未提供") return "未提供";
  return `${option.coverage}㎡/${option.unit || ""}`;
}
```

`utils/home-products.js` 的 `coverageText` 改用该函数；`web/app.js` 的首页卡片、报价卡片初始说明和规格切换说明均改用该函数。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node tests\home-products.test.js` 和 `node tests\web-static.test.js`

Expected: 两项均 PASS。

### Task 2: 液态瓷砖目录数据

**Files:**
- Create: `utils/liquid-tile-products.js`
- Modify: `utils/extra-products.js`
- Test: `tests/catalogs.test.js`
- Test: `tests/home-products.test.js`

**Interfaces:**
- Produces: `dealerLiquidTileProducts: Product[]` 和 `channelLiquidTileProducts: Product[]`。
- Consumes: `extraDealerProducts`、`extraChannelProducts` 现有目录合并接口。

- [ ] **Step 1: 写目录和首页卡片的失败测试**

断言两套目录各包含三个 `category === "液态瓷砖"` 的产品，编号为 DP-1021 至 DP-1023，价格分别为 `[56, 56, 308]` 和 `[67, 67, 370]`。首页断言 DP-1021 显示“未提供”，DP-1023 显示“3.5㎡/组”。

```js
assert.deepStrictEqual(dealerLiquidTileProducts.map((item) => item.model), ["DP-1021", "DP-1022", "DP-1023"]);
assert.deepStrictEqual(dealerLiquidTileProducts.map((item) => item.dealerPrice), [56, 56, 308]);
assert.deepStrictEqual(channelLiquidTileProducts.map((item) => item.dealerPrice), [67, 67, 370]);
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\catalogs.test.js` 和 `node tests\home-products.test.js`

Expected: FAIL，因为目录尚无“液态瓷砖”分类。

- [ ] **Step 3: 新增数据模块并接入目录**

在 `utils/liquid-tile-products.js` 定义：

```js
const rows = [
  ["DP-1021", "地砖填缝胶（AB组份）", "1.2KG", "未提供", 56, 67],
  ["DP-1022", "墙砖补缝膏（AB组份）", "1.2KG", "未提供", 56, 67],
  ["DP-1023", "液态无缝瓷砖（AB组份）", "7KG", 3.5, 308, 370]
];
```

每行映射为现有产品结构：`category` 为“液态瓷砖”、`workTimes` 为 `1`、`unit` 为“组”；涂布量为数值时计算单平方成本，否则留空。导出经销商和渠道数组，并在 `utils/extra-products.js` 中分别展开加入两套额外产品目录。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node tests\catalogs.test.js` 和 `node tests\home-products.test.js`

Expected: 两项均 PASS。

### Task 3: 网页静态目录同步与部署验证

**Files:**
- Modify: `web/data.js`
- Test: `tests/web-static.test.js`

**Interfaces:**
- Consumes: `window.__QUOTE_CATALOGS__.dealer` 和 `window.__QUOTE_CATALOGS__.channel`。
- Produces: 浏览器可读取的三款液态瓷砖产品及两套价格。

- [ ] **Step 1: 写网页数据失败测试**

实际执行 `web/data.js`，断言两套目录中的液态瓷砖编号和价格正确。

```js
assert.deepStrictEqual(Array.from(dealerLiquidTiles, (item) => item.model), ["DP-1021", "DP-1022", "DP-1023"]);
assert.deepStrictEqual(Array.from(dealerLiquidTiles, (item) => item.dealerPrice), [56, 56, 308]);
assert.deepStrictEqual(Array.from(channelLiquidTiles, (item) => item.dealerPrice), [67, 67, 370]);
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node tests\web-static.test.js`

Expected: FAIL，因为网页静态目录尚无三款液态瓷砖产品。

- [ ] **Step 3: 同步两套网页静态数据**

把三款产品按现有对象结构加入 `web/data.js` 的 `dealer` 和 `channel` 数组。两款缺失涂布量产品使用字符串“未提供”及空单平方成本，DP-1023 使用涂布量 `3.5`。

- [ ] **Step 4: 运行全部测试和 Netlify 构建**

Run: 遍历执行 `tests\*.test.js`，随后执行 `node tools\build_netlify_release.js`。

Expected: 所有测试 PASS，输出 `netlify release generated`。

- [ ] **Step 5: 检查、合并并部署**

Run: `git diff --check`，合并已验证分支到 `master`，再次运行全部测试，推送 GitHub。

Expected: GitHub 推送成功，Netlify 固定链接自动部署新版本。
