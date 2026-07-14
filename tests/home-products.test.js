const assert = require("assert");

const { buildHomeProductCards } = require("../utils/home-products");
const { getCatalogByQuoteType } = require("../utils/catalogs");

const dealerCatalog = getCatalogByQuoteType("dealer");
const channelCatalog = getCatalogByQuoteType("channel");
const cards = buildHomeProductCards(dealerCatalog.products, channelCatalog.products);
const dt101 = cards.find((product) => product.model === "DT-101");
const yc231 = cards.find((product) => product.model === "YC-231+YC-Y");
const yc232 = cards.find((product) => product.model === "YC-232+YC-Y");
const qc401 = cards.find((product) => product.model === "QC-401");
const colorPaste = cards.find((product) => product.model === "TN-SJ");
const hColorPaste = cards.find((product) => product.model === "CC-H-SJ");
const sColorPaste = cards.find((product) => product.model === "GN-S-SJ");
const customTintingPaste = cards.find((product) => product.model === "TY-TT-SJ");

assert.ok(dt101);
assert.deepStrictEqual(dt101.specRows.map((row) => row.spec), ["0.8KG", "16KG"]);
assert.deepStrictEqual(dt101.specRows.map((row) => row.coverageText), ["8㎡/瓶", "160㎡/桶"]);
assert.strictEqual(dt101.specRows[0].dealerPrice, 30);
assert.strictEqual(dt101.specRows[0].channelPrice, 38);
assert.strictEqual(dt101.specRows[1].dealerPrice, 580);
assert.strictEqual(dt101.specRows[1].channelPrice, 725);
assert.ok(yc231);
assert.deepStrictEqual(yc231.specRows.map((row) => row.channelPrice), [560, 960, 3250]);
assert.ok(yc232);
assert.deepStrictEqual(yc232.specRows.map((row) => row.channelPrice), [469, 880, 2655]);
assert.ok(qc401);
assert.deepStrictEqual(qc401.specRows.map((row) => row.channelPrice), [323, 1108]);
assert.deepStrictEqual(dt101.specRows[0].cells, ["0.8KG", "8㎡/瓶", "¥30", "¥38"]);
assert.deepStrictEqual(dt101.specRows[1].cells, ["16KG", "160㎡/桶", "¥580", "¥725"]);
assert.ok(colorPaste);
assert.strictEqual(colorPaste.category, "陶泥色浆");
assert.strictEqual(colorPaste.specRows.length, 12);
assert.deepStrictEqual(colorPaste.specRows[0].cells, ["1号色浆 TS001/TN001", "50ml/瓶", "¥10", "¥10"]);
assert.deepStrictEqual(colorPaste.specRows[11].cells, ["16号色浆 TS016/TN016", "50ml/瓶", "¥10", "¥10"]);
assert.ok(hColorPaste);
assert.strictEqual(hColorPaste.category, "彩瓷H系列色浆");
assert.strictEqual(hColorPaste.specRows.length, 70);
assert.deepStrictEqual(hColorPaste.specRows[0].cells, ["H-002 黑色色浆 100ml/瓶", "100ml/瓶", "¥10", "¥10"]);
assert.deepStrictEqual(hColorPaste.specRows[1].cells, ["H-002 黑色色浆 250ml/瓶", "250ml/瓶", "¥16", "¥16"]);
assert.ok(sColorPaste);
assert.strictEqual(sColorPaste.category, "高浓度S系列色浆");
assert.strictEqual(sColorPaste.specRows.length, 96);
assert.deepStrictEqual(sColorPaste.specRows[0].cells, ["S001 中国红（清漆）200ml/瓶", "200ml/瓶", "¥55", "¥55"]);
assert.deepStrictEqual(sColorPaste.specRows[20].cells, ["S025 冰川（白漆）200ml/瓶", "200ml/瓶", "¥10", "¥10"]);

assert.ok(customTintingPaste);
assert.deepStrictEqual(customTintingPaste.specRows.map((row) => row.spec), ["2.4KG配套", "5KG配套", "18KG配套"]);
assert.deepStrictEqual(customTintingPaste.specRows[0].cells, ["2.4KG配套", "2.4KG配套", "可填", "可填"]);

console.log("home product cards ok");
