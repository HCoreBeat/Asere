// carrito.js
// Lógica del carrito de compras

let carrito = [];

function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (!cartCountElement) return;
    const itemCount = carrito.reduce((total, producto) => {
        const productoEnDB = (productos && productos.find(p => p.nombre === producto.nombre)) || 
                           (combos && combos.find(c => c.nombre === producto.nombre));
        const disponible = productoEnDB ? productoEnDB.disponible : false;
        return disponible ? total + producto.cantidad : total;
    }, 0);
    cartCountElement.textContent = itemCount;
    cartCountElement.style.display = itemCount > 0 ? 'flex' : 'none';
}

function vaciarCarrito() {
    const productosNoDisponibles = carrito.filter(producto => {
        const productoEnDB = productos.find(p => p.nombre === producto.nombre) || 
                            combos.find(c => c.nombre === producto.nombre);
        return productoEnDB ? !productoEnDB.disponible : false;
    });
    carrito = productosNoDisponibles;
    guardarCarrito();
    renderCarrito();
}

function renderCarrito() {
    const carritoContainer = document.getElementById("carrito-container");
    const carritoTotal = document.getElementById("cart-total");
    const carritoVacio = document.getElementById("carrito-vacio");
    const cartCountElement = document.getElementById("cart-count");
    const checkoutButton = document.getElementById("checkout-button");
    carritoContainer.innerHTML = '';
    let totalDisponible = 0;
    const [disponibles, noDisponibles] = carrito.reduce(([disp, noDisp], producto) => {
        const productoEnDB = (productos && productos.find(p => p.nombre === producto.nombre)) || 
                            (combos && combos.find(c => c.nombre === producto.nombre));
        const disponible = productoEnDB ? productoEnDB.disponible : false;
        if (disponible) {
            disp.push(producto);
            totalDisponible += producto.precio * producto.cantidad;
        } else {
            noDisp.push(producto);
        }
        return [disp, noDisp];
    }, [[], []]);
    if (cartCountElement) {
        cartCountElement.textContent = disponibles.reduce((total, p) => total + p.cantidad, 0);
        cartCountElement.style.display = cartCountElement.textContent === '0' ? 'none' : 'block';
    }
    if (disponibles.length > 0) {
        const disponiblesSection = document.createElement('div');
        disponiblesSection.className = 'carrito-section';
        disponiblesSection.innerHTML = '<h3>Productos Disponibles</h3>';
        disponibles.forEach(producto => {
            disponiblesSection.appendChild(crearItemCarrito(producto, true));
        });
        carritoContainer.appendChild(disponiblesSection);
    }
    if (noDisponibles.length > 0) {
        const noDisponiblesSection = document.createElement('div');
        noDisponiblesSection.className = 'carrito-section no-disponibles';
        noDisponiblesSection.innerHTML = '<h3>Productos No Disponibles</h3>';
        noDisponibles.forEach(producto => {
            noDisponiblesSection.appendChild(crearItemCarrito(producto, false));
        });
        carritoContainer.appendChild(noDisponiblesSection);
    }
    if (carritoVacio) {
        carritoVacio.style.display = carrito.length === 0 ? 'block' : 'none';
        checkoutButton.style.display = disponibles.length === 0 ? 'none' : 'block';
    }
    carritoTotal.textContent = `$${totalDisponible.toFixed(2)}`;
}

function crearItemCarrito(producto, disponible) {
    const esCombo = producto.esCombo;
    const productoDiv = document.createElement("div");
    productoDiv.className = `carrito-producto ${!disponible ? 'no-disponible' : ''}`;
    let cantidadControls = '';
    if (disponible) {
        cantidadControls = `
            <div class="carrito-cantidad">
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                <span>${producto.cantidad}</span>
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', 1)">+</button>
            </div>
        `;
    } else {
        cantidadControls = '';
    }
    if (esCombo) {
        productoDiv.innerHTML = `
            <div class="carrito-item combo">
                <div class="combo-badge">Pack</div>
                ${!disponible ? '<div class="no-disponible-overlay">No disponible</div>' : ''}
                <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-imagen ${!disponible ? 'no-disponible-img' : ''}">
                <div class="carrito-detalles">
                    <p class="carrito-nombre ${!disponible ? 'no-disponible-text' : ''}">${producto.nombre}</p>
                    <div class="carrito-combo-detalles">
                        <strong>Incluye:</strong>
                        <ul>
                            ${producto.productos.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <p class="carrito-precio ${!disponible ? 'no-disponible-text' : ''}">Precio: $${producto.precio.toFixed(2)}</p>
                    ${cantidadControls}
                </div>
                <button class="eliminar-producto" onclick="eliminarDelCarrito('${producto.id}')">Eliminar</button>
            </div>
        `;
    } else {
        productoDiv.innerHTML = `
            <div class="carrito-item">
                ${!disponible ? '<div class="no-disponible-overlay">No disponible</div>' : ''}
                <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-imagen ${!disponible ? 'no-disponible-img' : ''}">
                <div class="carrito-detalles">
                    <p class="carrito-nombre ${!disponible ? 'no-disponible-text' : ''}">${producto.nombre}</p>
                    <p class="carrito-precio ${!disponible ? 'no-disponible-text' : ''}">Precio: $${producto.precio.toFixed(2)}</p>
                    ${cantidadControls}
                </div>
                <button class="eliminar-producto" onclick="eliminarDelCarrito('${producto.id}')">Eliminar</button>
            </div>
        `;
    }
    return productoDiv;
}

function cambiarCantidad(id, change) {
    carrito = carrito.map(producto => {
        if (producto.id === id) {
            producto.cantidad += change;
        }
        return producto;
    }).filter(producto => producto.cantidad > 0);
    guardarCarrito();
    renderCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    guardarCarrito();
    renderCarrito();
}

function agregarAlCarrito(nombre, precio, cantidadId, imagen, boton, productosCombo = []) {
    const cantidadElemento = document.getElementById(cantidadId);
    if (!cantidadElemento) return;
    const cantidad = parseInt(cantidadElemento.textContent);
    const productoExistente = carrito.find(producto => producto.nombre === nombre);
    const productoEnDB = productos.find(p => p.nombre === nombre) || combos.find(c => c.nombre === nombre);
    const imagenPrincipal = productoEnDB ? productoEnDB.imagen : imagen;
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: nombre + Date.now(),
            nombre,
            precio,
            cantidad,
            imagen: imagenPrincipal,
            esCombo: productosCombo.length > 0,
            productos: productosCombo
        });
    }
    guardarCarrito();
    renderCarrito();
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    renderCarrito();
}

function mostrarCarrito() {
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById("productos").style.display = "none";
    document.getElementById("detalle-producto").style.display = "none";
    document.getElementById("carrito").style.display = "block";
    document.getElementById("panel-electrodomesticos").style.display = "none";
    let slider = document.querySelector(".slider");
    if (slider) slider.style.display = "none";
}

function ocultarCarrito() {
    document.getElementById("carrito").style.display = "none";
    document.getElementById("productos").style.display = "block";
    let slider = document.querySelector(".slider");
    if (slider) slider.style.display = "block";
}

function incrementar(id) {
    const cantidadElemento = document.getElementById(id);
    if (cantidadElemento) {
        cantidadElemento.textContent = parseInt(cantidadElemento.textContent) + 1;
    }
}

function decrementar(id) {
    const cantidadElemento = document.getElementById(id);
    if (cantidadElemento && parseInt(cantidadElemento.textContent) > 1) {
        cantidadElemento.textContent = parseInt(cantidadElemento.textContent) - 1;
    }
}
