const TAX_RATE = 0.0825;
const STORAGE_KEY = "matcha-pos-orders";
const PRODUCTS_KEY = "matcha-pos-products";
const SHOP_TIME_ZONE = "Asia/Phnom_Penh";
const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80";

const defaultProducts = [
  { id: "ceremonial-latte", name: "Ceremonial Matcha Latte", category: "Matcha", price: 5.75, description: "Stone-ground matcha with milk", photo: FALLBACK_PHOTO },
  { id: "iced-matcha", name: "Iced Matcha Latte", category: "Matcha", price: 5.95, description: "Cold shaken and creamy", photo: FALLBACK_PHOTO },
  { id: "strawberry-matcha", name: "Strawberry Matcha", category: "Specials", price: 6.75, description: "House strawberry puree", photo: FALLBACK_PHOTO },
  { id: "mango-matcha", name: "Mango Cloud Matcha", category: "Specials", price: 6.95, description: "Mango, matcha, soft foam", photo: FALLBACK_PHOTO },
  { id: "hojicha-latte", name: "Hojicha Latte", category: "Tea", price: 5.5, description: "Roasted green tea latte", photo: FALLBACK_PHOTO },
  { id: "genmaicha", name: "Genmaicha", category: "Tea", price: 4.25, description: "Toasted rice green tea", photo: FALLBACK_PHOTO },
  { id: "matcha-lemonade", name: "Matcha Lemonade", category: "Cold Bar", price: 5.25, description: "Bright lemon with matcha float", photo: FALLBACK_PHOTO },
  { id: "sparkling-yuzu", name: "Sparkling Yuzu", category: "Cold Bar", price: 4.95, description: "Citrus soda over ice", photo: FALLBACK_PHOTO },
  { id: "mochi", name: "Matcha Mochi", category: "Snacks", price: 3.25, description: "Soft rice cake dessert", photo: FALLBACK_PHOTO },
  { id: "cookie", name: "White Choc Matcha Cookie", category: "Snacks", price: 3.75, description: "Baked in-house", photo: FALLBACK_PHOTO },
  { id: "cake", name: "Matcha Basque Cake", category: "Snacks", price: 6.25, description: "Creamy cheesecake slice", photo: FALLBACK_PHOTO },
  { id: "set", name: "Latte + Snack Set", category: "Combos", price: 8.95, description: "Any latte with daily snack", photo: FALLBACK_PHOTO }
];

const modifiers = {
  size: [
    { name: "Small", price: 0 },
    { name: "Regular", price: 0.75 },
    { name: "Large", price: 1.35 }
  ],
  milk: [
    { name: "Whole", price: 0 },
    { name: "Oat", price: 0.7 },
    { name: "Almond", price: 0.6 },
    { name: "Coconut", price: 0.6 }
  ],
  sweetness: [
    { name: "0%", price: 0 },
    { name: "25%", price: 0 },
    { name: "50%", price: 0 },
    { name: "100%", price: 0 }
  ],
  toppings: [
    { name: "Boba", price: 0.9 },
    { name: "Matcha Foam", price: 1 },
    { name: "Vanilla", price: 0.5 },
    { name: "Extra Shot", price: 1.2 }
  ]
};

