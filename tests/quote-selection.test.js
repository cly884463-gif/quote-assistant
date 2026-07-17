const assert = require("assert");

const {
  buildQuoteCards,
  changeQuantity,
  getQuoteItemKey,
  getQuantityOnFocus,
  getQuantityOnBlur,
  removeQuoteItem,
  selectSpecOption,
  syncCustomTintingFees,
  upsertQuoteItem
} = require("../utils/quote-selection");

const products = [
  {
    id: "dt-103",
    name: "金刚底固宝",
    specs: ["3.2KG", "10KG"]
  },
  {
    id: "yc-203",
    name: "金刚瓷釉",
    specs: ["2.4KG"]
  }
];

const cards = buildQuoteCards(products, [{ id: "dt-103", quantity: 2, spec: "10KG" }]);

assert.strictEqual(cards[0].quantity, 2);
assert.strictEqual(cards[0].isAdded, true);
assert.strictEqual(cards[0].selectedSpec, "10KG");
assert.strictEqual(cards[1].isAdded, false);
assert.strictEqual(getQuantityOnFocus(0), "");
assert.strictEqual(getQuantityOnFocus(2), 2);
assert.strictEqual(getQuantityOnBlur(""), 0);
assert.strictEqual(getQuantityOnBlur("3"), 3);
assert.strictEqual(changeQuantity(2, 1), 3);
assert.strictEqual(changeQuantity(2, -1), 1);
assert.strictEqual(changeQuantity(0, -1), 0);
assert.strictEqual(changeQuantity("", 1), 1);

const specProduct = {
  id: "dt-103",
  model: "DT-103",
  name: "金刚底固宝",
  specs: ["3.2KG", "16KG"],
  specOptions: [
    { spec: "3.2KG", dealerPrice: 84, coverage: 32, unit: "桶", workTimes: 1 },
    { spec: "16KG", dealerPrice: 362, coverage: 160, unit: "桶", workTimes: 1 }
  ],
  selectedSpecIndex: 0,
  selectedSpec: "3.2KG",
  dealerPrice: 84,
  coverage: 32
};
const selectedLarge = selectSpecOption(specProduct, 1);
assert.strictEqual(selectedLarge.selectedSpec, "16KG");
assert.strictEqual(selectedLarge.dealerPrice, 362);
assert.strictEqual(selectedLarge.coverage, 160);

const updatedItems = upsertQuoteItem(
  [{ id: "dt-103", quantity: 2, spec: "3.2KG", name: "旧名称" }],
  { id: "dt-103", quantity: 5, selectedSpec: "3.2KG", name: "金刚底固宝" }
);
assert.strictEqual(updatedItems.length, 1);
assert.strictEqual(updatedItems[0].quantity, 5);
assert.strictEqual(updatedItems[0].spec, "3.2KG");

const multiSpecItems = upsertQuoteItem(
  [{ id: "dt-101", quantity: 1, spec: "0.8KG", name: "瓷砖处理剂" }],
  { id: "dt-101", quantity: 2, selectedSpec: "16KG", name: "瓷砖处理剂" }
);
assert.strictEqual(multiSpecItems.length, 2);
assert.strictEqual(multiSpecItems[0].spec, "0.8KG");
assert.strictEqual(multiSpecItems[1].spec, "16KG");

const multiSpecCards = buildQuoteCards([{
  id: "dt-101",
  name: "瓷砖处理剂",
  specs: ["0.8KG", "16KG"],
  specOptions: [
    { spec: "0.8KG", dealerPrice: 30, coverage: 8, unit: "瓶", workTimes: 1 },
    { spec: "16KG", dealerPrice: 580, coverage: 160, unit: "桶", workTimes: 1 }
  ]
}], multiSpecItems);
assert.strictEqual(multiSpecCards[0].isAdded, true);
assert.strictEqual(multiSpecCards[0].selectedSpec, "0.8KG");
assert.strictEqual(multiSpecCards[0].quantity, 1);

const insertedItems = upsertQuoteItem([], {
  id: "yc-203",
  quantity: 1,
  selectedSpec: "2.4KG",
  name: "金刚瓷釉"
});
assert.strictEqual(insertedItems.length, 1);
assert.strictEqual(insertedItems[0].spec, "2.4KG");

