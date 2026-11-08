const STORAGE_KEY = "sov-demo-v1";
const LOW_STOCK_DEFAULT = 5;
const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" });
const initialState = {
    products: [
        { id: "p-aud", sku: "AUD-024", name: "Audífonos inalámbricos", category: "Accesorios", price: 2499, stock: 3, lowStock: 5 },
        { id: "p-moc", sku: "MOC-011", name: "Mochila minimalista", category: "Accesorios", price: 1250, stock: 5, lowStock: 5 },
        { id: "p-bot", sku: "BOT-008", name: "Botella de acero", category: "Hogar", price: 680, stock: 2, lowStock: 5 },
        { id: "p-rel", sku: "REL-032", name: "Reloj análogo", category: "Accesorios", price: 3890, stock: 4, lowStock: 5 },
        { id: "p-tec", sku: "TEC-016", name: "Teclado mecánico", category: "Tecnología", price: 1799, stock: 18, lowStock: 5 },
        { id: "p-lam", sku: "LAM-003", name: "Lámpara de escritorio", category: "Hogar", price: 920, stock: 12, lowStock: 5 },
        { id: "p-lib", sku: "LIB-041", name: "Libreta de pasta dura", category: "Papelería", price: 245, stock: 32, lowStock: 8 },
        { id: "p-cam", sku: "CAM-019", name: "Cámara instantánea", category: "Tecnología", price: 3290, stock: 7, lowStock: 3 }
    ],
    sales: [
        { id: "V-1048", customer: "Sofía Ramírez", date: daysAgo(0, 10, 42), items: [{ productId: "p-aud", name: "Audífonos inalámbricos", sku: "AUD-024", quantity: 1, price: 2499 }], total: 2499 },
        { id: "V-1047", customer: "Diego Mendoza", date: daysAgo(0, 9, 18), items: [{ productId: "p-moc", name: "Mochila minimalista", sku: "MOC-011", quantity: 1, price: 1250 }], total: 1250 },
        { id: "V-1046", customer: "Valentina Cruz", date: daysAgo(1, 17, 36), items: [{ productId: "p-rel", name: "Reloj análogo", sku: "REL-032", quantity: 1, price: 3890 }], total: 3890 },
        { id: "V-1045", customer: "Andrés López", date: daysAgo(1, 16, 5), items: [{ productId: "p-bot", name: "Botella de acero", sku: "BOT-008", quantity: 1, price: 680 }], total: 680 }
    ],
    users: [
        { id: "u-admin", name: "María García", email: "maria@novastore.com", role: "Administradora" },
        { id: "u-sales", name: "Luis Hernández", email: "luis@novastore.com", role: "Vendedor" }
    ]
};

function daysAgo(days, hours = 12, minutes = 0) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return structuredClone(initialState);
    }

    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.sales) || !Array.isArray(parsed.users)) {
        throw new Error("Los datos guardados no tienen el formato esperado. Borra los datos del sitio para volver a iniciar la demostración.");
    }
    return parsed;
}

let state;
let currentView = "inicio";
let toastTimeout;

const viewTitles = {
    inicio: "Resumen",
    productos: "Productos",
    ventas: "Ventas",
    inventario: "Inventario",
    reportes: "Reportes",
    usuarios: "Usuarios"
};

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function money(value) {
    return currency.format(value);
}

function normalizeText(value) {
    return String(value ?? "").trim().toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (error) {
        showToast(`No se pudieron guardar los cambios: ${error.message}`, true);
        return false;
    }
}

function showToast(message, isError = false) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.toggle("toast-error", isError);
    toast.classList.add("toast-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("toast-visible"), 3200);
}

function dateInputValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function renderPage() {
    document.querySelector("#breadcrumb-current").textContent = viewTitles[currentView];
    document.querySelectorAll(".main-nav .nav-link").forEach((link) => {
        const active = link.dataset.view === currentView;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });

    const renderers = {
        inicio: renderDashboard,
        productos: renderProducts,
        ventas: renderSales,
        inventario: renderInventory,
        reportes: renderReports,
        usuarios: renderUsers
    };
    document.querySelector("#app-view").innerHTML = renderers[currentView]();
}

function pageHeading(title, description, action = "") {
    return `<section class="welcome-row">
        <div><p class="eyebrow">${escapeHtml(viewTitles[currentView].toLocaleUpperCase("es-MX"))} · SOV</p>
        <h1>${title}</h1><p class="welcome-subtitle">${description}</p></div>${action}
    </section>`;
}

