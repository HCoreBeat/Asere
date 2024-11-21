// para agregar los productos basados en un json
document.addEventListener("DOMContentLoaded", () => {
    const productosContainer = document.getElementById("productos");

    fetch('Json/productos.json')
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                const productoDiv = document.createElement("div");
                productoDiv.className = "producto";
                productoDiv.dataset.nombre = producto.nombre;
                productoDiv.dataset.categoria = producto.categoria;

                productoDiv.innerHTML = `
                    <div class="producto-img">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="producto-info">
                        <p class="nombre">${producto.nombre}</p>
                        <p class="precio">$${producto.precio}</p>
                        <div class="cantidad">
                            <button class="btn-cantidad" onclick="decrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">-</button>
                            <span id="cantidad${producto.nombre.replace(/\s+/g, '')}">1</span>
                            <button class="btn-cantidad" onclick="incrementar('cantidad${producto.nombre.replace(/\s+/g, '')}')">+</button>
                        </div>
                        <button>Añadir al carrito</button>
                    </div>
                `;

                productosContainer.appendChild(productoDiv);
            });

            // Añadir funcionalidad de filtrado por categorías
            const categoryLinks = document.querySelectorAll(".categorias ul li a");
            categoryLinks.forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const category = link.getAttribute("data-categoria");

                    const productos = document.querySelectorAll(".producto");
                    productos.forEach(producto => {
                        if (producto.getAttribute("data-categoria") === category || category === "all") {
                            producto.style.display = "block";
                        } else {
                            producto.style.display = "none";
                        }
                    });
                });
            });

            // Filtrar productos en tiempo real
            const searchInput = document.getElementById("search-input");
            const searchButton = document.getElementById("search-button");

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

        const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const overlay = document.querySelector(".overlay");
    const homeButton = document.querySelector(".home-button");
    const products = document.querySelectorAll(".producto");

    let lastScrollTop = 0; 
    const header = document.querySelector("header");

    // Deshabilitar scroll 
    const disableScroll = () => { 
        document.body.style.overflow = "hidden"; 
    };

    // Habilitar scroll 
    const enableScroll = () => { 
        document.body.style.overflow = "auto"; 
    };

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

