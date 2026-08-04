const trimStripDefinitions = [
  {
    id: "edge-trim-corner",
    name: "阳角条",
    options: [
      ["YA096", "YA096 2.7米/支", "2.7米/支", 24, 30],
      ["YA097", "YA097 2.7米/支", "2.7米/支", 24, 30]
    ]
  },
  {
    id: "divider-trim",
    name: "分割条",
    options: [
      ["1.5T3H", "1.5T3H 2米/支", "2米/支", 7, 10],
      ["2T5H", "2T5H 2米/支", "2米/支", 7, 10]
    ]
  }
];

function buildTrimStripProducts(priceIndex) {
  return trimStripDefinitions.map((definition) => {
    const specOptions = definition.options.map(([model, spec, packageSpec, dealerPrice, channelPrice]) => {
      const price = priceIndex === "channel" ? channelPrice : dealerPrice;
      return {
        model,
        spec,
        packageSpec,
        workTimes: "",
        coverage: "",
        unit: "支",
        dealerPrice: price,
        costPerSquare: "",
        remark: "收口分割条，报价单统一收取一次30元打包费"
      };
    });
    const firstOption = specOptions[0];

    return {
      id: definition.id,
      model: firstOption.model,
      category: "微岩石体系",
      name: definition.name,
      specs: specOptions.map((option) => option.spec),
      specOptions,
      autoPackagingFee: true,
      workTimes: firstOption.workTimes,
      coverage: firstOption.coverage,
      unit: firstOption.unit,
      dealerPrice: firstOption.dealerPrice,
      costPerSquare: firstOption.costPerSquare,
      remark: firstOption.remark
    };
  });
}

module.exports = {
  dealerTrimStripProducts: buildTrimStripProducts("dealer"),
  channelTrimStripProducts: buildTrimStripProducts("channel")
};