function primaryButton(label, action, icon = "+") {
    return `<button class="button button-primary" type="button" data-action="${action}"><span aria-hidden="true">${icon}</span>${label}</button>`;
}

function lowStockProducts() {
    return state.products.filter((product) => product.stock <= product.lowStock);
}

function renderDashboard() {
    const completedSales = state.sales;
    const total = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const average = completedSales.length ? total / completedSales.length : 0;
    const lowStock = lowStockProducts();
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
    const dailyTotals = days.map((date) => state.sales
        .filter((sale) => new Date(sale.date).toDateString() === date.toDateString())
        .reduce((sum, sale) => sum + sale.total, 0));
    const maxTotal = Math.max(100, ...dailyTotals);

    return `${pageHeading("¡Buen día! <span aria-hidden=\"true\">✦</span>", "Resumen de productos, ventas e inventario.", primaryButton("Registrar venta", "new-sale"))}
        <section class="metrics-grid" aria-label="Indicadores del negocio">
            <article class="metric-card"><div class="metric-heading"><span>Ventas registradas</span><span class="metric-icon purple">↗</span></div><div class="metric-value">${money(total)}</div><div class="metric-foot">${completedSales.length} transacciones en el historial</div></article>
            <article class="metric-card"><div class="metric-heading"><span>Órdenes</span><span class="metric-icon blue">▤</span></div><div class="metric-value">${completedSales.length}</div><div class="metric-foot">Ventas registradas</div></article>
            <article class="metric-card"><div class="metric-heading"><span>Ticket promedio</span><span class="metric-icon orange">◎</span></div><div class="metric-value">${money(average)}</div><div class="metric-foot">Promedio por transacción</div></article>
            <article class="metric-card"><div class="metric-heading"><span>Productos activos</span><span class="metric-icon green">◇</span></div><div class="metric-value">${state.products.length}</div><div class="metric-foot"><span class="inventory-alert">${lowStock.length} con bajo inventario</span></div></article>
        </section>
        <section class="panel sales-panel">
            <div class="panel-heading"><div><h2>Ventas recientes</h2><p>Actividad de los últimos siete días</p></div><a class="text-link" href="#reportes" data-view="reportes">Ver reportes →</a></div>
            <div class="chart-summary"><div><strong>${money(total)}</strong><span>Ingresos registrados</span></div><div class="chart-legend"><span></span> Ventas</div></div>
            <div class="chart" role="img" aria-label="Ventas de los últimos siete días">
                <div class="chart-y-labels"><span>${money(maxTotal)}</span><span>${money(maxTotal * .75)}</span><span>${money(maxTotal * .5)}</span><span>${money(maxTotal * .25)}</span><span>$0</span></div>
                <div class="chart-plot"><div class="chart-grid"><i></i><i></i><i></i><i></i><i></i></div>
                    <div class="chart-bars">${dailyTotals.map((amount) => `<span class="chart-bar" style="height:${Math.max(amount ? 4 : 0, amount / maxTotal * 100)}%" title="${money(amount)}"></span>`).join("")}</div>
                    <div class="chart-x-labels">${days.map((date) => `<span>${escapeHtml(new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(date))}</span>`).join("")}</div>
                </div>
            </div>
        </section>
        <div class="lower-grid">
            <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>Últimas ventas</h2><p>Historial de transacciones</p></div><a class="text-link" href="#ventas" data-view="ventas">Ver historial →</a></div>
                ${salesTable(state.sales.slice(0, 5))}
            </section>
            <section class="panel inventory-panel"><div class="panel-heading table-heading"><div><h2>Productos con bajo inventario</h2><p>En o por debajo del mínimo configurado</p></div><a class="text-link" href="#inventario" data-view="inventario">Ver inventario →</a></div>
                ${lowStockTable(lowStock.slice(0, 5))}
            </section>
        </div>`;
}

function searchField(placeholder, id) {
    return `<label class="search-box"><span aria-hidden="true">⌕</span><input id="${id}" type="search" placeholder="${placeholder}" aria-label="${placeholder}"></label>`;
}