let activeCategory = "All";
let selectedProduct = null;
let selectedOptions = {};
let cart = [];
let orders = loadJSON(STORAGE_KEY, []);
let products = loadJSON(PRODUCTS_KEY, defaultProducts);
let selectedDate = dateKey(new Date());
let reportPeriod = "daily";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  categoryRow: document.querySelector("#category-row"),
  productGrid: document.querySelector("#product-grid"),
  search: document.querySelector("#product-search"),
  cartItems: document.querySelector("#cart-items"),
  cartStatus: document.querySelector("#cart-status"),
  clearCart: document.querySelector("#clear-cart"),
  subtotal: document.querySelector("#subtotal"),
  discount: document.querySelector("#discount"),
  tax: document.querySelector("#tax"),
  total: document.querySelector("#total"),
  checkoutButton: document.querySelector("#checkout-button"),
  discountSelect: document.querySelector("#discount-select"),
  paymentSelect: document.querySelector("#payment-select"),
  modifierDialog: document.querySelector("#modifier-dialog"),
  modifierTitle: document.querySelector("#modifier-title"),
  sizeOptions: document.querySelector("#size-options"),
  milkOptions: document.querySelector("#milk-options"),
  sweetnessOptions: document.querySelector("#sweetness-options"),
  toppingOptions: document.querySelector("#topping-options"),
  addCustomItem: document.querySelector("#add-custom-item"),
  receiptDialog: document.querySelector("#receipt-dialog"),
  receiptContent: document.querySelector("#receipt-content"),
  ordersList: document.querySelector("#orders-list"),
  ordersDate: document.querySelector("#orders-date"),
  ordersDayLabel: document.querySelector("#orders-day-label"),
  ordersDayStrip: document.querySelector("#orders-day-strip"),
  addProductButton: document.querySelector("#add-product-button"),
  productAdminList: document.querySelector("#product-admin-list"),
  productDialog: document.querySelector("#product-dialog"),
  productForm: document.querySelector("#product-form"),
  productDialogTitle: document.querySelector("#product-dialog-title"),
  productId: document.querySelector("#product-id"),
  productName: document.querySelector("#product-name"),
  productCategory: document.querySelector("#product-category"),
  productPrice: document.querySelector("#product-price"),
  productPhotoFile: document.querySelector("#product-photo-file"),
  productPhotoPreview: document.querySelector("#product-photo-preview"),
  removeProductPhoto: document.querySelector("#remove-product-photo"),
  productDescription: document.querySelector("#product-description"),
  shiftTotal: document.querySelector("#shift-total"),
  shiftCount: document.querySelector("#shift-count"),
  currentTime: document.querySelector("#current-time"),
  summaryDate: document.querySelector("#summary-date"),
  summaryDayLabel: document.querySelector("#summary-day-label"),
  summaryRevenue: document.querySelector("#summary-revenue"),
  summaryOrders: document.querySelector("#summary-orders"),
  summaryAverage: document.querySelector("#summary-average"),
  summaryItems: document.querySelector("#summary-items"),
  summaryDayStrip: document.querySelector("#summary-day-strip"),
  periodButtons: document.querySelectorAll("[data-period]"),
  popularList: document.querySelector("#popular-list")
};

let currentProductPhoto = "";

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function dateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(date));
  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  return `${year}-${month}-${day}`;
}

function formatDay(key) {
  const [year, month, day] = key.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 5));
  return utcNoon.toLocaleDateString([], {
    timeZone: SHOP_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function dayLabel(key) {
  return key === dateKey(new Date()) ? "Today" : formatDay(key);
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 5));
}

function keyFromDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(key, days) {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return keyFromDate(date);
}

function monthEndKey(key) {
  const [year, month] = key.split("-").map(Number);
  return keyFromDate(new Date(Date.UTC(year, month, 0, 5)));
}

function reportRange() {
  if (reportPeriod === "weekly") {
    const anchor = dateFromKey(selectedDate);
    const day = anchor.getUTCDay() || 7;
    const start = addDays(selectedDate, 1 - day);
    return { start, end: addDays(start, 6) };
  }

  if (reportPeriod === "monthly") {
    const [year, month] = selectedDate.split("-");
    const start = `${year}-${month}-01`;
    return { start, end: monthEndKey(start) };
  }

  return { start: selectedDate, end: selectedDate };
}

function reportLabel() {
  const range = reportRange();
  if (reportPeriod === "daily") return dayLabel(selectedDate);
  if (reportPeriod === "weekly") return `${formatDay(range.start)} to ${formatDay(range.end)}`;
  return dateFromKey(selectedDate).toLocaleDateString([], {
    timeZone: SHOP_TIME_ZONE,
    month: "long",
    year: "numeric"
  });
}

