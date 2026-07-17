const CUSTOM_TINTING_PRODUCT_ID = "custom-tinting-paste";
const CUSTOM_TINTING_FEE_ID = "fee-custom-tinting";

function normalizeReferenceColor(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function getQuoteItemKey(item) {
  const baseKey = `${item.id}|${item.spec || item.selectedSpec || ""}`;
  if (item.id !== CUSTOM_TINTING_PRODUCT_ID) {
    return baseKey;
  }
  return `${baseKey}|${normalizeReferenceColor(item.referenceColor)}`;
}

function getAddedProductMap(items) {
  const map = {};
  (items || []).forEach((item) => {
    map[getQuoteItemKey(item)] = item;
  });
  return map;
}

function findAddedSpecItem(items, product) {
  const specs = product.specs || [];
  return (items || []).find((item) => item.id === product.id && specs.indexOf(item.spec) !== -1);
}

function applyAddedState(product, quoteItems) {
  const addedMap = getAddedProductMap(quoteItems);
  const addedItem = addedMap[getQuoteItemKey(product)];
  return Object.assign({}, product, addedItem || {}, {
    quantity: addedItem ? addedItem.quantity : 0,
    isAdded: Boolean(addedItem)
  });
}

function buildQuoteCards(products, quoteItems) {
  return (products || []).map((product) => {
    const addedItem = findAddedSpecItem(quoteItems, product);
    const selectedSpec = addedItem ? addedItem.spec : product.specs[0];
    const selectedSpecIndex = Math.max(0, product.specs.indexOf(selectedSpec));

    const card = selectSpecOption(Object.assign({}, product, {
      referenceColor: addedItem ? addedItem.referenceColor : product.referenceColor,
      selectedSpecIndex,
      selectedSpec
    }), selectedSpecIndex);

    return applyAddedState(card, quoteItems);
  });
}

function selectSpecOption(product, index) {
  const selectedSpecIndex = Number(index) || 0;
  const option = product.specOptions && product.specOptions[selectedSpecIndex];
  if (!option) {
    return Object.assign({}, product, {
      selectedSpecIndex,
      selectedSpec: product.specs[selectedSpecIndex]
    });
  }

  return Object.assign({}, product, option, {
    selectedSpecIndex,
    selectedSpec: option.spec
  });
}

function getQuantityOnFocus(value) {
  return Number(value) === 0 ? "" : value;
}

function getQuantityOnBlur(value) {
  if (value === "" || value === null || typeof value === "undefined") {
    return 0;
  }
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity : 0;
}

function changeQuantity(value, delta) {
  const quantity = Number(value) || 0;
  const nextQuantity = quantity + delta;
  return nextQuantity < 0 ? 0 : nextQuantity;
}

function normalizeQuoteItem(product) {
  return Object.assign({}, product, {
    spec: product.selectedSpec || product.spec,
    quantity: Number(product.quantity) || 0
  });
}

function upsertQuoteItem(items, product) {
  const quoteItem = normalizeQuoteItem(product);
  const quoteItemKey = getQuoteItemKey(quoteItem);
  const existingIndex = (items || []).findIndex((item) => getQuoteItemKey(item) === quoteItemKey);
  if (existingIndex === -1) {
    return (items || []).concat(quoteItem);
  }

  return (items || []).map((item, index) => {
    if (index !== existingIndex) {
      return item;
    }
    return Object.assign({}, item, quoteItem);
  });
}

function removeQuoteItem(items, id, spec) {
  const removeKey = getQuoteItemKey({ id, spec });
  return (items || []).filter((item) => getQuoteItemKey(item) !== removeKey);
}

function syncCustomTintingFees(items, feeTemplate) {
  const productItems = (items || []).filter((item) => item.id !== CUSTOM_TINTING_FEE_ID);
  const selectedColors = new Map();

  productItems.forEach((item) => {
    const referenceColor = String(item.referenceColor || "").trim();
    const colorKey = normalizeReferenceColor(referenceColor);
    if (item.id !== CUSTOM_TINTING_PRODUCT_ID
      || Number(item.quantity) <= 0
      || !item.needsTintingFee
      || !colorKey) {
      return;
    }
    if (!selectedColors.has(colorKey)) {
      selectedColors.set(colorKey, referenceColor);
    }
  });

  const feeItems = Array.from(selectedColors.entries()).map(([colorKey, referenceColor]) => (
    Object.assign({}, feeTemplate, {
      name: `${feeTemplate.name}（${referenceColor}）`,
      spec: `参考颜色：${referenceColor}`,
      selectedSpec: `参考颜色：${referenceColor}`,
      referenceColor,
      feeColorKey: colorKey
    })
  ));

  return productItems.concat(feeItems);
}

module.exports = {
  applyAddedState,
  buildQuoteCards,
  changeQuantity,
  getQuoteItemKey,
  getQuantityOnFocus,
  getQuantityOnBlur,
  removeQuoteItem,
  selectSpecOption,
  syncCustomTintingFees,
  upsertQuoteItem
};
