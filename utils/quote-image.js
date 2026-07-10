const { getSummaryColumns } = require("./summary-options");

const columnWidths = [88, 108, 238, 92, 72, 126, 66, 76, 96, 98];
const palette = {
  border: "#111111",
  header: "#fff200",
  headCell: "#f7f7f7",
  money: "#10b981",
  white: "#ffffff",
  text: "#111111",
  red: "#e60000"
};

function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function compactMoney(value) {
  const number = Number(value || 0);
  return `¥${Number.isInteger(number) ? number : number.toFixed(2)}`;
}

function buildQuoteImageModel(input) {
  const width = columnWidths.reduce((sum, item) => sum + item, 0);
  const quote = input.quote || {};
  const rows = (quote.rows || []).map((item) => [
    item.model,
    item.category,
    item.name,
    item.spec,
    item.workTimes,
    item.coverage,
    item.unit,
    item.quantity,
    compactMoney(item.dealerPrice),
    compactMoney(item.amount)
  ]);

  const topRowHeight = 24;
  const headerHeight = 26;
  const rowHeight = 30;
  const totalHeight = 24;
  const noticeTitleWidth = 88;
  const noticeLineHeight = 26;
  const noticeHeight = Math.max(120, (input.noticeItems || []).length * noticeLineHeight);
  const tableHeight = topRowHeight + headerHeight + rows.length * rowHeight + totalHeight * 3;

  return {
    width,
    height: tableHeight + noticeHeight + 24,
    columnWidths,
    palette,
    topRowHeight,
    headerHeight,
    rowHeight,
    totalHeight,
    noticeTitleWidth,
    noticeLineHeight,
    noticeHeight,
    topRow: {
      logistics: `物流方式：${input.logistics || ""}`,
      delivery: `送货方式：${input.delivery || ""}`
    },
    columns: getSummaryColumns(input.quoteType).map((column) => column.label),
    rows,
    totalRows: [
      ["合计（不含税）：", money(quote.subtotal)],
      [`发票税金（${quote.taxRate || 0}%）：`, money(quote.tax)],
      ["含税报价：", money(quote.total)]
    ],
    notices: input.noticeItems || []
  };
}

module.exports = {
  buildQuoteImageModel
};
