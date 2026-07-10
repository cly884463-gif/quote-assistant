const assert = require("assert");
const { buildQuoteImageModel } = require("../utils/quote-image");

const model = buildQuoteImageModel({
  quoteType: "channel",
  logistics: "普通物流(运费到付）",
  delivery: "物流点自提",
  quote: {
    rows: [
      {
        model: "DT-103",
        category: "底漆",
        name: "金刚底固宝",
        spec: "3.2KG",
        workTimes: 1,
        coverage: 32,
        unit: "桶",
        quantity: 5,
        dealerPrice: 84,
        amount: 420
      }
    ],
    subtotal: 420,
    taxRate: 1,
    tax: 4.2,
    total: 424.2
  },
  noticeItems: ["1、测试注意事项"]
});

assert.strictEqual(model.width, model.columnWidths.reduce((sum, width) => sum + width, 0));
assert.strictEqual(model.width, 1060);
assert.strictEqual(model.palette.header, "#fff200");
assert.strictEqual(model.palette.money, "#10b981");
assert.strictEqual(model.topRow.logistics, "物流方式：普通物流(运费到付）");
assert.strictEqual(model.topRow.delivery, "送货方式：物流点自提");
assert.strictEqual(model.columns.length, 10);
assert.strictEqual(model.columns[8], "渠道合作单价");
assert.strictEqual(model.columns[9], "渠道价合计");
assert.strictEqual(model.rows[0][0], "DT-103");
assert.strictEqual(model.rows[0][8], "¥84");
assert.strictEqual(model.rows[0][9], "¥420");
assert.deepStrictEqual(model.totalRows[2], ["含税报价：", "¥424.20"]);
assert.strictEqual(model.notices[0], "1、测试注意事项");
assert.ok(model.height > 260);

console.log("quote image model ok");
