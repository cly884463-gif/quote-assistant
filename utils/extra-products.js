const { sColorPasteProduct } = require("./s-color-products");

const colorPasteSpecs = [
  ["1号色浆", "TS001", "TN001"],
  ["2号色浆", "TS002", "TN002"],
  ["3号色浆", "TS003", "TN003"],
  ["4号色浆", "TS004", "TN004"],
  ["5号色浆", "TS005", "TN005"],
  ["6号色浆", "TS006", "TN006"],
  ["7号色浆", "TS007", "TN007"],
  ["9号色浆", "TS009", "TN009"],
  ["13号色浆", "TS013", "TN013"],
  ["14号色浆", "TS014", "TN014"],
  ["15号色浆", "TS015", "TN015"],
  ["16号色浆", "TS016", "TN016"]
];

const colorPasteSpecOptions = colorPasteSpecs.map(([color, ceramicCode, plainCode]) => ({
  spec: `${color} ${ceramicCode}/${plainCode}`,
  workTimes: "",
  coverage: "50ml",
  unit: "瓶",
  packageSpec: "50ml/瓶",
  dealerPrice: 10,
  costPerSquare: "",
  remark: `陶砂色浆编号：${ceramicCode}；素陶色浆编号：${plainCode}`
}));

const colorPasteProduct = {
  id: "tn-sj-陶泥色浆",
  model: "TN-SJ",
  category: "陶泥色浆",
  name: "陶泥色浆",
  specs: colorPasteSpecOptions.map((option) => option.spec),
  specOptions: colorPasteSpecOptions,
  workTimes: "",
  coverage: "50ml",
  unit: "瓶",
  packageSpec: "50ml/瓶",
  dealerPrice: 10,
  costPerSquare: "",
  remark: "陶泥色浆，50ml/瓶"
};

const hColorPasteRows = [
  ["H-002", "黑色色浆", 10, 16],
  ["H-003", "大红色浆", 16, 42],
  ["H-004", "中黄色浆", 20, 54],
  ["H-005", "铁红色浆", 11, 20],
  ["H-006", "中灰色浆", 13, 23],
  ["H-007", "棕色色浆", 11, 20],
  ["H-008", "浅灰色浆", 9, 13],
  ["H-009", "粉红色浆", 9, 13],
  ["H-010", "深灰色浆", 14, 26],
  ["H-011", "砖红色浆", 13, 23],
  ["H-012", "橙红色浆", 17, 49],
  ["H-013", "苹果绿色浆", 9, 13],
  ["H-014", "蓝色色浆", 16, 33],
  ["H-015", "中绿色浆", 16, 36],
  ["H-016", "中兰色浆", 13, 23],
  ["H-017", "翠绿色浆", 17, 46],
  ["H-021", "欧式蓝绿色浆", 13, 29],
  ["H-022", "蓝灰瓷色色浆", 9, 13],
  ["H-023", "驼白瓷色色浆", 9, 13],
  ["H-024", "象牙白瓷色浆", 9, 13],
  ["H-025", "藕色粉瓷色浆", 9, 13],
  ["H-026", "淡水蓝瓷色浆", 9, 13],
  ["H-027", "卡奇瓷色色浆", 10, 16],
  ["H-028", "浅水绿瓷色浆", 13, 23],
  ["H-029", "豆蔻青瓷色浆", 9, 13],
  ["H-030", "橄榄绿瓷色浆", 13, 32],
  ["H-031", "青圭绿瓷色浆", 11, 20],
  ["H-032", "孔雀蓝瓷色浆", 13, 23],
  ["H-033", "青灰瓷色浆", 14, 26],
  ["H-034", "浅紫瓷色浆", 11, 20],
  ["H-035", "蓝灰青瓷色浆", 13, 23],
  ["H-036", "米黄瓷色浆", 9, 13],
  ["H-037", "暖白瓷色浆", 9, 13],
  ["H-038", "浅含瓷白色浆", 9, 13],
  ["H-039", "香槟粉瓷色浆", 9, 13]
];

const hColorPasteSpecOptions = hColorPasteRows.flatMap(([code, name, price100, price250]) => ([
  {
    spec: `${code} ${name} 100ml/瓶`,
    workTimes: "",
    coverage: "100ml",
    unit: "瓶",
    packageSpec: "100ml/瓶",
    dealerPrice: price100,
    costPerSquare: "",
    remark: `产品编号：${code}；产品名称：${name}`
  },
  {
    spec: `${code} ${name} 250ml/瓶`,
    workTimes: "",
    coverage: "250ml",
    unit: "瓶",
    packageSpec: "250ml/瓶",
    dealerPrice: price250,
    costPerSquare: "",
    remark: `产品编号：${code}；产品名称：${name}`
  }
]));

const hColorPasteProduct = {
  id: "cc-h-sj-彩瓷h系列色浆",
  model: "CC-H-SJ",
  category: "彩瓷H系列色浆",
  name: "彩瓷H系列色浆",
  specs: hColorPasteSpecOptions.map((option) => option.spec),
  specOptions: hColorPasteSpecOptions,
  workTimes: "",
  coverage: "100ml/250ml",
  unit: "瓶",
  packageSpec: "100ml/瓶、250ml/瓶",
  dealerPrice: 10,
  costPerSquare: "",
  remark: "彩瓷H系列色浆，含100ml/瓶和250ml/瓶两种规格"
};

const customTintingPasteProduct = {
  id: "custom-tinting-paste",
  model: "TY-TT-SJ",
  category: "陶釉特调色浆",
  name: "陶釉特调色浆",
  specs: ["2.4KG", "5KG", "18KG"],
  allowCustomPrice: true,
  autoFee: {
    id: "fee-custom-tinting",
    model: "FEE-001",
    category: "陶釉特调色浆",
    name: "特调调色费",
    spec: "人工费",
    unit: "项",
    price: 50
  },
  specOptions: [
    {
      spec: "2.4KG",
      workTimes: "",
      coverage: "",
      unit: "桶",
      packageSpec: "2.4KG",
      dealerPrice: "",
      costPerSquare: "",
      remark: "陶釉特调色浆，价格按实际填写"
    },
    {
      spec: "5KG",
      workTimes: "",
      coverage: "",
      unit: "桶",
      packageSpec: "5KG",
      dealerPrice: "",
      costPerSquare: "",
      remark: "陶釉特调色浆，价格按实际填写"
    },
    {
      spec: "18KG",
      workTimes: "",
      coverage: "",
      unit: "桶",
      packageSpec: "18KG",
      dealerPrice: "",
      costPerSquare: "",
      remark: "陶釉特调色浆，价格按实际填写"
    }
  ],
  workTimes: "",
  coverage: "",
  unit: "桶",
  packageSpec: "2.4KG/5KG/18KG",
  dealerPrice: "",
  costPerSquare: "",
  remark: "陶釉特调色浆，价格按实际填写"
};

module.exports = {
  extraDealerProducts: [colorPasteProduct, hColorPasteProduct, sColorPasteProduct, customTintingPasteProduct],
  extraChannelProducts: [colorPasteProduct, hColorPasteProduct, sColorPasteProduct, customTintingPasteProduct]
};
