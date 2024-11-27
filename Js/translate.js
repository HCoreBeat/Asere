document.addEventListener("DOMContentLoaded", function() {
    const languageSelect = document.getElementById("language-select");
    let locales = {};

    // Cargar el archivo JSON con las traducciones
    fetch("Json/lang.json")
        .then(response => response.json())
        .then(data => {
            locales = data;
            // Establecer el idioma por defecto
            changeLanguage("es");
        });

    // Función para actualizar el contenido de la página
    function updateContent(lang) {
        document.getElementById('slogan').innerText = locales[lang].header.slogan;
        document.getElementById('search-input').placeholder = locales[lang].header.search_placeholder;
        document.getElementById('currency-text').innerText = locales[lang].header.currency_usd; // Cambia según el valor de la moneda actual
        document.getElementById('nav-home').innerHTML = `<i class="fas fa-home"></i> ${locales[lang].header.nav.home}`;
        document.getElementById('nav-products').innerHTML = locales[lang].header.nav.products;
        document.getElementById('nav-contact').innerHTML = locales[lang].header.nav.contact;
        document.getElementById('nav-cart').innerHTML = `<i class="fas fa-shopping-cart"></i> ${locales[lang].header.nav.cart}`;

        // Actualizar categorías
        document.getElementById('cat-all').innerHTML = `<i class="fas fa-bars"></i> ${locales[lang].categories.all}`;
        document.getElementById('cat-offers').innerHTML = `<i class="fas fa-tags"></i> ${locales[lang].categories.offers}`;
        document.getElementById('cat-combos').innerHTML = `<i class="fas fa-box"></i> ${locales[lang].categories.combos}`;
        document.getElementById('cat-fruits').innerHTML = `<i class="fas fa-apple-alt"></i> ${locales[lang].categories.fruits}`;
        document.getElementById('cat-meats').innerHTML = `<i class="fas fa-drumstick-bite"></i> ${locales[lang].categories.meats}`;
        document.getElementById('cat-canned').innerHTML = `<i class="fas fa-box-open"></i> ${locales[lang].categories.canned}`;
        document.getElementById('cat-dressings').innerHTML = `<i class="fas fa-utensils"></i> ${locales[lang].categories.dressings}`;
        document.getElementById('cat-pasta_grains').innerHTML = `<i class="fas fa-boxes"></i> ${locales[lang].categories.pasta_grains}`;
        document.getElementById('cat-dairy').innerHTML = `<i class="fas fa-cheese"></i> ${locales[lang].categories.dairy}`;
        document.getElementById('cat-confectionery').innerHTML = `<i class="fas fa-cookie"></i> ${locales[lang].categories.confectionery}`;
        document.getElementById('cat-drinks').innerHTML = `<i class="fas fa-coffee"></i> ${locales[lang].categories.drinks}`;
        document.getElementById('cat-alcohol').innerHTML = `<i class="fas fa-wine-bottle"></i> ${locales[lang].categories.alcohol}`;
        document.getElementById('cat-cakes').innerHTML = `<i class="fas fa-birthday-cake"></i> ${locales[lang].categories.cakes}`;
        document.getElementById('cat-others').innerHTML = `<i class="fas fa-ellipsis-h"></i> ${locales[lang].categories.others}`;

        // Actualizar los productos
        document.querySelectorAll('.producto-oferta').forEach(el => el.innerText = locales[lang].productos.producto_oferta);
        document.querySelectorAll('.producto-masvendido').forEach(el => el.innerText = locales[lang].productos.producto_masvendido);
        document.querySelectorAll('.boton-agregarcarrito').forEach(el => el.innerText = locales[lang].productos.boton_agregarcarrito);
        
        // Actualizar carrito y footer
        document.getElementById('cart-title').innerText = locales[lang].cart.title;
        document.getElementById('cart-empty-text').innerText = locales[lang].cart.empty;
        document.getElementById('checkout-button').innerText = locales[lang].cart.checkout;
        document.getElementById('regresar').innerText = locales[lang].cart.back;
        document.getElementById('total').innerText = locales[lang].cart.total;
        document.getElementById('footer-about-us').innerText = locales[lang].footer.about_us;
        document.getElementById('footer-about-text').innerText = locales[lang].footer.about_text;
        document.getElementById('footer-quick-links').innerText = locales[lang].footer.quick_links;
        document.getElementById('footer-products').innerText = locales[lang].footer.f_products;
        document.getElementById('footer_contact').innerText = locales[lang].footer.f_contact;
        document.getElementById('footer-follow-us').innerText = locales[lang].footer.follow_us;
        document.getElementById('footer-cart').innerText = locales[lang].footer.f_cart;
        document.getElementById('footer-privacy-policy').innerText = locales[lang].footer.privacy_policy;
        document.getElementById('footer-terms-conditions').innerText = locales[lang].footer.terms_conditions;
    }

    // Función para cambiar el idioma
    function changeLanguage(lang) {
        updateContent(lang);
        // Disparar evento personalizado para notificar el cambio de idioma
        const event = new CustomEvent('languageChanged', { detail: { lang: lang } });
        document.dispatchEvent(event);
    }

    // Evento para cambiar el idioma al seleccionar del dropdown
    languageSelect.addEventListener("change", function() {
        changeLanguage(this.value);
    });
});