function formatShopDateTime(value) {
  return new Date(value).toLocaleString([], {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function makeId(value) {
  const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return base || `product-${Date.now()}`;
}

function uniqueId(base, existingIds, currentId = "") {
  let candidate = base;
  let count = 2;
  while (existingIds.includes(candidate) && candidate !== currentId) {
    candidate = `${base}-${count}`;
    count += 1;
  }
  return candidate;
}

function productPhoto(product) {
  return product.photo || FALLBACK_PHOTO;
}

function updateProductPhotoPreview() {
  els.productPhotoPreview.src = currentProductPhoto || FALLBACK_PHOTO;
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("Could not read image file.")));
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("error", () => reject(new Error("Could not load image file.")));
      image.addEventListener("load", () => {
        const maxSize = 900;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(Math.round(image.width * scale), 1);
        canvas.height = Math.max(Math.round(image.height * scale), 1);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function linePrice(item) {
  const optionTotal = Object.values(item.options)
    .flat()
    .reduce((sum, option) => sum + option.price, 0);
  return item.basePrice + optionTotal;
}

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + linePrice(item) * item.qty, 0);
  const discountRate = Number(els.discountSelect.value);
  const discount = subtotal * discountRate;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

function ordersForDay(key) {
  return orders.filter((order) => dateKey(order.createdAt) === key);
}

function ordersForRange(start, end) {
  return orders.filter((order) => {
    const key = dateKey(order.createdAt);
    return key >= start && key <= end;
  });
}

function availableDays() {
  const days = [...new Set(orders.map((order) => dateKey(order.createdAt)))];
  if (!days.includes(dateKey(new Date()))) days.unshift(dateKey(new Date()));
  if (!days.includes(selectedDate)) days.push(selectedDate);
  return days.sort((a, b) => b.localeCompare(a));
}

function renderDayControls() {
  const days = availableDays();
  els.ordersDate.value = selectedDate;
  els.summaryDate.value = selectedDate;
  els.ordersDayLabel.textContent = `Completed tickets for ${dayLabel(selectedDate)}`;
  els.summaryDayLabel.textContent = `Sales, tickets, and popular items for ${reportLabel()}`;

  const buttons = days.map((day) => `
    <button class="day-button ${day === selectedDate ? "active" : ""}" data-day="${day}" type="button">
      ${dayLabel(day)}
    </button>
  `).join("");

  els.ordersDayStrip.innerHTML = buttons;
  els.summaryDayStrip.innerHTML = buttons;
}

function selectDay(day) {
  if (!day) return;
  selectedDate = day;
  renderDayControls();
  renderOrders();
  renderSummary();
}

function selectReportPeriod(period) {
  reportPeriod = period;
  els.periodButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.period === reportPeriod);
  });
  renderDayControls();
  renderSummary();
}

function renderCategories() {
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  els.categoryRow.innerHTML = categories.map((category) => (
    `<button class="category-button ${category === activeCategory ? "active" : ""}" data-category="${category}" type="button">${category}</button>`
  )).join("");
}

function renderProducts() {
  const query = els.search.value.trim().toLowerCase();
  const visible = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = [product.name, product.description, product.category].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  els.productGrid.innerHTML = visible.map((product) => {
    return `
      <button class="product-card" data-product="${product.id}" type="button">
        <img src="${productPhoto(product)}" alt="${product.name}" loading="lazy" onerror="this.src='${FALLBACK_PHOTO}'">
        <span class="product-card-body">
          <strong>${product.name}</strong>
          <span>${product.description}</span>
          <em>${money.format(product.price)}</em>
        </span>
      </button>
    `;
  }).join("") || `<div class="empty-state">No products found</div>`;
}

