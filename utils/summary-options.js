const logisticsOptions = [
  "普通物流(运费到付）",
  "物流快运",
  "快递",
  "普通物流(运费现付）",
  "自提"
];

const deliveryOptions = [
  "物流点自提",
  "送货上门（不上楼不卸货）",
  "送货上楼并卸货",
  "待定"
];

const taxOptions = ["1%", "3%", "13%"];

const summaryColumns = [
  { key: "model", label: "系列号" },
  { key: "category", label: "材料类别" },
  { key: "name", label: "产品名称" },
  { key: "spec", label: "产品规格" },
  { key: "workTimes", label: "施工次数" },
  { key: "coverage", label: "单桶涂布量" },
  { key: "unit", label: "单位" },
  { key: "quantity", label: "数量" },
  { key: "dealerPrice", label: "经销商单价" },
  { key: "amount", label: "经销商合计" }
];

const totalRowLayout = {
  labelSpan: 9,
  valueSpan: 1
};

const topRowLayout = {
  logisticsSpan: 5,
  deliverySpan: 5
};

const noticeItems = [
  "1、订单报价不含安装、不含税、不含运费、全款订单发货。如需开票请按含税报价支付货款（默认普票，如需其他票类请与业务人员沟通）",
  "2、报价单默认普通物流自提方式发货，如需送货上门请提前和业务员沟通备注。",
  "3、自提+送货方式收到货物后，先验货，货物无磨损、破碎、结冻等情况再签收，如有损坏现象请及时与对接业务人及时联系反馈。",
  "4、退换货政策：在不影响工厂二次销售的情况下，自实际收到商品之日起7日内可退货；15天可换货，退换货运费由客户承担，换货产品按照订单金额的8折处理。",
  "6、所有产品的施工，如非我方负责，施工前一定要和业务员沟通施工流程及细节，并按照业务员的建议和指导按步骤进行；如客户擅自按照自己的想法施工导致了后续不理想的效果，我方不予处理。",
  "5、定制产品确认下单付款后不退不换。"
];

function parseTaxRate(taxText) {
  return Number(String(taxText).replace("%", "")) || 0;
}

function getSummaryColumns(quoteType) {
  if (quoteType !== "channel") {
    return summaryColumns;
  }

  return summaryColumns.map((column) => {
    if (column.key === "dealerPrice") {
      return Object.assign({}, column, { label: "渠道合作单价" });
    }
    if (column.key === "amount") {
      return Object.assign({}, column, { label: "渠道价合计" });
    }
    return column;
  });
}

module.exports = {
  logisticsOptions,
  deliveryOptions,
  getSummaryColumns,
  taxOptions,
  summaryColumns,
  topRowLayout,
  totalRowLayout,
  noticeItems,
  parseTaxRate
};
