
// Array para almacenar los productos del carrito
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const overlay = document.querySelector(".overlay");
    const homeButton = document.querySelector(".home-button");
    const header = document.querySelector("header");
    const currencyText = document.getElementById("currency-text");
    const currencyOptions = document.getElementById("currency-options");
    const toggleCurrencyButton = document.getElementById("toggle-currency");
    const carritoButton = document.querySelector("li a[href='#carrito']");
    const productosButton = document.querySelector("nav ul li a[href='#productos']");
    const progressBarContainer = document.getElementById("progress-bar-container");
    const progressBar = document.getElementById("progress-bar");

    let locales = {};
    let productos = [];
    let currentLang = 'es'; // Idioma por defecto

    let lastScrollTop = 0;
    let currency = 'USD';

    header.style.transition = "top 0.3s ease";
    
    // Mostrar la barra de progreso al comenzar a cargar
    progressBarContainer.style.display = "block";

    // Simular el progreso de carga (puedes personalizar según el comportamiento de tu página)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10; // Incrementa aleatoriamente
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            progressBar.style.width = "100%";

            // Ocultar la barra después de un breve momento
            setTimeout(() => {
                progressBarContainer.style.display = "none";
            }, 500);
        }
    }, 150);

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
        // Limpiar el contenedor de productos
        const productosContainer = document.getElementById("productos-container");
        while (productosContainer.firstChild) {
            productosContainer.removeChild(productosContainer.firstChild);
        }
    }

    // Función para actualizar los precios con el cálculo del precio total
    function actualizarPrecios(productos) {
        productos.forEach(producto => {
            if (producto.precio !== undefined) {
                const total = producto.precio * 0.23;
                producto.precio = +(producto.precio + total).toFixed(2); // Actualiza el precio con el total calculado
            }
        });
        return productos;
    }
    
    function renderProductos(lang) {
        limpiarProductosContainer(); // Limpiar productos actuales
    
        // Eliminar productos duplicados
        const productosUnicos = removeDuplicates(productos);
        const productosActualizados = actualizarPrecios(productosUnicos); // Actualizar precios
    
        console.log('Renderizando productos en idioma:', lang);
        console.log('Locales:', locales);
    
        // Crear el contenedor de productos más vendidos
        const masVendidosContainer = document.createElement("div");
        masVendidosContainer.className = "mas-vendidos-container"; // Clase para el contenedor de productos más vendidos
        const masVendidos = productosActualizados.filter(producto => producto.mas_vendido); // Filtrar los productos más vendidos
    
        // Crear un contenedor para los productos más vendidos
        masVendidos.forEach((producto, index) => {
            const productoDiv = document.createElement("div");
            productoDiv.className = "producto";
            productoDiv.dataset.nombre = producto.nombre;
            productoDiv.dataset.categoria = producto.categoria;
    
            let precio = producto.precio;
            let pvpr = producto.pvpr;
            let descuento = '';
    
            // Asegurarse de que el precio tenga dos decimales
            precio = precio.toFixed(2);
            if (producto.oferta) {
                pvpr = producto.precio;
                precio = (producto.precio - (producto.precio * (producto.descuento / 100))).toFixed(2);
                descuento = `<p class="descuento" style="text-decoration: none;">-${producto.descuento}%</p>`;
            }
    
            const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';
    
            const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">${locales[lang].productos.oferta}</span>` : '';
            const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">${locales[lang].productos.mas_vendido}</div>` : '';
    
            // Mostrar disponibilidad
            const disponibilidadHtml = producto.disponible
                ? `<div class="disponibilidad disponible">${locales[lang].productos.disponible}</div>`
                : `<div class="disponibilidad no-disponible">${locales[lang].productos.no_disponible}</div>`;
    
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
                        ${disponibilidadHtml} <!-- Agregar disponibilidad -->
                        <div class="cantidad-carrito-contenedor">
                            <div class="cantidad">
                                <button class="btn-cantidad" onclick="decrementar('cantidad-masvendido-${index}')">-</button>
                                <span id="cantidad-masvendido-${index}" class="cantidad-span">1</span>
                                <button class="btn-cantidad" onclick="incrementar('cantidad-masvendido-${index}')">+</button>
                            </div>
                            <button class="btn-carrito boton-agregarcarrito" onclick="agregarAlCarrito('${producto.nombre}', ${precio}, 'cantidad-masvendido-${index}', '${producto.imagen}', this)">${locales[lang].productos.agregar_al_carrito}</button>
                        </div>
                        <p class="nombre">${producto.nombre}</p>
                    </div>
                </div>
            `;
    
            // Ocultar botones y cantidad cuando el producto no está disponible
            const botonesCantidad = productoDiv.querySelector('.cantidad-carrito-contenedor');
            if (!producto.disponible) {
                botonesCantidad.style.display = "none"; // Ocultar los botones de cantidad y el botón "Agregar al carrito"
            }
    
            masVendidosContainer.appendChild(productoDiv);
        });
        
    
        const separadorContainer = document.createElement("div");
        separadorContainer.className = "separador-container";
        
        // Agregar la imagen al separador
        const separadorImg = document.createElement("img");
        separadorImg.src = "img/Pago_seguro.jpg"; // Cambia esto por la ruta de tu imagen
        separadorImg.alt = "Separador";
        separadorImg.className = "separador-img";
        
        separadorContainer.appendChild(separadorImg);


        // Crear el contenedor para los productos por categoría
        const categoriasContainer = document.createElement("div");
        categoriasContainer.className = "categorias-container"; // Clase para el contenedor de categorías

        // Agrupar productos por categorías
        const categorias = [...new Set(productosUnicos.map(producto => producto.categoria))];

        categorias.forEach((categoria, index) => {
            const categoriaDiv = document.createElement("div");
            categoriaDiv.className = "categoria";
            categoriaDiv.dataset.categoria = categoria;

            // Crear el título de la categoría
            const categoriaTitle = document.createElement("h2");
            categoriaTitle.textContent = categoria;
            categoriaDiv.appendChild(categoriaTitle);

            // Filtrar productos de esta categoría
            const productosCategoria = productosUnicos.filter(producto => producto.categoria === categoria);
            const categoriaProductosContainer = document.createElement("div");
            categoriaProductosContainer.className = "productos-categoria-container";

            let categoriaVisible = false; // Variable para saber si hay productos visibles en la categoría

            productosCategoria.forEach((producto, productoIndex) => {
                const productoDiv = document.createElement("div");
                productoDiv.className = "producto";
                productoDiv.dataset.nombre = producto.nombre;
                productoDiv.dataset.categoria = producto.categoria;

                let precio = producto.precio;
                let pvpr = producto.pvpr;
                let descuento = '';

                // Asegurarse de que el precio tenga dos decimales
                precio = precio.toFixed(2);
                if (producto.oferta) {
                    pvpr = producto.precio;
                    precio = (producto.precio - (producto.precio * (producto.descuento / 100))).toFixed(2);
                    descuento = `<p class="descuento" style="text-decoration: none;">-${producto.descuento}%</p>`;
                }

                const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

                const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">${locales[lang].productos.oferta}</span>` : '';
                const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">${locales[lang].productos.mas_vendido}</div>` : '';

                // Mostrar disponibilidad
                const disponibilidadHtml = producto.disponible
                    ? `<div class="disponibilidad disponible">${locales[lang].productos.disponible}</div>`
                    : `<div class="disponibilidad no-disponible">${locales[lang].productos.no_disponible}</div>`;

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
                            ${disponibilidadHtml} <!-- Agregar disponibilidad -->
                            <div class="cantidad-carrito-contenedor">
                                <div class="cantidad">
                                    <button class="btn-cantidad" onclick="decrementar('cantidad${producto.nombre.replace(/\s+/g, '-')}')">-</button>
                                    <span id="cantidad${producto.nombre.replace(/\s+/g, '-')}" class="cantidad-span">1</span>
                                    <button class="btn-cantidad" onclick="incrementar('cantidad${producto.nombre.replace(/\s+/g, '-')}')">+</button>
                                </div>
                                <button class="btn-carrito boton-agregarcarrito" onclick="agregarAlCarrito('${producto.nombre}', ${precio}, 'cantidad${producto.nombre.replace(/\s+/g, '-')}', '${producto.imagen}', this)">${locales[lang].productos.agregar_al_carrito}</button>
                            </div>
                            <p class="nombre">${producto.nombre}</p>
                        </div>
                    </div>
                `;

                // Ocultar productos que excedan el límite de 4 por categoría
                if (productoIndex >= 4) {
                    productoDiv.style.display = "none";
                }

                // Ocultar botones y cantidad cuando el producto no está disponible
                const botonesCantidad = productoDiv.querySelector('.cantidad-carrito-contenedor');
                if (!producto.disponible) {
                    botonesCantidad.style.display = "none"; // Ocultar los botones de cantidad y el botón "Agregar al carrito"
                }

                categoriaProductosContainer.appendChild(productoDiv);

                // Verificar si la categoría tiene productos visibles
                if (productoDiv.style.display !== "none") {
                    categoriaVisible = true;
                }

                // Agregar evento para abrir el modal cuando se hace clic en el producto, excluyendo los botones
                productoDiv.addEventListener("click", (e) => {
                    // Evitar que se active el modal si se hace clic en los botones
                    if (e.target.closest(".btn-cantidad") || e.target.closest(".btn-carrito")) return;

                    // Abrir modal
                    abrirModal(producto);
                });
            });

            // Si no hay productos visibles, ocultar la categoría
            if (!categoriaVisible) {
                categoriaDiv.style.display = "none";
            } else {
                categoriaDiv.appendChild(categoriaProductosContainer);
                categoriasContainer.appendChild(categoriaDiv);

                // Agregar un botón para cargar más productos si hay más de 4 productos
                if (productosCategoria.length > 4) {
                    const cargarMasBtn = document.createElement("button");
                    cargarMasBtn.textContent = "Cargar más";
                    cargarMasBtn.className = "btn-cargar-mas";
                    cargarMasBtn.addEventListener("click", () => {
                        productosCategoria.slice(4).forEach((producto, productoIndex) => {
                            const productoDiv = categoriaProductosContainer.children[productoIndex + 4];
                            productoDiv.style.display = "block";
                        });
                        cargarMasBtn.style.display = "none"; // Ocultar el botón después de mostrar todos los productos
                    });
                    categoriaDiv.appendChild(cargarMasBtn);
                }

                // Agregar un separador después de la primera categoría
                if (index === 0) {
                    const separadorExtraContainer = document.createElement("div");
                    separadorExtraContainer.className = "separador-container-extra";

                    const separadorExtraImg = document.createElement("img");
                    separadorExtraImg.src = "img/Separador_2.jpg"; // Cambia por la ruta de tu imagen extra
                    separadorExtraImg.alt = "Separador Extra";
                    separadorExtraImg.className = "separador-extra-img";

                    separadorExtraContainer.appendChild(separadorExtraImg);
                    categoriasContainer.appendChild(separadorExtraContainer);
                }
            }
        });
    
        // Insertar los contenedores en el DOM
        const productosContainer = document.getElementById("productos-container");
        productosContainer.appendChild(masVendidosContainer); // Insertar los más vendidos en la parte superior
        productosContainer.appendChild(separadorContainer); 
        productosContainer.appendChild(categoriasContainer); // Insertar los productos por categorías debajo
    

        // Ocultar botones de categoría que no tienen productos, excepto "all"
        const categoriaLinks = document.querySelectorAll(".categorias ul li a");
        categoriaLinks.forEach(link => {
            const category = link.getAttribute("data-categoria");
            const productos = document.querySelectorAll(`.producto[data-categoria='${category}']`);
            const hasVisibleProducts = Array.from(productos).some(producto => producto.style.display !== "none");

            if (category !== "all" && !hasVisibleProducts) {
                link.parentElement.style.display = "none"; // Ocultar el botón si no hay productos visibles y no es "all"
            } else {
                link.parentElement.style.display = "block"; // Mostrar el botón si hay productos o si es "all"
            }
        });


        // Mostrar/ocultar separadores según la categoría seleccionada
        document.querySelectorAll(".categorias ul li a").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const category = link.getAttribute("data-categoria");

                const separadorContainers = document.querySelectorAll(".separador-container, .separador-container-extra");
                separadorContainers.forEach(separador => {
                    separador.style.display = category === "all" ? "block" : "none";
                });
            });
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

                // Ocultar categorías vacías
                document.querySelectorAll(".categoria").forEach(categoriaDiv => {
                    const productosCategoria = categoriaDiv.querySelectorAll(".producto");
                    const categoriaVisible = Array.from(productosCategoria).some(producto => producto.style.display !== "none");
                
                    if (categoriaVisible) {
                        categoriaDiv.style.display = "block";
                    } else {
                        categoriaDiv.style.display = "none";
                    }
                });

                // Ocultar el carrito al seleccionar una categoría
                ocultarCarrito();

                // Mostrar u ocultar los botones "Cargar más" según la categoría seleccionada
                if (category === "all") {
                    document.querySelectorAll(".categoria").forEach(categoriaDiv => {
                        const productosCategoria = categoriaDiv.querySelectorAll(".producto");
                        productosCategoria.forEach((producto, productoIndex) => {
                            if (productoIndex >= 4) {
                                producto.style.display = "none";
                            } else {
                                producto.style.display = "block";
                            }
                        });
                    });

                    document.querySelectorAll(".btn-cargar-mas").forEach(btn => {
                        btn.style.display = "block";
                    });
                } else {
                    document.querySelectorAll(".btn-cargar-mas").forEach(btn => {
                        btn.style.display = "none";
                    });
                }
            });
        });

        // Mejorar la función de filtrado de productos
        const searchInput = document.getElementById("search-input");
        const searchButton = document.getElementById("search-button");

        // Filtrar productos en tiempo real
        searchInput.addEventListener("input", filterProducts);
        searchButton.addEventListener("click", filterProducts);

        function filterProducts() {
            const searchValue = searchInput.value.trim().toLowerCase();

            //-----Ocultar los separadores cuando se está buscando algo-----
            //--------------------------------------------------------------
            const separadorContainers = document.querySelectorAll(".separador-container, .separador-container-extra");
            separadorContainers.forEach(separador => {
                separador.style.display = searchValue === "" ? "block" : "none";
            });

            // Mostrar todos los productos si el campo de búsqueda está vacío
            if (searchValue === "") {
                mostrarTodosLosProductos();
                return;
            }

            let foundProducts = false;

            document.querySelectorAll(".producto").forEach(producto => {
                const productName = producto.dataset.nombre.toLowerCase();
                const productCategoria = producto.dataset.categoria.toLowerCase();

                const matchesSearch = productName.includes(searchValue) || productCategoria.includes(searchValue);

                if (matchesSearch) {
                    producto.style.display = "block";
                    foundProducts = true;
                } else {
                    producto.style.display = "none";
                }
            });

            // Ocultar categorías vacías
            document.querySelectorAll(".categoria").forEach(categoriaDiv => {
                const productosCategoria = categoriaDiv.querySelectorAll(".producto");
                const categoriaVisible = Array.from(productosCategoria).some(producto => producto.style.display !== "none");

                if (categoriaVisible) {
                    categoriaDiv.style.display = "block";
                } else {
                    categoriaDiv.style.display = "none";
                }
            });

            // Ocultar productos más vendidos que no coinciden con la búsqueda
            if (!foundProducts) {
                masVendidosContainer.style.display = "none";
            } else {
                masVendidosContainer.style.display = "flex";
            }

            // Mostrar u ocultar el mensaje de "No se encontraron resultados"
            const noResultMessage = document.getElementById("no-result-message");
            if (!foundProducts && searchValue !== "") {
                noResultMessage.classList.remove("hidden"); // Mostrar el mensaje
                noResultMessage.style.display = "block"; // Asegurarse de que se vea
                noResultMessage.style.marginTop = (120)+'px';
            } else {
                noResultMessage.classList.add("hidden"); // Ocultar el mensaje
                noResultMessage.style.display = "none"; // Asegurarse de que no se vea
            }

            // Ocultar botones "Cargar más" al buscar
            document.querySelectorAll(".btn-cargar-mas").forEach(btn => {
                btn.style.display = "none";
            });
        }

        function mostrarTodosLosProductos() {
            document.querySelectorAll(".producto").forEach(producto => {
                producto.style.display = "block";  // Mostrar todos los productos
            });

            // Asegúrate de que las categorías y los más vendidos también se muestren si no hay filtros activos
            document.querySelectorAll(".categoria").forEach(categoriaDiv => {
                categoriaDiv.style.display = "block";
            });
            
            masVendidosContainer.style.display = "flex";  // Mostrar productos más vendidos si no hay filtro de búsqueda
            
            // Eliminar botones "Cargar más" cuando se muestran todos los productos
            document.querySelectorAll(".btn-cargar-mas").forEach(btn => {
                btn.style.display = "none";
            });

            // Volver a configurar la visualización de 4 productos por categoría con el botón "Cargar más" al seleccionar "all"
            document.querySelectorAll(".categoria").forEach(categoriaDiv => {
                const productosCategoria = categoriaDiv.querySelectorAll(".producto");
                productosCategoria.forEach((producto, productoIndex) => {
                    if (productoIndex >= 4) {
                        producto.style.display = "none";
                    } else {
                        producto.style.display = "block";
                    }
                });

                if (productosCategoria.length > 4) {
                    const cargarMasBtn = categoriaDiv.querySelector(".btn-cargar-mas");
                    if (cargarMasBtn) {
                        cargarMasBtn.style.display = "block";
                    }
                }
            });
        }

        
    }

    
    function abrirModal(producto) {
        // Obtener el modal y el contenedor de la información
        const modal = document.getElementById("product-modal");
        const modalInfo = document.getElementById("modal-product-info");

        // Llenar el modal con la información del producto
        modalInfo.innerHTML = `
            <h2>${producto.nombre}</h2>
            <img src="${producto.imagen} " alt="${producto.nombre}" class="modal-img">
            <p><strong>Precio:</strong> US$${producto.precio}</p>
            <p><strong>Categoría:</strong> ${producto.categoria}</p>
            <p><strong>Disponibilidad:</strong> ${producto.disponible ? "Disponible" : "No disponible"}</p>
        `;

        // Mostrar el modal
        modal.style.display = "block";
        disableScroll();

        // Agregar evento para cerrar el modal
        const closeBtn = modal.querySelector(".close-btn");
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none"; // Cerrar modal
            enableScroll();
        });

        // Cerrar modal cuando se haga clic fuera del contenido
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none"; // Cerrar modal
                enableScroll();
            }
        });
    }

    // Fetch de traducciones
    fetch("Json/lang.json")
    .then(response => response.json())
    .then(data => {
        locales = data;

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
                document.getElementById('planilla-pago').classList.add('hidden');
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

// Función para vaciar el carrito
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    renderCarrito();
}

    // Función para renderizar el carrito
    function renderCarrito () {
        const carritoContainer = document.getElementById("carrito-container");
        const carritoTotal = document.getElementById("cart-total");
        const carritoVacio = document.getElementById("carrito-vacio");
        const cartCountElement = document.getElementById("cart-count");
        const checkoutButton = document.getElementById("checkout-button");
        
    
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
                <div class="carrito-item">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-imagen">

                <div class="carrito-detalles">
                    <p class="carrito-nombre">${producto.nombre}</p>
                    <p class="carrito-precio">Precio: $${producto.precio}</p>
                    <div class="carrito-cantidad">
                        <button onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                        <span>${producto.cantidad}</span>
                        <button onclick="cambiarCantidad('${producto.id}', 1)">+</button>
                    </div>
                </div>

                <button class="eliminar-producto" onclick="eliminarDelCarrito('${producto.id}')">Eliminar</button>
            </div>
            `;
    
            carritoContainer.appendChild(productoDiv);
            
        });
    
        // Mostrar mensaje si el carrito está vacío
    if (carritoVacio) { // Verificar que el elemento existe
        carritoVacio.style.display = carrito.length === 0 ? 'block' : 'none';
        checkoutButton.style.display = carrito.length === 0? 'none' : 'block';
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
    document.getElementById('planilla-pago').classList.add('hidden');
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

// funsion para los afiliados
// Función para obtener el parámetro de referencia de la URL
function getRefParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

// Función para cargar el archivo JSON y verificar si el afiliado existe
async function verifyAffiliate(ref) {
    try {
        const response = await fetch('Json/afiliados.json');
        const affiliates = await response.json();
        const affiliate = affiliates.find(affiliate => affiliate.id === ref);
        return affiliate ? affiliate : null;
    } catch (error) {
        console.error('Error al cargar el archivo JSON', error);
        return null;
    }
}

// Función principal para manejar la lógica de afiliados
async function handleAffiliate() {
    const ref = getRefParameter();
    const affiliateMessage = document.getElementById('affiliate-message');
    
    if (ref) {
        const affiliate = await verifyAffiliate(ref);
        if (affiliate) {
            localStorage.setItem('affiliateRef', ref);
            localStorage.setItem('affiliateName', affiliate.nombre);
            console.log("Afiliado:" + affiliate.nombre);
            affiliateMessage.textContent = `Gracias por venir a través de uno de nuestros afiliados!`;
        } else {
            console.warn(`El afiliado con ID ${ref} no es válido.`);
            affiliateMessage.textContent = `¡Bienvenido a Asere Online Shop!`;
        }
    } else {
        affiliateMessage.textContent = `¡Bienvenido a Asere Online Shop!`;
    }
}

// Ejecutar la función principal
handleAffiliate();


// Función para generar copos de nieve
const createSnowflake = () => {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '&#10052;';
    snowflake.style.left = `${Math.random() * document.getElementById('snowflakes-container').offsetWidth}px`;
    
    const duration = Math.random() * 3 + 2; // Duración entre 2 y 5 segundos
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.fontSize = `${Math.random() * 1 + 0.5}em`;

    document.getElementById('snowflakes-container').appendChild(snowflake);

    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
};

setInterval(createSnowflake, 100);

//----Para el gif basado en imagens para mantener transparencia y mas profesional---
const frames = ['img/N2.png','img/N3.png','img/N4.png','img/N5.png','img/N6.png','img/N7.png','img/N8.png',
'img/N8.png','img/N7.png','img/N6.png','img/N5.png','img/N4.png','img/N3.png','img/N2.png'
]; // Rutas de las imágenes
    let currentFrame = 0;

    const gifContainer = document.getElementById('gif-slogan');

    setInterval(() => {
        currentFrame = (currentFrame + 1) % frames.length; // Cicla entre los frames
        gifContainer.src = frames[currentFrame];
 }, 100); // Cambia cada 250 ms (ajusta la velocidad según tus necesidades)

 window.onload = function() {
    //------------Whatsapp----------
    const whatsappButton = document.getElementById("whatsapp-button");
    whatsappButton.style.opacity = 0;
    whatsappButton.style.transform = "translateY(20px)";
    setTimeout(() => {
      whatsappButton.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      whatsappButton.style.opacity = 1;
      whatsappButton.style.transform = "translateY(0)";
    }, 500);
  };


  //------------------------Ajuste de imagen del slider------------------------
  //----------------------------------------------------------------------------
  function adjustImages() {
    if (window.innerWidth <= 720) {
        document.querySelectorAll('.img-pc').forEach(img => img.style.display = 'none');
        document.querySelectorAll('.img-mobile').forEach(img => img.style.display = 'block');
    } else {
        document.querySelectorAll('.img-pc').forEach(img => img.style.display = 'block');
        document.querySelectorAll('.img-mobile').forEach(img => img.style.display = 'none');
    }
}

// Ajustar imágenes al cargar la página
adjustImages();

// Ajustar imágenes al redimensionar la ventana
window.addEventListener('resize', adjustImages);
