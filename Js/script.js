
// Array para almacenar los productos del carrito
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    const productosContainer = document.getElementById("productos");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const overlay = document.querySelector(".overlay");
    const homeButton = document.querySelector(".home-button");
    const header = document.querySelector("header");
    const currencyText = document.getElementById("currency-text");
    const currencyOptions = document.getElementById("currency-options");
    const toggleCurrencyButton = document.getElementById("toggle-currency");
    const carritoButton = document.querySelector("nav ul li a[href='#carrito']");
    const productosButton = document.querySelector("nav ul li a[href='#productos']");

    let locales = {};
    let productos = [];
    let currentLang = 'es'; // Idioma por defecto
    let productosRenderizados = false;

    let lastScrollTop = 0;
    let currency = 'USD';

    header.style.transition = "top 0.3s ease";

    // Deshabilitar scroll
    const disableScroll = () => {
        document.body.style.overflow = "hidden";
    };

    // Habilitar scroll
    const enableScroll = () => {
        document.body.style.overflow = "auto";
    };

    function removeDuplicates(productos) {
        const uniqueProductos = [];
        const productoNames = new Set();
    
        productos.forEach(producto => {
            if (!productoNames.has(producto.nombre)) {
                productoNames.add(producto.nombre);
                uniqueProductos.push(producto);
            }
        });
    
        return uniqueProductos;
    }
    

    function limpiarProductosContainer() {
        while (productosContainer.firstChild) {
            productosContainer.removeChild(productosContainer.firstChild);
        }
    }
    
    function renderProductos(lang) {
        limpiarProductosContainer(); // Limpiar productos actuales
    
        // Eliminar productos duplicados
        const productosUnicos = removeDuplicates(productos);
    
        console.log('Renderizando productos en idioma:', lang);
        console.log('Locales:', locales);
    
        productosUnicos.forEach(producto => {
            const productoDiv = document.createElement("div");
            productoDiv.className = "producto";
            productoDiv.dataset.nombre = producto.nombre;
            productoDiv.dataset.categoria = producto.categoria;
    
            let precio = producto.precio;
            let pvpr = producto.pvpr;
            let descuento = '';
    
            if (producto.oferta) {
                pvpr = producto.precio;
                precio = (producto.precio - (producto.precio * (producto.descuento / 100))).toFixed(2);
                descuento = `<p class="descuento" style="text-decoration: none;">-${producto.descuento}%</p>`;
            }
    
            const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr}</s></p>` : '';
    
            const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">${locales[lang].productos.oferta}</span>` : '';
            const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">${locales[lang].productos.mas_vendido}</div>` : '';
    
            productoDiv.innerHTML = `
                <div class="producto-contenedor">
                    <div class="etiqueta-segmento">
                        ${etiquetaMasVendido}
                        ${etiquetaOferta}
                    </div>
                    <div class="producto-img">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="producto-info">
                        <div class="pvpr-precio-contenedor">
                            <p class="precio"><span class="currency">US$</span>${precio}</p>
                            ${pvprHtml}
                        </div>
                        ${descuento}
                        <div class="cantidad-carrito-contenedor">
                            <div class="cantidad">
                                <button class="btn-cantidad" onclick="decrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">-</button>
                                <span id="cantidad${producto.nombre.replace(/\s+/g, '')}">1</span>
                                <button class="btn-cantidad" onclick="incrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">+</button>
                            </div>
                            <button class="btn-carrito boton-agregarcarrito" onclick="agregarAlCarrito('${producto.nombre}', ${precio}, 'cantidad${producto.nombre.replace(/\s+/g, '')}', '${producto.imagen}', this)">${locales[lang].productos.agregar_al_carrito}</button>
                        </div>
                        <p class="nombre">${producto.nombre}</p>
                    </div>
                </div>
            `;
    
            productosContainer.appendChild(productoDiv);
        });
    
        // Filtrar productos por categoría
        document.querySelectorAll(".categorias ul li a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const category = link.getAttribute("data-categoria");
    
                document.querySelectorAll(".producto").forEach(producto => {
                    if (category === "ofertas" && producto.dataset.categoria !== "ofertas" && !producto.querySelector('.etiqueta.oferta')) {
                        producto.style.display = "none";
                    } else if (producto.getAttribute("data-categoria") === category || category === "all" || (category === "ofertas" && producto.querySelector('.etiqueta.oferta'))) {
                        producto.style.display = "block";
                    } else {
                        producto.style.display = "none";
                    }
                });
    
                // Ocultar el carrito al seleccionar una categoría
                ocultarCarrito();
            });
        });
    
        // Filtrar productos en tiempo real
        searchInput.addEventListener("input", filterProducts);
        searchButton.addEventListener("click", filterProducts);
    
        function filterProducts() {
            const searchValue = searchInput.value.toLowerCase();
    
            productosUnicos.forEach(producto => {
                const productName = producto.nombre.toLowerCase();
                const productElement = document.querySelector(`.producto[data-nombre="${producto.nombre}"]`);
                if (productName.includes(searchValue)) {
                    productElement.style.display = "block";
                } else {
                    productElement.style.display = "none";
                }
            });
        }
    
        productosRenderizados = true; // Marcar que los productos han sido renderizados
        currentLang = lang; // Actualizar el idioma actual
    }
    
    // Fetch de traducciones
    fetch("Json/lang.json")
    .then(response => response.json())
    .then(data => {
        locales = data;
        console.log('Traducciones cargadas:', locales);

        // Fetch de productos
        fetch('Json/productos.json')
            .then(response => response.json())
            .then(data => {
                productos = data;
                console.log('Productos cargados:', productos);
                // Renderizar productos al cargar la página
                renderProductos(currentLang);
            });
    });

    // Escuchar el evento de cambio de idioma y traducir productos
    document.addEventListener('languageChanged', (event) => {
    const lang = event.detail.lang;
    renderProductos(lang);
    });

    


