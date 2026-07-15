const assert = require("assert");

const { getCatalogByQuoteType } = require("../utils/catalogs");
const dealerCatalog = require("../utils/products");
const channelCatalog = require("../utils/channel-products");

const dealerDt101 = dealerCatalog.products.find((item) => item.model === "DT-101");
const channelDt101 = channelCatalog.products.find((item) => item.model === "DT-101");
const dealerCatalogView = getCatalogByQuoteType("dealer");
const channelCatalogView = getCatalogByQuoteType("channel");
const dealerColorPaste = dealerCatalogView.products.find((item) => item.model === "TN-SJ");
const channelColorPaste = channelCatalogView.products.find((item) => item.model === "TN-SJ");
const hColorPaste = dealerCatalogView.products.find((item) => item.model === "CC-H-SJ");
const sColorPaste = dealerCatalogView.products.find((item) => item.model === "GN-S-SJ");
const dealerCustomTintingPaste = dealerCatalogView.products.find((item) => item.model === "TY-TT-SJ");
const channelCustomTintingPaste = channelCatalogView.products.find((item) => item.model === "TY-TT-SJ");
const dealerCustomTintingFee = dealerCatalogView.products.find((item) => item.model === "FEE-001");

assert.ok(!dealerCatalog.products.some((item) => item.model === "DT-107"));
assert.ok(!channelCatalog.products.some((item) => item.model === "DT-107"));

assert.strictEqual(dealerDt101.specOptions[0].dealerPrice, 30);
assert.strictEqual(channelDt101.specOptions[0].dealerPrice, 38);
assert.strictEqual(channelDt101.specOptions[1].dealerPrice, 725);
assert.strictEqual(channelDt101.specOptions[0].costPerSquare, 4.75);
assert.ok(channelCatalog.products.every((product) => (
  product.specOptions.every((option) => Number.isInteger(option.dealerPrice))
)));
assert.ok(dealerCatalogView.products.length > dealerCatalog.products.length);
assert.ok(channelCatalogView.products.length > channelCatalog.products.length);
assert.ok(dealerColorPaste);
assert.ok(channelColorPaste);
assert.strictEqual(dealerColorPaste.name, "陶泥色浆");
assert.strictEqual(dealerColorPaste.specOptions.length, 12);
assert.strictEqual(dealerColorPaste.specOptions[0].spec, "1号色浆 TS001/TN001");
assert.strictEqual(dealerColorPaste.specOptions[0].dealerPrice, 10);
assert.strictEqual(channelColorPaste.specOptions[0].dealerPrice, 10);
assert.strictEqual(dealerCatalogView.filterProducts("TS001")[0].name, "陶泥色浆");
assert.ok(hColorPaste);
assert.strictEqual(hColorPaste.name, "彩瓷H系列色浆");
assert.strictEqual(hColorPaste.specOptions.length, 70);
assert.strictEqual(hColorPaste.specOptions[0].spec, "H-002 黑色色浆 100ml/瓶");
assert.strictEqual(hColorPaste.specOptions[0].dealerPrice, 10);
assert.strictEqual(hColorPaste.specOptions[1].spec, "H-002 黑色色浆 250ml/瓶");
assert.strictEqual(hColorPaste.specOptions[1].dealerPrice, 16);
assert.strictEqual(dealerCatalogView.filterProducts("H-039")[0].name, "彩瓷H系列色浆");
assert.ok(sColorPaste);
assert.strictEqual(sColorPaste.name, "高浓度S系列色浆");
assert.strictEqual(sColorPaste.specOptions.length, 96);
assert.strictEqual(sColorPaste.specOptions[0].spec, "S001 中国红（清漆）200ml/瓶");
assert.strictEqual(sColorPaste.specOptions[0].dealerPrice, 55);
assert.ok(sColorPaste.specOptions[0].remark.includes("配比(g:g)：清漆：色浆=1000：55"));
assert.ok(sColorPaste.specOptions[0].remark.includes("配比(g:ml)：清漆：色浆=1000：42"));
assert.strictEqual(sColorPaste.specOptions[20].spec, "S025 冰川（白漆）200ml/瓶");
assert.ok(sColorPaste.specOptions[20].remark.includes("配比(g:g)：白漆：色浆=1000：10"));
assert.strictEqual(dealerCatalogView.filterProducts("S025")[0].name, "高浓度S系列色浆");
assert.ok(dealerCustomTintingPaste);
assert.ok(channelCustomTintingPaste);
assert.ok(!dealerCustomTintingFee);
assert.deepStrictEqual(dealerCustomTintingPaste.specs, ["2.4KG配套", "5KG配套", "18KG配套"]);
assert.strictEqual(dealerCustomTintingPaste.allowCustomPrice, true);
assert.strictEqual(dealerCustomTintingPaste.specOptions[0].dealerPrice, "");
assert.strictEqual(channelCustomTintingPaste.specOptions[0].dealerPrice, "");
assert.strictEqual(dealerCustomTintingPaste.specOptions[0].unit, "瓶");
assert.strictEqual(dealerCatalogView.filterProducts("TY-TT-SJ")[0].model, "TY-TT-SJ");
assert.strictEqual(getCatalogByQuoteType("unknown").products.length, dealerCatalogView.products.length);

console.log("catalog selection ok");
