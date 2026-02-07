let checkoutToken = null;

// Función para generar token aleatorio
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Función para validar acceso a planilla
function validateCheckoutAccess() {
    const token = sessionStorage.getItem('checkoutToken');
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    
    return token === checkoutToken && 
           cartItems && 
           cartItems.length > 0 && 
           parseFloat(total) > 0;
}

// Observer para detectar cambios en la visibilidad de la planilla
const planillaObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'planilla-pago') {
            const isHidden = mutation.target.classList.contains('hidden');
            if (!isHidden && !validateCheckoutAccess()) {
                mutation.target.classList.add('hidden');
                console.warn('Intento de acceso no autorizado a la planilla de pago');
            }
        }
    });
});

// Iniciar observación de la planilla
const planillaPago = document.getElementById('planilla-pago');
if (planillaPago) {
    planillaObserver.observe(planillaPago, {
        attributes: true,
        attributeFilter: ['class']
    });
}

let isProcessing = false;
const submitButton = document.getElementById('submit-button');
const buttonText = submitButton.querySelector('.button-text');
const spinner = submitButton.querySelector('.spinner');
const processingMessage = document.getElementById('processing-message');

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
        const productoEnDB = productos.find(p => p.nombre === item.nombre) || combos.find(c => c.nombre === item.nombre);
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
        const productoEnDB = productos.find(p => p.nombre === item.nombre) || combos.find(c => c.nombre === item.nombre);
        return productoEnDB ? productoEnDB.disponible : false;
    });

    // Llenar la tabla con los productos disponibles del carrito
    productosDisponibles.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${ (window.getCurrentCurrency && window.getCurrentCurrency()? ({ USD: 'US$', EUR: '€', UYU: 'U$' }[window.getCurrentCurrency()]) : 'US$') }${item.precio.toFixed(2)}</td>
        <td>${ (window.getCurrentCurrency && window.getCurrentCurrency()? ({ USD: 'US$', EUR: '€', UYU: 'U$' }[window.getCurrentCurrency()]) : 'US$') }${(item.cantidad * item.precio).toFixed(2)}</td>
        `;
        summaryItemsContainer.appendChild(row);
    });

    // Mostrar el total de la compra solo con productos disponibles
    const totalDisponible = calculateTotal(productosDisponibles);
    const _cur = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
    const _symbol = { USD: 'US$', EUR: '€', UYU: 'UYU$' }[_cur] || 'US$';
    summaryTotal.textContent = `Total a pagar: ${_symbol}${totalDisponible}`;
    
    // Advertencia si hay productos no disponibles
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

// Mostrar la planilla de pago al presionar "Proceder al Pedido"
document.getElementById('checkout-button').addEventListener('click', () => {
    if (isProcessing) return;
    
    const warningMessage = document.getElementById('warning-message');
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    
    // Validaciones robustas
    if (!cartItems || cartItems.length === 0) {
        alert('Tu carrito está vacío. Añade productos antes de proceder al pago.');
        return;
    }
    
    if (parseFloat(total) <= 0) {
        alert('El total de tu compra debe ser mayor a 0.');
        return;
    }
    
    if (isTotalAboveMinimum()) {
        // Generar y guardar token de sesión
        checkoutToken = generateToken();
        sessionStorage.setItem('checkoutToken', checkoutToken);
        
        document.getElementById('carrito').style.display = 'none';
        document.getElementById('planilla-pago').classList.remove('hidden');
        fillPaymentForm();
        
        // Iniciar check periódico del estado
        const checkInterval = setInterval(() => {
            if (!validateCheckoutAccess()) {
                document.getElementById('planilla-pago').classList.add('hidden');
                document.getElementById('carrito').style.display = 'block';
                clearInterval(checkInterval);
                console.warn('Sesión de pago invalidada');
            }
        }, 1000);
    } else {
        warningMessage.style.display = 'block';
        setTimeout(() => warningMessage.style.display = 'none', 5000);
      }
});

// Función para obtener la fuente de tráfico
function obtenerFuenteTrafico() {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');

    if (utmSource) return utmSource;
    else if (referrer) {
        const dominioReferrer = new URL(referrer).hostname;
        if (dominioReferrer.includes("google.com")) return "Google";
        if (dominioReferrer.includes("facebook.com")) return "Facebook";
        if (dominioReferrer.includes("instagram.com")) return "Instagram";
        if (dominioReferrer.includes("twitter.com")) return "Twitter";
        return dominioReferrer;
    } else return "Directo";
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

    return `${dateTimeParts.year}-${dateTimeParts.month}-${dateTimeParts.day}T${dateTimeParts.hour}:${dateTimeParts.minute}:${dateTimeParts.second}(${dateTimeParts.timeZone})`;
}

// Función para enviar estadísticas al realizar una compra
async function enviarEstadisticaCompra(fullName, email, phone, address, cartItems, total, affiliate) {
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
        fuente_trafico: fuenteTrafico,
        afiliado: affiliate,
        duracion_sesion_segundos: Math.round((Date.now() - inicioSesion) / 1000),
        tiempo_carga_pagina_ms: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        nombre_comprador: fullName,
        telefono_comprador: phone,
        correo_comprador: email,
        direccion_envio: address,
        compras: cartItems.map(item => ({
            producto: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            precio_total: (item.cantidad * item.precio)
        })),
            precio_compra_total: total,
            navegador,
            sistema_operativo: sistemaOperativo,
            tipo_usuario: "Comprador"
        };

      // Enviar la estadística a dos backends en paralelo
      const responseEndpoints = await Promise.allSettled([
        fetch("https://servidor-estadisticas.onrender.com/guardar-estadistica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(estadisticaCompra)
        }),
      ]);

        responseEndpoints.forEach((resultado) => {
        const servicio = "Render";
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
        console.error("Error al enviar la estadística de compra:", error);
    }
}

// Función auxiliar para validar el formulario de pago
function validatePaymentForm() {
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const termsAccepted = document.getElementById('terms').checked;
  const phone = document.getElementById('phone').value.trim();
  const recipientName = document.getElementById('recipient-name').value.trim();
  const recipientPhone = document.getElementById('recipient-phone').value.trim();

  // Validación simple de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!fullName || !email || !address || !phone || !recipientName || !recipientPhone) {
    return { valid: false, message: 'Por favor, rellena todos los campos obligatorios.' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Por favor, introduce un correo electrónico válido.' };
  }
  if (!termsAccepted) {
    return { valid: false, message: 'Debes aceptar los términos y condiciones.' };
  }
  return { valid: true };
}

// Manejar el envío del formulario de pago con EmailJs
document.getElementById('payment-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // Validar acceso antes de procesar
  if (!validateCheckoutAccess()) {
    alert('Sesión de pago inválida. Por favor, intenta nuevamente desde el carrito.');
    document.getElementById('planilla-pago').classList.add('hidden');
    document.getElementById('carrito').style.display = 'block';
    return;
  }

  // Validar el formulario
  const validation = validatePaymentForm();
  if (!validation.valid) {
    alert(validation.message);
    return;
  }
  
  // Bloquear UI y mostrar spinner
  isProcessing = true;
  submitButton.disabled = true;
  buttonText.classList.add('hidden');
  spinner.classList.remove('hidden');

  // Mostrar mensaje de procesamiento si tarda más de 5 segundos
  const processingTimeout = setTimeout(() => {
    processingMessage.textContent = "Estamos procesando su pedido, por favor espere...";
    processingMessage.style.display = "block";
  }, 5000);

  try {
    // Recopilar datos del formulario
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const recipientName = document.getElementById('recipient-name').value.trim();
    const recipientPhone = document.getElementById('recipient-phone').value.trim();

    // Obtener información de la IP
    const ipInfoData = await fetch('https://ipapi.co/json/').then(res => res.json());


    // Obtener datos del carrito
    const cartItems = getCartItems();
    const total = calculateTotal(cartItems);
    const affiliate = getAffiliate();

    // Prevención: no permitir procesar un pago si el carrito está vacío o el total es 0
    // (protege contra accesos directos a la planilla y envíos fraudulentos desde la UI)
    if (!cartItems || cartItems.length === 0 || parseFloat(total) <= 0) {
      alert('Tu carrito está vacío. Añade productos antes de proceder al pago.');
      // Lanzamos una excepción controlada para saltar al finally y restaurar la UI
      throw new Error('Carrito vacío - cancelando envío');
    }

    // Enviar estadísticas de compra
    await enviarEstadisticaCompra(fullName, email, phone, address, cartItems, total, affiliate);

    // Crear mensaje de pedido
    const curTot = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
    const symTot = { USD: 'US$', EUR: '€', UYU: 'UYU$' }[curTot] || 'US$';
    const totalFormatted = (parseFloat(total) || 0).toFixed(2);
    const message = `
    Nombre completo: ${fullName}
    Correo electrónico: ${email}
    País: ${ipInfoData.country_name || 'Desconocido'}
    Teléfono del comprador: ${phone}

    Datos del destinatario:
    Nombre del destinatario: ${recipientName}
    Teléfono del destinatario: ${recipientPhone}

    Dirección de envío: ${address}
    Afiliado: ${affiliate}

    Detalles del pedido:
    ${cartItems.map(item => `- ${item.nombre} (x${item.cantidad}): ${ (window.getCurrentCurrency && window.getCurrentCurrency()? ({ USD: 'US$', EUR: '€', UYU: 'UYU$' }[window.getCurrentCurrency()]) : 'US$') }${(item.precio * item.cantidad).toFixed(2)}`).join('\n')}

    Total: ${symTot}${totalFormatted}
    `;

    const serviceID = 'default_service';
    const templateID = 'template_yw2stbs';
    
    // Enviar correo mediante emailjs
    await emailjs.send(
      serviceID,
      templateID,
      { name: fullName, email: email, message: message },
      "UE5xZtzvJ3W5lClZS"
    );

    // Vaciar carrito y mostrar panel de agradecimiento
    vaciarCarrito();
    mostrarPanelAgradecimiento();

  } catch (error) {
        console.error("Error en el proceso:", error);
        alert("Error al procesar el pedido. Por favor, inténtalo de nuevo.");
  } finally {
        clearTimeout(processingTimeout);
        processingMessage.style.display = "none";
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
    
    const cur = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
    const symbol = { USD: 'US$', EUR: '€', UYU: 'UYU$' }[cur] || 'US$';
    document.getElementById('order-total-amount').textContent = `${symbol}${total}`;
    
    panel.style.display = 'flex';
    setTimeout(() => {
        panel.classList.add('active');
        void panel.offsetHeight;
    }, 10);
  
    document.getElementById('planilla-pago').classList.add('hidden');
  
    document.getElementById('continue-shopping').addEventListener('click', goBack);
}

// Función para manejar el regreso a la página principal sin mostrar index.html en la URL
function goBack() {
    window.location.href = 'index.html';
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

    if (userAgent.includes("Firefox")) navegador = "Firefox";
    else if (userAgent.includes("Edg")) navegador = "Edge";
    else if (userAgent.includes("Chrome")) navegador = "Chrome";
    else if (userAgent.includes("Safari")) navegador = "Safari";

    if (userAgent.includes("Windows")) sistemaOperativo = "Windows";
    else if (userAgent.includes("Android")) sistemaOperativo = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) sistemaOperativo = "iOS";
    else if (userAgent.includes("Mac")) sistemaOperativo = "MacOS";
    else if (userAgent.includes("Linux")) sistemaOperativo = "Linux";

  return { navegador, sistemaOperativo };
}

// Función auxiliar para fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error(`Timeout de ${timeout}ms excedido para: ${url}`);
        }
        throw error;
    }
};

// Función principal mejorada para registrar la visita
async function registrarVisita() {
  try {
    const fuenteTrafico = obtenerFuenteTrafico();
    const affiliate = getAffiliate();
    
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

    // Enviar en paralelo a dos endpoints
    const resultados = await Promise.allSettled([
      fetchWithTimeout(
        "https://servidor-estadisticas.onrender.com/guardar-estadistica",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(estadistica)
        },
        5000
      ),
    ]);

    resultados.forEach((resultado) => {
      const servicio = "Render";
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

// Registrar la visita al cargar la página
window.addEventListener("load", registrarVisita);

// Registrar la duración de la sesión antes de que el usuario cierre o recargue la página
window.addEventListener("beforeunload", async () => {
  const duracionSesionSegundos = Math.round((Date.now() - inicioSesion) / 1000);

  try {
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
        tiempo_promedio_pagina: duracionSesionSegundos
      })
    });

    if (response.ok) console.log("Duración de la sesión actualizada correctamente en render.");
    else console.error("Error al actualizar la duración de la sesión:", await response.text());
  } catch (error) {
    console.error("Error al enviar la duración de la sesión:", error);
  }
});

// Captura el inicio de la sesión al cargar la página
const inicioSesion = Date.now();
