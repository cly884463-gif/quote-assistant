function getQuoteItemKey(item) {
  return `${item.id}|${item.spec || item.selectedSpec || ""}`;
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

module.exports = {
  applyAddedState,
  buildQuoteCards,
  changeQuantity,
  getQuantityOnFocus,
  getQuantityOnBlur,
  removeQuoteItem,
  selectSpecOption,
  upsertQuoteItem
};
