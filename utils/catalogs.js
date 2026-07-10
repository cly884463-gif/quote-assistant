const dealerCatalog = require("./products");
const channelCatalog = require("./channel-products");
const {
  extraDealerProducts,
  extraChannelProducts
} = require("./extra-products");

function filterProducts(products, keyword) {
  const normalized = String(keyword || "").trim().toLowerCase();
  if (!normalized) {
    return products;
  }

  return products.filter((product) => {
    const text = [
      product.model,
      product.category,
      product.name,
      product.specs.join(" ")
    ].join(" ").toLowerCase();
    return text.includes(normalized);
  });
}

function buildCatalog(baseCatalog, extraProducts) {
  const products = baseCatalog.products.concat(extraProducts);
  return {
    products,
    filterProducts: (keyword) => filterProducts(products, keyword),
    groupProductsByCategory: (sourceProducts) => baseCatalog.groupProductsByCategory(sourceProducts || products)
  };
}

const catalogs = {
  dealer: buildCatalog(dealerCatalog, extraDealerProducts),
  channel: buildCatalog(channelCatalog, extraChannelProducts)
};

function getCatalogByQuoteType(type) {
  if (type === "channel") {
    return catalogs.channel;
  }
  return catalogs.dealer;
}

module.exports = {
  getCatalogByQuoteType
};
