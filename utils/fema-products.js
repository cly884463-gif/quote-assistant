const femaRows = [
  ["FEMA-001", "短流平耐磨地坪实色面漆", "A+B组份 7KG/组", 3.5, 350, 420],
  ["FEMA-002", "墙瓷（粗粉）套装", "套装 14.35KG/组", 11, 265, 318],
  ["FEMA-003", "墙瓷（细粉）套装", "套装 21KG/组", 17.5, 295, 354],
  ["FEMA-004", "墙瓷实色面漆套装", "A+B组份 3KG/组", 12, 336, 403]
];

function buildFemaProducts(priceIndex) {
  return femaRows.map(([model, name, spec, coverage, dealerPrice, channelPrice]) => {
    const price = priceIndex === "channel" ? channelPrice : dealerPrice;
    const option = {
      spec,
      workTimes: "",
      coverage,
      unit: "套",
      dealerPrice: price,
      costPerSquare: price / coverage,
      remark: "菲玛"
    };

    return {
      id: model.toLowerCase(),
      model,
      category: "菲玛",
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
  dealerFemaProducts: buildFemaProducts("dealer"),
  channelFemaProducts: buildFemaProducts("channel")
};
