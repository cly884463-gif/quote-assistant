const assert = require("assert");

const {
  logisticsOptions,
  deliveryOptions,
  taxOptions,
  noticeItems
} = require("../utils/summary-options");

assert.deepStrictEqual(logisticsOptions, [
  "普通物流(运费到付）",
  "物流快运",
  "快递",
  "普通物流(运费现付）",
  "自提"
]);

assert.deepStrictEqual(deliveryOptions, [
  "物流点自提",
  "送货上门（不上楼不卸货）",
  "送货上楼并卸货",
  "待定"
]);

assert.deepStrictEqual(taxOptions, ["1%", "3%", "13%"]);
assert.strictEqual(noticeItems.length, 6);
assert.strictEqual(noticeItems[0], "1、订单报价不含安装、不含税、不含运费、全款订单发货。如需开票请按含税报价支付货款（默认普票，如需其他票类请与业务人员沟通）");
assert.strictEqual(noticeItems[5], "5、定制产品确认下单付款后不退不换。");

console.log("summary options ok");
