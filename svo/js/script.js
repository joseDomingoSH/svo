const productos = [
    { id: 1, nombre: "Laptop HP Pavilion", precio: 12500.50, existencias: 12, categoria: "Tecnología" },
    { id: 2, nombre: "Mouse Inalámbrico", precio: 350.00, existencias: 30, categoria: "Tecnología" },
    { id: 3, nombre: "Licuadora 3 Velocidades", precio: 899.00, existencias: 8, categoria: "Hogar" },
    { id: 4, nombre: "Teclado Mecánico RGB", precio: 1100.00, existencias: 15, categoria: "Tecnología" }
];


function buscarProductoPorNombre(busqueda) {
    const termino = busqueda.toLowerCase().trim();
    
    const resultados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(termino)
    );
    
    return resultados;
}

console.log("Resultados de buscar 'laptop':", buscarProductoPorNombre("laptop"));
console.log("Resultados de buscar 'teclado':", buscarProductoPorNombre("teclado"));