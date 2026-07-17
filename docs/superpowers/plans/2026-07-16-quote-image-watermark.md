# Quote Image Watermark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在经销商和渠道合作报价导出的 PNG 图片中加入不影响阅读的浅灰色重复品牌水印。

**Architecture:** 在现有 Canvas 导出流程中增加独立的 `drawQuoteWatermark(ctx, width, height)` 函数。函数只负责水印绘制和 Canvas 状态恢复，由 `exportQuoteImage()` 在白色背景之后、表格内容之前调用。

**Tech Stack:** 原生 JavaScript、Canvas 2D API、Node.js 静态测试、现有 Netlify 构建脚本。

## Global Constraints

- 水印文字固定为 `新材联·New Material Union`。
- 旋转角度固定为 `-24°`，透明度固定为 `0.06`。
- 水印仅进入导出图片及预览，不进入网页报价清单 DOM。
- 不安装新依赖，不调整现有报价数据和计算逻辑。

---

### Task 1: Canvas 报价图片水印

**Files:**
- Modify: `tests/web-static.test.js`
- Modify: `web/app.js`

**Interfaces:**
- Consumes: `exportQuoteImage()` 创建的 Canvas 2D 上下文、画布宽度和高度。
- Produces: `drawQuoteWatermark(ctx, width, height)`，完成重复水印绘制并恢复传入上下文状态。

- [ ] **Step 1: Write the failing static test**

在 `tests/web-static.test.js` 的 JavaScript 断言区域增加：

```js
assert.ok(js.includes("function drawQuoteWatermark(ctx, width, height)"));
assert.ok(js.includes("新材联·New Material Union"));
assert.ok(js.includes("ctx.globalAlpha = 0.06"));
assert.ok(js.includes("drawQuoteWatermark(ctx, canvas.width, canvas.height)"));
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests\web-static.test.js`

Expected: FAIL，缺少 `drawQuoteWatermark` 断言内容。

- [ ] **Step 3: Implement the watermark renderer**

在 `web/app.js` 的 `exportQuoteImage()` 之前增加：

```js
function drawQuoteWatermark(ctx, width, height) {
  const text = "新材联·New Material Union";
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#667085";
  ctx.font = "bold 22px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-24 * Math.PI / 180);

  for (let y = -height; y <= height; y += 120) {
    for (let x = -width; x <= width; x += 320) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}
```

在 `exportQuoteImage()` 白色背景填充后调用：

```js
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawQuoteWatermark(ctx, canvas.width, canvas.height);
```

- [ ] **Step 4: Run focused and full verification**

Run: `node tests\web-static.test.js`

Expected: `web static app ok`

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

Expected: 全部 12 组测试通过，输出 `netlify release generated`，`git diff --check` 无错误。

- [ ] **Step 5: Commit**

```powershell
git add tests/web-static.test.js web/app.js
git commit -m "Add watermark to exported quote images"
```
