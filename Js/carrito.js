let carrito = [];

function agregarAlCarrito(nombre, precio, cantidadId) {
    const cantidadElem = document.getElementById(cantidadId);
    const cantidad = parseInt(cantidadElem.textContent);
    const productoExistente = carrito.find(item => item.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ nombre, precio, cantidad });
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const carritoContainer = document.getElementById("carrito-container");
    const totalContainer = document.getElementById("total-container");
    const totalElem = document.getElementById("total");
    const carritoVacioElem = document.getElementById("carrito-vacio");

    carritoContainer.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        carritoVacioElem.style.display = 'block';
        totalContainer.style.display = 'none';
    } else {
        carritoVacioElem.style.display = 'none';
        totalContainer.style.display = 'block';

        carrito.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'carrito-producto';
            productoDiv.innerHTML = `
                <span>${producto.nombre}</span>
                <span>${producto.cantidad} x $${producto.precio}</span>
                <button onclick="eliminarDelCarrito('${producto.nombre}')">Eliminar</button>
            `;
            carritoContainer.appendChild(productoDiv);
            total += producto.precio * producto.cantidad;
        });

        totalElem.textContent = total.toFixed(2);
    }
}

function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(producto => producto.nombre !== nombre);
    actualizarCarrito();
}

function mostrarCarrito() {
    document.getElementById('productos').style.display = 'none';
    document.getElementById('carrito').style.display = 'block';
}

function ocultarCarrito() {
    document.getElementById('carrito').style.display = 'none';
    document.getElementById('productos').style.display = 'block';
}