function renderProductAdmin() {
  els.productAdminList.innerHTML = products.length ? products.map((product) => {
    return `
      <article class="admin-product-card">
        <img src="${productPhoto(product)}" alt="${product.name}" loading="lazy" onerror="this.src='${FALLBACK_PHOTO}'">
        <div>
          <h3>${product.name}</h3>
          <p>${product.category} - ${money.format(product.price)}</p>
          <small>${product.description}</small>
        </div>
        <div class="admin-actions">
          <button class="icon-button" data-edit-product="${product.id}" type="button">Edit</button>
          <button class="danger-button" data-delete-product="${product.id}" type="button">Remove</button>
        </div>
      </article>
    `;
  }).join("") : `<div class="empty-state">Add your first product</div>`;
}

function openProductDialog(product = null) {
  els.productDialogTitle.textContent = product ? "Edit Product" : "Add Product";
  els.productId.value = product?.id || "";
  els.productName.value = product?.name || "";
  els.productCategory.value = product?.category || "";
  els.productPrice.value = product?.price ?? "";
  els.productPhotoFile.value = "";
  currentProductPhoto = product?.photo || "";
  updateProductPhotoPreview();
  els.productDescription.value = product?.description || "";
  els.productDialog.showModal();
}

function productFromForm() {
  const currentId = els.productId.value;
  const name = els.productName.value.trim();
  const productId = currentId || uniqueId(makeId(name), products.map((product) => product.id));

  return {
    id: productId,
    name,
    category: els.productCategory.value.trim(),
    price: Math.max(Number(els.productPrice.value), 0),
    photo: currentProductPhoto,
    description: els.productDescription.value.trim()
  };
}

function saveProduct() {
  const product = productFromForm();
  const index = products.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  activeCategory = "All";
  saveState();
  renderAll();
}

function removeProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const confirmed = window.confirm(`Remove ${product.name} from the menu? Existing order history will stay unchanged.`);
  if (!confirmed) return;
  products = products.filter((item) => item.id !== productId);
  cart = cart.filter((item) => item.productId !== productId);
  if (activeCategory !== "All" && !products.some((item) => item.category === activeCategory)) {
    activeCategory = "All";
  }
  saveState();
  renderAll();
}

function renderModifierDialog(product) {
  selectedProduct = product;
  selectedOptions = {
    size: [modifiers.size[1]],
    milk: [modifiers.milk[0]],
    sweetness: [modifiers.sweetness[2]],
    toppings: []
  };

  els.modifierTitle.textContent = product.name;
  renderOptionGroup("size", els.sizeOptions);
  renderOptionGroup("milk", els.milkOptions);
  renderOptionGroup("sweetness", els.sweetnessOptions);
  els.toppingOptions.innerHTML = modifiers.toppings.map((option) => `
    <label class="check-option">
      <input type="checkbox" value="${option.name}" data-price="${option.price}">
      ${option.name} +${money.format(option.price)}
    </label>
  `).join("");
  updateAddButton();
  els.modifierDialog.showModal();
}

function renderOptionGroup(group, container) {
  container.innerHTML = modifiers[group].map((option) => `
    <button class="option-button ${selectedOptions[group][0].name === option.name ? "active" : ""}"
      data-group="${group}" data-name="${option.name}" type="button">
      ${option.name}${option.price ? ` +${money.format(option.price)}` : ""}
    </button>
  `).join("");
}

function updateAddButton() {
  const item = { basePrice: selectedProduct.price, options: selectedOptions };
  els.addCustomItem.textContent = `Add ${money.format(linePrice(item))}`;
}

function addToCart() {
  const signature = JSON.stringify({
    id: selectedProduct.id,
    options: selectedOptions
  });
  const existing = cart.find((item) => item.signature === signature);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      signature,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      basePrice: selectedProduct.price,
      options: structuredClone(selectedOptions),
      qty: 1
    });
  }

  renderCart();
}

function optionText(item) {
  const selected = [
    ...item.options.size,
    ...item.options.milk,
    ...item.options.sweetness,
    ...item.options.toppings
  ];
  return selected.map((option) => option.name).join(", ");
}

