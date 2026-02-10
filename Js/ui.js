// Botón para compartir el producto desde el panel de detalles

// Botón compartir flotante sobre la imagen principal
document.addEventListener('DOMContentLoaded', function() {
  const compartirBtn = document.getElementById('btn-compartir-producto');
  if (compartirBtn) {
    compartirBtn.setAttribute('data-tooltip', 'Compartir enlace');
    compartirBtn.addEventListener('click', function() {
      const nombre = document.getElementById('detalle-nombre')?.textContent?.trim();
      let url = window.location.origin + window.location.pathname;
      if (nombre) {
        const hash = '#producto-' + nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        url += hash;
      }
      if (navigator.share) {
        navigator.share({
          title: nombre || 'Producto Asere',
          url
        });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          compartirBtn.classList.add('copiado');
          compartirBtn.setAttribute('data-tooltip', '¡Enlace copiado!');
          compartirBtn.querySelector('i').className = 'fas fa-check';
          setTimeout(() => {
            compartirBtn.classList.remove('copiado');
            compartirBtn.setAttribute('data-tooltip', 'Compartir enlace');
            compartirBtn.querySelector('i').className = 'fas fa-share-alt';
          }, 1600);
        });
      }
    });
  }
});
// Genera las categorías dinámicamente en el header
// Normaliza cadenas: elimina diacríticos y genera slugs
window.slugify = window.slugify || function(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

function generarCategoriasHeader() {
  // Relación nombre de categoría -> ícono FontAwesome
  const iconosCategorias = {
    'todos': 'fas fa-bars',
    'all': 'fas fa-bars',
    'vehículos': 'fas fa-motorcycle',
    'veiculos': 'fas fa-motorcycle',
    'frutas': 'fas fa-apple-alt',
    'café': 'fas fa-coffee',
    'cafe': 'fas fa-coffee',
    'carnes': 'fas fa-drumstick-bite',
    'enlatados': 'fas fa-box-archive',
    'aderezos': 'fas fa-pepper-hot',
    'agro': 'fas fa-seedling',
    'pastas-y-granos': 'fas fa-wheat-awn',
    'pastas & granos': 'fas fa-wheat-awn',
    'lácteos': 'fas fa-cheese',
    'lacteos': 'fas fa-cheese',
    'despensa': 'fas fa-kitchen-set',
    'bebidas': 'fas fa-glass-water',
    'alcohol': 'fas fa-wine-bottle',
    'bebidas alcohólicas': 'fas fa-wine-bottle',
    'cakes': 'fas fa-cake-candles',
    'confituras': 'fas fa-candy-cane',
    'otros': 'fas fa-ellipsis-h',
    'electrodomesticos': 'fas fa-plug',
    'aseo': 'fas fa-spray-can-sparkles',
    'fragancias': 'fas fa-spray-can',
    'perfumes': 'fas fa-spray-can'
  };

  fetch('Json/productos.json')
    .then(response => response.json())
    .then(data => {
      // Extraer todas las categorías únicas de los productos
      let categorias = [];
      if (Array.isArray(data)) {
        categorias = [...new Set(data.map(p => p.categoria))];
      } else if (Array.isArray(data.productos)) {
        categorias = [...new Set(data.productos.map(p => p.categoria))];
      }
      // Filtrar duplicados de 'todos' y 'all'
      categorias = categorias.filter(c => {
        const cl = c.toLowerCase();
        return cl !== 'todos' && cl !== 'all';
      });
      // Obtener el ul solo una vez
      const ulCategorias = document.getElementById('categorias-list');
      if (!ulCategorias) {
        console.error('No se encontró el elemento #categorias-list en el DOM');
        return;
      }
      ulCategorias.innerHTML = '';
            // Insertar 'Todos' como primer elemento (usa hash semántico)
            ulCategorias.innerHTML += `<li><a href="#categoria-all" data-categoria="all" id="cat-all"><i class="fas fa-bars"></i> <span>Todos</span></a></li>`;
      // Insertar el resto de categorías
            categorias.forEach(cat => {
                const dataCat = window.slugify ? window.slugify(cat) : cat.toLowerCase().replace(/\s|&/g, '-').replace(/[^a-z0-9\-]/gi, '');
                const idCat = 'cat-' + dataCat;
                let icon = iconosCategorias[cat.toLowerCase()] || iconosCategorias[dataCat] || 'fas fa-tag';
                                ulCategorias.innerHTML += `<li><a href="#categoria-${dataCat}" data-categoria="${dataCat}" id="${idCat}"><i class="${icon}"></i> <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span></a></li>`;
            });
    })
    .catch(err => {
      console.error('Error cargando categorías:', err);
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', generarCategoriasHeader);
// ui.js
// Lógica de la interfaz y eventos DOM

document.addEventListener("DOMContentLoaded", async () => {
// Ejecutar primero la verificación de IP
    const isBlocked = await checkBlockedIP();
    if (isBlocked) return; // Detener ejecución si está bloqueado
    
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
        let slider = document.querySelector(".slider");
        if (slider) slider.style.display = "block";
        window.location.hash = "#inicio";
    });

    carritoButton.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        enableScroll();
        mostrarCarrito();
        window.location.hash = "#carrito";
    });

    productosButton.addEventListener("click", (event) => {
        event.preventDefault();
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        enableScroll();
        ocultarCarrito();
        let slider = document.querySelector(".slider");
        if (slider) slider.style.display = "block";
        window.location.hash = "#productos";
    });

    // Añadir evento a otros enlaces del menú para salir del carrito
    document.querySelectorAll("nav ul li a").forEach(link => {
        if (link.getAttribute("href") !== '#carrito') {
            link.addEventListener("click", () => {
                ocultarCarrito();
                document.getElementById('planilla-pago').classList.add('hidden');
                let slider = document.querySelector(".slider");
                if (slider) slider.style.display = "block";
                window.location.hash = "#productos";
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
    const slides = document.querySelector(".slider .slides");
    const slideElements = slides ? slides.querySelectorAll(".slide") : [];
    const dotsContainer = document.querySelector(".slider-dots");
    let currentIndex = 0;
    let sliderInterval = null;

    function updateSlider() {
        if (!slides) return;
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        // Actualizar dots
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }
    }

    function showNextSlide() {
        currentIndex = (currentIndex + 1) % slideElements.length;
        updateSlider();
    }
    function showPrevSlide() {
        currentIndex = (currentIndex - 1 + slideElements.length) % slideElements.length;
        updateSlider();
    }
    function goToSlide(idx) {
        currentIndex = idx;
        updateSlider();
    }
    function startSliderInterval() {
        if (sliderInterval) clearInterval(sliderInterval);
        sliderInterval = setInterval(showNextSlide, 5000);
    }
    function stopSliderInterval() {
        if (sliderInterval) clearInterval(sliderInterval);
    }

    // Crear dots
    if (dotsContainer && slideElements.length > 0) {
        dotsContainer.innerHTML = "";
        slideElements.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'slider-dot' + (idx === 0 ? ' active' : '');
            dot.dataset.dotIndex = idx;
            dot.onclick = () => { goToSlide(idx); startSliderInterval(); };
            dotsContainer.appendChild(dot);
        });
    }

    // Botones next/prev
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    if (prevBtn) prevBtn.onclick = () => { showPrevSlide(); startSliderInterval(); };
    if (nextBtn) nextBtn.onclick = () => { showNextSlide(); startSliderInterval(); };

    // Pausa en hover
    const sliderContainer = document.querySelector('.slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSliderInterval);
        sliderContainer.addEventListener('mouseleave', startSliderInterval);
    }

    updateSlider();
    startSliderInterval();


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
    if (productoParam) {
        const producto = buscarProductoPorNombre(productoParam);
        if (producto) {
            mostrarDetallesProducto(producto);
        } else {
            console.warn(`Producto no encontrado: ${productoParam}`);
            mostrarMensajeNoDisponible();
            setTimeout(() => {
                const newUrl = refParam 
                    ? `${window.location.pathname}/?ref=${refParam}`
                    : window.location.pathname;
                window.location.href = newUrl;
            }, 3000);
        }
    }
}

window.formatearDescripcion = function(descripcion) {
    // Usar la función Montaque para formatear la descripción
    return formatProductDescription(descripcion);
}

window.actualizarPuntosIndicadores = function(index) {
    document.querySelectorAll(".punto-indicador").forEach((punto, i) => {
        punto.classList.toggle("activo", i === index);
    });
}

window.mostrarProductosSugeridos = function(producto) {
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
            <p class="precio" data-base-price="${sugerido.precio}"><span class="currency">US$</span>${sugerido.precio.toFixed(2)}</p>
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

window.mostrarDetallesProducto = function(producto) {
    productoActual = producto; // Almacenar el producto actual en la variable global
    window.scrollTo({ top: 0 });

    let currentImageIndex = 0; // Definir la variable aquí

    // Actualizar la información del producto
    document.getElementById("detalle-nombre").textContent = producto.nombre;
    document.getElementById("detalle-imagen").src = producto.imagen;

    // Mostrar contenido del pack si es un pack (tiene propiedad productos como array)
    const detalleNombreElem = document.getElementById("detalle-agregar-carrito");
    // Eliminar sección previa si existe
    const oldPackContent = document.getElementById("detalle-pack-content");
    if (oldPackContent) oldPackContent.remove();
    if (Array.isArray(producto.productos) && producto.productos.length > 0) {
        const packContent = document.createElement("div");
        packContent.id = "detalle-pack-content";
        packContent.className = "detalle-pack-content";
        packContent.innerHTML = `
            <h4 class="pack-content-title"><i class="fas fa-box-open"></i> Contenido del Pack:</h4>
            <ul class="pack-content-list">
                ${producto.productos.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        detalleNombreElem.insertAdjacentElement('afterend', packContent);
    }

    // Formatear la descripción
    const descripcion = producto.descripcion || "Por el momento, no contamos con una descripción para este producto.";
    const descripcionContainer = document.getElementById("detalle-descripcion");
    descripcionContainer.innerHTML = formatProductDescription(descripcion);

    // Función Montaque: listas, párrafos, saltos de línea y HTML enriquecido
    function formatProductDescription(description) {
        if (!description) return '<p class="no-description">No hay descripción disponible</p>';
        
        // Dividir en oraciones considerando múltiples signos de puntuación
        const sentences = description.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        
        return sentences.map(sentence => {
            const trimmedSentence = sentence.trim();
            // Destacar oraciones importantes
            const isImportant = /(garantiza|ideal|perfecto|exclusiv|especial)/i.test(trimmedSentence);
            
            return `
                <div class="description-sentence ${isImportant ? 'important-sentence' : ''}">
                    <div class="sentence-icon">
                        <i class="fas ${isImportant ? 'fa-star' : 'fa-angle-right'}"></i>
                    </div>
                    <div class="sentence-text">
                        ${trimmedSentence}
                        ${!trimmedSentence.endsWith('.') && !trimmedSentence.endsWith('!') && !trimmedSentence.endsWith('?') ? '.' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
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
    const curC = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
    const symC = { USD: 'US$', EUR: '€', UYU: 'UYU$' }[curC] || 'US$';
    const valorTotalEl = document.getElementById("valor-precio-total");
    if(valorTotalEl){
        valorTotalEl.dataset.basePrice = Number(precio).toFixed(2);
        valorTotalEl.textContent = `Precio: ${symC}${precio.toFixed(2)}`;
    }
    
    // Mostrar PVPR y descuento
    if (producto.oferta) {
        const curPV = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
        const symPV = { USD: 'US$', EUR: '€', UYU: 'UYU$' }[curPV] || 'US$';
        document.getElementById("detalle-pvpr").innerHTML = `PVPR: <span class="pvpr-value" data-base-price="${pvpr.toFixed(2)}">${symPV}${pvpr.toFixed(2)}</span>`;
        document.getElementById("detalle-descuento").textContent = `-${producto.descuento.toFixed()}%`;
    } else {
        document.getElementById("detalle-pvpr").innerHTML = "";
        document.getElementById("detalle-descuento").textContent = "";
    }

    // Mostrar descuento si aplica
    const detalleDescuento = document.getElementById("detalle-descuento");
    if (producto.oferta && producto.descuento) {
        detalleDescuento.style.display = "block";
        detalleDescuento.innerHTML = `<i class="fas fa-tag"></i> -${producto.descuento.toFixed()}%`;
    } else {
        detalleDescuento.textContent = ""; // Ocultar si no hay oferta
        detalleDescuento.style.display = "none";
    }

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

    // Asignar eventos a los botones de cantidad y agregar al carrito
    const btnSumar = document.getElementById("btn-sumar");
    const btnRestar = document.getElementById("btn-restar");
    const btnAgregarCarrito = document.getElementById("detalle-agregar-carrito");

    // Asignar evento al botón volver-productos
    const btnVolverProductos = document.getElementById("volver-productos");
    if (btnVolverProductos) {
        btnVolverProductos.replaceWith(btnVolverProductos.cloneNode(true));
        const btnVolverProductosNew = document.getElementById("volver-productos");
        btnVolverProductosNew.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = "#productos";
            }
        });
    }

    // Eliminar listeners previos para evitar duplicados
    if (btnSumar) btnSumar.replaceWith(btnSumar.cloneNode(true));
    if (btnRestar) btnRestar.replaceWith(btnRestar.cloneNode(true));
    if (btnAgregarCarrito) btnAgregarCarrito.replaceWith(btnAgregarCarrito.cloneNode(true));

    // Reobtener los nodos
    const btnSumarNew = document.getElementById("btn-sumar");
    const btnRestarNew = document.getElementById("btn-restar");
    const btnAgregarCarritoNew = document.getElementById("detalle-agregar-carrito");

    // Evento sumar cantidad
    if (btnSumarNew) {
        btnSumarNew.addEventListener("click", () => {
            const cantidadElem = document.getElementById("detalle-cantidad");
            cantidadElem.textContent = parseInt(cantidadElem.textContent) + 1;
        });
    }
    // Evento restar cantidad
    if (btnRestarNew) {
        btnRestarNew.addEventListener("click", () => {
            const cantidadElem = document.getElementById("detalle-cantidad");
            if (parseInt(cantidadElem.textContent) > 1) {
                cantidadElem.textContent = parseInt(cantidadElem.textContent) - 1;
            }
        });
    }
    // Evento agregar al carrito
    if (btnAgregarCarritoNew) {
        btnAgregarCarritoNew.addEventListener("click", () => {
            const cantidadElem = document.getElementById("detalle-cantidad");
            const cantidad = parseInt(cantidadElem.textContent);
            // Usar la función global agregarAlCarrito
            if (window.agregarAlCarrito && window.productoActual) {
                window.agregarAlCarrito(
                    window.productoActual.nombre,
                    window.productoActual.precio,
                    "detalle-cantidad",
                    window.productoActual.imagen,
                    btnAgregarCarritoNew,
                    window.productoActual.productos || []
                );
            }
        });
    }
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
    // Guardar estado en el historial usando el nombre normalizado
    if (window.normalizarNombre) {
        const nombreNormalizado = window.normalizarNombre(producto.nombre);
        window.location.hash = `#producto-${encodeURIComponent(nombreNormalizado)}`;
    } else {
        window.location.hash = `#producto-${encodeURIComponent(producto.nombre)}`;
    }
}

// Función global para cambiar la imagen principal desde los puntos o miniaturas
window.cambiarImagen = function(index) {
    const imagenPrincipal = document.getElementById("detalle-imagen");
    imagenPrincipal.style.opacity = 0;
    setTimeout(() => {
        let producto = window.productoActual || productoActual;
        let nuevaImagen = producto.imagen;
        if (index > 0 && producto.imagenesAdicionales && producto.imagenesAdicionales.length >= index) {
            nuevaImagen = producto.imagenesAdicionales[index - 1];
        }
        imagenPrincipal.src = nuevaImagen;
        imagenPrincipal.style.opacity = 1;
        if (window.actualizarPuntosIndicadores) {
            window.actualizarPuntosIndicadores(index);
        }
    }, 300);
}

// ... Puedes agregar aquí más funciones de UI y eventos ...

// Evento para cerrar el panel de electrodomésticos
document.addEventListener("DOMContentLoaded", () => {
    const btnCerrarElectro = document.getElementById("cerrar-electrodomesticos");
    if (btnCerrarElectro) {
        btnCerrarElectro.replaceWith(btnCerrarElectro.cloneNode(true));
        const btnCerrarElectroNew = document.getElementById("cerrar-electrodomesticos");
        btnCerrarElectroNew.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = "#productos";
            }
        });
document.addEventListener("DOMContentLoaded", () => {
    const btnRegresar = document.getElementById("regresar");
    if (btnRegresar) {
        btnRegresar.replaceWith(btnRegresar.cloneNode(true));
        const btnRegresarNew = document.getElementById("regresar");
        btnRegresarNew.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = "#productos";
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const btnContinueShopping = document.getElementById("continue-shopping");
    if (btnContinueShopping) {
        btnContinueShopping.replaceWith(btnContinueShopping.cloneNode(true));
        const btnContinueShoppingNew = document.getElementById("continue-shopping");
        btnContinueShoppingNew.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = "#productos";
            }
        });
    }
});
    }
});

