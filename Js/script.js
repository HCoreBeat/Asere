// Datos iniciales de los productos
const productos = {
    cantidad1: 1, // Producto 1
    cantidad2: 1, // Producto 2
};

// Incrementar la cantidad
function incrementar(id) {
    productos[id]++;
    document.getElementById(id).textContent = productos[id];
}

// Decrementar la cantidad
function decrementar(id) {
    if (productos[id] > 1) {
        productos[id]--;
        document.getElementById(id).textContent = productos[id];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const overlay = document.querySelector(".overlay");
    const homeButton = document.querySelector(".home-button");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const products = document.querySelectorAll(".producto");
    const categoryLinks = document.querySelectorAll(".categorias ul li a");

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
        if (scrollTop > lastScrollTop) { 
            // Scroll hacia abajo 
            header.style.top = "-210px"; // Oculta el header 
        } else { 
            // Scroll hacia arriba 
            header.style.top = "0"; // Muestra el header 
        } 
        lastScrollTop = scrollTop; });

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
    });

    

    // Filtrar productos en tiempo real
    searchInput.addEventListener("input", filterProducts);
    searchButton.addEventListener("click", filterProducts);

    function filterProducts() {
        const searchValue = searchInput.value.toLowerCase();

        products.forEach(product => {
            const productName = product.getAttribute("data-nombre").toLowerCase();
            if (productName.includes(searchValue)) {
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        });
    }

    // Filtrar productos por categoría
    categoryLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const category = link.getAttribute("data-categoria");

            products.forEach(product => {
                if (product.getAttribute("data-categoria") === category || category === "all") {
                    product.style.display = "block";
                } else {
                    product.style.display = "none";
                }
            });
        });
    });
});
