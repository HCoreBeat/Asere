let isProcessing = false;
const submitButton = document.getElementById('submit-button');
const buttonText = submitButton.querySelector('.button-text');
const spinner = submitButton.querySelector('.spinner');

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

function isTotalAboveMinimum() {
    const cartItems = getCartItems();
    // Filtrar solo productos disponibles
    const productosDisponibles = cartItems.filter(item => {
        const productoEnDB = productos.find(p => p.nombre === item.nombre) || 
                            combos.find(c => c.nombre === item.nombre);
        return productoEnDB ? productoEnDB.disponible : false;
    });
    const total = calculateTotal(productosDisponibles);
    return total >= 10;
}

// Función para llenar la planilla de pago con los datos del carrito y el afiliado
function fillPaymentForm() {
    const cartItems = getCartItems();
    const summaryItemsContainer = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');

    // Limpiar contenido previo
    summaryItemsContainer.innerHTML = '';

    // Filtrar solo productos disponibles
    const productosDisponibles = cartItems.filter(item => {
        const productoEnDB = productos.find(p => p.nombre === item.nombre) || 
                            combos.find(c => c.nombre === item.nombre);
        return productoEnDB ? productoEnDB.disponible : false;
    });

    // Llenar la tabla con los productos disponibles del carrito
    productosDisponibles.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${(item.cantidad * item.precio).toFixed(2)}</td>
        `;
        summaryItemsContainer.appendChild(row);
    });

    // Mostrar el total de la compra solo con productos disponibles
    const totalDisponible = calculateTotal(productosDisponibles);
    summaryTotal.textContent = `Total a pagar: $${totalDisponible}`;
    
    // Mostrar advertencia si hay productos no disponibles
    if (productosDisponibles.length < cartItems.length) {
        const warningRow = document.createElement('tr');
        warningRow.innerHTML = `
            <td colspan="4" class="warning-row">
                <i class="fas fa-exclamation-triangle"></i>
                Algunos productos de tu carrito no están disponibles y se mantendrán en el carrito
            </td>
        `;
        summaryItemsContainer.appendChild(warningRow);
    }
}

// Mostrar la planilla de pago al presionar "Proceder al Pago"
document.getElementById('checkout-button').addEventListener('click', () => {
    if (isProcessing) return;
    
    const warningMessage = document.getElementById('warning-message');
    if (isTotalAboveMinimum()) {
        document.getElementById('carrito').style.display = 'none';
        document.getElementById('planilla-pago').classList.remove('hidden');
        fillPaymentForm();
    } else {
        warningMessage.style.display = 'block';
        setTimeout(() => warningMessage.style.display = 'none', 5000);
    }
});

function obtenerFuenteTrafico() {
    const referrer = document.referrer; // Obtiene la URL de referencia
    const urlParams = new URLSearchParams(window.location.search); // Obtiene los parámetros de la URL
    const utmSource = urlParams.get('utm_source'); // Obtiene el parámetro utm_source si existe

    if (utmSource) {
        return utmSource; // Si hay un UTM parameter, lo usamos como fuente
    } else if (referrer) {
        // Si no hay UTM parameter, analizamos el referrer
        const dominioReferrer = new URL(referrer).hostname;
        if (dominioReferrer.includes("google.com")) {
            return "Google";
        } else if (dominioReferrer.includes("facebook.com")) {
            return "Facebook";
        } else if (dominioReferrer.includes("instagram.com")) {
            return "Instagram";
        } else if (dominioReferrer.includes("twitter.com")) {
            return "Twitter";
        } else {
            return dominioReferrer; // Devuelve el dominio de referencia
        }
    } else {
        return "Directo"; // Si no hay referrer, es tráfico directo
    }
}

// Función para obtener fecha/hora actual en formato ISO con zona horaria de Cuba
function getCubanDateTime() {
    const options = {
        timeZone: 'America/Havana',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    
    const dateTimeParts = {
        year: parts.find(p => p.type === 'year').value,
        month: parts.find(p => p.type === 'month').value,
        day: parts.find(p => p.type === 'day').value,
        hour: parts.find(p => p.type === 'hour').value,
        minute: parts.find(p => p.type === 'minute').value,
        second: parts.find(p => p.type === 'second').value,
        timeZone: parts.find(p => p.type === 'timeZoneName').value
    };

    // Formato ISO 8601 sin desplazamiento (ya que estamos representando hora local)
    return `${dateTimeParts.year}-${dateTimeParts.month}-${dateTimeParts.day}T${dateTimeParts.hour}:${dateTimeParts.minute}:${dateTimeParts.second}(${dateTimeParts.timeZone})`;
}

// Función para enviar estadísticas al realizar una compra
async function enviarEstadisticaCompra(fullName, email, phone, cartItems, total, affiliate) {
    try {
        // Obtener información adicional (IP, país, etc.)
        const ipInfo = await fetch('https://ipapi.co/json/').then(res => res.json());
        const ip = ipInfo.ip || 'Desconocida';
        const pais = ipInfo.country_name || 'Desconocido';

        // Obtener navegador y sistema operativo
        const { navegador, sistemaOperativo } = getBrowserAndOS();

        // Obtener la fuente de tráfico
        const fuenteTrafico = obtenerFuenteTrafico();

        // Crear la estadística de compra
        const estadisticaCompra = {
            ip,
            pais,
            fecha_hora_entrada: getCubanDateTime(),
            origen: document.referrer || 'Acceso directo',
            fuente_trafico: fuenteTrafico, // Nueva: fuente de tráfico
            afiliado: affiliate,
            duracion_sesion_segundos: Math.round((Date.now() - inicioSesion) / 1000), // Duración de la sesión
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
            precio_compra_total: total,
            navegador,
            sistema_operativo: sistemaOperativo,
            tipo_usuario: "Comprador" // Marcamos como comprador
        };

        // Enviar la estadística al backend de render.com
        const response = await fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estadisticaCompra)
        });

        if (response.ok) {
            console.log("Estadística de compra enviada exitosamente a render.");
        } else {
            console.error("Error al enviar la estadística de compra:", await response.text());
        }
        // Enviar la estadística al backend de railway.com
        const response2 = await fetch("https://servidor-estadisticas-production.up.railway.app/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estadisticaCompra)
        });

        if (response2.ok) {
            console.log("Estadística de compra enviada exitosamente a railway.");
        } else {
            console.error("Error al enviar la estadística de compra:", await response2.text());
        }
    } catch (error) {
        console.error("Error al enviar la estadística de compra:", error);
    }
}

// Manejar el envío del formulario de pago
document.getElementById('payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    if (isProcessing) return;
    
    try {
        // Bloquear UI
        isProcessing = true;
        submitButton.disabled = true;
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');

        // Validaciones previas
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const termsAccepted = document.getElementById('terms').checked;
        const phone = document.getElementById('phone').value;
        const recipientName = document.getElementById('recipient-name').value;
        const recipientPhone = document.getElementById('recipient-phone').value;

        if (!fullName || !email || !address || !termsAccepted || !phone || !recipientName || !recipientPhone) {
            alert('Por favor, rellena todos los campos obligatorios y acepta los términos y condiciones.');
            return;
        }

        // Obtener datos
        const cartItems = getCartItems();
        const total = calculateTotal(cartItems);
        const affiliate = getAffiliate();

        // Enviar estadísticas
        await enviarEstadisticaCompra(fullName, email, phone, cartItems, total, affiliate);

        // Crear y enviar mensaje
        const message = `
            Nombre completo: ${fullName}
            Correo electrónico: ${email}
            Teléfono del comprador: ${phone}
        
            Datos del destinatario:
            Nombre del destinatario: ${recipientName}
            Teléfono del destinatario: ${recipientPhone}
        
            Dirección de envío: ${address}
            Afiliado: ${affiliate}
            
            Detalles del pedido:
            ${cartItems.map(item => `- ${item.nombre} (x${item.cantidad}): $${(item.precio * item.cantidad).toFixed(2)}`).join('\n')}
        
            Total: $${total}
        `;
        
        const serviceID = 'default_service';
        const templateID = 'template_yw2stbs';
        
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

        // Post-procesamiento
        vaciarCarrito();
        mostrarPanelAgradecimiento();

    } catch (error) {
        console.error("Error en el proceso:", error);
        alert("Error al procesar el pedido. Por favor, inténtalo de nuevo.");
    } finally {
        // Restaurar UI
        isProcessing = false;
        submitButton.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
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
    const panel = document.getElementById('thank-you-panel');
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    
    document.getElementById('order-total-amount').textContent = `$${total}`;
    
    panel.style.display = 'flex';
    setTimeout(() => {
        panel.classList.add('active');
        // Forzar reflow para activar animaciones
        void panel.offsetHeight;
    }, 10);
    
    document.getElementById('planilla-pago').classList.add('hidden');
    
    document.getElementById('continue-shopping').addEventListener('click', goBack);
}


// Función para manejar el regreso a la página principal sin mostrar index.html en la URL
function goBack() {
    window.location.href = 'index.html'; // Redirige al archivo
    // Al cargar la página, actualiza el historial del navegador para eliminar index.html
    window.addEventListener('load', () => {
        const newUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        history.replaceState(null, '', newUrl);
    });
}


// Función para cancelar el pago y regresar al carrito
function cancelPayment() {
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById('carrito').style.display = 'block';
}


// Función para obtener el navegador y sistema operativo
function getBrowserAndOS() {
    const userAgent = navigator.userAgent;
    let navegador = "Desconocido";
    let sistemaOperativo = "Desconocido";

    // Detectar navegador
    if (userAgent.includes("Firefox")) {
        navegador = "Firefox";
    } else if (userAgent.includes("Edg")) {
        navegador = "Edge";
    } else if (userAgent.includes("Chrome")) {
        navegador = "Chrome";
    } else if (userAgent.includes("Safari")) {
        navegador = "Safari";
    }

    // Detectar sistema operativo
    if (userAgent.includes("Windows")) {
        sistemaOperativo = "Windows";
    } else if (userAgent.includes("Android")) {
        sistemaOperativo = "Android";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        sistemaOperativo = "iOS";
    } else if (userAgent.includes("Mac")) {
        sistemaOperativo = "MacOS";
    } else if (userAgent.includes("Linux")) {
        sistemaOperativo = "Linux";
    }

    return { navegador, sistemaOperativo };
}

// Función auxiliar para fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Timeout de ${timeout}ms excedido para: ${url}`);
        }
        throw error;
    }
};

