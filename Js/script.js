
// Array para almacenar los productos del carrito
let carrito = [];
let productos = [];
let combos = [];
let productoActual = null; // Variable global para almacenar el producto actual
let totalImagenes = 0; // Variable global para almacenar el total de imágenes
// para definir si el panel electrodomesticos esta abierto o no
let panelElectrodomesticosAbierto = false; // Variable para guardar el estado del panel


document.addEventListener("DOMContentLoaded", () => {
    
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const overlay = document.querySelector(".overlay");
    const homeButton = document.querySelector(".home-button");
    const header = document.querySelector("header");
    const carritoButton = document.querySelector("li a[href='#carrito']");
    const productosButton = document.querySelector("nav ul li a[href='#productos']");
    const progressBarContainer = document.getElementById("progress-bar-container");
    const progressBar = document.getElementById("progress-bar");


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


        cargarCarrito();  // Cargar carrito cuando la página esté lista

        // Verifica los elementos del DOM
        const carritoContainer = document.getElementById("carrito-container");
        const carritoTotal = document.getElementById("cart-total");
        const carritoVacio = document.getElementById("carrito-vacio");
    
    
        if (!carritoContainer || !carritoTotal || !carritoVacio) {
            console.error("Uno o más elementos no existen en el DOM");
        } else {
            //console.log("Todos los elementos se encontraron correctamente");
            renderCarrito(); // Llama a la función solo si todo está listo
        }
    
});
// Función para buscar un producto por nombre normalizado
function buscarProductoPorNombre(nombre) {
    if (!nombre) return null;
    
    // Normalización más completa
    const normalizar = (str) => {
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina acentos
            .replace(/[^a-z0-9]+/g, ' ') // Reemplaza caracteres especiales por espacios
            .trim()
            .replace(/\s+/g, ' '); // Multiples espacios por uno solo
    };

    const nombreBuscado = normalizar(nombre);
    let mejorCoincidencia = null;
    let mejorPuntaje = 0;

    // Buscar en productos normales y combos
    [...productos, ...combos].forEach(item => {
        const nombreItem = normalizar(item.nombre);
        
        // Coincidencia exacta
        if (nombreItem === nombreBuscado) {
            mejorCoincidencia = item;
            return;
        }
        
        // Coincidencia parcial (solo si no hay exacta)
        if (!mejorCoincidencia) {
            const palabrasBuscadas = nombreBuscado.split(' ');
            const palabrasItem = nombreItem.split(' ');
            const puntaje = palabrasBuscadas.filter(p => 
                palabrasItem.includes(p)
            ).length;
            
            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejorCoincidencia = item;
            }
        }
    });

    return mejorCoincidencia;
}

