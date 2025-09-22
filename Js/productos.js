// productos.js
// Lógica de productos y combos


window.productos = [];
window.combos = [];
window.productoActual = null;
window.totalImagenes = 0;

window.buscarProductoPorNombre = function(nombre) {
    if (!nombre) return null;
    const nombreBuscado = window.normalizarNombre(nombre);
    let mejorCoincidencia = null;
    let mejorPuntaje = 0;
    [...window.productos, ...window.combos].forEach(item => {
        const nombreItem = window.normalizarNombre(item.nombre);
        if (nombreItem === nombreBuscado) {
            mejorCoincidencia = item;
            return;
        }
        if (!mejorCoincidencia) {
            const palabrasBuscadas = nombreBuscado.split(' ');
            const palabrasItem = nombreItem.split(' ');
            const puntaje = palabrasBuscadas.filter(p => palabrasItem.includes(p)).length;
            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejorCoincidencia = item;
            }
        }
    });
    return mejorCoincidencia;
};

window.normalizarNombre = function(nombre) {
    if (!nombre) return '';
    return nombre.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
};

window.removeDuplicates = function(productos) {
    const uniqueProductos = [];
    const productoNames = new Set();
    productos.forEach(producto => {
        if (!productoNames.has(producto.nombre)) {
            productoNames.add(producto.nombre);
            uniqueProductos.push(producto);
        }
    });
    return uniqueProductos;
};

window.limpiarProductosContainer = function() {
    const productosContainer = document.getElementById("productos-container");
    while (productosContainer.firstChild) {
        productosContainer.removeChild(productosContainer.firstChild);
    }
};

window.actualizarPrecios = function(productos) {
    productos.forEach(producto => {
        if (producto.precio !== undefined) {
            const total = producto.precio * 0.05;
            producto.precio = +(producto.precio + total).toFixed(2);
        }
    });
    return productos;
};

window.mostrarMensajeNoDisponible = function() {
    const mensaje = document.getElementById("producto-no-disponible");
    if (mensaje) {
        mensaje.style.display = "block";
        mensaje.style.animation = "fadeIn 0.5s ease-in-out";
        setTimeout(() => {
            mensaje.style.animation = "fadeOut 0.5s ease-in-out";
            setTimeout(() => {
                mensaje.style.display = "none";
            }, 500);
        }, 5000);
    }
};

