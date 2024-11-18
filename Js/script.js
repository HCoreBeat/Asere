// Datos iniciales de los productos
const productos = {
    cantidad1: 1, // Producto 1
    cantidad2: 1, // Producto 2
};

// Incrementar la cantidad
function incrementar(id) {
    productos[id]++;
    document.getElementById(id).textContent = productos[id];
}

// Decrementar la cantidad
function decrementar(id) {
    if (productos[id] > 1) {
        productos[id]--;
        document.getElementById(id).textContent = productos[id];
    }
}
