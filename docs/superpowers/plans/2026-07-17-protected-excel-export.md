# Protected Excel Quote Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为最终报价清单增加带浅灰水印、完整报价内容和密码保护的 `.xlsx` 导出功能。

**Architecture:** 使用本地 ExcelJS 4.4.0 浏览器构建，不依赖 CDN。新增独立 UMD 模块 `web/excel-export.js` 负责报价模型、工作簿样式、水印图片嵌入和工作表保护；`web/app.js` 只负责从现有状态取数、生成水印 PNG、触发下载和处理微信提示。

**Tech Stack:** 原生 JavaScript、ExcelJS 4.4.0、Canvas 2D、Node.js assert 测试、Netlify 静态发布。

## Global Constraints

- 导出格式固定为 `.xlsx`。
- 工作表保护密码固定为 `XCL995511`，仅用于防误改，不作为机密凭证。
- 水印文字固定为 `新材联·New Material Union`，浅灰、斜向重复，不影响报价阅读。
- 经销商和渠道报价必须使用各自的单价、合计列名。
- 物流、送货、税点、明细、合计、备注和六条注意事项必须完整。
- ExcelJS 必须本地加载，不使用外部 CDN。
- 不改变产品数据、报价计算和现有图片导出行为。

---

### Task 1: 固定 ExcelJS 浏览器依赖并接入发布包

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Modify: `.gitignore`
- Create: `web/vendor/exceljs.min.js`
- Create: `web/vendor/exceljs.LICENSE.txt`
- Modify: `tools/build_netlify_release.js`
- Modify: `tests/web-static.test.js`

**Interfaces:**
- Consumes: npm 包 `exceljs@4.4.0`。
- Produces: 浏览器全局 `window.ExcelJS`，以及发布包中的 `vendor/exceljs.min.js` 和许可证文件。

- [ ] **Step 1: Write the failing dependency and release assertions**

在 `tests/web-static.test.js` 增加对 `./vendor/exceljs.min.js` 的 HTML 引用断言。在 `tests/deploy-config.test.js` 增加构建脚本包含 `web/vendor` 复制逻辑的断言。

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node tests\web-static.test.js; node tests\deploy-config.test.js`

Expected: FAIL，缺少 ExcelJS 本地脚本和发布复制逻辑。

- [ ] **Step 3: Install and vendor ExcelJS 4.4.0**

创建：

```json
{
  "name": "quote-assistant",
  "private": true,
  "version": "1.0.0",
  "devDependencies": {
    "exceljs": "4.4.0"
  }
}
```

Run: `npm install`

在 `.gitignore` 增加 `node_modules/`。把 `node_modules/exceljs/dist/exceljs.min.js` 复制到 `web/vendor/exceljs.min.js`，把 `node_modules/exceljs/LICENSE` 复制到 `web/vendor/exceljs.LICENSE.txt`。在 `web/index.html` 的 `app.js` 前加载：

```html
<script src="./vendor/exceljs.min.js"></script>
```

修改 `tools/build_netlify_release.js`，创建 `release/quote-assistant-site/vendor` 并复制上述两个 vendor 文件。

- [ ] **Step 4: Run focused tests and build**

Run: `node tests\web-static.test.js; node tests\deploy-config.test.js; node tools\build_netlify_release.js`

Expected: 两项测试通过，发布目录包含两个 vendor 文件。

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json .gitignore web/vendor web/index.html tools/build_netlify_release.js tests/web-static.test.js tests/deploy-config.test.js
git commit -m "Vendor ExcelJS for browser exports"
```

---

### Task 2: 生成受保护且带水印的 Excel 工作簿

**Files:**
- Create: `web/excel-export.js`
- Create: `tests/excel-export.test.js`

**Interfaces:**
- Consumes: `input = { quoteType, logistics, delivery, remark, quote, noticeItems }`、ExcelJS 构造器和 PNG Data URL。
- Produces: `buildExcelQuoteModel(input)` 和异步 `createProtectedQuoteWorkbook(ExcelJS, input, watermarkDataUrl, password)`。

- [ ] **Step 1: Write failing model and workbook tests**

创建 `tests/excel-export.test.js`，至少断言：

```js
const assert = require("assert");
const ExcelJS = require("exceljs");
const {
  buildExcelQuoteModel,
  createProtectedQuoteWorkbook
} = require("../web/excel-export");

const input = {
  quoteType: "channel",
  logistics: "普通物流(运费到付）",
  delivery: "物流点自提",
  remark: "测试备注",
  quote: {
    rows: [{
      model: "DT-103", category: "底漆", name: "金刚底固宝", spec: "3.2KG",
      workTimes: 1, coverage: 32, unit: "桶", quantity: 2,
      dealerPrice: 84, amount: 168
    }],
    subtotal: 168, taxRate: 1, tax: 1.68, total: 169.68
  },
  noticeItems: ["1、测试注意事项"]
};

const model = buildExcelQuoteModel(input);
assert.strictEqual(model.columns[8], "渠道合作单价");
assert.strictEqual(model.columns[9], "渠道价合计");
assert.strictEqual(model.rows[0][0], "DT-103");
assert.deepStrictEqual(model.totals[2], ["含税报价：", 169.68]);
assert.strictEqual(model.remark, "测试备注");

const workbook = await createProtectedQuoteWorkbook(
  ExcelJS,
  input,
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+4x6bWQAAAABJRU5ErkJggg==",
  "XCL995511"
);
const sheet = workbook.worksheets[0];
assert.strictEqual(sheet.sheetProtection.sheet, true);
assert.strictEqual(sheet.getCell("A3").value, "DT-103");
assert.strictEqual(sheet.getImages().length, 1);
const buffer = await workbook.xlsx.writeBuffer();
assert.ok(buffer.byteLength > 1000);
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node tests\excel-export.test.js`

