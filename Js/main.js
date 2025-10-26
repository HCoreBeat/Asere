// main.js
// Inicialización principal y carga de datos


// Centralización de navegación y historial
let productos = [];
let combos = [];

function mostrarPanel(panel) {
    // Oculta todos los paneles principales
    document.getElementById('detalle-producto').style.display = 'none';
    document.getElementById('carrito').style.display = 'none';
    document.getElementById('productos').style.display = 'none';
    let slider = document.querySelector('.slider');
    if (slider) slider.style.display = 'none';
    const panelElectro = document.getElementById('panel-electrodomesticos');
    if (panelElectro) panelElectro.style.display = 'none';

    if (panel === 'detalle') {
        document.getElementById('detalle-producto').style.display = 'block';
    } else if (panel === 'carrito') {
        document.getElementById('carrito').style.display = 'block';
    } else if (panel === 'productos') {
        document.getElementById('productos').style.display = 'block';
        if (slider) slider.style.display = 'block';
    } else if (panel === 'electrodomesticos') {
        if (panelElectro) panelElectro.style.display = 'block';
    }
}

function handleRouteChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#producto-')) {
        const nombreProductoAmigable = hash.replace('#producto-', '');
        const nombreDecodificado = decodeURIComponent(nombreProductoAmigable);
        const nombreProductoNormalizado = normalizarNombre(nombreDecodificado);
        const producto = buscarProductoPorNombre(nombreProductoNormalizado);
        if (producto) {
            mostrarPanel('detalle');
            mostrarDetallesProducto(producto);
        } else {
            mostrarPanel('productos');
            mostrarMensajeNoDisponible();
        }
    } else if (hash === '#carrito') {
        mostrarPanel('carrito');
        renderCarrito();
    } else if (hash === '#productos' || hash === '' || hash === '#inicio') {
        mostrarPanel('productos');
        renderProductos();
    } else if (hash === '#electrodomesticos') {
        mostrarPanel('electrodomesticos');
        // Renderizar electrodomésticos al recargar
        if (window.productos && typeof window.renderProductosEnContenedor === 'function') {
            const electrodomesticos = window.productos.filter(producto => producto.categoria === "electrodomesticos" && producto.disponible);
            window.renderProductosEnContenedor(electrodomesticos, "lista-electrodomesticos");
        }
    } else {
        mostrarPanel('productos');
        renderProductos();
    }
}

window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('popstate', handleRouteChange);

// Inicialización principal y carga de datos
document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetch('Json/productos.json').then(response => response.json()),
        fetch('Json/combos.json').then(response => response.json())
    ])
    .then(([productosData, combosData]) => {
        productos = actualizarPrecios(productosData);
        combos = actualizarPrecios(combosData);
        window.productos = productos;
        window.combos = combos;
        renderProductos();
        cargarCarrito();
        handleRouteChange(); // Mostrar el panel correcto al cargar
    })
    .catch(error => {
        console.error('Error cargando datos:', error);
        mostrarPanel('productos');
    });
});

// Activar/desactivar decoraciones de Halloween en header según fecha anual
// Período activo: 15 octubre (inclusive) hasta 1 noviembre (inclusive), cada año
function toggleHalloweenDecorByDate() {
    try {
        const header = document.querySelector('header');
        if (!header) return;

        const now = new Date();
        const month = now.getMonth() + 1; // getMonth: 0-11
        const day = now.getDate();

        // Activar si (octubre && día >= 15) OR (noviembre && día <= 1)
        const isHalloweenRange = (month === 10 && day >= 15) || (month === 11 && day <= 1);

        if (isHalloweenRange) {
            header.classList.add('halloween-active');
        } else {
            header.classList.remove('halloween-active');
        }
    } catch (e) {
        console.error('toggleHalloweenDecorByDate error:', e);
    }
}

// Ejecutar al cargar y también en focus (por si la página queda abierta a medianoche)
document.addEventListener('DOMContentLoaded', toggleHalloweenDecorByDate);
window.addEventListener('focus', toggleHalloweenDecorByDate);
