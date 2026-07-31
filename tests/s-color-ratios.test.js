const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { sColorPasteProduct } = require("../utils/s-color-products");

const app = fs.readFileSync(path.join(__dirname, "..", "web", "app.js"), "utf8");

assert.strictEqual(sColorPasteProduct.specOptions.length, 96);
assert.ok(sColorPasteProduct.specOptions.every((option) => (
  option.remark.includes("配比(g:g)") && option.remark.includes("配比(g:ml)")
)));
assert.ok(sColorPasteProduct.specOptions[0].remark.includes("清漆：色浆=1000：55"));
assert.ok(sColorPasteProduct.specOptions[0].remark.includes("清漆：色浆=1000：42"));
assert.ok(app.includes("function getSColorRatioText"));
assert.ok(app.includes("data-role=\"choice-ratio\""));
assert.ok(app.includes("formatQuoteItemName(item)"));

console.log("s color ratios ok");