function productsTable(products) {
    if (!products.length) return `<div class="empty-state">No hay productos para mostrar.</div>`;
    return `<div class="table-scroll"><table><thead><tr><th>PRODUCTO</th><th>SKU</th><th>CATEGORÍA</th><th>PRECIO</th><th>EXISTENCIAS</th><th>ACCIONES</th></tr></thead><tbody>
        ${products.map((product) => `<tr data-search="${escapeHtml(normalizeText(`${product.name} ${product.sku} ${product.category}`))}">
            <td><span class="product-cell"><span class="product-icon product-headphones">◇</span><strong>${escapeHtml(product.name)}</strong></span></td>
            <td>${escapeHtml(product.sku)}</td><td>${escapeHtml(product.category)}</td><td class="amount">${money(product.price)}</td>
            <td><span class="stock-pill ${product.stock <= product.lowStock ? "stock-low" : "stock-ok"}">${product.stock} unidades</span></td>
            <td><div class="row-actions"><button class="small-button" type="button" data-action="edit-product" data-id="${escapeHtml(product.id)}">Editar</button><button class="small-button danger-text" type="button" data-action="delete-product" data-id="${escapeHtml(product.id)}">Eliminar</button></div></td>
        </tr>`).join("")}
    </tbody></table></div>`;
}

function renderProducts() {
    return `${pageHeading("Catálogo de productos", "Registra y actualiza la información de tus productos.", primaryButton("Nuevo producto", "new-product"))}
        <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>${state.products.length} productos</h2><p>Catálogo y existencias actuales</p></div></div>
        ${searchField("Buscar por nombre, SKU o categoría...", "product-search")}
        <div id="product-table">${productsTable(state.products)}</div></section>`;
}

function salesTable(sales) {
    if (!sales.length) return `<div class="empty-state">No hay ventas registradas.</div>`;
    return `<div class="table-scroll"><table><thead><tr><th>FOLIO</th><th>CLIENTE</th><th>FECHA</th><th>PRODUCTOS</th><th>TOTAL</th></tr></thead><tbody>
        ${sales.map((sale) => `<tr data-search="${escapeHtml(normalizeText(`${sale.id} ${sale.customer} ${sale.items.map((item) => item.name).join(" ")}`))}">
            <td><strong>${escapeHtml(sale.id)}</strong></td><td>${escapeHtml(sale.customer)}</td><td>${escapeHtml(dateTimeFormatter.format(new Date(sale.date)))}</td>
            <td>${sale.items.map((item) => `${escapeHtml(item.name)} × ${item.quantity}`).join("<br>")}</td><td class="amount">${money(sale.total)}</td>
        </tr>`).join("")}
    </tbody></table></div>`;
}

function renderSales() {
    const sales = [...state.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    return `${pageHeading("Historial de ventas", "Consulta las transacciones y registra nuevas ventas.", primaryButton("Registrar venta", "new-sale"))}
        <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>${sales.length} transacciones</h2><p>Las ventas actualizan las existencias automáticamente</p></div></div>
        ${searchField("Buscar por folio, cliente o producto...", "sales-search")}
        <div id="sales-table">${salesTable(sales)}</div></section>`;
}

function lowStockTable(products) {
    if (!products.length) return `<div class="empty-state">¡Todo bien! No hay productos con bajo inventario.</div>`;
    return `<div class="inventory-list">${products.map((product) => `<div class="inventory-item">
        <span class="product-icon product-headphones">◇</span><span class="product-info"><strong>${escapeHtml(product.name)}</strong><small>SKU: ${escapeHtml(product.sku)} · mínimo ${product.lowStock}</small></span>
        <span class="stock-level"><strong>${product.stock}</strong><small>disponibles</small></span></div>`).join("")}</div>`;
}

function renderInventory() {
    const products = [...state.products].sort((a, b) => a.stock - b.stock);
    return `${pageHeading("Inventario disponible", "Existencias actuales y alertas de reabastecimiento.")}
        <section class="metrics-grid inventory-metrics"><article class="metric-card"><div class="metric-heading"><span>Unidades disponibles</span><span class="metric-icon blue">▦</span></div><div class="metric-value">${state.products.reduce((sum, product) => sum + product.stock, 0)}</div><div class="metric-foot">En ${state.products.length} productos</div></article>
        <article class="metric-card"><div class="metric-heading"><span>Bajo inventario</span><span class="metric-icon orange">!</span></div><div class="metric-value">${lowStockProducts().length}</div><div class="metric-foot">En o por debajo del mínimo</div></article></section>
        <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>Existencias por producto</h2><p>El stock se descuenta automáticamente al registrar una venta</p></div></div>
        ${searchField("Buscar por nombre o SKU...", "inventory-search")}
        <div id="inventory-table">${productsTable(products)}</div></section>
        <section class="panel inventory-panel low-stock-panel"><div class="panel-heading table-heading"><div><h2>Productos con bajo inventario</h2><p>Revisa estos productos para evitar quedarte sin existencias</p></div></div>${lowStockTable(lowStockProducts())}</section>`;
}

function renderReports() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return `${pageHeading("Reportes de ventas", "Filtra las ventas por fecha y exporta el resultado.")}
        <section class="panel report-filter"><div class="panel-heading"><div><h2>Periodo del reporte</h2><p>Selecciona las fechas que deseas consultar</p></div></div>
            <form id="report-filter-form" class="filter-form"><label>Desde<input name="from" type="date" value="${dateInputValue(monthStart)}"></label><label>Hasta<input name="to" type="date" value="${dateInputValue(today)}"></label>
            <button class="button button-primary" type="submit">Aplicar filtro</button><button class="button button-secondary" type="button" data-action="export-report">Exportar CSV</button></form>
        </section><div id="report-results"></div>`;
}

