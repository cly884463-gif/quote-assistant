(function () {
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

  const noticeItems = [
    "1、订单报价不含安装、不含税、不含运费、全款订单发货。如需开票请按含税报价支付货款（默认普票，如需其他票类请与业务人员沟通）",
    "2、报价单默认普通物流自提方式发货，如需送货上门请提前和业务员沟通备注。",
    "3、自提+送货方式收到货物后，先验货，货物无磨损、破碎、结冻等情况再签收，如有损坏现象请及时与对接业务人及时联系反馈。",
    "4、退换货政策：在不影响工厂二次销售的情况下，自实际收到商品之日起7日内可退货；15天可换货，退换货运费由客户承担，换货产品按照订单金额的8折处理。",
    "5、定制产品确认下单付款后不退不换。",
    "6、所有产品的施工，如非我方负责，施工前一定要和业务员沟通施工流程及细节，并按照业务员的建议和指导按步骤进行；如客户擅自按照自己的想法施工导致了后续不理想的效果，我方不予处理。"
  ];

  const CUSTOM_TINTING_PRODUCT_ID = "custom-tinting-paste";
  const CUSTOM_TINTING_FEE_ID = "fee-custom-tinting";
  const CUSTOM_TINTING_FEE_ITEM = {
    id: CUSTOM_TINTING_FEE_ID,
    model: "FEE-001",
    category: "陶釉特调色浆",
    name: "特调调色费",
    spec: "人工费",
    selectedSpec: "人工费",
    workTimes: "",
    coverage: "",
    unit: "项",
    quantity: 1,
    dealerPrice: 50,
    costPerSquare: "",
    remark: "陶釉特调色浆自动调色费"
  };

  const summaryColumnKeys = [
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

  const summaryColumnLabels = {
    dealer: ["系列号", "材料类别", "产品名称", "产品规格", "施工次数", "单桶涂布量（㎡）", "单位", "数量", "经销商单价", "经销商合计"],
    channel: ["系列号", "材料类别", "产品名称", "产品规格", "施工次数", "单桶涂布量（㎡）", "单位", "数量", "渠道合作单价", "渠道价合计"]
  };

  const state = {
    modules: null,
    quoteType: "dealer",
    quoteItems: [],
    homeKeyword: "",
    quoteKeyword: "",
    logistics: logisticsOptions[0],
    delivery: deliveryOptions[0],
    taxText: taxOptions[0],
    remark: ""
  };

  const el = {};
  const quoteOpenCategories = {};

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(value) {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) ? parsed : 0;
    return Math.round(normalized * 100) / 100;
  }

  function formatMoney(value) {
    if (value === "" || value === null || typeof value === "undefined") {
      return "可填";
    }
    if (!Number.isFinite(Number(value))) {
      return String(value);
    }
    return `¥${money(value)}`;
  }

  function parseTaxRate(text) {
    return Number(String(text).replace("%", "")) || 0;
  }

  function getItemKey(item) {
    return `${item.id}|${item.spec || item.selectedSpec || ""}`;
  }

  function createCjsLoader() {
    const cache = {};
    const sourceCache = {};

    function normalizePath(fromPath, request) {
      if (!request.startsWith(".")) {
        throw new Error(`不支持加载外部模块：${request}`);
      }
      const baseParts = fromPath.split("/");
      baseParts.pop();
      request.split("/").forEach((part) => {
        if (!part || part === ".") {
          return;
        }
        if (part === "..") {
          baseParts.pop();
          return;
        }
        baseParts.push(part);
      });
      const joined = baseParts.join("/");
      return joined.endsWith(".js") ? joined : `${joined}.js`;
    }

    async function readSource(path) {
      if (!sourceCache[path]) {
        const response = await fetch(`../${path}`);
        if (!response.ok) {
          throw new Error(`模块加载失败：${path}`);
        }
        sourceCache[path] = await response.text();
      }
      return sourceCache[path];
    }

    async function preload(path) {
      if (cache[path]) {
        return;
      }
      const code = await readSource(path);
      const deps = Array.from(code.matchAll(/require\(["'](.+?)["']\)/g)).map((match) => normalizePath(path, match[1]));
      for (const dep of deps) {
        await preload(dep);
      }
      const module = { exports: {} };
      const requireFromModule = (request) => {
        const depPath = normalizePath(path, request);
        if (!cache[depPath]) {
          throw new Error(`模块未预加载：${depPath}`);
        }
        return cache[depPath].exports;
      };
      Function("require", "module", "exports", code)(requireFromModule, module, module.exports);
      cache[path] = module;
    }

    return {
      async require(path) {
        await preload(path);
        return cache[path].exports;
      }
    };
  }

  function getCatalog(type) {
    return state.modules.getCatalogByQuoteType(type || state.quoteType);
  }

  function filterProducts(products, keyword) {
    const normalized = String(keyword || "").trim().toLowerCase();
    if (!normalized) {
      return products;
    }
    return products.filter((product) => [
      product.model,
      product.category,
      product.name,
      (product.specs || []).join(" ")
    ].join(" ").toLowerCase().includes(normalized));
  }

  function groupByCategory(products) {
    return (products || []).reduce((groups, product) => {
      const category = product.category || "未分类";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  }

  function normalizeProductName(name) {
    return String(name || "")
      .replace(/罩面/g, "")
      .replace(/[（）()\s]/g, "")
      .toLowerCase();
  }

  function setIfEmpty(map, key, value) {
    if (key && !map[key]) {
      map[key] = value;
    }
  }

  function buildChannelSpecMap(channelProducts) {
    const map = {};
    (channelProducts || []).forEach((product) => {
      (product.specOptions || []).forEach((option) => {
        setIfEmpty(map, `${product.id}|${option.spec}`, option);
        setIfEmpty(map, `${product.model}|${product.name}|${option.spec}`, option);
        setIfEmpty(map, `${product.name}|${option.spec}`, option);
        setIfEmpty(map, `${normalizeProductName(product.name)}|${option.spec}`, option);
      });
    });
    return map;
  }

  function findChannelOption(map, product, option) {
    return map[`${product.id}|${option.spec}`]
      || map[`${product.model}|${product.name}|${option.spec}`]
      || map[`${product.name}|${option.spec}`]
      || map[`${normalizeProductName(product.name)}|${option.spec}`]
      || {};
  }

  function formatCoverage(option) {
    if (option.packageSpec) {
      return option.packageSpec;
    }
    if (option.coverage === "" || option.coverage == null || option.coverage === "未提供") {
      return "未提供";
    }
    return `${option.coverage}㎡/${option.unit || ""}`;
  }

  function buildHomeCards() {
    const dealerProducts = getCatalog("dealer").products;
    const channelProducts = getCatalog("channel").products;
    const channelMap = buildChannelSpecMap(channelProducts);
    return dealerProducts.map((product) => {
      const specRows = (product.specOptions || []).map((option) => {
        const channel = findChannelOption(channelMap, product, option);
        return {
          spec: option.spec,
          coverageText: formatCoverage(option),
          dealerPrice: option.dealerPrice,
          channelPrice: product.allowCustomPrice ? "可填" : (channel.dealerPrice || "")
        };
      });
      return Object.assign({}, product, { specRows });
    });
  }

  function selectSpecOption(product, index) {
    const selectedSpecIndex = Number(index) || 0;
    const option = product.specOptions && product.specOptions[selectedSpecIndex];
    if (!option) {
      return Object.assign({}, product, {
        selectedSpecIndex,
        selectedSpec: product.specs[selectedSpecIndex]
      });
    }
    return Object.assign({}, product, option, {
      selectedSpecIndex,
      selectedSpec: option.spec
    });
  }

  function applyAddedState(product) {
    const quoteItem = state.quoteItems.find((item) => getItemKey(item) === getItemKey(product));
    return Object.assign({}, product, quoteItem || {}, {
      quantity: quoteItem ? quoteItem.quantity : 0,
      isAdded: Boolean(quoteItem)
    });
  }

  function firstAddedSpecItem(product) {
    return state.quoteItems.find((item) => item.id === product.id && (product.specs || []).includes(item.spec));
  }

  function buildQuoteCards() {
    return filterProducts(getCatalog().products, state.quoteKeyword).map((product) => {
      const addedItem = firstAddedSpecItem(product);
      const selectedSpec = addedItem ? addedItem.spec : product.specs[0];
      const selectedSpecIndex = Math.max(0, product.specs.indexOf(selectedSpec));
      return applyAddedState(selectSpecOption(Object.assign({}, product, {
        selectedSpec,
        selectedSpecIndex
      }), selectedSpecIndex));
    });
  }

  function normalizeQuoteItem(product) {
    return Object.assign({}, product, {
      spec: product.selectedSpec || product.spec,
      quantity: Number(product.quantity) || 0
    });
  }

  function upsertQuoteItem(product) {
    const quoteItem = normalizeQuoteItem(product);
    const key = getItemKey(quoteItem);
    const index = state.quoteItems.findIndex((item) => getItemKey(item) === key);
    if (index === -1) {
      state.quoteItems.push(quoteItem);
      return;
    }
    state.quoteItems[index] = Object.assign({}, state.quoteItems[index], quoteItem);
  }

  function removeQuoteItem(product) {
    const key = getItemKey(product);
    state.quoteItems = state.quoteItems.filter((item) => getItemKey(item) !== key);
  }

  function syncCustomTintingFee() {
    const hasCustomTinting = state.quoteItems.some((item) => (
      item.id === CUSTOM_TINTING_PRODUCT_ID
      && Number(item.quantity) > 0
      && Number(item.dealerPrice) > 0
    ));
    const hasFee = state.quoteItems.some((item) => item.id === CUSTOM_TINTING_FEE_ID);
    if (hasCustomTinting && !hasFee) {
      state.quoteItems.push(Object.assign({}, CUSTOM_TINTING_FEE_ITEM));
    }
    if (!hasCustomTinting && hasFee) {
      state.quoteItems = state.quoteItems.filter((item) => item.id !== CUSTOM_TINTING_FEE_ID);
    }
  }

  function isCustomTintingProduct(product) {
    return product && product.id === CUSTOM_TINTING_PRODUCT_ID;
  }

  function hasValidCustomPrice(product) {
    return Number(product.dealerPrice) > 0;
  }

  function calculateQuote() {
    const taxRate = parseTaxRate(state.taxText);
    const rows = state.quoteItems.map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const amount = money((Number(item.dealerPrice) || 0) * quantity);
      return Object.assign({}, item, { quantity, amount });
    });
    const subtotal = money(rows.reduce((sum, item) => sum + item.amount, 0));
    const tax = money(subtotal * taxRate / 100);
    return {
      rows,
      subtotal,
      taxRate,
      tax,
      total: money(subtotal + tax)
    };
  }

  function showView(viewId) {
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("is-active", view.id === viewId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 1500);
  }

  function renderHome() {
    const products = filterProducts(buildHomeCards(), state.homeKeyword);
    const groups = groupByCategory(products);
    el.homeCategories.innerHTML = Object.keys(groups).map((category) => `
      <article class="category-panel">
        <button class="category-toggle" data-category-toggle>
          <strong>${escapeHtml(category)}</strong>
          <span>${groups[category].length} 个产品</span>
        </button>
        <div class="category-body">
          ${groups[category].map(renderHomeProduct).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderHomeProduct(product) {
    return `
      <div class="product-card">
        <div class="product-head">
          <span class="model">${escapeHtml(product.model)}</span>
          <span class="category-tag">${escapeHtml(product.category)}</span>
        </div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="spec-table">
          <div class="spec-head">
            <span>规格</span><span>涂布率</span><span>经销商</span><span>渠道</span>
          </div>
          ${product.specRows.map((row) => `
            <div class="spec-row">
              <span>${escapeHtml(row.spec)}</span>
              <span>${escapeHtml(row.coverageText)}</span>
              <span>${formatMoney(row.dealerPrice)}</span>
              <span>${row.channelPrice ? formatMoney(row.channelPrice) : ""}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderQuote() {
    const products = buildQuoteCards();
    const groups = groupByCategory(products);
    const categories = Object.keys(groups);
    el.selectedCount.textContent = `已选 ${state.quoteItems.length} 项`;
    el.quoteCategoryTabs.innerHTML = categories.map((category) => `
      <button class="quote-category-tab" data-quote-category-target="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `).join("");
    el.quoteProducts.innerHTML = categories.map((category) => {
      if (typeof quoteOpenCategories[category] === "undefined") {
        quoteOpenCategories[category] = false;
      }
      return `
        <article class="quote-category-panel ${quoteOpenCategories[category] ? "is-open" : ""}" data-quote-category="${escapeHtml(category)}">
          <button class="quote-category-toggle" data-quote-category-toggle="${escapeHtml(category)}">
            <strong>${escapeHtml(category)}</strong>
            <span>${groups[category].length} 个产品</span>
          </button>
          <div class="quote-category-body">
            ${groups[category].map(renderQuoteCard).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderQuoteCard(product) {
    const optionHtml = (product.specs || []).map((spec, index) => (
      `<option value="${index}" ${index === product.selectedSpecIndex ? "selected" : ""}>${escapeHtml(spec)}</option>`
    )).join("");
    return `
      <article class="quote-card ${product.isAdded ? "is-added" : ""}" data-product-id="${escapeHtml(product.id)}">
        <div class="quote-head">
          <span class="model">${escapeHtml(product.model)}</span>
          <span class="price" data-role="price">${formatMoney(product.dealerPrice)}/${escapeHtml(product.unit)}</span>
        </div>
        <div class="quote-name">${escapeHtml(product.name)}</div>
        <div class="quote-desc" data-role="desc">${escapeHtml(product.category)} · 施工${escapeHtml(product.workTimes)}次 · ${escapeHtml(formatCoverage(product))}</div>
        <div class="quote-controls">
          <select class="spec-select" data-action="spec">${optionHtml}</select>
          ${product.allowCustomPrice ? `
            <label class="custom-price-control">单价
              <input data-action="custom-price" type="number" min="0" step="0.01" placeholder="请输入单价" value="${escapeHtml(product.dealerPrice)}">
            </label>
          ` : ""}
          <div class="qty-stepper">
            <button data-action="step" data-delta="-1">-</button>
            <input data-action="quantity" type="number" min="0" value="${escapeHtml(product.quantity)}">
            <button data-action="step" data-delta="1">+</button>
          </div>
        </div>
        <button class="add-btn ${product.isAdded && Number(product.quantity) === 0 ? "delete-btn" : ""}" data-action="add" data-role="add-button">
          ${product.isAdded && Number(product.quantity) === 0 ? "删除" : product.isAdded ? "更新" : "添加"}
        </button>
      </article>
    `;
  }

  function getProductFromCard(card) {
    const id = card.dataset.productId;
    const source = getCatalog().products.find((product) => product.id === id);
    const specIndex = Number(card.querySelector("[data-action='spec']").value) || 0;
    const quantity = card.querySelector("[data-action='quantity']").value;
    const product = selectSpecOption(source, specIndex);
    const customPriceInput = card.querySelector("[data-action='custom-price']");
    return Object.assign(product, {
      quantity,
      dealerPrice: customPriceInput ? customPriceInput.value : product.dealerPrice
    });
  }

  function updateSelectedCount() {
    el.selectedCount.textContent = `已选 ${state.quoteItems.length} 项`;
  }

  function updateQuoteCard(card, product) {
    const addedProduct = applyAddedState(product);
    const quantity = Number(product.quantity);
    const button = card.querySelector("[data-role='add-button']");
    card.classList.toggle("is-added", addedProduct.isAdded);
    card.querySelector("[data-role='price']").textContent = `${formatMoney(product.dealerPrice)}/${product.unit}`;
    card.querySelector("[data-role='desc']").textContent = `${product.category} · 施工${product.workTimes}次 · ${formatCoverage(product)}`;
    if (addedProduct.isAdded && quantity === 0) {
      button.textContent = "删除";
      button.classList.add("delete-btn");
    } else {
      button.textContent = addedProduct.isAdded ? "更新" : "添加";
      button.classList.remove("delete-btn");
    }
    updateSelectedCount();
  }

  function syncAddedProduct(card) {
    const product = getProductFromCard(card);
    if (!applyAddedState(product).isAdded) {
      updateQuoteCard(card, product);
      return;
    }
    const quantity = Number(product.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      updateQuoteCard(card, product);
      return;
    }
    if (isCustomTintingProduct(product) && !hasValidCustomPrice(product)) {
      updateQuoteCard(card, product);
      return;
    }
    upsertQuoteItem(product);
    syncCustomTintingFee();
    updateQuoteCard(card, product);
  }

  function renderOptions() {
    el.logisticsSelect.innerHTML = logisticsOptions.map((option) => `<option>${escapeHtml(option)}</option>`).join("");
    el.deliverySelect.innerHTML = deliveryOptions.map((option) => `<option>${escapeHtml(option)}</option>`).join("");
    el.taxSelect.innerHTML = taxOptions.map((option) => `<option>${escapeHtml(option)}</option>`).join("");
    el.noticeList.innerHTML = `<div class="notes-title">注意事项</div>${noticeItems.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}`;
  }

  function renderSummary() {
    const quote = calculateQuote();
    const labels = summaryColumnLabels[state.quoteType];
    el.quoteSheet.innerHTML = `
      <div class="sheet-top">
        <span class="logistics">物流方式：${escapeHtml(state.logistics)}</span>
        <span class="delivery">送货方式：${escapeHtml(state.delivery)}</span>
      </div>
      <div class="sheet-row sheet-head">
        ${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
      </div>
      ${quote.rows.map((row) => `
        <div class="sheet-row">
          ${summaryColumnKeys.map((key) => `<span class="${key === "dealerPrice" || key === "amount" ? "green" : ""}">${escapeHtml(row[key])}</span>`).join("")}
        </div>
      `).join("")}
      <div class="sheet-total"><span class="label">合计（不含税）：</span><span class="value">${formatMoney(quote.subtotal)}</span></div>
      <div class="sheet-total"><span class="label">发票税金（${quote.taxRate}%）：</span><span class="value">${formatMoney(quote.tax)}</span></div>
      <div class="sheet-total"><span class="label"><strong>含税报价：</strong></span><span class="value">${formatMoney(quote.total)}</span></div>
      <div class="sheet-remark"><span class="label">备注：</span><span class="value">${escapeHtml(state.remark)}</span></div>
    `;
  }

  function drawText(ctx, text, x, y, maxWidth, lineHeight) {
    const source = String(text == null ? "" : text);
    let line = "";
    let currentY = y;
    for (const char of source) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
    }
    return currentY + lineHeight;
  }

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent || "");
  }

  function showExportPreview(imageUrl) {
    el.exportPreviewImage.src = imageUrl;
    el.exportPreviewTip.textContent = isWeChatBrowser()
      ? "微信内不支持网页直接下载文件，请长按图片保存，或点右上角用浏览器打开后下载。"
      : "图片已生成，若未自动下载，也可以右键或长按图片保存。";
    el.exportPreview.classList.add("is-open");
    el.exportPreview.setAttribute("aria-hidden", "false");
  }

  function closeExportPreview() {
    el.exportPreview.classList.remove("is-open");
    el.exportPreview.setAttribute("aria-hidden", "true");
  }

  function exportQuoteImage() {
    const quote = calculateQuote();
    const canvas = document.getElementById("exportCanvas");
    const widths = [90, 115, 230, 105, 80, 135, 65, 65, 115, 125];
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const rowHeight = 34;
    const noteHeight = 24;
    const noticeTitleHeight = 38;
    const totalRows = 1 + 1 + quote.rows.length + 4;
    const height = totalRows * rowHeight + noticeTitleHeight + noticeItems.length * noteHeight + 28;
    canvas.width = tableWidth;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1;
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.textBaseline = "middle";

    function cell(text, x, y, width, heightValue, fill, align) {
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, width, heightValue);
      }
      ctx.strokeRect(x, y, width, heightValue);
      ctx.fillStyle = "#111827";
      ctx.textAlign = align || "center";
      const textX = align === "left" ? x + 6 : align === "right" ? x + width - 6 : x + width / 2;
      ctx.fillText(String(text == null ? "" : text), textX, y + heightValue / 2, width - 8);
    }

    let y = 0;
    cell(`物流方式：${state.logistics}`, 0, y, widths.slice(0, 5).reduce((a, b) => a + b, 0), rowHeight, "#fff200", "left");
    cell(`送货方式：${state.delivery}`, widths.slice(0, 5).reduce((a, b) => a + b, 0), y, widths.slice(5).reduce((a, b) => a + b, 0), rowHeight, "#fff200", "right");
    y += rowHeight;

    let x = 0;
    summaryColumnLabels[state.quoteType].forEach((label, index) => {
      cell(label, x, y, widths[index], rowHeight, "#f3f4f6");
      x += widths[index];
    });
    y += rowHeight;

    quote.rows.forEach((row) => {
      x = 0;
      summaryColumnKeys.forEach((key, index) => {
        const fill = key === "dealerPrice" || key === "amount" ? "#10b981" : "";
        cell(row[key], x, y, widths[index], rowHeight, fill);
        x += widths[index];
      });
      y += rowHeight;
    });

    [
      ["合计（不含税）：", formatMoney(quote.subtotal)],
      [`发票税金（${quote.taxRate}%）：`, formatMoney(quote.tax)],
      ["含税报价：", formatMoney(quote.total)]
    ].forEach((row) => {
      cell(row[0], 0, y, tableWidth - widths[9], rowHeight, "", "right");
      cell(row[1], tableWidth - widths[9], y, widths[9], rowHeight);
      y += rowHeight;
    });

    cell("备注：", 0, y, widths[0], rowHeight, "", "center");
    cell(state.remark, widths[0], y, tableWidth - widths[0], rowHeight, "", "left");
    y += rowHeight;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "bold 18px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "#111827";
    ctx.fillText("注意事项", 8, y + 8);
    y += noticeTitleHeight;
    ctx.font = "12px Microsoft YaHei, sans-serif";
    noticeItems.forEach((item) => {
      y = drawText(ctx, item, 8, y + 5, tableWidth - 16, 18);
    });

    const imageUrl = canvas.toDataURL("image/png");
    showExportPreview(imageUrl);

    if (!isWeChatBrowser()) {
      const link = document.createElement("a");
      link.download = `${state.quoteType === "channel" ? "渠道合作报价" : "经销商批发报价"}.png`;
      link.href = imageUrl;
      link.click();
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-start-quote]").forEach((button) => {
      button.addEventListener("click", () => {
        state.quoteType = button.dataset.startQuote;
        state.quoteItems = [];
        state.quoteKeyword = "";
        el.quoteSearch.value = "";
        renderQuote();
        showView("quoteView");
      });
    });

    el.homeSearch.addEventListener("input", (event) => {
      state.homeKeyword = event.target.value;
      renderHome();
    });

    el.quoteSearch.addEventListener("input", (event) => {
      state.quoteKeyword = event.target.value;
      renderQuote();
    });

    el.homeCategories.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-category-toggle]");
      if (toggle) {
        toggle.closest(".category-panel").classList.toggle("is-open");
      }
    });

    el.quoteCategoryTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quote-category-target]");
      if (!button) {
        return;
      }
      const category = button.dataset.quoteCategoryTarget;
      quoteOpenCategories[category] = true;
      renderQuote();
      const panel = Array.from(el.quoteProducts.querySelectorAll("[data-quote-category]"))
        .find((item) => item.dataset.quoteCategory === category);
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    el.quoteProducts.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-quote-category-toggle]");
      if (toggle) {
        const category = toggle.dataset.quoteCategoryToggle;
        quoteOpenCategories[category] = !quoteOpenCategories[category];
        toggle.closest(".quote-category-panel").classList.toggle("is-open", quoteOpenCategories[category]);
      }
    });

    el.quoteProducts.addEventListener("change", (event) => {
      const card = event.target.closest(".quote-card");
      if (!card) {
        return;
      }
      if (event.target.dataset.action === "spec") {
        const product = applyAddedState(getProductFromCard(card));
        const input = card.querySelector("[data-action='quantity']");
        input.value = product.quantity;
        updateQuoteCard(card, getProductFromCard(card));
      }
      syncAddedProduct(card);
    });

    el.quoteProducts.addEventListener("input", (event) => {
      if (event.target.dataset.action === "quantity" || event.target.dataset.action === "custom-price") {
        syncAddedProduct(event.target.closest(".quote-card"));
      }
    });

    el.quoteProducts.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      const card = event.target.closest(".quote-card");
      if (!card || !action) {
        return;
      }
      if (action === "step") {
        const input = card.querySelector("[data-action='quantity']");
        const next = Math.max(0, (Number(input.value) || 0) + Number(event.target.dataset.delta));
        input.value = next;
        syncAddedProduct(card);
        return;
      }
      if (action === "add") {
        const product = getProductFromCard(card);
        const quantity = Number(product.quantity);
        const addedProduct = applyAddedState(product);
        if (addedProduct.isAdded && quantity === 0) {
          removeQuoteItem(product);
          syncCustomTintingFee();
          renderQuote();
          toast("已删除");
          return;
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
          toast("请先填写数量");
          return;
        }
        if (isCustomTintingProduct(product) && !hasValidCustomPrice(product)) {
          toast("请先填写单价");
          return;
        }
        upsertQuoteItem(product);
        syncCustomTintingFee();
        renderQuote();
        toast(addedProduct.isAdded ? "已更新报价" : "已加入报价");
      }
    });

    el.backHomeBtn.addEventListener("click", () => showView("homeView"));
    el.backQuoteBtn.addEventListener("click", () => showView("quoteView"));
    el.goSummaryBtn.addEventListener("click", () => {
      renderSummary();
      showView("summaryView");
    });

    el.logisticsSelect.addEventListener("change", (event) => {
      state.logistics = event.target.value;
      renderSummary();
    });
    el.deliverySelect.addEventListener("change", (event) => {
      state.delivery = event.target.value;
      renderSummary();
    });
    el.taxSelect.addEventListener("change", (event) => {
      state.taxText = event.target.value;
      renderSummary();
    });
    el.summaryRemark.addEventListener("input", (event) => {
      state.remark = event.target.value;
      renderSummary();
    });
    el.exportImageBtn.addEventListener("click", exportQuoteImage);
    el.closeExportPreview.addEventListener("click", closeExportPreview);
    el.exportPreview.addEventListener("click", (event) => {
      if (event.target === el.exportPreview) {
        closeExportPreview();
      }
    });
  }

  async function init() {
    Object.assign(el, {
      homeCategories: document.getElementById("homeCategories"),
      quoteProducts: document.getElementById("quoteProducts"),
      quoteCategoryTabs: document.getElementById("quoteCategoryTabs"),
      selectedCount: document.getElementById("selectedCount"),
      homeSearch: document.getElementById("homeSearch"),
      quoteSearch: document.getElementById("quoteSearch"),
      backHomeBtn: document.getElementById("backHomeBtn"),
      backQuoteBtn: document.getElementById("backQuoteBtn"),
      goSummaryBtn: document.getElementById("goSummaryBtn"),
      logisticsSelect: document.getElementById("logisticsSelect"),
      deliverySelect: document.getElementById("deliverySelect"),
      taxSelect: document.getElementById("taxSelect"),
      summaryRemark: document.getElementById("summaryRemark"),
      quoteSheet: document.getElementById("quoteSheet"),
      noticeList: document.getElementById("noticeList"),
      exportImageBtn: document.getElementById("exportImageBtn"),
      exportPreview: document.getElementById("exportPreview"),
      exportPreviewImage: document.getElementById("exportPreviewImage"),
      exportPreviewTip: document.getElementById("exportPreviewTip"),
      closeExportPreview: document.getElementById("closeExportPreview")
    });

    if (window.__QUOTE_CATALOGS__) {
      state.modules = {
        getCatalogByQuoteType(type) {
          return {
            products: type === "channel" ? window.__QUOTE_CATALOGS__.channel : window.__QUOTE_CATALOGS__.dealer
          };
        }
      };
    } else {
      const loader = createCjsLoader();
      state.modules = await loader.require("utils/catalogs.js");
    }
    renderOptions();
    renderHome();
    renderQuote();
    renderSummary();
    bindEvents();
  }

  init().catch((error) => {
    document.body.innerHTML = `<pre style="padding: 24px; color: #b91c1c;">网页版加载失败：${escapeHtml(error.message)}</pre>`;
  });
}());
