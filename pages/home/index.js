const { getCatalogByQuoteType } = require("../../utils/catalogs");
const { buildHomeProductCards } = require("../../utils/home-products");

const dealerCatalog = getCatalogByQuoteType("dealer");
const channelCatalog = getCatalogByQuoteType("channel");
const homeProducts = buildHomeProductCards(dealerCatalog.products, channelCatalog.products);

Page({
  data: {
    categoryGroups: dealerCatalog.groupProductsByCategory(homeProducts)
  },

  createDealerQuote() {
    this.createQuote("dealer");
  },

  createChannelQuote() {
    this.createQuote("channel");
  },

  createQuote(type) {
    const app = getApp();
    app.globalData.quoteItems = [];
    app.globalData.quoteType = type;
    wx.navigateTo({
      url: `/pages/quote/index?type=${type}`
    });
  },

  toggleCategory(event) {
    const category = event.currentTarget.dataset.category;
    const categoryGroups = this.data.categoryGroups.map((group) => {
      if (group.category !== category) {
        return group;
      }
      return Object.assign({}, group, {
        open: !group.open
      });
    });
    this.setData({ categoryGroups });
  }
});