function filteredSales(from, to) {
    const start = from ? new Date(`${from}T00:00:00`) : new Date(0);
    const end = to ? new Date(`${to}T23:59:59.999`) : new Date(8640000000000000);
    return state.sales.filter((sale) => new Date(sale.date) >= start && new Date(sale.date) <= end)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateReportResults() {
    const form = document.querySelector("#report-filter-form");
    if (!form) return;
    const formData = new FormData(form);
    const from = formData.get("from");
    const to = formData.get("to");
    const results = document.querySelector("#report-results");
    if (from && to && from > to) {
        results.innerHTML = `<p class="form-error">La fecha inicial no puede ser posterior a la fecha final.</p>`;
        return;
    }
    const sales = filteredSales(from, to);
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    results.innerHTML = `<section class="metrics-grid report-metrics"><article class="metric-card"><div class="metric-heading"><span>Ingresos del periodo</span><span class="metric-icon purple">↗</span></div><div class="metric-value">${money(total)}</div><div class="metric-foot">${sales.length} ventas</div></article>
        <article class="metric-card"><div class="metric-heading"><span>Ticket promedio</span><span class="metric-icon blue">◎</span></div><div class="metric-value">${money(sales.length ? total / sales.length : 0)}</div><div class="metric-foot">Por transacción</div></article></section>
        <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>Detalle del periodo</h2><p>${sales.length} ventas encontradas</p></div></div>${salesTable(sales)}</section>`;
}

function renderUsers() {
    return `${pageHeading("Usuarios del sistema", "Administra las cuentas de las personas que usan el sistema.", primaryButton("Agregar usuario", "new-user"))}
        <section class="panel table-panel"><div class="panel-heading table-heading"><div><h2>${state.users.length} usuarios</h2><p>Usuarios registrados en esta demostración</p></div></div>
        <div class="table-scroll"><table><thead><tr><th>NOMBRE</th><th>CORREO</th><th>ROL</th><th>ACCIONES</th></tr></thead><tbody>
            ${state.users.map((user) => `<tr><td><strong>${escapeHtml(user.name)}</strong></td><td>${escapeHtml(user.email)}</td><td><span class="status completed">${escapeHtml(user.role)}</span></td>
                <td><div class="row-actions"><button class="small-button" type="button" data-action="edit-user" data-id="${escapeHtml(user.id)}">Editar</button><button class="small-button danger-text" type="button" data-action="delete-user" data-id="${escapeHtml(user.id)}">Eliminar</button></div></td></tr>`).join("")}
        </tbody></table></div></section>
        <p class="helper-note">La administración de usuarios es una interfaz de demostración: no incluye inicio de sesión ni control real de permisos.</p>`;
}

function openDialog(title, body, submitLabel) {
    document.querySelector("#active-dialog")?.remove();
    const dialog = document.createElement("dialog");
    dialog.id = "active-dialog";
    dialog.className = "app-dialog";
    dialog.innerHTML = `<form method="dialog" class="dialog-close-form"><button class="dialog-close" aria-label="Cerrar" value="cancel">×</button></form>
        <div class="dialog-heading"><p class="eyebrow">SOV · SISTEMA ONLINE DE VENTAS</p><h2>${title}</h2></div>
        <form id="dialog-form">${body}<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit">${submitLabel}</button></div></form>`;
    document.body.append(dialog);
    dialog.showModal();
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });
    return dialog;
}

