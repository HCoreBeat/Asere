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
    let lastScrollTop = 0;
    let currency = 'USD';

    // Deshabilitar scroll
    const disableScroll = () => {
        document.body.style.overflow = "hidden";
    };

    // Habilitar scroll
    const enableScroll = () => {
        document.body.style.overflow = "auto";
    };

    // Fetch de productos
    fetch('Json/productos.json')
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                const productoDiv = document.createElement("div");
                productoDiv.className = "producto";
                productoDiv.dataset.nombre = producto.nombre;
                productoDiv.dataset.categoria = producto.categoria;

                const descuento = producto.oferta ? `<p class="descuento" style="text-decoration: none;">-${producto.descuento}%</p>` : '';
                const pvpr = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${producto.pvpr}</s></p>` : '';
                const etiquetaOferta = producto.oferta ? '<span class="etiqueta oferta">Oferta</span>' : '';
                const etiquetaMasVendido = producto.mas_vendido ? '<div class="badge mas-vendido">Más Vendido</div>' : '';

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
                                <p class="precio"><span class="currency">US$</span>${producto.precio}</p>
                                ${pvpr}
                            </div>
                            ${descuento}
                            <div class="cantidad-carrito-contenedor">
                                <div class="cantidad">
                                    <button class="btn-cantidad" onclick="decrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">-</button>
                                    <span id="cantidad${producto.nombre.replace(/\s+/g, '')}">1</span>
                                    <button class="btn-cantidad" onclick="incrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">+</button>
                                </div>
                                <button class="btn-carrito">Añadir al carrito</button>
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
                });
            });

            // Filtrar productos en tiempo real
            searchInput.addEventListener("input", filterProducts);
            searchButton.addEventListener("click", filterProducts);

            function filterProducts() {
                const searchValue = searchInput.value.toLowerCase();

                productos.forEach(producto => {
                    const productName = producto.nombre.toLowerCase();
                    const productElement = document.querySelector(`.producto[data-nombre="${producto.nombre}"]`);
                    if (productName.includes(searchValue)) {
                        productElement.style.display = "block";
                    } else {
                        productElement.style.display = "none";
                    }
                });
            }
        });

    // Funcionalidad de cambio de moneda
    currencyOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('currency-option')) {
            currency = e.target.dataset.currency;
            currencyText.textContent = currency;
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
});

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