function renderCart() {
  if (!cart.length) {
    els.cartItems.innerHTML = `<div class="empty-state">Tap a product to start an order</div>`;
  } else {
    els.cartItems.innerHTML = cart.map((item, index) => `
      <article class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p>${optionText(item)}</p>
          <p>${money.format(linePrice(item))} each</p>
        </div>
        <div class="quantity">
          <button type="button" data-dec="${index}">-</button>
          <strong>${item.qty}</strong>
          <button type="button" data-inc="${index}">+</button>
        </div>
      </article>
    `).join("");
  }

  const totals = cartTotals();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  els.cartStatus.textContent = itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : "No items yet";
  els.subtotal.textContent = money.format(totals.subtotal);
  els.discount.textContent = `-${money.format(totals.discount)}`;
  els.tax.textContent = money.format(totals.tax);
  els.total.textContent = money.format(totals.total);
  els.checkoutButton.textContent = `Charge ${money.format(totals.total)}`;
  els.checkoutButton.disabled = !cart.length;
}

function checkout() {
  if (!cart.length) return;
  const totals = cartTotals();
  const order = {
    id: `M-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    payment: els.paymentSelect.value,
    items: structuredClone(cart),
    totals
  };

  orders.unshift(order);
  selectedDate = dateKey(order.createdAt);
  cart = [];
  saveState();
  renderAll();
  showReceipt(order);
}

function showReceipt(order) {
  els.receiptContent.innerHTML = `
    <h3>Receipt ${order.id}</h3>
    <p>${formatShopDateTime(order.createdAt)} GMT+7</p>
    <p>${order.payment}</p>
    ${order.items.map((item) => `
      <div class="receipt-line">
        <span>${item.qty} x ${item.name}<br><small>${optionText(item)}</small></span>
        <strong>${money.format(linePrice(item) * item.qty)}</strong>
      </div>
    `).join("")}
    <div class="receipt-line"><span>Subtotal</span><strong>${money.format(order.totals.subtotal)}</strong></div>
    <div class="receipt-line"><span>Discount</span><strong>-${money.format(order.totals.discount)}</strong></div>
    <div class="receipt-line"><span>Tax</span><strong>${money.format(order.totals.tax)}</strong></div>
    <div class="receipt-line"><span>Total</span><strong>${money.format(order.totals.total)}</strong></div>
  `;
  els.receiptDialog.showModal();
}

function renderOrders() {
  const dailyOrders = ordersForDay(selectedDate);
  els.ordersList.innerHTML = dailyOrders.length ? dailyOrders.map((order) => {
    const items = order.items.reduce((sum, item) => sum + item.qty, 0);
    return `
      <article class="order-card">
        <div>
          <h3>${order.id}</h3>
          <p>${formatShopDateTime(order.createdAt)} GMT+7 &middot; ${items} item${items === 1 ? "" : "s"} &middot; ${order.payment}</p>
        </div>
        <strong>${money.format(order.totals.total)}</strong>
      </article>
    `;
  }).join("") : `<div class="empty-state">No completed orders for ${dayLabel(selectedDate)}</div>`;
}

function renderSummary() {
  const range = reportRange();
  const reportOrders = ordersForRange(range.start, range.end);
  const revenue = reportOrders.reduce((sum, order) => sum + order.totals.total, 0);
  const orderCount = reportOrders.length;
  const itemCount = reportOrders.flatMap((order) => order.items).reduce((sum, item) => sum + item.qty, 0);
  const popular = {};

  reportOrders.forEach((order) => {
    order.items.forEach((item) => {
      popular[item.name] = (popular[item.name] || 0) + item.qty;
    });
  });

  els.summaryRevenue.textContent = money.format(revenue);
  els.summaryOrders.textContent = orderCount;
  els.summaryAverage.textContent = money.format(orderCount ? revenue / orderCount : 0);
  els.summaryItems.textContent = itemCount;
  els.shiftTotal.textContent = money.format(revenue);
  els.shiftCount.textContent = `${orderCount} order${orderCount === 1 ? "" : "s"} in report`;

  const popularRows = Object.entries(popular).sort((a, b) => b[1] - a[1]).slice(0, 6);
  els.popularList.innerHTML = popularRows.length ? popularRows.map(([name, qty]) => `
    <div class="popular-row"><span>${name}</span><strong>${qty}</strong></div>
  `).join("") : `<div class="empty-state">No sales yet</div>`;
}

function renderAll() {
  renderDayControls();
  renderCategories();
  renderProducts();
  renderProductAdmin();
  renderCart();
  renderOrders();
  renderSummary();
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    els.tabs.forEach((item) => item.classList.remove("active"));
    els.views.forEach((view) => view.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.view}-view`).classList.add("active");
  });
});

