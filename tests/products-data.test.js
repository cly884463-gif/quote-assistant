const assert = require("assert");
const { products, filterProducts } = require("../utils/products");

assert.ok(products.length < 110);

const dt101 = products.find((item) => item.model === "DT-101");
assert.strictEqual(dt101.name, "瓷砖处理剂");
assert.deepStrictEqual(dt101.specs, ["0.8KG", "16KG"]);
assert.strictEqual(dt101.specOptions[0].dealerPrice, 30);
assert.strictEqual(dt101.specOptions[1].dealerPrice, 580);

const yc231 = products.find((item) => item.model === "YC-231+YC-Y");
assert.strictEqual(yc231.name, "陶釉哑光白漆（A组份）+（B组份）");
assert.deepStrictEqual(yc231.specs, ["2.88KG", "6KG", "21.6KG"]);
assert.strictEqual(yc231.specOptions[0].dealerPrice, 448);

const qc401 = products.find((item) => item.model === "QC-401");
assert.deepStrictEqual(qc401.specs, ["4.8KG", "20KG"]);
assert.strictEqual(qc401.specOptions[1].dealerPrice, 975);

assert.strictEqual(filterProducts("金刚底固宝").length, 1);

console.log("products data ok");
