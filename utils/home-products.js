function buildChannelSpecMap(channelProducts) {
  const map = {};
  (channelProducts || []).forEach((product) => {
    (product.specOptions || []).forEach((option) => {
      map[`${product.id}|${option.spec}`] = option;
    });
  });
  return map;
}

function buildHomeProductCards(dealerProducts, channelProducts) {
  const channelSpecMap = buildChannelSpecMap(channelProducts);

  return (dealerProducts || []).map((product) => {
    const specRows = (product.specOptions || []).map((option) => {
      const channelOption = channelSpecMap[`${product.id}|${option.spec}`] || {};
      const coverageText = option.packageSpec || `${option.coverage}㎡/${option.unit}`;
      const channelPrice = channelOption.dealerPrice || "";
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
          `¥${option.dealerPrice}`,
          channelPrice ? `¥${channelPrice}` : ""
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
