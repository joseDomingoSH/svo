const STORAGE_KEY = "sov-demo-v1";

const initialState = {
    products: [
        { id: "p-aud", sku: "AUD-024", name: "Audífonos inalámbricos", category: "Accesorios", price: 2499, stock: 3, lowStock: 5 },
        { id: "p-moc", sku: "MOC-011", name: "Mochila minimalista", category: "Accesorios", price: 1250, stock: 5, lowStock: 5 },
        { id: "p-bot", sku: "BOT-008", name: "Botella de acero", category: "Hogar", price: 680, stock: 2, lowStock: 5 }
    ],
    sales: [
        { id: "V-1048", customer: "Sofía Ramírez", date: new Date().toISOString(), items: [{ productId: "p-aud", name: "Audífonos inalámbricos", sku: "AUD-024", quantity: 1, price: 2499 }], total: 2499 }
    ]
};

export let state = loadState();

export function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialState);
    try {
        return JSON.parse(saved);
    } catch {
        return structuredClone(initialState);
    }
}

export function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (e) {
        console.error("Error al guardar estado:", e);
        return false;
    }
}