// Función global para mostrar el panel de electrodomésticos
window.mostrarPanelElectrodomesticos = function() {
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

    // Filtrar solo los electrodomésticos disponibles (normalizando la categoría)
    const electrodomesticos = productos.filter(producto => 
        (window.slugify ? window.slugify(producto.categoria) : String(producto.categoria).toLowerCase()) === "electrodomesticos" && producto.disponible
    );

    // Renderizar solo los electrodomésticos en el panel
    renderProductosEnContenedor(electrodomesticos, "lista-electrodomesticos");

    // Actualizar el historial de navegación
    window.location.hash = "#electrodomesticos";
}

window.adjustImages = function() {
    if (window.innerWidth <= 720) {
        document.querySelectorAll('.img-pc').forEach(img => img.style.display = 'none');
        document.querySelectorAll('.img-mobile').forEach(img => img.style.display = 'block');
    } else {
        document.querySelectorAll('.img-pc').forEach(img => img.style.display = 'block');
        document.querySelectorAll('.img-mobile').forEach(img => img.style.display = 'none');
    }
}

adjustImages();

// Ajustar imágenes al redimensionar la ventana
window.addEventListener('resize', adjustImages);

// Manejo de navegación con el botón "atrás" del navegador
// Eliminado: el historial y navegación ahora se manejan en main.js
