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
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const products = document.querySelectorAll(".producto");
    const categoryLinks = document.querySelectorAll(".categorias ul li a");

    // Toggle menú
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
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
