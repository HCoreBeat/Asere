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

    // Obtener información adicional (IP, país, etc.)
    const ipInfo = await fetch('https://ipapi.co/json/').then(res => res.json());
    const ip = ipInfo.ip || 'Desconocida';
    const pais = ipInfo.country_name || 'Desconocido';

    // Crear la estadística a enviar
    const estadistica = {
        ip,
        pais,
        fecha_hora_entrada: new Date().toISOString(),
        origen: document.referrer || 'Acceso directo',
        afiliado: affiliate,
        duracion_sesion_segundos: 300, // Aquí puedes calcularlo dinámicamente
        tiempo_carga_pagina_ms: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        nombre_comprador: fullName,
        telefono_comprador: phone,
        correo_comprador: email,
        compras: cartItems.map(item => ({
            producto: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            precio_total: (item.cantidad * item.precio)
        })),
        precio_compra_total: total
    };

    // Enviar la estadística al backend
    try {
        const response = await fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estadistica)
        });
        const result = await response.text();
        console.log("Estadística enviada exitosamente:", result);

        // Vaciar el carrito
        vaciarCarrito();

        // Mostrar panel de agradecimiento
        mostrarPanelAgradecimiento();
    } catch (error) {
        console.error("Error al enviar la estadística:", error);
        alert("Hubo un problema al registrar tu estadística. Intenta nuevamente.");
    }

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

// Captura el inicio de la sesión al cargar la página
const inicioSesion = Date.now();

// Función para obtener información del usuario
async function registrarVisita() {
    // Información del navegador y página
    const referrer = document.referrer || 'Acceso directo';

    try {
        // Información IP y geolocalización
        const ipInfo = await fetch('https://ipapi.co/json/').then(res => res.json());
        const ip = ipInfo.ip || 'Desconocido';
        const pais = ipInfo.country_name || 'Desconocido';

        // Crea la estadística inicial
        const estadistica = {
            ip,
            pais,
            fecha_hora_entrada: new Date().toISOString(),
            origen: referrer,
            duracion_sesion_segundos: 0 // Actualizaremos este campo más adelante
        };

        // Enviar al backend
        const response = await fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estadistica)
        });

        if (response.ok) {
            console.log("Visita registrada exitosamente.");
        } else {
            console.error("Error al registrar la visita.");
        }
    } catch (error) {
        console.error("Error al obtener información del usuario:", error);
    }
}

// Ejecutar la función cuando se cargue la página
window.addEventListener("load", registrarVisita);


window.addEventListener("beforeunload", async () => {
    const duracionSesionSegundos = Math.round((Date.now() - inicioSesion) / 1000);

    try {
        // Actualizar duración de la sesión al backend
        const response = await fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip: await fetch('https://ipapi.co/ip/').then(res => res.text()),
                duracion_sesion_segundos: duracionSesionSegundos
            })
        });

        if (response.ok) {
            console.log("Duración de la sesión actualizada correctamente.");
        } else {
            console.error("Error al actualizar la duración de la sesión.");
        }
    } catch (error) {
        console.error("Error al enviar la duración de la sesión:", error);
    }
});
