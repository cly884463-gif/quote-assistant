const { calculateQuote } = require("../../utils/quote");
const { buildQuoteImageModel } = require("../../utils/quote-image");
const {
  logisticsOptions,
  deliveryOptions,
  getSummaryColumns,
  taxOptions,
  summaryColumns,
  noticeItems,
  parseTaxRate
} = require("../../utils/summary-options");

Page({
  data: {
    logisticsOptions,
    deliveryOptions,
    taxOptions,
    summaryColumns,
    noticeItems,
    logisticsIndex: 0,
    deliveryIndex: 0,
    taxIndex: 0,
    logistics: logisticsOptions[0],
    delivery: deliveryOptions[0],
    taxText: taxOptions[0],
    taxRate: 1,
    quoteType: "dealer",
    quote: calculateQuote([], 1),
    exportCanvasWidth: 960,
    exportCanvasHeight: 520
  },

  onShow() {
    this.recalculate();
  },

  recalculate() {
    const app = getApp();
    const quoteType = app.globalData.quoteType || "dealer";
    this.setData({
      quoteType,
      summaryColumns: getSummaryColumns(quoteType),
      quote: calculateQuote(app.globalData.quoteItems, this.data.taxRate)
    });
  },

  onLogisticsChange(event) {
    const logisticsIndex = Number(event.detail.value);
    this.setData({
      logisticsIndex,
      logistics: this.data.logisticsOptions[logisticsIndex]
    });
  },

  onDeliveryChange(event) {
    const deliveryIndex = Number(event.detail.value);
    this.setData({
      deliveryIndex,
      delivery: this.data.deliveryOptions[deliveryIndex]
    });
  },

  onTaxChange(event) {
    const taxIndex = Number(event.detail.value);
    const taxText = this.data.taxOptions[taxIndex];
    this.setData({
      taxIndex,
      taxText,
      taxRate: parseTaxRate(taxText)
    }, () => this.recalculate());
  },

  exportQuoteImage() {
    const model = buildQuoteImageModel({
      logistics: this.data.logistics,
      delivery: this.data.delivery,
      quoteType: this.data.quoteType,
      quote: this.data.quote,
      noticeItems: this.data.noticeItems
    });

    this.setData({
      exportCanvasWidth: model.width,
      exportCanvasHeight: model.height
    }, () => {
      this.drawQuoteImage(model);
    });
  },

  drawQuoteImage(model) {
    const ctx = wx.createCanvasContext("quoteCanvas", this);
    const tableWidth = model.columnWidths.reduce((sum, width) => sum + width, 0);
    let y = 0;

    ctx.setFillStyle("#ffffff");
    ctx.fillRect(0, 0, model.width, model.height);

    this.fillCell(ctx, 0, y, tableWidth / 2, model.topRowHeight, model.palette.header, model.topRow.logistics, "left", true);
    this.fillCell(ctx, tableWidth / 2, y, tableWidth / 2, model.topRowHeight, model.palette.header, model.topRow.delivery, "right", true);
    y += model.topRowHeight;

    let x = 0;
    model.columns.forEach((label, index) => {
      this.fillCell(ctx, x, y, model.columnWidths[index], model.headerHeight, model.palette.headCell, label, "center", true);
      x += model.columnWidths[index];
    });
    y += model.headerHeight;

    model.rows.forEach((row) => {
      x = 0;
      row.forEach((value, index) => {
        const isMoney = index >= 8;
        this.fillCell(ctx, x, y, model.columnWidths[index], model.rowHeight, isMoney ? model.palette.money : model.palette.white, String(value), "center", isMoney);
        x += model.columnWidths[index];
      });
      y += model.rowHeight;
    });

    model.totalRows.forEach((row, index) => {
      const bold = index === model.totalRows.length - 1;
      const labelWidth = tableWidth - model.columnWidths[9];
      this.fillCell(ctx, 0, y, labelWidth, model.totalHeight, model.palette.white, row[0], "right", bold);
      this.fillCell(ctx, labelWidth, y, model.columnWidths[9], model.totalHeight, model.palette.white, row[1], "center", bold);
      y += model.totalHeight;
    });

    this.fillCell(ctx, 0, y, model.noticeTitleWidth, model.noticeHeight, model.palette.white, "注意事项", "center", false);
    const noticeX = model.noticeTitleWidth;
    const noticeWidth = tableWidth - model.noticeTitleWidth;
    model.notices.forEach((notice, index) => {
      this.fillCell(ctx, noticeX, y + index * model.noticeLineHeight, noticeWidth, model.noticeLineHeight, model.palette.white, notice, "left", false);
    });
    for (let line = model.notices.length; line < Math.ceil(model.noticeHeight / model.noticeLineHeight); line += 1) {
      this.strokeRect(ctx, noticeX, y + line * model.noticeLineHeight, noticeWidth, model.noticeLineHeight);
    }

    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: "quoteCanvas",
        width: model.width,
        height: model.height,
        destWidth: model.width * 2,
        destHeight: model.height * 2,
        success: (res) => {
          this.saveQuoteImage(res.tempFilePath);
        },
        fail: () => {
          wx.showToast({
            title: "导出失败",
            icon: "none"
          });
        }
      }, this);
    });
  },

  saveQuoteImage(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: "已保存图片",
          icon: "success"
        });
      },
      fail: () => {
        wx.previewImage({
          urls: [tempFilePath]
        });
      }
    });
  },

  fillCell(ctx, x, y, width, height, fill, text, align, bold) {
    ctx.setFillStyle(fill);
    ctx.fillRect(x, y, width, height);
    this.strokeRect(ctx, x, y, width, height);
    ctx.setFillStyle("#111111");
    ctx.setFontSize(12);
    ctx.setTextAlign(align);
    ctx.setTextBaseline("middle");
    if (bold) {
      ctx.font = "bold 12px sans-serif";
    }
    const textX = align === "left" ? x + 6 : align === "right" ? x + width - 6 : x + width / 2;
    ctx.fillText(String(text || ""), textX, y + height / 2, width - 10);
    ctx.font = "12px sans-serif";
  },

  strokeRect(ctx, x, y, width, height) {
    ctx.setStrokeStyle("#111111");
    ctx.setLineWidth(1);
    ctx.strokeRect(x, y, width, height);
  }
});