function openProductDialog(product = null) {
    const editing = Boolean(product);
    openDialog(editing ? "Editar producto" : "Registrar producto", `
        <input type="hidden" name="id" value="${escapeHtml(product?.id ?? "")}">
        <div class="form-grid"><label>Nombre del producto<input name="name" required maxlength="80" value="${escapeHtml(product?.name ?? "")}" placeholder="Ej. Audífonos inalámbricos"></label>
        <label>SKU<input name="sku" required maxlength="24" value="${escapeHtml(product?.sku ?? "")}" placeholder="Ej. AUD-024"></label>
        <label>Categoría<input name="category" required maxlength="40" value="${escapeHtml(product?.category ?? "")}" placeholder="Ej. Tecnología"></label>
        <label>Precio (MXN)<input name="price" type="number" required min="0.01" step="0.01" value="${product?.price ?? ""}" placeholder="0.00"></label>
        <label>Existencias<input name="stock" type="number" required min="0" step="1" value="${product?.stock ?? 0}"></label>
        <label>Alertar cuando haya<input name="lowStock" type="number" required min="0" step="1" value="${product?.lowStock ?? LOW_STOCK_DEFAULT}"></label></div>
        <p class="form-error" id="dialog-error" role="alert"></p>`, editing ? "Guardar cambios" : "Registrar producto");
}

function saleItemRow(productId = "", quantity = 1) {
    const options = state.products.map((product) => `<option value="${escapeHtml(product.id)}" ${product.id === productId ? "selected" : ""} ${product.stock === 0 ? "disabled" : ""}>${escapeHtml(product.name)} · ${money(product.price)} · ${product.stock} disp.</option>`).join("");
    return `<div class="sale-item-row"><label>Producto<select name="productId" required><option value="">Selecciona un producto</option>${options}</select></label>
        <label>Cantidad<input name="quantity" type="number" min="1" step="1" value="${quantity}" required></label>
        <button class="icon-remove" type="button" data-action="remove-sale-item" aria-label="Quitar producto">×</button></div>`;
}

function openSaleDialog() {
    if (!state.products.some((product) => product.stock > 0)) {
        showToast("No hay productos con existencias disponibles.", true);
        return;
    }
    openDialog("Registrar venta", `<label>Nombre del cliente<input name="customer" required maxlength="80" placeholder="Nombre completo"></label>
        <div class="sale-items-heading"><strong>Productos de la venta</strong><button class="small-button" type="button" data-action="add-sale-item">＋ Agregar producto</button></div>
        <div id="sale-items">${saleItemRow()}</div><div class="sale-total">Total estimado <strong id="sale-total">${money(0)}</strong></div>
        <p class="form-error" id="dialog-error" role="alert"></p>`, "Confirmar venta");
}

function openUserDialog(user = null) {
    const editing = Boolean(user);
    openDialog(editing ? "Editar usuario" : "Agregar usuario", `
        <input type="hidden" name="id" value="${escapeHtml(user?.id ?? "")}">
        <div class="form-grid"><label>Nombre completo<input name="name" required maxlength="80" value="${escapeHtml(user?.name ?? "")}" placeholder="Nombre del usuario"></label>
        <label>Correo electrónico<input name="email" type="email" required maxlength="120" value="${escapeHtml(user?.email ?? "")}" placeholder="nombre@ejemplo.com"></label>
        <label>Rol<select name="role"><option ${user?.role === "Administrador" ? "selected" : ""}>Administrador</option><option ${user?.role === "Vendedor" ? "selected" : ""}>Vendedor</option></select></label></div>
        <p class="form-error" id="dialog-error" role="alert"></p>`, editing ? "Guardar cambios" : "Agregar usuario");
}

function deleteRecord(collection, id, label) {
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    if (collection === "products") {
        state.products = state.products.filter((product) => product.id !== id);
    } else {
        if (state.users.length <= 1) {
            showToast("Debe existir al menos un usuario en el sistema.", true);
            return;
        }
        state.users = state.users.filter((user) => user.id !== id);
    }
    if (saveState()) {
        renderPage();
        showToast(`${label} eliminado.`);
    }
}