// Función para manejar parámetros de URL al cargar
function manejarParametrosURL() {
    const urlParts = window.location.href.split('?');
    const queryString = urlParts.length > 1 ? urlParts[1] : '';
    const urlParams = new URLSearchParams(queryString);
    
    const productoParam = urlParams.get('producto');
    const refParam = urlParams.get('ref');
    
    if (refParam) {
        const cleanRef = refParam.split('?')[0].split('&')[0];
        handleAffiliate(cleanRef);
    }
    
    // Luego manejar el producto
    if (productoParam) {
        const producto = buscarProductoPorNombre(productoParam);
        if (producto) {
            mostrarDetallesProducto(producto);
        } else {
            console.warn(`Producto no encontrado: ${productoParam}`);
            mostrarMensajeNoDisponible();
            // Redirigir después de 3 segundos si el producto no existe
            setTimeout(() => {
                // Mantener el parámetro ref si existe con el formato /?ref=
                const newUrl = refParam 
                    ? `${window.location.pathname}/?ref=${refParam}`
                    : window.location.pathname;
                window.location.href = newUrl;
            }, 3000);
        }
    }
}
// Función para normalizar nombres (eliminar caracteres especiales y convertir a minúsculas)
function normalizarNombre(nombre) {
    return nombre
        .toLowerCase() // Convertir a minúsculas
        .replace(/[^a-z0-9]+/g, ' ') // Reemplazar caracteres especiales con espacios
        .trim(); // Eliminar espacios al inicio y al final
}

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
            const total = producto.precio * 0.05;
            producto.precio = +(producto.precio + total).toFixed(2); // Actualiza el precio con el total calculado
        }
    });
    return productos;
}
function renderProductos() {
    limpiarProductosContainer(); // Limpiar productos actuales

    // Combinar productos y combos en un solo array
    const productosYCombos = [...productos, ...combos]; 
    // Eliminar productos duplicados
    const productosUnicos = removeDuplicates(productosYCombos);
    // Filtrar productos disponibles
    const productosDisponibles = productosUnicos.filter(producto => 
        producto.disponible && producto.categoria !== "combos" && producto.categoria !== "electrodomesticos"
    );
    // Crear el contenedor de productos más vendidos
    const masVendidosContainer = document.createElement("div");
    masVendidosContainer.className = "mas-vendidos-container"; // Clase para el contenedor de productos más vendidos
    const masVendidos = productosDisponibles.filter(producto => producto.mas_vendido); // Filtrar los productos más vendidos

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

        const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">Oferta</span>` : '';
        const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">Más Vendido</div>` : '';

        // Mostrar disponibilidad
        const disponibilidadHtml = producto.disponible
            ? `<div class="disponibilidad disponible">Disponible</div>`
            : `<div class="disponibilidad no-disponible">No Disponible</div>`;

        productoDiv.innerHTML = `
            <div class="producto-contenedor">
            <p class="nombre">${producto.nombre}</p>
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
                </div>
            </div>
        `;

        // Agregar evento para abrir el modal cuando se hace clic en el producto, excluyendo los botones
        productoDiv.addEventListener('click', (e) => {
            if (e.target.closest(".btn-cantidad") || e.target.closest(".btn-carrito")) return;
        
            mostrarDetallesProducto(producto);
        });

        // Ocultar botones y cantidad cuando el producto no está disponible
        const botonesCantidad = productoDiv.querySelector('.cantidad-carrito-contenedor');
        if (!producto.disponible) {
            botonesCantidad.style.display = "none"; // Ocultar los botones de cantidad y el botón "Agregar al carrito"
        }

        masVendidosContainer.appendChild(productoDiv);
    });
    
    // Crear el panel cuadrado para electrodomésticos
    const botonElectrodomesticos = document.createElement("div"); // Definir la variable aquí
    botonElectrodomesticos.className = "panel-categoria";
    botonElectrodomesticos.innerHTML = `
        <p>Tecnologia</p>
        <img src="img/tecnologia.jpg" alt="Tecnologia">
        <p id="texto-comprar-ahora">Comprar ahora</p>
    `;

    // Añadir evento para abrir el panel de electrodomésticos
    botonElectrodomesticos.addEventListener("click", () => {
        mostrarPanelElectrodomesticos();
    });

   // Insertar el botón en el contenedor de productos
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
    const categorias = [...new Set(productosDisponibles.map(producto => producto.categoria))];

    categorias.forEach((categoria, index) => {
        const categoriaDiv = document.createElement("div");
        categoriaDiv.className = "categoria";
        categoriaDiv.dataset.categoria = categoria;

        // Crear el título de la categoría
        const categoriaTitle = document.createElement("h2");
        categoriaTitle.textContent = categoria;
        categoriaDiv.appendChild(categoriaTitle);

        // Filtrar productos de esta categoría
        const productosCategoria = productosDisponibles.filter(producto => producto.categoria === categoria);
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
                descuento = `<p class="descuento" style="text-decoration: none;">-${producto.descuento.toFixed()}%</p>`;
            }

            const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

            const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">Oferta</span>` : '';
            const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">Más Vendido</div>` : '';

            // Mostrar disponibilidad
            const disponibilidadHtml = producto.disponible
                ? `<div class="disponibilidad disponible">Disponible</div>`
                : `<div class="disponibilidad no-disponible">No Disponible</div>`;

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
                            <button class="btn-carrito boton-agregarcarrito" onclick="agregarAlCarrito('${producto.nombre}', ${precio}, 'cantidad${producto.nombre.replace(/\s+/g, '-')}', '${producto.imagen}', this)">Añadir al Carrito</button>
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
            productoDiv.addEventListener('click', (e) => {
                if (e.target.closest(".btn-cantidad") || e.target.closest(".btn-carrito")) return;
            
                mostrarDetallesProducto(producto);
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

    // Contenedor para los combos
    const combosContainer = document.createElement("div");
    combosContainer.className = "combos-container"; // Clase para el contenedor de combos

    const combosTitle = document.createElement("h2");
    combosTitle.textContent = "Packs Especiales"; // nombre del contenedor de los packs
    combosTitle.style.textAlign = 'center';
    combosTitle.style.marginBottom = '20px';
    combosContainer.appendChild(combosTitle);

    const comboSlider = document.createElement("div");
    comboSlider.className = "combo-slider"; // Clase para el slider vertical u horizontal
    combosContainer.appendChild(comboSlider);

    const sliderIndicator = document.createElement("div");
    sliderIndicator.className = "slider-indicator"; // Indicador de deslizamiento
    combosContainer.appendChild(sliderIndicator);

    const updateIndicatorDirection = () => {
        if (window.innerWidth <= 768) {
            sliderIndicator.classList.remove("vertical");
            sliderIndicator.classList.add("horizontal");
        } else {
            sliderIndicator.classList.remove("horizontal");
            sliderIndicator.classList.add("vertical");
        }
    };

    // Llamar a la función de actualización de la dirección del indicador en el cambio de tamaño de la ventana
    window.addEventListener('resize', updateIndicatorDirection);
    updateIndicatorDirection(); // Llamar a la función en la carga inicial de la página

    const combosDisponibles = combos.filter(combos => combos.disponible);

    combosDisponibles.forEach((combo, comboIndex) => {
        const comboDiv = document.createElement("div");
        comboDiv.className = "combo";
        comboDiv.dataset.nombre = combo.nombre;
        comboDiv.dataset.categoria = combo.categoria;

        let precio = combo.precio.toFixed(2);
        
        //aqui agregamos los cambios para cuando hay algun evento en especifico
        if(combo.categoria === "febrero")
        {
            console.log("Hay Eventos agregados")
        // estructura del combo personalizado por evento
        comboDiv.innerHTML = `
        <div class="combo-contenedor-evento">
            <div class="combo-img">
                <img src="${combo.imagen}" alt="${combo.nombre}">
            </div>
            <div class="combo-info">
                <p class="nombre">${combo.nombre} 💘</p>
                <div class="productos">
                    ${combo.productos.map(producto => `<div class="producto-item">${producto} ❤️</div>`).join('')}
                </div>
                <p class="precio"><span class="currency">US$</span>${precio}</p>
                <div class="cantidad-carrito-contenedor">
                    <div class="cantidad">
                        <button class="btn-cantidad" onclick="decrementar('cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}')">-</button>
                        <span id="cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}">1</span>
                        <button class="btn-cantidad" onclick="incrementar('cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}')">+</button>
                    </div>
                    <button class="btn-carrito boton-agregarcarrito" 
                        onclick="agregarAlCarrito('${combo.nombre}', ${combo.precio}, 
                        'cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}',
                        '${combo.imagen}', this, [${combo.productos.map(producto => `'${producto}'`).join(', ')}])">
                        Añadir al Carrito 💝
                    </button>
                </div>
            </div>
        </div>
    `;
        }
        else
        {
        // Estructura del combo
        comboDiv.innerHTML = `
        <div class="combo-contenedor">
            <div class="combo-img">
                <img src="${combo.imagen}" alt="${combo.nombre}">
            </div>
            <div class="combo-info">
                <p class="nombre">${combo.nombre}</p>
                <div class="productos">
                    ${combo.productos.map(producto => `<div class="producto-item">${producto}</div>`).join('')}
                </div>
                <p class="precio"><span class="currency">US$</span>${precio}</p>
                <div class="cantidad-carrito-contenedor">
                    <div class="cantidad">
                        <button class="btn-cantidad" onclick="decrementar('cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}')">-</button>
                        <span id="cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}">1</span>
                        <button class="btn-cantidad" onclick="incrementar('cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}')">+</button>
                    </div>
                    <button class="btn-carrito boton-agregarcarrito" 
                        onclick="agregarAlCarrito('${combo.nombre}', ${combo.precio}, 
                        'cantidadCombo-${combo.nombre.replace(/\s+/g, '-')}',
                        '${combo.imagen}', this, [${combo.productos.map(producto => `'${producto}'`).join(', ')}])">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
        }

        comboSlider.appendChild(comboDiv);
    });

    // Añadir el contenedor principal al cuerpo del documento
    document.body.appendChild(combosContainer);

    // define el orden en que se crean en el doom
    // Insertar los contenedores en el DOM
    const productosContainer = document.getElementById("productos-container");
    productosContainer.appendChild(masVendidosContainer); // Insertar los más vendidos en la parte superior
    productosContainer.appendChild(combosContainer);     // Insertar los combos
    productosContainer.appendChild(botonElectrodomesticos);
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

            // Ocultar el panel de electrodomésticos
            const panelElectrodomesticos = document.getElementById("panel-electrodomesticos");
            if (panelElectrodomesticos) {
                panelElectrodomesticos.style.display = "none";
            }

            // Ocultar el panel-categoria
            const panelCategoria = document.querySelector(".panel-categoria");
            if (panelCategoria) {
                panelCategoria.style.display = "none";
            }
            

            //mostrar o ocultar los separadores
            const separadorContainers = document.querySelectorAll(".separador-container, .separador-container-extra");
            separadorContainers.forEach(separador => {
                separador.style.display = category === "all" ? "block" : "none";
            });

            // Filtrar productos por categoría
            // Ocultar el detalle del producto cuando se selecciona una categoría
            document.getElementById("detalle-producto").style.display = "none";

            // Limpiar la barra de búsqueda
            const searchInput = document.getElementById("search-input");
            searchInput.value = ""; // Vaciar el campo de búsqueda

            // Ocultar el mensaje de "No se encontraron resultados"
            const noResultMessage = document.getElementById("no-result-message");
            if (noResultMessage) noResultMessage.style.display = "none";

            // Opcional: si tienes secciones como "más vendidos", puedes asegurarte de que también se muestren.
            const masVendidosContainer = document.querySelector(".mas-vendidos-container");
            if (masVendidosContainer) masVendidosContainer.style.display = "flex";

            document.querySelectorAll(".producto, .combos-container").forEach(producto => {
                if ((category === "ofertas" && producto.dataset.categoria !== "ofertas" && !producto.querySelector('.etiqueta.oferta')) ||
                    (producto.getAttribute("data-categoria") !== category && category !== "all" && producto.getAttribute("data-categoria") === "combos")) {
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

                // mostrar el panel de categoria cuando se presiona la categoria all
                panelCategoria.style.display = "flex";

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
        const selectedCategory = document.querySelector(".categorias ul li a.selected")?.getAttribute("data-categoria");
    
        // Ocultar el panel de electrodomésticos si está visible
        const panelElectrodomesticos = document.getElementById("panel-electrodomesticos");
        if (panelElectrodomesticos) {
            panelElectrodomesticos.style.display = "none";
        }
        const panelCategoria = document.querySelector(".panel-categoria");
        if (panelCategoria) {
            panelCategoria.style.display = "none";
        }

        // Ocultar el detalle del producto cuando se busca o se selecciona una categoría
        document.getElementById("detalle-producto").style.display = "none";
        document.getElementById("productos").style.display = "block";
        let slider = document.querySelector(".slider");
        if (slider) {
            slider.style.display = "block";
        }

        // Ocultar los separadores cuando se está buscando algo
        const separadorContainers = document.querySelectorAll(".separador-container, .separador-container-extra");
        separadorContainers.forEach(separador => {
            separador.style.display = searchValue === "" ? "block" : "none";
        });
    
        // Mostrar todos los productos si el campo de búsqueda está vacío y la categoría seleccionada es "All"
        if (searchValue === "" && (selectedCategory === "all" || !selectedCategory)) {
            mostrarTodosLosProductos();
            combosContainer.style.display = "block"; // Mostrar el contenedor de combos cuando la búsqueda está vacía
            // mostrar el panel de categoria cuando se presiona la categoria all
            panelCategoria.style.display = "flex";
            return;
        }
    
        let foundProducts = false;
        let foundCombos = false;
    
        document.querySelectorAll(".producto, .combo").forEach(item => {
            const productName = item.dataset.nombre ? item.dataset.nombre.toLowerCase() : '';
            const productCategoria = item.dataset.categoria ? item.dataset.categoria.toLowerCase() : '';
    
            const matchesSearch = productName.includes(searchValue) || productCategoria.includes(searchValue);
    
            if (matchesSearch && (selectedCategory === "all" || !selectedCategory || (productCategoria !== "combos" || (productCategoria === "combos" && searchValue.includes("combo"))))) {
                item.style.display = "block";
                foundProducts = true;
                if (item.classList.contains("combo")) {
                    foundCombos = true;
                }
            } else {
                item.style.display = "none";
            }
        });
    
        // Ocultar el contenedor de combos si no hay combos visibles
        combosContainer.style.display = foundCombos ? "block" : "none";
    
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
        const masVendidosContainer = document.querySelector(".mas-vendidos-container");
        if (masVendidosContainer) {
            masVendidosContainer.style.display = foundProducts ? "flex" : "none";
        }
    
        // Mostrar u ocultar el mensaje de "No se encontraron resultados"
        const noResultMessage = document.getElementById("no-result-message");
        if (!foundProducts && searchValue !== "") {
            noResultMessage.classList.remove("hidden"); // Mostrar el mensaje
            noResultMessage.style.display = "block"; // Asegurarse de que se vea
            noResultMessage.style.marginTop = '120px';
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
        
        const masVendidosContainer = document.querySelector(".mas-vendidos-container");
        if (masVendidosContainer) {
            masVendidosContainer.style.display = "flex";  // Mostrar productos más vendidos si no hay filtro de búsqueda
        }
    
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
    
        // Mostrar el contenedor de combos cuando se muestran todos los productos
        combosContainer.style.display = "block";
    }
    
}
// Cargar productos y combos
Promise.all([
    fetch('Json/productos.json').then(response => response.json()),
    fetch('Json/combos.json').then(response => response.json())
])
.then(([productosData, combosData]) => {
    productos = productosData;
    combos = combosData;

    productos = actualizarPrecios(productosData);
    combos = actualizarPrecios(combosData);

    // Verificar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoParam = urlParams.get('producto');

    if (productoParam) {
        const producto = buscarProductoPorNombre(productoParam);
        if (producto) {
            mostrarDetallesProducto(producto);
        }
    }

    // Verificar si la URL contiene un producto
    const hash = window.location.hash;
    if (hash.startsWith("#producto-")) {
        const nombreProductoAmigable = hash.replace("#producto-", "");

        // Normalizar el nombre del producto en la URL
        const nombreProductoNormalizado = normalizarNombre(nombreProductoAmigable);

        // Buscar el producto por nombre normalizado
        const producto = buscarProductoPorNombre(nombreProductoNormalizado);

        if (producto) {
            // Mostrar el panel de detalles
            document.getElementById("productos").style.display = "none"; // Ocultar productos
            document.getElementById("detalle-producto").style.display = "block"; // Mostrar detalles

            // Cargar los datos del producto en el panel de detalles
            mostrarDetallesProducto(producto);
        } else {
            console.warn("Producto no encontrado:", nombreProductoNormalizado);
            // Mostrar el mensaje de "Producto no disponible"
            mostrarMensajeNoDisponible();
        }
    }
    renderProductos();
    cargarCarrito();
})
.catch(error => {
    console.error('Error cargando datos:', error);
    manejarParametrosURL(); // Intentar manejar parámetros igualmente
});
// fusion para mostrara el mensaje no disponible para el producto que se busca por la url
function mostrarMensajeNoDisponible() {
    const mensaje = document.getElementById("producto-no-disponible");
    if (mensaje) {
        // Mostrar el mensaje con animación
        mensaje.style.display = "block";
        mensaje.style.animation = "fadeIn 0.5s ease-in-out";

        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            mensaje.style.animation = "fadeOut 0.5s ease-in-out";
            setTimeout(() => {
                mensaje.style.display = "none";
            }, 500); // Tiempo de la animación de fadeOut
        }, 5000); // Tiempo que el mensaje estará visible
    }
}
    
function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (!cartCountElement) return;
    
    // Calcular solo productos disponibles
    const itemCount = carrito.reduce((total, producto) => {
        const productoEnDB = (productos && productos.find(p => p.nombre === producto.nombre)) || 
                           (combos && combos.find(c => c.nombre === producto.nombre));
        const disponible = productoEnDB ? productoEnDB.disponible : false;
        return disponible ? total + producto.cantidad : total;
    }, 0);

    cartCountElement.textContent = itemCount;
    cartCountElement.style.display = itemCount > 0 ? 'flex' : 'none';
}

// Función para vaciar el carrito
function vaciarCarrito() {
    // Obtener productos no disponibles para mantenerlos
    const productosNoDisponibles = carrito.filter(producto => {
        const productoEnDB = productos.find(p => p.nombre === producto.nombre) || 
                            combos.find(c => c.nombre === producto.nombre);
        return productoEnDB ? !productoEnDB.disponible : false;
    });

    // Guardar solo los no disponibles
    carrito = productosNoDisponibles;
    guardarCarrito();
    
    // Actualizar la interfaz
    renderCarrito();
}

// Función para renderizar el carrito
function renderCarrito() {
    const carritoContainer = document.getElementById("carrito-container");
    const carritoTotal = document.getElementById("cart-total");
    const carritoVacio = document.getElementById("carrito-vacio");
    const cartCountElement = document.getElementById("cart-count");
    const checkoutButton = document.getElementById("checkout-button");

    carritoContainer.innerHTML = ''; // Limpiar el contenido del carrito
    let totalDisponible = 0;

    // Separar productos disponibles y no disponibles
    const [disponibles, noDisponibles] = carrito.reduce(([disp, noDisp], producto) => {
        // Buscar en productos y combos (asegurándonos de que combos esté definido)
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

    // Mostrar contador de productos (solo disponibles)
    if (cartCountElement) {
        cartCountElement.textContent = disponibles.reduce((total, p) => total + p.cantidad, 0);
        cartCountElement.style.display = cartCountElement.textContent === '0' ? 'none' : 'block';
    }

    // Crear sección de productos disponibles
    if (disponibles.length > 0) {
        const disponiblesSection = document.createElement('div');
        disponiblesSection.className = 'carrito-section';
        disponiblesSection.innerHTML = '<h3>Productos Disponibles</h3>';
        
        disponibles.forEach(producto => {
            disponiblesSection.appendChild(crearItemCarrito(producto, true));
        });
        
        carritoContainer.appendChild(disponiblesSection);
    }

    // Crear sección de productos no disponibles
    if (noDisponibles.length > 0) {
        const noDisponiblesSection = document.createElement('div');
        noDisponiblesSection.className = 'carrito-section no-disponibles';
        noDisponiblesSection.innerHTML = '<h3>Productos No Disponibles</h3>';
        
        noDisponibles.forEach(producto => {
            noDisponiblesSection.appendChild(crearItemCarrito(producto, false));
        });
        
        carritoContainer.appendChild(noDisponiblesSection);
    }

    // Mostrar mensaje si el carrito está vacío
    if (carritoVacio) {
        carritoVacio.style.display = carrito.length === 0 ? 'block' : 'none';
        checkoutButton.style.display = disponibles.length === 0 ? 'none' : 'block';
    }

    // Mostrar el total solo de productos disponibles
    carritoTotal.textContent = `$${totalDisponible.toFixed(2)}`;
}

// Función auxiliar para crear items del carrito (actualizada para ocultar cantidad)
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
        // Ocultamos completamente el contador de cantidad para no disponibles
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


function agregarAlCarrito(nombre, precio, cantidadId, imagen, boton, productosCombo = []) {
    console.log('cantidadId recibido:', cantidadId); // Depuración
    const cantidadElemento = document.getElementById(cantidadId);
    if (!cantidadElemento) {
        console.error(`El elemento con id "${cantidadId}" no se encontró en el DOM.`);
        return; // Salir de la función si el elemento no existe
    }
    const cantidad = parseInt(cantidadElemento.textContent);
    const productoExistente = carrito.find(producto => producto.nombre === nombre);
 
    // Buscar el producto en la base de datos para obtener la imagen principal
    const productoEnDB = productos.find(p => p.nombre === nombre) || combos.find(c => c.nombre === nombre);
    const imagenPrincipal = productoEnDB ? productoEnDB.imagen : imagen;    

    if (productoExistente) {
        cambiarCantidad(productoExistente.id, cantidad);
    } else {
        const nuevoProducto = {
            id: `${carrito.length + 1}`, // Generar un ID único
            nombre,
            precio,
            imagen: imagenPrincipal,
            cantidad,
            esCombo: productosCombo.length > 0, // Marcar como combo si tiene productos
            productos: productosCombo // Lista de productos si es un combo
        };
        carrito.push(nuevoProducto);

        // Animación del botón
        boton.classList.add('animacion-carrito');
        setTimeout(() => {
            boton.classList.remove('animacion-carrito');
        }, 500);

        guardarCarrito();
        renderCarrito();
    }
}

function mostrarCarrito() {
    document.getElementById('planilla-pago').classList.add('hidden');

    document.getElementById("productos").style.display = "none";
    document.getElementById("detalle-producto").style.display = "none";
    document.getElementById("carrito").style.display = "block";
    
    document.getElementById("panel-electrodomesticos").style.display = "none";

    let slider = document.querySelector(".slider");
    if (slider) {
        slider.style.display = "none";
    }

    // **Guardar estado en el historial**
    history.pushState({ tipo: "carrito" }, "", "#carrito");

    renderCarrito();
}

function ocultarCarrito() {
    document.getElementById('planilla-pago').classList.add('hidden');
    
    document.getElementById("detalle-producto").style.display = "none";


    document.getElementById("carrito").style.display = "none";
    document.getElementById("productos").style.display = "block";

    let slider = document.querySelector(".slider");
    if (slider) {
        slider.style.display = "block";
    }

    // **Regresar a la vista principal en la URL sin recargar**
    history.pushState({ tipo: "productos" }, "", window.location.pathname);
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
        // Actualizar el contador inmediatamente
        updateCartCount();
    }
    renderCarrito(); // Esto ahora se puede llamar después
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

function mostrarDetallesProducto(producto) {
    productoActual = producto; // Almacenar el producto actual en la variable global
    window.scrollTo({ top: 0 });

    actualizarMetaEtiquetas(producto);

    let currentImageIndex = 0; // Definir la variable aquí

    // Actualizar la información del producto
    document.getElementById("detalle-nombre").textContent = producto.nombre;
    document.getElementById("detalle-imagen").src = producto.imagen;
    
    // Formatear la descripción
    const descripcion = producto.descripcion || "Por el momento, no contamos con una descripción para este producto."
    const descripcionFormateada = formatearDescripcion(descripcion); // Llamar a la función de formateo
    document.getElementById("detalle-descripcion").innerHTML = descripcionFormateada;
    
    // Calcular el precio de descuento si aplica
    let precio = producto.precio;
    let pvpr = producto.pvpr || producto.precio; // Si no hay PVPR, usar el precio principal

    if (producto.oferta && producto.descuento) {
        precio = (producto.precio - (producto.precio * (producto.descuento / 100)).toFixed(2));
    }

    // Dividir el precio en entero y decimales
    const precioParts = precio.toFixed(2).split('.');
    const entero = precioParts[0];
    const decimales = precioParts[1];

    // Mostrar precio con decimales más pequeños
    document.getElementById("detalle-precio").innerHTML = `
        <span class="simbolo">Precio: $</span>
        <span class="entero">${entero}</span>
        <span class="decimales">.${decimales}</span>
    `;

    // define el valor oculto del precio del producto para el carrito
    document.getElementById("valor-precio-total").textContent = `Precio: $${precio.toFixed(2)}`;
    
    // Mostrar PVPR y descuento
    if (producto.oferta) {
        document.getElementById("detalle-pvpr").textContent = `PVPR: $${pvpr.toFixed(2)}`;
        document.getElementById("detalle-descuento").textContent = `-${producto.descuento.toFixed()}%`;
    } else {
        document.getElementById("detalle-pvpr").textContent = "";
        document.getElementById("detalle-descuento").textContent = "";
    }

    // Mostrar descuento si aplica
    const detalleDescuento = document.getElementById("detalle-descuento");
    if (producto.oferta && producto.descuento) {
        detalleDescuento.style.display = "block";
        detalleDescuento.textContent = `¡En oferta! -${producto.descuento.toFixed()}%`;
    } else {
        detalleDescuento.textContent = ""; // Ocultar si no hay oferta
        detalleDescuento.style.display = "none";
    }

    // Mostrar disponibilidad
    const detalleDisponibilidad = document.getElementById("detalle-disponibilidad");
    detalleDisponibilidad.innerHTML = producto.disponible
        ? `<span class="disponible">✅ En stock</span>`
        : `<span class="no-disponible">❌ No disponible</span>`;

    // Mostrar envío gratuito
     const detalleEnvio = document.getElementById("detalle-envio");
    detalleEnvio.innerHTML = `
        <i class="fas fa-truck" style="margin-right: 8px;"></i> <!-- Ícono de envío -->
        <span>Envío gratuito</span> <!-- Texto de envío gratuito -->
        <br> <!-- Salto de línea para el tiempo estimado -->
        <small style="color: #666;">Entrega en 24-48 horas</small> <!-- Tiempo estimado -->
    `;

    // Mostrar si es más vendido
    const detalleMasVendido = document.getElementById("detalle-mas-vendido");
    if (producto.mas_vendido) {
        detalleMasVendido.style.display = "inline-block";
    } else {
        detalleMasVendido.style.display = "none";
    }

    // Mostrar imágenes adicionales (incluyendo la foto principal)
    const imagenesAdicionales = document.getElementById("imagenes-adicionales");
    imagenesAdicionales.innerHTML = ""; // Limpiar imágenes previas
    const galeriaImagenes = document.getElementById("galeria-imagenes");

    // Calcular el total de imágenes (principal + adicionales)
    totalImagenes = 1 + (producto.imagenesAdicionales ? producto.imagenesAdicionales.length : 0);

    // Ocultar el selector de imágenes adicionales si solo hay una imagen
    if (totalImagenes <= 1) {
        imagenesAdicionales.style.display = "none";
        galeriaImagenes.style.display = "none";
    } else {
        imagenesAdicionales.style.display = "flex";
        galeriaImagenes.style.display = "block";
    }

    // Mostrar miniaturas de imágenes adicionales en modo normal (escritorio)
    if (window.innerWidth > 768) {
        // Agregar la imagen principal como primera miniatura
        const imgPrincipal = document.createElement("img");
        imgPrincipal.src = producto.imagen;
        imgPrincipal.alt = "Imagen principal del producto";
        imgPrincipal.addEventListener("click", () => {
            cambiarImagen(0); // Cambiar a la imagen principal
        });
        imagenesAdicionales.appendChild(imgPrincipal);

        // Agregar las imágenes adicionales
        if (producto.imagenesAdicionales && producto.imagenesAdicionales.length > 0) {
            producto.imagenesAdicionales.forEach((imagen, index) => {
                const img = document.createElement("img");
                img.src = imagen;
                img.alt = "Imagen adicional del producto";
                img.addEventListener("click", () => {
                    cambiarImagen(index + 1); // Cambiar a la imagen adicional
                });
                imagenesAdicionales.appendChild(img);
            });
        }
    }

   // Mostrar puntos indicadores
   const puntosIndicadores = document.getElementById("puntos-indicadores");
   puntosIndicadores.innerHTML = ""; // Limpiar puntos previos
   for (let i = 0; i < totalImagenes; i++) {
       const punto = document.createElement("div");
       punto.className = "punto-indicador";
       punto.addEventListener("click", () => cambiarImagen(i));
       puntosIndicadores.appendChild(punto);
   }
   actualizarPuntosIndicadores(0); // Activar el primer punto

    // Mostrar galería de imágenes adicionales (solo en responsive)
    const galeriaContenedor = document.querySelector(".galeria-contenedor");
    galeriaContenedor.innerHTML = ""; // Limpiar galería previa
    if (producto.imagenesAdicionales && producto.imagenesAdicionales.length > 0) {
        producto.imagenesAdicionales.forEach((imagen, index) => {
            const img = document.createElement("img");
            img.src = imagen;
            img.alt = "Imagen adicional del producto";
            img.addEventListener("click", () => {
                cambiarImagen(index + 1); // Cambiar a la imagen adicional
            });
            galeriaContenedor.appendChild(img);
        });
    }


    // Guardar el estado del panel de electrodomésticos
    const panelElectrodomesticos = document.getElementById("panel-electrodomesticos");
    panelElectrodomesticosAbierto = panelElectrodomesticos.style.display === "block";

    // Resetear cantidad a 1
    document.getElementById("detalle-cantidad").textContent = "1";

    // Mostrar productos sugeridos (solo productos disponibles)
    mostrarProductosSugeridos(producto);

    // Ocultar otros paneles
    document.getElementById("panel-electrodomesticos").style.display = "none";
    document.getElementById("productos").style.display = "none";
    document.getElementById("carrito").style.display = "none";
    document.getElementById("detalle-producto").style.display = "block";

    // Ocultar el slider si existe
    let slider = document.querySelector(".slider");
    if (slider) {
        slider.style.display = "none";
    }

    document.getElementById("imagen-principal-container").addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    document.getElementById("imagen-principal-container").addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchStartX - touchEndX;

        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Deslizamiento hacia la izquierda (siguiente imagen)
                currentImageIndex = (currentImageIndex + 1) % totalImagenes;
            } else {
                // Deslizamiento hacia la derecha (imagen anterior)
                currentImageIndex = (currentImageIndex - 1 + totalImagenes) % totalImagenes;
            }
            cambiarImagen(currentImageIndex); // Cambiar a la imagen correspondiente
        }
    });
    // Guardar estado en el historial
    history.pushState({ tipo: "producto", producto }, "", `#producto-${encodeURIComponent(producto.nombre)}`);
    // Extraer parámetros manteniendo el formato con /
    const urlParts = window.location.href.split('?');
    const refParam = urlParts.length > 1 ? new URLSearchParams(urlParts[1]).get('ref') : null;
    
    const nombreProductoAmigable = producto.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    // Mantener el formato /?ref= en la URL
    const newUrl = refParam 
        ? `#producto-${nombreProductoAmigable}/?ref=${refParam}`
        : `#producto-${nombreProductoAmigable}`;
    
    history.pushState(
        { tipo: "producto", producto },
        "",
        newUrl
    );
}


function actualizarPuntosIndicadores(index) {
    document.querySelectorAll(".punto-indicador").forEach((punto, i) => {
        punto.classList.toggle("activo", i === index);
    });
}



function cambiarImagen(index) {
    const imagenPrincipal = document.getElementById("detalle-imagen");
    imagenPrincipal.style.opacity = 0;

    setTimeout(() => {
        imagenPrincipal.src = index === 0 ? 
            productoActual.imagen : 
            productoActual.imagenesAdicionales[index - 1];
        imagenPrincipal.style.opacity = 1;
        actualizarPuntosIndicadores(index);

        // Actualizar currentImageIndex
        currentImageIndex = index;
    }, 300);
}

function mostrarProductosSugeridos(producto) {
    const sugeridosContainer = document.getElementById("productos-sugeridos");
    const sugeridosContenedor = sugeridosContainer.querySelector(".sugeridos-contenedor");
    sugeridosContenedor.innerHTML = ""; // Limpiar sugerencias previas

    // Filtrar productos de la misma categoría, disponibles y excluir el actual
    const productosSugeridos = productos
        .filter(p => p.categoria === producto.categoria && p.nombre !== producto.nombre && p.disponible)
        .slice(0, 6); // Mostrar hasta 6 sugerencias

    if (productosSugeridos.length === 0) {
        sugeridosContainer.style.display = "none"; // Ocultar si no hay sugerencias
        return;
    }

    sugeridosContainer.style.display = "block"; // Mostrar el contenedor de sugerencias

    productosSugeridos.forEach(sugerido => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "producto-sugerido";
        productoDiv.innerHTML = `
            <img src="${sugerido.imagen}" alt="${sugerido.nombre}" class="sugerido-imagen">
            <p class="nombre">${sugerido.nombre}</p>
            <p class="precio">$${sugerido.precio.toFixed(2)}</p>
            ${sugerido.oferta ? `<p class="oferta-badge">¡En oferta!</p>` : ''}
            ${sugerido.mas_vendido ? `<p class="mas-vendido-badge">Más Vendido</p>` : ''}
        `;

        // Agregar efecto hover
        productoDiv.addEventListener("mouseenter", () => {
            productoDiv.style.transform = "scale(1.05)";
            productoDiv.style.transition = "transform 0.3s ease";
        });
        productoDiv.addEventListener("mouseleave", () => {
            productoDiv.style.transform = "scale(1)";
        });

        // Mostrar detalles del producto sugerido al hacer clic
        productoDiv.addEventListener("click", () => mostrarDetallesProducto(sugerido));

        sugeridosContenedor.appendChild(productoDiv);
    });
}

// Función para agregar al carrito desde los detalles
document.getElementById("detalle-agregar-carrito").addEventListener("click", () => {
    const nombre = document.getElementById("detalle-nombre").textContent;
    const precio = parseFloat(document.getElementById("valor-precio-total").textContent.replace("Precio: $", ""));
    const imagen = document.getElementById("detalle-imagen").src;
    const cantidad = parseInt(document.getElementById("detalle-cantidad").textContent);

    // Usar la función agregarAlCarrito que ya está definida
    agregarAlCarrito(nombre, precio, 'detalle-cantidad', imagen, document.getElementById("detalle-agregar-carrito"));
});

// Función para volver a los productos
document.getElementById("volver-productos").addEventListener("click", (e) => {
    e.preventDefault(); // Evitar la recarga de la página


    // Extraer parámetros manteniendo el formato con /
    const urlParts = window.location.href.split('?');
    const refParam = urlParts.length > 1 ? new URLSearchParams(urlParts[1]).get('ref') : null;
    
    // Limpiar la URL pero mantener el parámetro ref con el formato /?ref= si existe
    const urlLimpia = refParam 
        ? `${window.location.origin}${window.location.pathname}/?ref=${refParam}`
        : `${window.location.origin}${window.location.pathname}`;
    
    history.replaceState({}, "", urlLimpia);

    // Mostrar el panel de electrodomésticos si estaba abierto
    if (panelElectrodomesticosAbierto) {
        document.getElementById("panel-electrodomesticos").style.display = "block";
        panelElectrodomesticosAbierto = false; // Reiniciar el estado
    } else {
        // Mostrar la página principal
        document.getElementById("productos").style.display = "block";
    }

    // Verificar si el usuario estaba en el panel de electrodomésticos
    const panelElectrodomesticos = document.getElementById("panel-electrodomesticos");
    if (panelElectrodomesticos && panelElectrodomesticos.style.display === "block") {
        // Volver al panel de electrodomésticos
        document.getElementById("detalle-producto").style.display = "none";
        panelElectrodomesticos.style.display = "block";
    } else {
        // Volver a la página principal
        document.getElementById("detalle-producto").style.display = "none";
        document.getElementById("productos").style.display = "block";

        // Mostrar el slider si existe
        const slider = document.querySelector(".slider");
        if (slider) {
            slider.style.display = "block";
        }
    }

    // Actualizar el historial de navegación sin recargar la página
    history.pushState({ tipo: "productos" }, "", window.location.pathname + window.location.search);
});

// Incrementar y decrementar cantidad
document.getElementById("btn-sumar").addEventListener("click", () => {
    let cantidad = parseInt(document.getElementById("detalle-cantidad").textContent);
    document.getElementById("detalle-cantidad").textContent = cantidad + 1;
});

document.getElementById("btn-restar").addEventListener("click", () => {
    let cantidad = parseInt(document.getElementById("detalle-cantidad").textContent);
    if (cantidad > 1) {
        document.getElementById("detalle-cantidad").textContent = cantidad - 1;
    }
});

function renderProductosEnContenedor(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = ""; // Limpiar el contenedor

    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "product-card";
        productoDiv.dataset.nombre = producto.nombre;
        productoDiv.dataset.categoria = producto.categoria;

        let precio = producto.precio;
        let pvpr = producto.precio; // Precio original (PVPR)
        let descuento = '';

        // Asegurarse de que el precio tenga dos decimales
        precio = precio.toFixed(2);
        if (producto.oferta) {
            pvpr = producto.precio;
            precio = (producto.precio - (producto.precio * (producto.descuento / 100))).toFixed(2);
            descuento = `<span class="oferta-badge">Oferta</span>`;
        }

        const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

        // Mostrar disponibilidad
        const disponibilidadHtml = producto.disponible
            ? `<div class="disponibilidad disponible">Disponible</div>`
            : `<div class="disponibilidad no-disponible">No Disponible</div>`;

        // Estructura de la tarjeta de producto en formato horizontal
        productoDiv.innerHTML = `
            <div class="product-image-container">
                ${descuento}
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
            </div>
            <div class="product-info">
                <h2 class="product-title">${producto.nombre}</h2>
                <div class="price-container">
                    <p class="product-price">US$${precio}</p>
                    ${pvprHtml}
                </div>
                ${disponibilidadHtml}
            </div>
        `;

        // Agregar evento para abrir el modal cuando se hace clic en el producto
        productoDiv.addEventListener('click', (e) => {
            mostrarDetallesProducto(producto);
        });

        contenedor.appendChild(productoDiv);
    });
}

function mostrarPanelElectrodomesticos() {
    window.scrollTo({ top: 0 });
    // Ocultar otros paneles
    document.getElementById("productos").style.display = "none";
    document.getElementById("detalle-producto").style.display = "none";
    document.getElementById("carrito").style.display = "none";

    // Ocultar el slider
    const slider = document.querySelector(".slider");
    if (slider) {
        slider.style.display = "none";
    }

    // Mostrar el panel de electrodomésticos
    const panelElectrodomesticos = document.getElementById("panel-electrodomesticos");
    panelElectrodomesticos.style.display = "block";

    // Filtrar solo los electrodomésticos disponibles
    const electrodomesticos = productos.filter(producto => 
        producto.categoria === "electrodomesticos" && producto.disponible
    );

    // Renderizar solo los electrodomésticos en el panel
    renderProductosEnContenedor(electrodomesticos, "lista-electrodomesticos");

    // Actualizar el historial de navegación
    history.pushState({ tipo: "electrodomesticos" }, "", "#electrodomesticos");
}

// Cerrar el panel de electrodomésticos
document.getElementById("cerrar-electrodomesticos").addEventListener("click", () => {
    document.getElementById("panel-electrodomesticos").style.display = "none";
    document.getElementById("productos").style.display = "block";

    // Mostrar el slider si existe
    const slider = document.querySelector(".slider");
    if (slider) {
        slider.style.display = "block";
    }

    // Actualizar el historial de navegación
    history.pushState({ tipo: "electrodomesticos" }, "", "#electrodomesticos");
    history.pushState({ tipo: "productos" }, "", window.location.pathname + window.location.search);
});


function formatearDescripcion(descripcion) {
    // Si la descripción tiene puntos clave separados por comas o puntos, la convertimos en una lista
    if (descripcion.includes(". ") || descripcion.includes(", ")) {
        // Dividir la descripción en puntos clave
        const puntosClave = descripcion.split(". ").filter(punto => punto.trim() !== "");

        // Crear una lista HTML con los puntos clave
        const listaHTML = puntosClave.map(punto => `<li>${punto}</li>`).join("");
        return `<ul class="descripcion-lista">${listaHTML}</ul>`;
    } else {
        // Si no, mostrar la descripción como párrafos
        return `<p class="descripcion-parrafo">${descripcion}</p>`;
    }
}

// Función para actualizar metaetiquetas OG automáticamente
function actualizarMetaEtiquetas(producto) {
    // Validación segura de propiedades
    const nombre = producto?.nombre || 'Producto Asere';
    const descripcion = producto?.descripcion ? 
        (producto.descripcion.length > 160 ? 
         producto.descripcion.substring(0, 160) + '...' : 
         producto.descripcion) : 
        'Descubre este producto en Asere Shops';
    const imagen = producto?.imagen || 'img/LogoVerde.jpeg';
    
    // CALCULAR PRECIO SEGÚN OFERTA
    let precioMostrado = producto?.precio || 0;
    if (producto?.oferta && producto?.descuento) {
        precioMostrado = producto.precio - (producto.precio * (producto.descuento / 100));
    }
    const precio = precioMostrado.toFixed(2);
    
    const disponible = producto?.disponible ? 'in stock' : 'out of stock';

    const urlBase = window.location.origin + window.location.pathname;
    const urlProducto = `${urlBase}?producto=${encodeURIComponent(nombre)}`;
    
    history.replaceState({}, '', urlProducto);

    // Función auxiliar para actualizar metaetiquetas
    const setMetaTag = (attr, name, value) => {
        let element = document.querySelector(`meta[${attr}="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, name);
            document.head.appendChild(element);
        }
        element.content = value;
    };

    // Actualizar metaetiquetas
    setMetaTag('property', 'og:title', `${nombre} | Asere Shops`);
    setMetaTag('property', 'og:description', descripcion);
    setMetaTag('property', 'og:image', obtenerUrlAbsoluta(imagen));
    setMetaTag('property', 'og:url', urlProducto);
    setMetaTag('property', 'og:type', 'product');
    setMetaTag('property', 'product:price:amount', precio);
    setMetaTag('property', 'product:price:currency', 'USD/EUR');
    setMetaTag('property', 'product:brand', 'Asere Shops');
    setMetaTag('property', 'product:availability', disponible);
    
    // Añadir etiqueta de descuento si está en oferta
    if (producto?.oferta && producto?.descuento) {
        setMetaTag('property', 'product:sale_price:amount', precio);
        setMetaTag('property', 'product:sale_price:currency', 'USD/EUR');
        setMetaTag('property', 'product:sale_price:start_date', new Date().toISOString());
        setMetaTag('property', 'product:sale_price:end_date', 
                  producto.finOferta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    }
}

function obtenerUrlAbsoluta(rutaRelativa) {
    if (!rutaRelativa) return window.location.origin + '/img/LogoVerde.jpeg';
    return window.location.origin + '/' + rutaRelativa.replace(/^\//, '');
}
function normalizarNombre(nombre) {
    return nombre.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
}

