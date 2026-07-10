const { getCatalogByQuoteType } = require("../../utils/catalogs");
const {
  applyAddedState,
  buildQuoteCards,
  changeQuantity,
  getQuantityOnFocus,
  getQuantityOnBlur,
  removeQuoteItem,
  selectSpecOption,
  upsertQuoteItem
} = require("../../utils/quote-selection");

function hydrateProducts(keyword, quoteType) {
  const app = getApp();
  const catalog = getCatalogByQuoteType(quoteType || app.globalData.quoteType);
  return buildQuoteCards(catalog.filterProducts(keyword), app.globalData.quoteItems);
}

Page({
  data: {
    keyword: "",
    quoteType: "dealer",
    products: [],
    selectedCount: 0
  },

  onLoad(options) {
    const app = getApp();
    const quoteType = options && options.type === "channel" ? "channel" : "dealer";
    app.globalData.quoteType = quoteType;
    this.setData({ quoteType });
    this.refreshProducts();
  },

  onShow() {
    this.refreshProducts();
  },

  onSearch(event) {
    const keyword = event.detail.value;
    this.setData({
      keyword,
      products: hydrateProducts(keyword, this.data.quoteType)
    });
  },

  onSpecChange(event) {
    const id = event.currentTarget.dataset.id;
    const index = Number(event.detail.value);
    const app = getApp();
    const products = this.data.products.map((product) => {
      if (product.id !== id) {
        return product;
      }
      return applyAddedState(selectSpecOption(product, index), app.globalData.quoteItems);
    });
    this.setData({ products });
    this.syncAddedProduct(id, products);
  },

  onQuantityInput(event) {
    const id = event.currentTarget.dataset.id;
    const quantity = event.detail.value;
    const products = this.data.products.map((product) => {
      if (product.id !== id) {
        return product;
      }
      return Object.assign({}, product, {
        quantity
      });
    });
    this.setData({ products });
    this.syncAddedProduct(id, products);
  },

  onQuantityFocus(event) {
    const id = event.currentTarget.dataset.id;
    const products = this.data.products.map((product) => {
      if (product.id !== id) {
        return product;
      }
      return Object.assign({}, product, {
        quantity: getQuantityOnFocus(product.quantity)
      });
    });
    this.setData({ products });
    this.syncAddedProduct(id, products);
  },

  onQuantityBlur(event) {
    const id = event.currentTarget.dataset.id;
    const quantity = getQuantityOnBlur(event.detail.value);
    const products = this.data.products.map((product) => {
      if (product.id !== id) {
        return product;
      }
      return Object.assign({}, product, {
        quantity
      });
    });
    this.setData({ products });
  },

  onQuantityStep(event) {
    const id = event.currentTarget.dataset.id;
    const delta = Number(event.currentTarget.dataset.delta);
    const products = this.data.products.map((product) => {
      if (product.id !== id) {
        return product;
      }
      return Object.assign({}, product, {
        quantity: changeQuantity(product.quantity, delta)
      });
    });
    this.setData({ products });
    this.syncAddedProduct(id, products);
  },

  addItem(event) {
    const id = event.currentTarget.dataset.id;
    const product = this.data.products.find((item) => item.id === id);
    const quantity = Number(product.quantity);
    const app = getApp();

    if (product.isAdded && quantity === 0) {
      app.globalData.quoteItems = removeQuoteItem(app.globalData.quoteItems, id, product.selectedSpec);
      this.refreshProducts();
      wx.showToast({
        title: "已删除",
        icon: "success"
      });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      wx.showToast({
        title: "请先填写数量",
        icon: "none"
      });
      return;
    }

    app.globalData.quoteItems = upsertQuoteItem(app.globalData.quoteItems, Object.assign({}, product, { quantity }));
    this.refreshProducts();

    wx.showToast({
      title: product.isAdded ? "已更新报价" : "已加入报价",
      icon: "success"
    });
  },

  refreshCount() {
    const app = getApp();
    this.setData({
      selectedCount: app.globalData.quoteItems.length
    });
  },

  refreshProducts() {
    const app = getApp();
    this.setData({
      products: hydrateProducts(this.data.keyword, this.data.quoteType),
      selectedCount: app.globalData.quoteItems.length
    });
  },

  syncAddedProduct(id, products) {
    const product = products.find((item) => item.id === id);
    if (!product || !product.isAdded) {
      return;
    }
    const quantity = Number(product.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.refreshCount();
      return;
    }
    const app = getApp();
    app.globalData.quoteItems = upsertQuoteItem(app.globalData.quoteItems, product);
    this.refreshCount();
  },

  goSummary() {
    wx.navigateTo({
      url: "/pages/summary/index"
    });
  }
});