function exportCsv(sales) {
    const rows = [["Folio", "Cliente", "Fecha", "SKU", "Producto", "Cantidad", "Precio unitario", "Total"]];
    sales.forEach((sale) => sale.items.forEach((item) => rows.push([
        sale.id, sale.customer, dateTimeFormatter.format(new Date(sale.date)), item.sku, item.name,
        item.quantity, item.price.toFixed(2), (item.price * item.quantity).toFixed(2)
    ])));
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-ventas.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleAction(action, target) {
    const id = target.dataset.id;
    if (action === "new-product") openProductDialog();
    if (action === "edit-product") openProductDialog(state.products.find((product) => product.id === id));
    if (action === "delete-product") deleteRecord("products", id, "este producto");
    if (action === "new-sale") openSaleDialog();
    if (action === "new-user") openUserDialog();
    if (action === "edit-user") openUserDialog(state.users.find((user) => user.id === id));
    if (action === "delete-user") deleteRecord("users", id, "este usuario");
    if (action === "close-dialog") document.querySelector("#active-dialog")?.close();
    if (action === "add-sale-item") document.querySelector("#sale-items").insertAdjacentHTML("beforeend", saleItemRow());
    if (action === "remove-sale-item") {
        const rows = document.querySelectorAll(".sale-item-row");
        if (rows.length === 1) {
            rows[0].querySelector("select").value = "";
            rows[0].querySelector('[name="quantity"]').value = "1";
        } else {
            target.closest(".sale-item-row").remove();
        }
        updateSaleTotal();
    }
    if (action === "export-report") {
        const formData = new FormData(document.querySelector("#report-filter-form"));
        exportCsv(filteredSales(formData.get("from"), formData.get("to")));
    }
}

function updateSaleTotal() {
    const form = document.querySelector("#dialog-form");
    if (!form) return;
    const total = [...form.querySelectorAll(".sale-item-row")].reduce((sum, row) => {
        const product = state.products.find((item) => item.id === row.querySelector('[name="productId"]').value);
        const quantity = Number(row.querySelector('[name="quantity"]').value);
        return sum + (product && Number.isInteger(quantity) && quantity > 0 ? product.price * quantity : 0);
    }, 0);
    const totalElement = document.querySelector("#sale-total");
    if (totalElement) totalElement.textContent = money(total);
}

function showFormError(message) {
    document.querySelector("#dialog-error").textContent = message;
}

function handleDialogSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    if (form.querySelector('[name="customer"]')) {
        const customer = String(data.get("customer")).trim();
        const rows = [...form.querySelectorAll(".sale-item-row")];
        const quantities = new Map();
        const items = [];
        for (const row of rows) {
            const product = state.products.find((item) => item.id === row.querySelector('[name="productId"]').value);
            const quantity = Number(row.querySelector('[name="quantity"]').value);
            if (!product || !Number.isInteger(quantity) || quantity < 1) {
                showFormError("Selecciona un producto e indica una cantidad válida para cada renglón.");
                return;
            }
            quantities.set(product.id, (quantities.get(product.id) ?? 0) + quantity);
            items.push({ productId: product.id, name: product.name, sku: product.sku, quantity, price: product.price });
        }
        const unavailable = [...quantities].find(([productId, quantity]) =>
            quantity > state.products.find((product) => product.id === productId).stock
        );
        if (unavailable) {
            const product = state.products.find((item) => item.id === unavailable[0]);
            showFormError(`Existencias insuficientes para "${product.name}". Disponibles: ${product.stock}.`);
            return;
        }
        const sale = {
            id: `V-${String(Math.max(1047, ...state.sales.map((item) => Number(item.id.slice(2)) || 0)) + 1)}`,
            customer,
            date: new Date().toISOString(),
            items,
            total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        };
        quantities.forEach((quantity, productId) => {
            state.products.find((product) => product.id === productId).stock -= quantity;
        });
        state.sales.push(sale);
        if (saveState()) {
            document.querySelector("#active-dialog").close();
            renderPage();
            if (currentView === "reportes") updateReportResults();
            showToast(`Venta ${sale.id} registrada. El inventario se actualizó.`);
        }
        return;
    }

    if (form.querySelector('[name="sku"]')) {
        const id = String(data.get("id"));
        const sku = String(data.get("sku")).trim();
        if (state.products.some((product) => product.sku.toLocaleLowerCase() === sku.toLocaleLowerCase() && product.id !== id)) {
            showFormError("Ya existe un producto con ese SKU.");
            return;
        }
        const product = {
            id: id || `p-${crypto.randomUUID()}`,
            sku,
            name: String(data.get("name")).trim(),
            category: String(data.get("category")).trim(),
            price: Number(data.get("price")),
            stock: Number(data.get("stock")),
            lowStock: Number(data.get("lowStock"))
        };
        const index = state.products.findIndex((item) => item.id === id);
        if (index >= 0) state.products[index] = product;
        else state.products.push(product);
        if (saveState()) {
            document.querySelector("#active-dialog").close();
            renderPage();
            showToast(index >= 0 ? "Producto actualizado." : "Producto registrado.");
        }
        return;
    }

    if (form.querySelector('[name="email"]')) {
        const id = String(data.get("id"));
        const email = String(data.get("email")).trim();
        if (state.users.some((user) => user.email.toLocaleLowerCase() === email.toLocaleLowerCase() && user.id !== id)) {
            showFormError("Ya existe un usuario con ese correo electrónico.");
            return;
        }
        const user = {
            id: id || `u-${crypto.randomUUID()}`,
            name: String(data.get("name")).trim(),
            email,
            role: String(data.get("role"))
        };
        const index = state.users.findIndex((item) => item.id === id);
        if (index >= 0) state.users[index] = user;
        else state.users.push(user);
        if (saveState()) {
            document.querySelector("#active-dialog").close();
            renderPage();
            showToast(index >= 0 ? "Usuario actualizado." : "Usuario agregado.");
        }
    }
}