// Funcionalidad de cambio de moneda
    toggleCurrencyButton.addEventListener('click', () => {
        currencyOptions.style.display = currencyOptions.style.display === 'block' ? 'none' : 'block';
    });

    currencyOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('currency-option')) {
            currency = e.target.dataset.currency;

            if(currency){
                currencyText.textContent = currency;
            }
            document.querySelectorAll('.precio').forEach(precioElem => {
                if (currency === 'EUR') {
                    precioElem.innerHTML = precioElem.innerHTML.replace('US$', '€');
                } else {
                    precioElem.innerHTML = precioElem.innerHTML.replace('€', 'US$');
                }
            });

            document.querySelectorAll('.pvpr').forEach(pvprElem => {
                if (currency === 'EUR') {
                    pvprElem.innerHTML = pvprElem.innerHTML.replace('US$', '€');
                } else {
                    pvprElem.innerHTML = pvprElem.innerHTML.replace('€', 'US$');
                }
            });
            // Ocultar el panel de opciones de moneda
            currencyOptions.style.display = 'none';
        }
    });

    // Toggle menú
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
        overlay.classList.toggle("active");

        if (overlay.classList.contains("active")) {
            disableScroll(); // Deshabilita el scroll cuando el overlay está activo
        } else {
            enableScroll(); // Habilita el scroll cuando el overlay no está activo
        }
    });

    overlay.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        enableScroll(); // Habilita el scroll cuando se oculta el overlay
    });

    homeButton.addEventListener("click", (event) => {
        event.preventDefault();
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        enableScroll();
        ocultarCarrito();
    });

    carritoButton.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        enableScroll();
        mostrarCarrito();
    });

    productosButton.addEventListener("click", (event) => {
        event.preventDefault();
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        enableScroll();
        ocultarCarrito();
    });

    // Añadir evento a otros enlaces del menú para salir del carrito
    document.querySelectorAll("nav ul li a").forEach(link => {
        if (link.getAttribute("href") !== '#carrito') {
            link.addEventListener("click", () => {
                ocultarCarrito();
            });
        }
    });

    window.addEventListener("scroll", () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 170) {
            // Scroll hacia abajo
            header.style.top = "-210px"; // Oculta el header
        } else {
            // Scroll hacia arriba
            header.style.top = "0"; // Muestra el header
        }

        lastScrollTop = scrollTop;
    });

    //--------para los slider de las imagenes de promocion---------
    //-----------------------------------------------------------
        const slides = document.querySelector(".slides");
        let currentIndex = 0;
    
        function showNextSlide() {
            currentIndex = (currentIndex + 1) % slides.children.length;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    
        setInterval(showNextSlide, 5000); // Reducir la velocidad del slider a 5000 ms (5 segundos)
});
    




document.addEventListener("DOMContentLoaded", () => {
    cargarCarrito();  // Cargar carrito cuando la página esté lista

    // Verifica los elementos del DOM
    const carritoContainer = document.getElementById("carrito-container");
    const carritoTotal = document.getElementById("cart-total");
    const carritoVacio = document.getElementById("carrito-vacio");


    console.log("carritoContainer:", carritoContainer);
    console.log("carritoTotal:", carritoTotal);
    console.log("carritoVacio:", carritoVacio);

    if (!carritoContainer || !carritoTotal || !carritoVacio) {
        console.error("Uno o más elementos no existen en el DOM");
    } else {
        console.log("Todos los elementos se encontraron correctamente");
        renderCarrito(); // Llama a la función solo si todo está listo
    }
});

