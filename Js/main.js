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
    // Manejar rutas semánticas de categoría: #categoria-<slug>
    if (hash.startsWith('#categoria-')) {
        const slug = decodeURIComponent(hash.replace('#categoria-', ''));
        // Mostrar panel de productos
        mostrarPanel('productos');
        // Actualizar clase 'selected' en el listado de categorías
        document.querySelectorAll('.categorias ul li a').forEach(link => {
            if (link.getAttribute('data-categoria') === slug) link.classList.add('selected');
            else link.classList.remove('selected');
        });

        // Si la categoría es 'all' restaurar la vista por defecto con separadores y botones
        if (slug === 'all') {
            if (typeof window.renderProductos === 'function') window.renderProductos();

            // Mostrar separadores
            document.querySelectorAll('.separador-container, .separador-container-extra').forEach(sep => {
                sep.style.display = 'block';
            });

            // Mostrar panel-categoria
            const panelCategoria = document.querySelector('.panel-categoria');
            if (panelCategoria) panelCategoria.style.display = 'flex';

            // Mostrar botones Cargar más y limitar la vista por categoría (solo 4 visibles por categoria)
            document.querySelectorAll('.categoria').forEach(categoriaDiv => {
                const productosCategoria = categoriaDiv.querySelectorAll('.producto');
                productosCategoria.forEach((producto, idx) => {
                    producto.style.display = idx >= 4 ? 'none' : 'block';
                });
            });
            document.querySelectorAll('.btn-cargar-mas').forEach(btn => btn.style.display = 'block');

            return;
        }

        // Manejo especial: si la categoría es electrodomésticos mostrar el panel dedicado
        if (slug === 'electrodomesticos') {
            if (typeof window.mostrarPanelElectrodomesticos === 'function') {
                window.mostrarPanelElectrodomesticos();
            } else {
                mostrarPanel('electrodomesticos');
            }
            return;
        }

        // Para una categoría específica
        // Ocultar separadores
        document.querySelectorAll('.separador-container, .separador-container-extra').forEach(sep => {
            sep.style.display = 'none';
        });

        // Ocultar panel-categoria
        const panelCategoria = document.querySelector('.panel-categoria');
        if (panelCategoria) panelCategoria.style.display = 'none';

        // Llamar al renderizador por categoría si existe
        if (typeof window.renderProductosPorCategoria === 'function') {
            window.renderProductosPorCategoria(slug);
        } else if (typeof window.renderProductos === 'function') {
            // fallback
            window.renderProductos();
        }

        // Forzar ocultamiento de separadores y panel-categoria después del render
        document.querySelectorAll('.separador-container, .separador-container-extra').forEach(sep => sep.style.display = 'none');
        const panelCat = document.querySelector('.panel-categoria'); if (panelCat) panelCat.style.display = 'none';

        // Ocultar botones de cargar más
        document.querySelectorAll('.btn-cargar-mas').forEach(btn => btn.style.display = 'none');

        return;
    }
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
            const electrodomesticos = window.productos.filter(producto => (window.slugify ? window.slugify(producto.categoria) : String(producto.categoria).toLowerCase()) === "electrodomesticos" && producto.disponible);
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
        productos = productosData;
        combos = combosData;
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

        // Activar si (octubre && día >= 15) OR (noviembre && día <= 5)
        const isHalloweenRange = (month === 10 && day >= 15) || (month === 11 && day <= 5);

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