window.renderProductos = function() {
    window.limpiarProductosContainer(); // Limpiar productos actuales

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

        let precio = Number(producto.precio);
        let pvpr = Number(producto.pvpr);
        let descuento = '';

        // Asegurarse de que el precio tenga dos decimales
        precio = precio.toFixed(2);
        if (producto.oferta) {
            pvpr = Number(producto.precio);
            precio = (Number(producto.precio) - (Number(producto.precio) * (Number(producto.descuento) / 100))).toFixed(2);
            descuento = `<p class="descuento" style="text-decoration: none;">-${Number(producto.descuento)}%</p>`;
        }

        const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

        const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">Oferta</span>` : '';
        const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">Más Vendido</div>` : '';
        const etiquetaNuevo = producto.nuevo ? `<div class="badge nuevo">Nuevo</div>` : '';

        productoDiv.innerHTML = `
            ${etiquetaNuevo}
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
            if (botonesCantidad) {
                botonesCantidad.style.display = "none"; // Ocultar los botones de cantidad y el botón "Agregar al carrito"
            }
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

        // Mapeo de íconos por categoría
        const iconosCategorias = {
            "frutas": "fa-apple-alt",
            "cafe": "fa-coffee",
            "carnes": "fa-drumstick-bite",
            "enlatados": "fa-box-archive",
            "aderezos": "fa-pepper-hot",
            "agro": "fa-seedling",
            "pastas-y-granos": "fa-wheat-awn",
            "lacteos": "fa-cheese",
            "despensa": "fa-kitchen-set",
            "bebidas": "fa-glass-water",
            "alcohol": "fa-wine-bottle",
            "cakes": "fa-cake-candles",
            "confituras": "fa-candy-cane",
            "otros": "fa-ellipsis-h",
            "all": "fa-bars",
            "vehículos": "fa-motorcycle",
            "electrodomesticos": "fa-plug",
            "aseo": "fa-spray-can-sparkles",
            "fragancias": "fa-spray-can",
            "perfumes": "fa-spray-can"
        };
        // Determinar el ícono
        const iconClass = iconosCategorias[categoria] || "fa-tag";
        
        // Check for new products in the category
        const hayNuevos = productosDisponibles.some(p => p.categoria === categoria && p.nuevo);

        // Crear el título de la categoría con ícono
        const categoriaTitle = document.createElement("h2");
        categoriaTitle.className = "categoria-titulo-visual";
        categoriaTitle.innerHTML = `
            <span class="categoria-titulo-bg">
                <i class="fas ${iconClass}"></i>
                <span class="categoria-titulo-nombre">${categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ')}</span>
                ${hayNuevos ? '<span class="nuevo-indicator"></span>' : ''}
            </span>
        `;
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

            let precio = Number(producto.precio);
            let pvpr = Number(producto.pvpr);
            let descuento = '';


            // Asegurarse de que el precio tenga dos decimales
            precio = precio.toFixed(2);
            if (producto.oferta) {
                pvpr = Number(producto.precio);
                precio = (Number(producto.precio) - (Number(producto.precio) * (Number(producto.descuento) / 100))).toFixed(2);
                descuento = `<p class="descuento" style="text-decoration: none;">-${Number(producto.descuento)}%</p>`;
            }

            const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

            const etiquetaOferta = producto.oferta ? `<span class="etiqueta oferta producto-oferta">Oferta</span>` : '';
            const etiquetaMasVendido = producto.mas_vendido ? `<div class="badge mas-vendido producto-masvendido">Más Vendido</div>` : '';
            const etiquetaNuevo = producto.nuevo ? `<div class="badge nuevo">Nuevo</div>` : '';

            productoDiv.innerHTML = `
                <div class="producto-contenedor">
                    <div class="etiqueta-segmento">
                        ${etiquetaMasVendido}
                        ${etiquetaOferta}
                        ${etiquetaNuevo}
                    </div>
                    <div class="producto-img">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="producto-info">
                        <div class="pvpr-precio-contenedor">
                            <p class="precio"><span class="currency">US$</span>${precio}</p>
                            ${pvprHtml}
                        </div>
                        ${descuento} <!-- Agregar disponibilidad -->
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
                if (botonesCantidad) {
                    botonesCantidad.style.display = "none"; // Ocultar los botones de cantidad y el botón "Agregar al carrito"
                }
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

    const combosDisponibles = combos.filter(combos => combos.disponible);

    // --- Botones de navegación para el slider de packs ---
    const leftBtn = document.createElement('button');
    leftBtn.className = 'combo-slider-btn combo-slider-btn-left';
    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    const rightBtn = document.createElement('button');
    rightBtn.className = 'combo-slider-btn combo-slider-btn-right';
    rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    combosContainer.appendChild(leftBtn);
    combosContainer.appendChild(rightBtn);

    // Scroll size dinámico según el ancho visible del slider
    function getScrollAmount() {
        // Desplaza casi todo el ancho visible menos un pequeño margen
        return comboSlider.offsetWidth * 0.85;
    }
    leftBtn.addEventListener('click', () => {
        comboSlider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
        comboSlider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    // Scroll horizontal con la rueda del mouse
    comboSlider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            comboSlider.scrollBy({ left: e.deltaY, behavior: 'smooth' });
        }
    }, { passive: false });

    combosDisponibles.forEach((combo, comboIndex) => {
        // Estructura visual tipo pack-card
        const packCard = document.createElement("div");
        packCard.className = "pack-card";
        packCard.dataset.nombre = combo.nombre;
        packCard.dataset.categoria = combo.categoria;

        // Badge PACK
        const badge = document.createElement("div");
        badge.className = "pack-badge";
        badge.textContent = "PACK";
        packCard.appendChild(badge);

        // Ahorro si existe
        if (combo.ahorro) {
            const savings = document.createElement("div");
            savings.className = "pack-savings";
            savings.textContent = `Ahorras ${combo.ahorro.toFixed(2)}`;
            packCard.appendChild(savings);
        }

        // Imagen principal
        const imgContainer = document.createElement("div");
        imgContainer.className = "pack-image-container";
        const img = document.createElement("img");
        img.className = "pack-image";
        img.src = combo.imagen;
        img.alt = combo.nombre;
        imgContainer.appendChild(img);
        packCard.appendChild(imgContainer);

        // Info principal
        const info = document.createElement("div");
        info.className = "pack-info";

        // Nombre
        const title = document.createElement("h3");
        title.className = "pack-title";
        title.textContent = combo.nombre;
        info.appendChild(title);

        // Precio y descuento
        const priceContainer = document.createElement("div");
        priceContainer.className = "pack-price-container";
        let isOnSale = combo.oferta && combo.descuento > 0;
        let finalPrice = isOnSale ? (combo.precio * (1 - combo.descuento/100)).toFixed(2) : combo.precio.toFixed(2);
        if (isOnSale) {
            const originalPrice = document.createElement("span");
            originalPrice.className = "pack-original-price";
            originalPrice.textContent = `$ ${combo.precio.toFixed(2)}`;
            priceContainer.appendChild(originalPrice);
            const discountPercent = document.createElement("span");
            discountPercent.className = "pack-discount-percent";
            discountPercent.textContent = `-${combo.descuento}%`;
            priceContainer.appendChild(discountPercent);
        }
        const currentPrice = document.createElement("span");
        currentPrice.className = "pack-current-price";
        currentPrice.textContent = `$ ${finalPrice}`;
        priceContainer.appendChild(currentPrice);
        info.appendChild(priceContainer);

        // Contenido del pack (máx 3 productos + "+N más")
        const contents = document.createElement("div");
        contents.className = "pack-contents";
        const contentsTitle = document.createElement("div");
        contentsTitle.className = "pack-contents-title";
        contentsTitle.innerHTML = `<i class='fas fa-box-open'></i> Contenido:`;
        contents.appendChild(contentsTitle);
        const contentsList = document.createElement("ul");
        contentsList.className = "pack-contents-list";
        const maxItemsToShow = 3;
        const itemsToShow = combo.productos.slice(0, maxItemsToShow);
        const remainingItems = combo.productos.length - maxItemsToShow;
        itemsToShow.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            contentsList.appendChild(li);
        });
        if (remainingItems > 0) {
            const li = document.createElement("li");
            li.className = "remaining-items";
            li.textContent = `+${remainingItems} productos más`;
            contentsList.appendChild(li);
        }
        contents.appendChild(contentsList);
        info.appendChild(contents);

        // Footer: cantidad y botón añadir
        const footer = document.createElement("div");
        footer.className = "pack-footer";
        const quantitySection = document.createElement("div");
        quantitySection.className = "pack-quantity-section";
        const quantityControls = document.createElement("div");
        quantityControls.className = "pack-quantity-controls";
        const minusBtn = document.createElement("button");
        minusBtn.className = "pack-quantity-btn";
        minusBtn.innerHTML = `<i class='fas fa-minus'></i>`;
        const plusBtn = document.createElement("button");
        plusBtn.className = "pack-quantity-btn";
        plusBtn.innerHTML = `<i class='fas fa-plus'></i>`;
        const quantitySpan = document.createElement("span");
        quantitySpan.className = "pack-quantity";
        quantitySpan.id = `pack-quantity-${combo.nombre.replace(/'/g, "\'")}`;
        quantitySpan.textContent = "1";
        minusBtn.onclick = function(e) {
            e.stopPropagation();
            let val = parseInt(quantitySpan.textContent);
            if (val > 1) quantitySpan.textContent = val - 1;
        };
        plusBtn.onclick = function(e) {
            e.stopPropagation();
            let val = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = val + 1;
        };
        quantityControls.appendChild(minusBtn);
        quantityControls.appendChild(quantitySpan);
        quantityControls.appendChild(plusBtn);
        quantitySection.appendChild(quantityControls);

        // Botón añadir al carrito
        const addBtn = document.createElement("button");
        addBtn.className = "add-pack-to-cart";
        addBtn.innerHTML = `<i class='fas fa-cart-plus'></i> <span>Añadir</span>`;
        addBtn.onclick = function(e) {
            e.stopPropagation();
            // Always pass a number for price
            agregarAlCarrito(combo.nombre, Number(finalPrice), quantitySpan.id, combo.imagen, this, combo.productos);
        };
        quantitySection.appendChild(addBtn);
        footer.appendChild(quantitySection);
        info.appendChild(footer);

        packCard.appendChild(info);
        comboSlider.appendChild(packCard);
        // Evento para mostrar detalles del pack al hacer click en el pack (excepto botones)
        packCard.addEventListener('click', (e) => {
            if (e.target.closest('.pack-quantity-btn') || e.target.closest('.add-pack-to-cart')) return;
            mostrarDetallesProducto(combo);
        });
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
    
        // Volver a configurar la visualización de 4 productos por categoría with el botón "Cargar más" al seleccionar "all"
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
};

window.renderProductosEnContenedor = function(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = ""; // Limpiar el contenedor

    productos.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "product-card";
        productoDiv.dataset.nombre = producto.nombre;
        productoDiv.dataset.categoria = producto.categoria;

        let precio = Number(producto.precio);
        let pvpr = Number(producto.precio); // Precio original (PVPR)
        let descuento = '';

        // Asegurarse de que el precio tenga dos decimales
        precio = precio.toFixed(2);
        if (producto.oferta) {
            pvpr = Number(producto.precio);
            precio = (Number(producto.precio) - (Number(producto.precio) * (Number(producto.descuento) / 100))).toFixed(2);
            descuento = `<span class="oferta-badge">Oferta</span>`;
        }

        const pvprHtml = producto.oferta ? `<p class="pvpr">PVPR: US$<s>${pvpr.toFixed(2)}</s></p>` : '';

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
            </div>
        `;

        // Agregar evento para abrir el modal cuando se hace clic en el producto
        productoDiv.addEventListener('click', (e) => {
            mostrarDetallesProducto(producto);
        });

        contenedor.appendChild(productoDiv);
    });
}
