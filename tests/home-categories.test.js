const assert = require("assert");
const { groupProductsByCategory, products } = require("../utils/products");

const groups = groupProductsByCategory(products);

assert.ok(groups.length > 5);
assert.strictEqual(groups[0].category, "底漆");
assert.strictEqual(groups[0].open, true);
assert.ok(groups[0].products.length >= 1);
assert.ok(groups.every((group) => Array.isArray(group.products)));
assert.ok(groups.find((group) => group.category === "陶釉"));

console.log("home categories ok");
