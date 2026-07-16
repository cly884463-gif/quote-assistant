function normalizeProductName(name) {
  return String(name || "")
    .replace(/罩面/g, "")
    .replace(/[（）()\s]/g, "")
    .toLowerCase();
}

function setIfEmpty(map, key, value) {
  if (key && !map[key]) {
    map[key] = value;
  }
}

function buildChannelSpecMap(channelProducts) {
  const map = {};
  (channelProducts || []).forEach((product) => {
    (product.specOptions || []).forEach((option) => {
      setIfEmpty(map, `${product.id}|${option.spec}`, option);
      setIfEmpty(map, `${product.model}|${product.name}|${option.spec}`, option);
      setIfEmpty(map, `${product.name}|${option.spec}`, option);
      setIfEmpty(map, `${normalizeProductName(product.name)}|${option.spec}`, option);
    });
  });
  return map;
}

function findChannelOption(map, product, option) {
  return map[`${product.id}|${option.spec}`]
    || map[`${product.model}|${product.name}|${option.spec}`]
    || map[`${product.name}|${option.spec}`]
    || map[`${normalizeProductName(product.name)}|${option.spec}`]
    || {};
}

function formatCoverage(option) {
  if (option.packageSpec) {
    return option.packageSpec;
  }
  if (option.coverage === "" || option.coverage == null || option.coverage === "未提供") {
    return "未提供";
  }
  return `${option.coverage}㎡/${option.unit || ""}`;
}

function buildHomeProductCards(dealerProducts, channelProducts) {
  const channelSpecMap = buildChannelSpecMap(channelProducts);

  return (dealerProducts || []).map((product) => {
    const specRows = (product.specOptions || []).map((option) => {
      const channelOption = findChannelOption(channelSpecMap, product, option);
      const coverageText = formatCoverage(option);
      const channelPrice = product.allowCustomPrice ? "可填" : (channelOption.dealerPrice || "");
      const dealerPriceText = product.allowCustomPrice ? "可填" : `¥${option.dealerPrice}`;
      const channelPriceText = channelPrice ? (product.allowCustomPrice ? channelPrice : `¥${channelPrice}`) : "";
      return {
        spec: option.spec,
        coverage: option.coverage,
        unit: option.unit,
        coverageText,
        dealerPrice: option.dealerPrice,
        channelPrice,
        cells: [
          option.spec,
          coverageText,
          dealerPriceText,
          channelPriceText
        ]
      };
    });

    return Object.assign({}, product, {
      specRows
    });
  });
}

module.exports = {
  buildHomeProductCards
};
