const assert = require("assert");

const {
  getSummaryColumns,
  summaryColumns,
  topRowLayout,
  totalRowLayout
} = require("../utils/summary-options");

assert.deepStrictEqual(summaryColumns.map((column) => column.key), [
  "model",
  "category",
  "name",
  "spec",
  "workTimes",
  "coverage",
  "unit",
  "quantity",
  "dealerPrice",
  "amount"
]);

assert.strictEqual(summaryColumns.some((column) => column.key === "costPerSquare"), false);
assert.strictEqual(summaryColumns.some((column) => column.key === "remark"), false);
assert.strictEqual(getSummaryColumns("dealer")[8].label, "经销商单价");
assert.strictEqual(getSummaryColumns("dealer")[9].label, "经销商合计");
assert.strictEqual(getSummaryColumns("channel")[8].label, "渠道合作单价");
assert.strictEqual(getSummaryColumns("channel")[9].label, "渠道价合计");
assert.deepStrictEqual(totalRowLayout, {
  labelSpan: 9,
  valueSpan: 1
});
assert.deepStrictEqual(topRowLayout, {
  logisticsSpan: 5,
  deliverySpan: 5
});

console.log("summary columns ok");