Expected: FAIL，模块不存在。

- [ ] **Step 3: Implement the UMD export module**

`web/excel-export.js` 必须同时支持 Node `module.exports` 和浏览器 `window.__EXCEL_EXPORT__`。实现要求：

- `buildExcelQuoteModel()` 返回两种报价对应列名、十列明细数组、三行合计、备注和注意事项。
- 工作表名为“报价清单”，隐藏网格线，A4 横向打印并适配一页宽度。
- 合并 `A1:E1` 和 `F1:J1` 展示物流与送货，第二行为表头，第三行开始写明细。
- 绿色价格列、黄色顶部行、灰色表头、黑色细边框、人民币数字格式 `¥0.00`。
- 明细后依次写合计、税金、含税报价、备注、“注意事项”和完整注意事项内容。
- 使用 `workbook.addImage({ base64, extension: "png" })`，以 `editAs: "absolute"` 覆盖 A1 至 J 末行。
- 所有单元格 `protection.locked = true`。
- 调用：

```js
await worksheet.protect(password, {
  selectLockedCells: true,
  selectUnlockedCells: false,
  formatCells: false,
  formatColumns: false,
  formatRows: false,
  insertRows: false,
  insertColumns: false,
  deleteRows: false,
  deleteColumns: false,
  sort: false,
  autoFilter: false,
  pivotTables: false,
  spinCount: 10000
});
```

- [ ] **Step 4: Run the test and verify pass**

Run: `node tests\excel-export.test.js`

Expected: 输出 `excel export ok`。

- [ ] **Step 5: Commit**

```powershell
git add web/excel-export.js tests/excel-export.test.js
git commit -m "Build protected Excel quote workbooks"
```

---

### Task 3: 接入导出按钮、下载和微信提示

**Files:**
- Modify: `web/index.html`
- Modify: `web/app.js`
- Modify: `web/styles.css`
- Modify: `tests/web-static.test.js`
- Modify: `tools/build_netlify_release.js`

**Interfaces:**
- Consumes: `window.ExcelJS`、`window.__EXCEL_EXPORT__`、现有 `calculateQuote()` 和页面状态。
- Produces: `exportExcelBtn` 交互、`createExcelWatermarkDataUrl()`、`exportQuoteExcel()` 和 `.xlsx` 浏览器下载。

- [ ] **Step 1: Write failing UI and integration assertions**

在 `tests/web-static.test.js` 增加：

```js
assert.ok(html.includes('id="exportExcelBtn"'));
assert.ok(html.includes('./excel-export.js'));
assert.ok(js.includes('const EXCEL_PROTECTION_PASSWORD = "XCL995511"'));
assert.ok(js.includes("function createExcelWatermarkDataUrl()"));
assert.ok(js.includes("async function exportQuoteExcel()"));
assert.ok(js.includes("window.__EXCEL_EXPORT__.createProtectedQuoteWorkbook"));
assert.ok(js.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
assert.ok(js.includes("请点击右上角，用系统浏览器打开后导出Excel表格"));
assert.ok(js.includes('el.exportExcelBtn.addEventListener("click", exportQuoteExcel)'));
assert.ok(css.includes(".summary-export-actions"));
```

在 `tests/deploy-config.test.js` 断言构建脚本复制 `web/excel-export.js`。

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node tests\web-static.test.js; node tests\deploy-config.test.js`

Expected: FAIL，缺少按钮和接入逻辑。

- [ ] **Step 3: Implement UI and browser export**

- `web/index.html` 在 `app.js` 前加载 `excel-export.js`，并将两个导出按钮包在 `.summary-export-actions` 中。
- `createExcelWatermarkDataUrl()` 使用透明 Canvas 绘制 `新材联·New Material Union`，透明度 `0.06`、旋转 `-24°`、重复间距与图片水印一致。
- `exportQuoteExcel()` 在微信内直接提示并返回；普通浏览器调用工作簿生成函数、`workbook.xlsx.writeBuffer()`、创建 XLSX Blob 和临时下载链接，下载后撤销 Object URL。
- 文件名按报价类型输出“经销商批发报价.xlsx”或“渠道合作报价.xlsx”。
- 导出过程中按钮禁用并显示“正在生成...”，在 `finally` 恢复。
- 捕获异常并 `toast("Excel表格生成失败，请重试")`。
- 桌面端两个按钮并列；手机端 `.summary-export-actions` 跨两列、两个按钮等宽，文字不溢出。
- 构建脚本复制 `web/excel-export.js` 到发布目录。

- [ ] **Step 4: Run all verification**

Run:

```powershell
$tests = Get-ChildItem -LiteralPath 'tests' -Filter '*.test.js' | Sort-Object Name
foreach ($test in $tests) {
  node $test.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node tools\build_netlify_release.js
git diff --check
```

Expected: 全部测试通过，输出 `netlify release generated`，发布目录包含 `excel-export.js` 和 `vendor/exceljs.min.js`。

- [ ] **Step 5: Commit**

```powershell
git add web/index.html web/app.js web/styles.css web/excel-export.js tests/web-static.test.js tests/deploy-config.test.js tools/build_netlify_release.js
git commit -m "Add protected Excel quote download"
```
