const assert = require("assert");
const fs = require("fs");
const path = require("path");

const app = fs.readFileSync(path.join(__dirname, "..", "web", "app.js"), "utf8");

assert.ok(app.includes("2001大理白"));
assert.ok(app.includes("2015蜡黄"));
assert.ok(app.includes("XCL001"));
assert.ok(app.includes("XCL012"));
assert.ok(app.includes("SCS-"));
assert.ok(app.includes("dealerPrice: 238"));
assert.ok(app.includes("channelPrice: 298"));
assert.ok(app.includes("function getAggregateColorPricing"));
assert.ok(app.includes('const AGGREGATE_PRODUCT_MODEL = "TJ-001"'));

console.log("aggregate special colors ok");