// Función principal mejorada
async function registrarVisita() {
    try {
        const fuenteTrafico = obtenerFuenteTrafico();
        const affiliate = getAffiliate(); // Cambié getAffiliate() para coincidir con tu código original
        
        // Obtener IP con timeout
        const ipInfo = await fetchWithTimeout('https://ipapi.co/json/', {}, 3000)
            .then(res => res.ok ? res.json() : { ip: 'Desconocida', country_name: 'Desconocido' })
            .catch(() => ({ ip: 'Desconocida', country_name: 'Desconocido' }));

        const { navegador, sistemaOperativo } = getBrowserAndOS();
        
        const estadistica = {
            ip: ipInfo.ip,
            pais: ipInfo.country_name,
            fecha_hora_entrada: getCubanDateTime(),
            origen: document.referrer || 'Acceso directo',
            fuente_trafico: fuenteTrafico,
            afiliado: affiliate,
            duracion_sesion_segundos: 0,
            navegador,
            sistema_operativo: sistemaOperativo,
            tipo_usuario: "Único"
        };

        // Enviar en paralelo con Promise.allSettled()
        const resultados = await Promise.allSettled([
            fetchWithTimeout(
                "https://servidor-estadisticas.onrender.com/guardar-estadistica",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(estadistica)
                },
                5000 // 5 segundos timeout
            ),
            fetchWithTimeout(
                "https://servidor-estadisticas-production.up.railway.app/guardar-estadistica",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(estadistica)
                },
                5000 // 5 segundos timeout
            )
        ]);

        // Analizar resultados
        resultados.forEach((resultado, index) => {
            const servicio = index === 0 ? "Render" : "Railway";
            
            if (resultado.status === "fulfilled") {
                if (resultado.value.ok) {
                    console.log(`${servicio}: Registro exitoso`);
                } else {
                    console.error(`${servicio}: Error HTTP ${resultado.value.status}`);
                }
            } else {
                console.error(`${servicio}: Error de conexión`, resultado.reason.message);
            }
        });

    } catch (error) {
        console.error("Error crítico en registro:", error);
    }
}

