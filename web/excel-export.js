(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.__EXCEL_EXPORT__ = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const columnKeys = [
    "model",
    "category",
    "name",
    "spec",
    "workTimes",
    "coverage",
    "unit",
    "quantity",
    "dealerPrice",
    "amount"
  ];

  const columnLabels = {
    dealer: [
      "系列号", "材料类别", "产品名称", "产品规格", "施工次数",
      "单桶涂布量（㎡）", "单位", "数量", "经销商单价", "经销商合计"
    ],
    channel: [
      "系列号", "材料类别", "产品名称", "产品规格", "施工次数",
      "单桶涂布量（㎡）", "单位", "数量", "渠道合作单价", "渠道价合计"
    ]
  };

  const border = {
    top: { style: "thin", color: { argb: "FF111111" } },
    left: { style: "thin", color: { argb: "FF111111" } },
    bottom: { style: "thin", color: { argb: "FF111111" } },
    right: { style: "thin", color: { argb: "FF111111" } }
  };

  function buildExcelQuoteModel(input) {
    const quote = input.quote || {};
    const quoteType = input.quoteType === "channel" ? "channel" : "dealer";
    return {
      quoteType,
      logistics: input.logistics || "",
      delivery: input.delivery || "",
      columns: columnLabels[quoteType].slice(),
      rows: (quote.rows || []).map((item) => columnKeys.map((key) => item[key])),
      totals: [
        ["合计（不含税）：", Number(quote.subtotal) || 0],
        [`发票税金（${Number(quote.taxRate) || 0}%）：`, Number(quote.tax) || 0],
        ["含税报价：", Number(quote.total) || 0]
      ],
      remark: input.remark || "",
      notices: (input.noticeItems || []).slice()
    };
  }

  function styleCells(worksheet, fromRow, toRow, options) {
    for (let rowNumber = fromRow; rowNumber <= toRow; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      for (let columnNumber = 1; columnNumber <= 10; columnNumber += 1) {
        const cell = row.getCell(columnNumber);
        cell.border = border;
        cell.alignment = Object.assign({
          vertical: "middle",
          horizontal: "center",
          wrapText: true
        }, options && options.alignment);
        cell.protection = { locked: true };
        if (options && options.fill) {
          cell.fill = options.fill;
        }
        if (options && options.font) {
          cell.font = options.font;
        }
      }
    }
  }

  async function createProtectedQuoteWorkbook(ExcelJS, input, watermarkDataUrl, password) {
    if (!ExcelJS || !ExcelJS.Workbook) {
      throw new Error("ExcelJS 未加载");
    }

    const model = buildExcelQuoteModel(input);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "新材联·New Material Union";
    workbook.lastModifiedBy = "新材联·New Material Union";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("报价清单", {
      views: [{ showGridLines: false }],
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.2, footer: 0.2 }
      }
    });

    worksheet.columns = [
      { width: 14 }, { width: 16 }, { width: 34 }, { width: 16 }, { width: 12 },
      { width: 18 }, { width: 10 }, { width: 10 }, { width: 16 }, { width: 17 }
    ];

    worksheet.mergeCells("A1:E1");
    worksheet.mergeCells("F1:J1");
    worksheet.getCell("A1").value = `物流方式：${model.logistics}`;
    worksheet.getCell("F1").value = `送货方式：${model.delivery}`;
    worksheet.getRow(1).height = 26;
    worksheet.getRow(2).values = model.columns;
    worksheet.getRow(2).height = 28;

    let currentRow = 3;
    model.rows.forEach((values) => {
      const row = worksheet.getRow(currentRow);
      row.values = values;
      row.height = 26;
      currentRow += 1;
    });
    const detailStartRow = 3;
    const detailEndRow = currentRow - 1;

    model.totals.forEach(([label, value]) => {
      worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`J${currentRow}`).value = value;
      worksheet.getCell(`J${currentRow}`).numFmt = "¥0.00";
      worksheet.getRow(currentRow).height = 25;
      currentRow += 1;
    });

    worksheet.getCell(`A${currentRow}`).value = "备注：";
    worksheet.mergeCells(`B${currentRow}:J${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = model.remark;
    worksheet.getRow(currentRow).height = Math.max(28, model.remark ? 42 : 28);
    const remarkRow = currentRow;
    currentRow += 1;

    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = "注意事项";
    worksheet.getRow(currentRow).height = 28;
    const noticeTitleRow = currentRow;
    currentRow += 1;

    model.notices.forEach((notice) => {
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = notice;
      worksheet.getRow(currentRow).height = 38;
      currentRow += 1;
    });
    const lastRow = currentRow - 1;

    const yellowFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF200" } };
    const grayFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    const greenFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } };

    styleCells(worksheet, 1, 1, {
      fill: yellowFill,
      font: { name: "Microsoft YaHei", size: 11, bold: true },
      alignment: { horizontal: "left" }
    });
    styleCells(worksheet, 2, 2, {
      fill: grayFill,
      font: { name: "Microsoft YaHei", size: 10, bold: true }
    });
    if (detailEndRow >= detailStartRow) {
      styleCells(worksheet, detailStartRow, detailEndRow, {
        font: { name: "Microsoft YaHei", size: 10 }
      });
      for (let rowNumber = detailStartRow; rowNumber <= detailEndRow; rowNumber += 1) {
        worksheet.getCell(`I${rowNumber}`).fill = greenFill;
        worksheet.getCell(`J${rowNumber}`).fill = greenFill;
        worksheet.getCell(`I${rowNumber}`).font = { name: "Microsoft YaHei", size: 10, bold: true };
        worksheet.getCell(`J${rowNumber}`).font = { name: "Microsoft YaHei", size: 10, bold: true };
        worksheet.getCell(`I${rowNumber}`).numFmt = "¥0.00";
        worksheet.getCell(`J${rowNumber}`).numFmt = "¥0.00";
      }
    }
    styleCells(worksheet, detailEndRow + 1, remarkRow, {
      font: { name: "Microsoft YaHei", size: 10 },
      alignment: { horizontal: "right" }
    });
    worksheet.getCell(`A${remarkRow}`).font = { name: "Microsoft YaHei", size: 10, bold: true };
    worksheet.getCell(`B${remarkRow}`).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    styleCells(worksheet, noticeTitleRow, noticeTitleRow, {
      font: { name: "Microsoft YaHei", size: 14, bold: true },
      alignment: { horizontal: "left" }
    });
    if (lastRow > noticeTitleRow) {
      styleCells(worksheet, noticeTitleRow + 1, lastRow, {
        font: { name: "Microsoft YaHei", size: 9 },
        alignment: { horizontal: "left" }
      });
    }

    worksheet.pageSetup.printArea = `A1:J${lastRow}`;
    worksheet.pageSetup.printTitlesRow = "1:2";

    if (watermarkDataUrl) {
      const imageId = workbook.addImage({ base64: watermarkDataUrl, extension: "png" });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        br: { col: 10, row: lastRow },
        editAs: "absolute"
      });
    }

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: true };
      });
    });

    await worksheet.protect(password, {
      selectLockedCells: true,
      selectUnlockedCells: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      insertColumns: false,
      deleteRows: false,
      deleteColumns: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
      spinCount: 10000
    });

    return workbook;
  }

  return {
    buildExcelQuoteModel,
    createProtectedQuoteWorkbook
  };
});