function filterTable(input, tableId, emptyMessage) {
    const query = normalizeText(input.value);
    let visible = 0;
    document.querySelectorAll(`#${tableId} tbody tr`).forEach((row) => {
        const matches = normalizeText(row.dataset.search).includes(query);
        row.hidden = !matches;
        visible += Number(matches);
    });
    let empty = document.querySelector(`#${tableId} .empty-state`);
    if (!visible && !empty) {
        empty = document.createElement("div");
        empty.className = "empty-state";
        document.querySelector(`#${tableId}`).append(empty);
    }
    if (empty) {
        empty.textContent = visible ? "" : emptyMessage;
        empty.hidden = visible > 0;
    }
}

document.addEventListener("click", (event) => {
    const viewLink = event.target.closest("[data-view]");
    if (viewLink) {
        event.preventDefault();
        currentView = viewLink.dataset.view;
        history.replaceState(null, "", `#${currentView}`);
        renderPage();
        if (currentView === "reportes") updateReportResults();
        document.querySelector("#sidebar").classList.remove("is-open");
        document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
        return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) handleAction(actionButton.dataset.action, actionButton);
});

document.addEventListener("input", (event) => {
    if (event.target.id === "product-search") filterTable(event.target, "product-table", "No se encontraron productos.");
    if (event.target.id === "sales-search") filterTable(event.target, "sales-table", "No se encontraron ventas.");
    if (event.target.id === "inventory-search") filterTable(event.target, "inventory-table", "No se encontraron productos.");
    if (event.target.closest("#sale-items")) updateSaleTotal();
});

document.addEventListener("change", (event) => {
    if (event.target.closest("#sale-items")) updateSaleTotal();
});

document.addEventListener("submit", (event) => {
    if (event.target.getAttribute("id") === "dialog-form") handleDialogSubmit(event);
    if (event.target.getAttribute("id") === "report-filter-form") {
        event.preventDefault();
        updateReportResults();
    }
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const isOpen = document.querySelector("#sidebar").classList.toggle("is-open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", () => {
    const requestedView = location.hash.slice(1);
    if (Object.hasOwn(viewTitles, requestedView) && requestedView !== currentView) {
        currentView = requestedView;
        renderPage();
        if (currentView === "reportes") updateReportResults();
    }
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("es-MX", {
    weekday: "short", day: "numeric", month: "short"
}).format(new Date());

try {
    state = loadState();
    currentView = Object.hasOwn(viewTitles, location.hash.slice(1)) ? location.hash.slice(1) : "inicio";
    renderPage();
    if (currentView === "reportes") updateReportResults();
} catch (error) {
    document.querySelector("#app-view").innerHTML = `<section class="panel"><h1>No se pudieron cargar los datos</h1><p class="form-error">${escapeHtml(error.message)}</p></section>`;
}