function updateCartCount() {
    const itemCount = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    cartCountElement.textContent = itemCount;
    cartCountElement.style.display = 'flex'; // Siempre visible
}

    // Función para renderizar el carrito
    function renderCarrito () {
        const carritoContainer = document.getElementById("carrito-container");
        const carritoTotal = document.getElementById("cart-total");
        const carritoVacio = document.getElementById("carrito-vacio");
        const cartCountElement = document.getElementById("cart-count");
        
    
        carritoContainer.innerHTML = '';  // Limpiar el contenido del carrito
        let total = 0;
        if(!carritoTotal){
            carritoTotal = document.getElementById("cart-total");
        }

        const itemCount = carrito.reduce((total, producto) => total + producto.cantidad, 0);
        cartCountElement.textContent = itemCount;
        if(cartCountElement){
            cartCountElement.style.display = itemCount != 0 ? 'block' : 'none'; // Siempre visible
        }
    
        // Iterar sobre los productos del carrito
        carrito.forEach(producto => {
            total += producto.precio * producto.cantidad;
    
            const productoDiv = document.createElement("div");
            productoDiv.className = "carrito-producto";
    
            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-imagen">
                <div class="carrito-detalles">
                    <p class="carrito-nombre">${producto.nombre}</p>
                    <p class="carrito-precio">Precio: $${producto.precio}</p>
                    <p class="carrito-cantidad">
                        Cantidad: 
                        <button class="carrito-cantidad" onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                        ${producto.cantidad}
                        <button class="carrito-cantidad" onclick="cambiarCantidad('${producto.id}', 1)">+</button>
                    </p>
                    <button class="eliminar-producto" onclick="eliminarDelCarrito('${producto.id}')">Eliminar</button>
                </div>
            `;
    
            carritoContainer.appendChild(productoDiv);
        });
    
        // Mostrar mensaje si el carrito está vacío
    if (carritoVacio) { // Verificar que el elemento existe
        carritoVacio.style.display = carrito.length === 0 ? 'block' : 'none';
    }
    
    carritoTotal.textContent = `$${total.toFixed(2)}`;

    
    }


// Función para cambiar la cantidad de un producto
function cambiarCantidad(id, change) {
    carrito = carrito.map(producto => {
        if (producto.id === id) {
            return { ...producto, cantidad: producto.cantidad + change };
        }
        return producto;
    }).filter(producto => producto.cantidad > 0);  // Eliminar productos con cantidad 0
    guardarCarrito();
    renderCarrito();
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    guardarCarrito();
    renderCarrito();
}

function agregarAlCarrito(nombre, precio, cantidadId, imagen, boton) {
    const cantidadElemento = document.getElementById(cantidadId);
    const cantidad = parseInt(cantidadElemento.textContent);
    const productoExistente = carrito.find(producto => producto.nombre === nombre);

    if (productoExistente) {
        cambiarCantidad(productoExistente.id, cantidad);
    } else {
        const nuevoProducto = {
            id: `${carrito.length + 1}`, // Generar un ID simple
            nombre,
            precio,
            imagen,
            cantidad
        };
        carrito.push(nuevoProducto);

        // Añadir animación al botón
        boton.classList.add('animacion-carrito');
        setTimeout(() => {
            boton.classList.remove('animacion-carrito');
        }, 500);

         // Guardar en localStorage después de añadir
        guardarCarrito();
        renderCarrito();
    }
}

function mostrarCarrito() {
    document.getElementById('productos').style.display = 'none';
    document.getElementById('carrito').style.display = 'block';
    document.querySelector(".slider").style.display = 'none';
}

function ocultarCarrito() {
    document.getElementById('carrito').style.display = 'none';
    document.getElementById('productos').style.display = 'block';
    document.querySelector(".slider").style.display = 'block';
}

// Funciones de incrementar y decrementar cantidad
function incrementar(id) {
    const cantidad = document.getElementById(id);
    cantidad.textContent = parseInt(cantidad.textContent) + 1;
}

function decrementar(id) {
    const cantidad = document.getElementById(id);
    if (parseInt(cantidad.textContent) > 1) {
        cantidad.textContent = parseInt(cantidad.textContent) - 1;
    }
}

// Guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar el carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        renderCarrito();
    }
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito(); // Limpiar localStorage
    renderCarrito();  // Actualizar la interfaz
}