// Llamar a `registrarVisita` al cargar la página
window.addEventListener("load", registrarVisita);

// Función para registrar la duración de la sesión antes de que el usuario cierre o recargue la página
window.addEventListener("beforeunload", async () => {
    const duracionSesionSegundos = Math.round((Date.now() - inicioSesion) / 1000);

    try {
        // Obtener la información de la IP del usuario
        const ipInfo = await fetch('https://ipapi.co/json/')
            .then(res => res.ok ? res.json() : { ip: 'Desconocida' });

        const ip = ipInfo.ip || 'Desconocida';

        // Enviar la duración al backend de render.com
        const response = await fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip,
                duracion_sesion_segundos: duracionSesionSegundos,
                tiempo_promedio_pagina: duracionSesionSegundos // Actualizar tiempo promedio
            })
        });

        if (response.ok) {
            console.log("Duración de la sesión actualizada correctamente en render.");
        } else {
            console.error("Error al actualizar la duración de la sesión:", await response.text());
        }

        // Enviar la duración al backend de railway.com
        const response2 = await fetch("https://servidor-estadisticas-production.up.railway.app/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip,
                duracion_sesion_segundos: duracionSesionSegundos,
                tiempo_promedio_pagina: duracionSesionSegundos // Actualizar tiempo promedio
            })
        });

        if (response2.ok) {
            console.log("Duración de la sesión actualizada correctamente en railway.");
        } else {
            console.error("Error al actualizar la duración de la sesión:", await response2.text());
        }
    } catch (error) {
        console.error("Error al enviar la duración de la sesión:", error);
    }
});
// Captura el inicio de la sesión al cargar la página
const inicioSesion = Date.now();
