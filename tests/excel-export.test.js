const assert = require("assert");
const ExcelJS = require("exceljs");

const {
  buildExcelQuoteModel,
  createProtectedQuoteWorkbook
} = require("../web/excel-export");

const transparentPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+4x6bWQAAAABJRU5ErkJggg==";

const input = {
  quoteType: "channel",
  logistics: "普通物流(运费到付）",
  delivery: "物流点自提",
  remark: "测试备注",
  quote: {
    rows: [{
      model: "DT-103",
      category: "底漆",
      name: "金刚底固宝",
      spec: "3.2KG",
      workTimes: 1,
      coverage: 32,
      unit: "桶",
      quantity: 2,
      dealerPrice: 84,
      amount: 168
    }],
    subtotal: 168,
    taxRate: 1,
    tax: 1.68,
    total: 169.68
  },
  noticeItems: ["1、测试注意事项"]
};

(async () => {
  const model = buildExcelQuoteModel(input);
  assert.strictEqual(model.columns[8], "渠道合作单价");
  assert.strictEqual(model.columns[9], "渠道价合计");
  assert.strictEqual(model.rows[0][0], "DT-103");
  assert.deepStrictEqual(model.totals[2], ["含税报价：", 169.68]);
  assert.strictEqual(model.remark, "测试备注");
  assert.deepStrictEqual(model.notices, ["1、测试注意事项"]);
  const dealerModel = buildExcelQuoteModel(Object.assign({}, input, { quoteType: "dealer" }));
  assert.strictEqual(dealerModel.columns[8], "经销商单价");
  assert.strictEqual(dealerModel.columns[9], "经销商合计");

  const workbook = await createProtectedQuoteWorkbook(
    ExcelJS,
    input,
    transparentPng,
    "XCL995511"
  );
  const sheet = workbook.worksheets[0];
  assert.strictEqual(sheet.name, "报价清单");
  assert.strictEqual(sheet.sheetProtection.sheet, true);
  assert.ok(sheet.sheetProtection.hashValue);
  assert.strictEqual(sheet.getCell("A3").value, "DT-103");
  assert.strictEqual(sheet.getCell("A3").protection.locked, true);
  assert.strictEqual(sheet.getCell("I3").value, 84);
  const images = sheet.getImages();
  assert.strictEqual(images.length, 1);
  assert.strictEqual(images[0].range.tl.nativeCol, 0);
  assert.strictEqual(images[0].range.br.nativeCol, 10);
  assert.strictEqual(images[0].range.editAs, "absolute");
  assert.ok(sheet.pageSetup.printArea.startsWith("A1:J"));

  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 1000);

  const reopened = new ExcelJS.Workbook();
  await reopened.xlsx.load(buffer);
  assert.strictEqual(reopened.worksheets[0].sheetProtection.sheet, true);
  assert.strictEqual(reopened.worksheets[0].getCell("J3").value, 168);

  console.log("excel export ok");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