els.categoryRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

els.productGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-product]");
  if (!card) return;
  const product = products.find((item) => item.id === card.dataset.product);
  if (product) renderModifierDialog(product);
});

els.search.addEventListener("input", renderProducts);

document.querySelector(".modifier-form").addEventListener("click", (event) => {
  const optionButton = event.target.closest(".option-button");
  if (optionButton) {
    const group = optionButton.dataset.group;
    selectedOptions[group] = [modifiers[group].find((option) => option.name === optionButton.dataset.name)];
    renderOptionGroup(group, document.querySelector(`#${group}-options`));
    updateAddButton();
  }
});

els.toppingOptions.addEventListener("change", () => {
  selectedOptions.toppings = [...els.toppingOptions.querySelectorAll("input:checked")].map((input) => ({
    name: input.value,
    price: Number(input.dataset.price)
  }));
  updateAddButton();
});

els.addCustomItem.addEventListener("click", addToCart);

els.cartItems.addEventListener("click", (event) => {
  const dec = event.target.closest("[data-dec]");
  const inc = event.target.closest("[data-inc]");
  if (inc) cart[Number(inc.dataset.inc)].qty += 1;
  if (dec) {
    const index = Number(dec.dataset.dec);
    cart[index].qty -= 1;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  }
  renderCart();
});

els.clearCart.addEventListener("click", () => {
  cart = [];
  renderCart();
});

els.discountSelect.addEventListener("change", renderCart);
els.checkoutButton.addEventListener("click", checkout);
els.addProductButton.addEventListener("click", () => openProductDialog());

els.productAdminList.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-product]");
  const remove = event.target.closest("[data-delete-product]");
  if (edit) {
    const product = products.find((item) => item.id === edit.dataset.editProduct);
    if (product) openProductDialog(product);
  }
  if (remove) removeProduct(remove.dataset.deleteProduct);
});

els.productForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  if (!els.productForm.reportValidity()) return;
  saveProduct();
  els.productDialog.close();
});

els.periodButtons.forEach((button) => {
  button.addEventListener("click", () => selectReportPeriod(button.dataset.period));
});

els.productPhotoFile.addEventListener("change", async () => {
  const file = els.productPhotoFile.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("Please choose an image file.");
    els.productPhotoFile.value = "";
    return;
  }
  currentProductPhoto = await resizeImageFile(file);
  updateProductPhotoPreview();
});

els.removeProductPhoto.addEventListener("click", () => {
  currentProductPhoto = "";
  els.productPhotoFile.value = "";
  updateProductPhotoPreview();
});

[els.ordersDate, els.summaryDate].forEach((input) => {
  input.addEventListener("change", () => selectDay(input.value));
});

[els.ordersDayStrip, els.summaryDayStrip].forEach((strip) => {
  strip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-day]");
    if (button) selectDay(button.dataset.day);
  });
});

document.querySelectorAll("[data-today-jump]").forEach((button) => {
  button.addEventListener("click", () => selectDay(dateKey(new Date())));
});

setInterval(() => {
  els.currentTime.textContent = new Date().toLocaleString([], {
    timeZone: SHOP_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }) + " GMT+7";
}, 1000);

renderAll();
