import { loadState } from "./core/state.js";
import { renderProducts, handleProductSubmit, openProductDialog } from "./modules/products.js";
import { renderSales, handleSaleSubmit, openSaleDialog, handleSaleItemActions } from "./modules/sales.js";
import { renderInventory } from "./modules/inventory.js";

let currentView = "inicio";

const viewRenderers = {
    inicio: renderDashboard,
    productos: renderProducts,
    ventas: renderSales,
    inventario: renderInventory
};

function renderDashboard() {
    return `<section class="welcome-row">
        <div><h1>Resumen General</h1><p class="welcome-subtitle">Selecciona un módulo en el menú para comenzar.</p></div>
    </section>`;
}

export function renderPage() {
    document.querySelector("#breadcrumb-current").textContent = currentView.toUpperCase();
    document.querySelectorAll(".main-nav .nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.view === currentView);
    });
    const renderer = viewRenderers[currentView] || renderDashboard;
    document.querySelector("#app-view").innerHTML = renderer();
}

// Global Event Listeners
document.addEventListener("click", (e) => {
    const viewLink = e.target.closest("[data-view]");
    if (viewLink) {
        e.preventDefault();
        currentView = viewLink.dataset.view;
        renderPage();
        return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === "new-product") openProductDialog();
        if (action === "edit-product") {
            const productId = actionBtn.dataset.id;
            openProductDialog(productId);
        }
        if (action === "new-sale") openSaleDialog();
        if (action === "close-dialog") document.querySelector("#active-dialog")?.close();
        handleSaleItemActions(action, actionBtn);
    }
});

document.addEventListener("submit", (e) => {
    if (e.target.id === "dialog-form") {
        e.preventDefault();
        const form = e.target;
        if (form.querySelector('[name="sku"]')) handleProductSubmit(form);
        if (form.querySelector('[name="customer"]')) handleSaleSubmit(form);
    }
});

loadState();
renderPage();