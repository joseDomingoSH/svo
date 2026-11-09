var listaProductos = [
    {}
];
// Programar la consulta y visualización de productos
function mostrarCatalogo(filtro) {
    var contenedor = document.getElementById("lista-productos");
    contenedor.innerHTML = "";

    for (var i = 0; i < listaProductos.length; i++) {
        var p = listaProductos[i];

        // Si hay texto de búsqueda, filtramos de forma sencilla
        if (filtro && !p.nombre.toLowerCase().includes(filtro.toLowerCase())) {
            continue; 
        }

        var div = document.createElement("div");
        div.className = "product-item";
        div.innerHTML = "<strong>" + p.nombre + "</strong> - $" + p.precio + "<br><span>" + p.descripcion + "</span>";
        contenedor.appendChild(div);
    }
}

// Lógica del formulario de registro
var formRegistro = document.getElementById("form-registro");
formRegistro.addEventListener("submit", function(e) {
    e.preventDefault();

    var nombre = document.getElementById("reg-nombre").value;
    var precio = document.getElementById("reg-precio").value;
    var desc = document.getElementById("reg-desc").value;

    if (nombre == "" || precio == "" || desc == "") {
        alert("Completa todos los campos de registro.");
        return;
    }

    var nuevo = { nombre: nombre, precio: precio, descripcion: desc };
    listaProductos.push(nuevo);

    formRegistro.reset();
    mostrarCatalogo();
    alert("¡Producto registrado con éxito!");
});

// Diseño y validación visual
var formEdicion = document.getElementById("form-edicion");
formEdicion.addEventListener("submit", function(e) {
    e.preventDefault();

    var nombreEdit = document.getElementById("edit-nombre").value;
    var precioEdit = document.getElementById("edit-precio").value;
    var descEdit = document.getElementById("edit-desc").value;

    if (nombreEdit == "" || precioEdit == "" || descEdit == "") {
        alert("Completa los campos para editar.");
        return;
    }

    alert("¡Formulario de edición validado correctamente!");
    formEdicion.reset();
});

// Búsqueda en tiempo real para la consulta
var inputBuscar = document.getElementById("input-buscar");
inputBuscar.addEventListener("input", function(e) {
    mostrarCatalogo(e.target.value);
});

// Carga inicial de la visualización
mostrarCatalogo();