// Función para obtener datos del carrito desde localStorage
function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (error) {
        console.error("Error al obtener los datos del carrito:", error);
        return [];
    }
}

// Función para obtener el afiliado desde localStorage
function getAffiliate() {
    return localStorage.getItem('affiliateName') || 'Ninguno';
}

// Función para calcular el total de la compra
function calculateTotal(items) {
    return items.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2);
}

// Función para verificar si el total cumple con el mínimo requerido
function isTotalAboveMinimum() {
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    return total >= 10;
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
document.getElementById('checkout-button').addEventListener('click', () => {
    const warningMessage = document.getElementById('warning-message');
    
    if (isTotalAboveMinimum()) {
        document.getElementById('carrito').style.display = 'none';
        document.getElementById('planilla-pago').classList.remove('hidden');
        fillPaymentForm();
    } else {
        warningMessage.style.display = 'block';
        setTimeout(() => {
            warningMessage.style.display = 'none';
        }, 5000); // Ocultar después de 5 segundos
    }
});

// Manejar el envío del formulario de pago
document.getElementById('payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validar que todos los campos obligatorios están rellenados
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const termsAccepted = document.getElementById('terms').checked;
    const phone = document.getElementById('phone').value;

    if (!fullName || !email || !address || !termsAccepted || !phone) {
        alert('Por favor, rellena todos los campos obligatorios y acepta los términos y condiciones.');
        return;
    }

    // Obtener datos del carrito y afiliado
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    const affiliate = getAffiliate();

    // Crear el mensaje con los detalles
    const message = `
        Nombre completo: ${fullName}
        Correo electrónico: ${email}
        Telefono: ${phone}
        Dirección: ${address}
        Afiliado: ${affiliate}
        
        Detalles del pedido:
        ${cartItems.map(item => `- ${item.nombre} (x${item.cantidad}): $${(item.precio * item.cantidad).toFixed(2)}`).join('\n')}

        Total: $${total}
    `;

    // Enviar los datos a EmailJS
    const serviceID = 'default_service';
    const templateID = 'template_yw2stbs';

    try {
        const response = await emailjs.send(
            serviceID,
            templateID,
            {
                name: fullName,
                email: email,
                message: message
            },
            "UE5xZtzvJ3W5lClZS"
        );
        console.log("Correo enviado exitosamente:", response);

        // Vaciar el carrito
        vaciarCarrito();

        // Mostrar panel de agradecimiento
        mostrarPanelAgradecimiento();

    } catch (error) {
        console.log("Error al enviar el correo:", error);
        alert("Error al enviar el correo. Por favor, inténtalo de nuevo.");
    }
});

// Función para vaciar el carrito
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    document.getElementById('summary-items').innerHTML = '';
    document.getElementById('summary-total').textContent = '';
}

// Función para mostrar el panel de agradecimiento
function mostrarPanelAgradecimiento() {
        // Mostrar el panel de agradecimiento
    const panelAgradecimiento = document.getElementById('thank-you-panel');
    panelAgradecimiento.style.display = 'flex';
}

// Función para cancelar el pago y regresar al carrito
function cancelPayment() {
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById('carrito').style.display = 'block';
}

// Función para manejar el regreso a la página principal sin recargar
function goBack() {
    window.location.href = 'index.html'; // Redirige sin recargar la página
}
