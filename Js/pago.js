// js/payment.js

// Función para obtener datos del carrito desde localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

// Función para obtener el afiliado desde localStorage
function getAffiliate() {
    return localStorage.getItem('affiliateName') || 'Ninguno';
}

// Función para calcular el total de la compra
function calculateTotal(items) {
    return items.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2);
}

// Función para llenar la planilla de pago con los datos del carrito y el afiliado
function fillPaymentForm() {
    const cartItems = getCartItems();
    const summaryItemsContainer = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');

    // Limpiar contenido previo
    summaryItemsContainer.innerHTML = '';

    // Llenar la tabla con los productos del carrito
    cartItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${(item.cantidad * item.precio).toFixed(2)}</td>
        `;
        summaryItemsContainer.appendChild(row);
    });

    // Mostrar el total de la compra
    summaryTotal.textContent = `Total a pagar: $${calculateTotal(cartItems)}`;
}

// Mostrar la planilla de pago al presionar "Proceder al Pago"
document.getElementById('checkout-button').addEventListener('click', function() {
    document.getElementById('carrito').style.display = 'none';
    document.getElementById('planilla-pago').classList.remove('hidden');
    fillPaymentForm();
});

// Manejar el envío del formulario de pago
document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Validar que todos los campos obligatorios están rellenados
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const termsAccepted = document.getElementById('terms').checked;

    if (!fullName || !email || !address || !termsAccepted) {
        alert('Por favor, rellena todos los campos obligatorios y acepta los términos y condiciones.');
        return;
    }

    // Enviar correo electrónico
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        sendEmail(fullName, email, address, getCartItems(), calculateTotal(getCartItems()), getAffiliate());
    } else {
        console.error('Google Apps Script not loaded properly.');
        alert('Error al enviar el correo. Intenta de nuevo más tarde.');
    }

    // Vaciar el carrito
    vaciarCarrito();

    // Mostrar mensaje de éxito
    alert('Pago realizado con éxito');
    // Ocultar la planilla de pago y mostrar el carrito vacío (o mensaje de confirmación)
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById('carrito').style.display = 'none';
});

// Función para enviar el correo electrónico utilizando Google Apps Script
function sendEmail(fullName, email, address, cartItems, total, affiliate) {
    const emailContent = `
        Nombre: ${fullName}\n
        Correo Electrónico: ${email}\n
        Dirección: ${address}\n
        Productos: ${JSON.stringify(cartItems, null, 2)}\n
        Total: $${total}\n
        Afiliado: ${affiliate}
    `;

    google.script.run.withSuccessHandler(function(response) {
        console.log('Correo enviado exitosamente:', response);
    }).withFailureHandler(function(error) {
        console.log('Error al enviar el correo:', error);
    }).sendOrderEmail(email, 'Confirmación de Pedido', emailContent);
}

// Función para cancelar el pago y regresar al carrito
function cancelPayment() {
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById('carrito').style.display = 'block';
}