const removedItems = removeQuoteItem([
  { id: "dt-101", spec: "0.8KG", quantity: 1 },
  { id: "dt-101", spec: "16KG", quantity: 2 },
  { id: "yc-203", spec: "2.4KG", quantity: 1 }
], "dt-101", "0.8KG");
assert.deepStrictEqual(removedItems, [
  { id: "dt-101", spec: "16KG", quantity: 2 },
  { id: "yc-203", spec: "2.4KG", quantity: 1 }
]);

const customTintingItems = upsertQuoteItem(
  [{
    id: "custom-tinting-paste",
    spec: "2.4KG配套",
    quantity: 1,
    referenceColor: "米白色 NCS S 0502-Y"
  }],
  {
    id: "custom-tinting-paste",
    selectedSpec: "2.4KG配套",
    quantity: 1,
    referenceColor: "暖灰色 NCS S 2002-Y"
  }
);
assert.strictEqual(customTintingItems.length, 2);
assert.strictEqual(customTintingItems[0].referenceColor, "米白色 NCS S 0502-Y");
assert.strictEqual(customTintingItems[1].referenceColor, "暖灰色 NCS S 2002-Y");

const customTintingCards = buildQuoteCards([{
  id: "custom-tinting-paste",
  name: "陶釉特调色浆",
  specs: ["2.4KG配套", "5KG配套", "18KG配套"],
  specOptions: [
    { spec: "2.4KG配套", dealerPrice: 15 },
    { spec: "5KG配套", dealerPrice: 15 },
    { spec: "18KG配套", dealerPrice: 15 }
  ]
}], customTintingItems);
assert.strictEqual(customTintingCards[0].selectedSpec, "2.4KG配套");
assert.strictEqual(customTintingCards[0].referenceColor, "米白色 NCS S 0502-Y");

const warmGrayKey = getQuoteItemKey({
  id: "custom-tinting-paste",
  spec: "2.4KG配套",
  referenceColor: "暖灰色 NCS S 2002-Y"
});
const riceWhiteKey = getQuoteItemKey({
  id: "custom-tinting-paste",
  spec: "2.4KG配套",
  referenceColor: "米白色 NCS S 0502-Y"
});
assert.notStrictEqual(warmGrayKey, riceWhiteKey);

const customColorItems = upsertQuoteItem(
  [{
    id: "custom-tinting-paste",
    spec: "2.4KG配套",
    quantity: 1,
    referenceColor: "暖灰色 NCS S 2002-Y",
    needsTintingFee: true
  }],
  {
    id: "custom-tinting-paste",
    selectedSpec: "2.4KG配套",
    quantity: 2,
    referenceColor: "米白色 NCS S 0502-Y",
    needsTintingFee: true
  }
);
assert.strictEqual(customColorItems.length, 2);

const tintingFeeTemplate = {
  id: "fee-custom-tinting",
  model: "FEE-001",
  category: "陶釉特调色浆",
  name: "特调调色费",
  spec: "人工费",
  unit: "项",
  quantity: 1,
  dealerPrice: 50
};
const synchronizedFees = syncCustomTintingFees([
  {
    id: "custom-tinting-paste",
    spec: "2.4KG配套",
    quantity: 1,
    referenceColor: "暖灰色 NCS S 2002-Y",
    needsTintingFee: true
  },
  {
    id: "custom-tinting-paste",
    spec: "5KG配套",
    quantity: 1,
    referenceColor: " 暖灰色 NCS S 2002-Y ",
    needsTintingFee: true
  },
  {
    id: "custom-tinting-paste",
    spec: "18KG配套",
    quantity: 1,
    referenceColor: "米白色 NCS S 0502-Y",
    needsTintingFee: false
  },
  {
    id: "custom-tinting-paste",
    spec: "2.4KG配套",
    quantity: 1,
    referenceColor: "深灰色 NCS S 6000-N",
    needsTintingFee: true
  }
], tintingFeeTemplate);
const tintingFees = synchronizedFees.filter((item) => item.id === "fee-custom-tinting");
assert.strictEqual(tintingFees.length, 2);
assert.ok(tintingFees.some((item) => item.name.includes("暖灰色 NCS S 2002-Y")));
assert.ok(tintingFees.some((item) => item.name.includes("深灰色 NCS S 6000-N")));
assert.ok(!tintingFees.some((item) => item.name.includes("米白色 NCS S 0502-Y")));

console.log("quote selection behavior ok");
