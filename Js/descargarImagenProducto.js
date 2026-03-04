// Js/descargarImagenProducto.js
// Genera y descarga una imagen mejorada del producto usando html2canvas
// Versión 2.0: Mejoras en calidad, nombre de archivo y responsividad

/**
 * Obtiene el nombre del producto limpio
 * @returns {string} Nombre del producto
 */
function obtenerNombreProducto() {
  const nombreEl = document.getElementById('detalle-nombre');
  let nombre = nombreEl ? nombreEl.textContent.trim() : 'producto';
  
  // Cleaning y sanitización del nombre para el archivo
  nombre = nombre
    .replace(/[<>:"/\\|?*]/g, '') // Caracteres inválidos en Windows
    .slice(0, 50) // Limitar a 50 caracteres
    .trim();
  
  return nombre || 'producto-asere';
}

/**
 * Genera y descarga una imagen de promoción minimalista y compacta del producto
 * Optimizada para compartir en redes sociales y promociones
 */
function descargarImagenProducto() {
  const detalle = document.getElementById('detalle-contenido');
  if (!detalle) {
    console.error('No se encontró el elemento detalle-contenido');
    return;
  }

  // Obtener datos del producto
  const nombreProducto = obtenerNombreProducto();
  
  // Creamos un clon del área de detalle para personalizar la imagen
  const clon = detalle.cloneNode(true);
  
  // ============ ESTILOS MINIMALISTAS Y COMPACTOS ============
  // Dimensiones optimizadas, menos espacios blancos laterales
  clon.style.width = '400px';
  clon.style.background = '#ffffff';
  clon.style.borderRadius = '0px';
  clon.style.padding = '16px';
  clon.style.boxSizing = 'border-box';
  clon.style.fontFamily = '"Roboto", Arial, sans-serif';
  clon.style.boxShadow = 'none';
  clon.style.overflow = 'visible';
  clon.style.display = 'flex';
  clon.style.flexDirection = 'column';
  clon.style.alignItems = 'center';
  clon.style.justifyContent = 'space-between';
  clon.style.position = 'relative';

  // fondo con imagen inclinada y opacidad suave
  const bg = document.createElement('div');
  bg.style.position = 'absolute';
  bg.style.inset = '0';
  bg.style.backgroundImage = "url('img/new.jpg')";
  bg.style.backgroundSize = 'cover';
  bg.style.backgroundPosition = 'center';
  bg.style.backgroundRepeat = 'no-repeat';
  bg.style.width = '390px';
  bg.style.height = '390px';
  bg.style.marginTop = '50px';
  bg.style.marginLeft = '25px';
  bg.style.opacity = '0.1';
  bg.style.transform = 'rotate(-3deg) scale(1)';
  bg.style.zIndex = '0';
  // insertar como primer hijo para que todos los demás elementos queden encima
  clon.insertBefore(bg, clon.firstChild);
  
  // asegurar que contenido esté por encima
  clon.style.zIndex = '1';
  
  // ============ LIMPIEZA DE ELEMENTOS INNECESARIOS ============
  const elementosAOcultar = [
    '.panel-btn-volver',
    '.btn-carrito',
    '.cantidad',
    '.product-description',
    '.galeria-imagenes',
    '#productos-sugeridos',
    '#detalle-extra',
    '#detalle-envio',
    '#imagenes-adicionales',
    '#puntos-indicadores',
    '.btn-compartir-float'
  ];
  
  elementosAOcultar.forEach(selector => {
    clon.querySelectorAll(selector).forEach(el => el.remove());
  });

  // ============ CONTENEDOR DE IMAGEN - SIN DISTORSIÓN ============
  const imagenEl = clon.querySelector('#detalle-imagen');
  if (imagenEl) {
    imagenEl.style.width = '100%';
    imagenEl.style.height = 'auto';
    imagenEl.style.maxWidth = '320px';
    imagenEl.style.objectFit = 'contain';
    imagenEl.style.objectPosition = 'center';
    imagenEl.style.borderRadius = '12px';
    imagenEl.style.background = '#f5f5f5';
    imagenEl.style.padding = '16px';
    imagenEl.style.boxSizing = 'border-box';
    imagenEl.style.boxShadow = 'none';
    imagenEl.style.display = 'block';
    imagenEl.style.margin = '0 auto 16px';
  }

  // ============ NOMBRE COMPACTO Y MINIMALISTA ============
  const nombreEl = clon.querySelector('#detalle-nombre');
  if (nombreEl) {
    nombreEl.style.fontSize = '1.4em';
    nombreEl.style.fontWeight = '700';
    nombreEl.style.color = '#1a1a1a';
    nombreEl.style.marginBottom = '5px';
    nombreEl.style.lineHeight = '1.2';
    nombreEl.style.padding = '0';
    nombreEl.style.margin = '0 0 5px 0';
    nombreEl.style.textAlign = 'center';
    nombreEl.style.maxWidth = '100%';
  }

  // ============ BADGE "Más Vendido" - MINIMALISTA ============
  const badge = clon.querySelector('.mas-vendido-badge');
  if (badge) {
    badge.style.display = 'none';
  }

  // ============ SECCIÓN DE PRECIOS - MINIMALISTA ============
  const precioContainer = clon.querySelector('.precio-container');
  if (precioContainer) {
    precioContainer.style.display = 'flex';
    precioContainer.style.flexDirection = 'column';
    precioContainer.style.gap = '4px';
    precioContainer.style.marginBottom = '5px';
    precioContainer.style.padding = '0';
    precioContainer.style.background = 'transparent';
    precioContainer.style.borderRadius = '0';
    precioContainer.style.border = 'none';
    precioContainer.style.alignItems = 'center';
  }

  // Modificar estructura de precios para mostrar de forma compacta
  const descuentoContainer = precioContainer?.querySelector('.descuento-pvpr-container');
  if (descuentoContainer) {
    descuentoContainer.style.display = 'flex';
    descuentoContainer.style.gap = '8px';
    descuentoContainer.style.alignItems = 'center';
    descuentoContainer.style.justifyContent = 'center';
    descuentoContainer.style.margin = '0 0 4px 0';
  }

  // Precio principal DESTACADO
  const precio = clon.querySelector('#detalle-precio');
  if (precio) {
    precio.style.fontSize = '2.4em';
    precio.style.fontWeight = '800';
    precio.style.color = '#d32f2f';
    precio.style.margin = '0';
    precio.style.lineHeight = '1';
    precio.style.textAlign = 'center';
  }

  // PVPR (tachado pequeño)
  const pvpr = clon.querySelector('#detalle-pvpr');
  if (pvpr && pvpr.textContent.trim()) {
    pvpr.style.fontSize = '0.9em';
    pvpr.style.color = '#aaa';
    pvpr.style.textDecoration = 'line-through';
    pvpr.style.fontWeight = '400';
    pvpr.style.margin = '0';
  }

  // Descuento COMPACTO
  const descuento = clon.querySelector('#detalle-descuento');
  if (descuento && descuento.textContent.trim()) {
    descuento.style.display = 'inline-block';
    descuento.style.background = '#ffeb3b';
    descuento.style.color = '#d84315';
    descuento.style.fontWeight = '700';
    descuento.style.fontSize = '0.85em';
    descuento.style.padding = '3px 8px';
    descuento.style.borderRadius = '4px';
    descuento.style.margin = '0';
    descuento.style.border = 'none';
  }

  // ============ PIE MINIMALISTA CON BRANDING ============
  const infoSitio = document.createElement('div');
  infoSitio.style.marginTop = '16px';
  infoSitio.style.paddingTop = '12px';
  infoSitio.style.borderTop = '1px solid #e0e0e0';
  infoSitio.style.textAlign = 'center';
  infoSitio.style.width = '100%';
  
  const logo = document.createElement('div');
  logo.textContent = 'ASERE SHOPS';
  logo.style.fontSize = '0.95em';
  logo.style.fontWeight = '800';
  logo.style.color = '#1a5c4a';
  logo.style.marginBottom = '2px';
  logo.style.letterSpacing = '0.5px';
  
  const url = document.createElement('div');
  url.textContent = 'www.asereshops.com';
  url.style.color = '#009688';
  url.style.fontWeight = '600';
  url.style.fontSize = '0.85em';
  
  infoSitio.appendChild(logo);
  infoSitio.appendChild(url);
  clon.appendChild(infoSitio);

  // ============ CREAR CONTENEDOR TEMPORAL FUERA DE PANTALLA ============
  const temp = document.createElement('div');
  temp.style.position = 'fixed';
  temp.style.left = '-9999px';
  temp.style.top = '0';
  temp.style.width = '400px';
  temp.appendChild(clon);
  document.body.appendChild(temp);

  // ============ CAPTURAR Y DESCARGAR EN JPG - OPTIMIZADO ============
  if (!window.html2canvas) {
    alert('Error: html2canvas no está cargado. Por favor recarga la página.');
    document.body.removeChild(temp);
    return;
  }

  html2canvas(clon, {
    backgroundColor: '#ffffff',
    scale: 2, // Escala optimizada para compacto
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: 400,
    windowHeight: clon.scrollHeight
  }).then(canvas => {
    try {
      // Convertir a JPG con calidad alta
      const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
      
      // Nombre de archivo con nombre del producto
      const nombreArchivo = `${nombreProducto}-asere.jpg`;
      
      // Crear y disparar descarga
      const link = document.createElement('a');
      link.download = nombreArchivo;
      link.href = dataUrl;
      link.click();
      
      // Limpiar
      document.body.removeChild(temp);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      alert('Error al descargar la imagen. Por favor intenta nuevamente.');
      document.body.removeChild(temp);
    }
  }).catch(error => {
    console.error('Error al capturar la imagen:', error);
    alert('Error al generar la imagen. Por favor intenta nuevamente.');
    document.body.removeChild(temp);
  });
}

// ============ VINCULACIÓN DE EVENTOS ============
window.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btn-compartir-producto');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      descargarImagenProducto();
    });
  }
});
