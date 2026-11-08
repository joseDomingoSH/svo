const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
let toastTimeout;

export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

export function money(value) {
    return currency.format(value);
}

export function normalizeText(value) {
    return String(value ?? "").trim().toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function showToast(message, isError = false) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("toast-error", isError);
    toast.classList.add("toast-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("toast-visible"), 3200);
}

export function openDialog(title, body, submitLabel) {
    document.querySelector("#active-dialog")?.remove();
    const dialog = document.createElement("dialog");
    dialog.id = "active-dialog";
    dialog.className = "app-dialog";
    dialog.innerHTML = `
        <form method="dialog" class="dialog-close-form"><button class="dialog-close" value="cancel">×</button></form>
        <div class="dialog-heading"><p class="eyebrow">SOV · SISTEMA ONLINE DE VENTAS</p><h2>${title}</h2></div>
        <form id="dialog-form">${body}<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit">${submitLabel}</button></div></form>`;
    document.body.append(dialog);
    dialog.showModal();
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    return dialog;
}