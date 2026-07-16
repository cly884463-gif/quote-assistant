const liquidTileRows = [
  ["DP-1021", "地砖填缝胶（AB组份）", "1.2KG", "未提供", 56, 67],
  ["DP-1022", "墙砖补缝膏（AB组份）", "1.2KG", "未提供", 56, 67],
  ["DP-1023", "液态无缝瓷砖（AB组份）", "7KG", 3.5, 308, 370]
];

function buildLiquidTileProducts(priceIndex) {
  return liquidTileRows.map(([model, name, spec, coverage, dealerPrice, channelPrice]) => {
    const price = priceIndex === "channel" ? channelPrice : dealerPrice;
    const costPerSquare = typeof coverage === "number" ? price / coverage : "";
    const option = {
      spec,
      workTimes: 1,
      coverage,
      unit: "组",
      dealerPrice: price,
      costPerSquare,
      remark: "液态瓷砖"
    };

    return {
      id: model.toLowerCase(),
      model,
      category: "液态瓷砖",
      name,
      specs: [spec],
      specOptions: [option],
      workTimes: option.workTimes,
      coverage: option.coverage,
      unit: option.unit,
      dealerPrice: option.dealerPrice,
      costPerSquare: option.costPerSquare,
      remark: option.remark
    };
  });
}

module.exports = {
  dealerLiquidTileProducts: buildLiquidTileProducts("dealer"),
  channelLiquidTileProducts: buildLiquidTileProducts("channel")
};
