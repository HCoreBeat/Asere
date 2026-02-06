// Js/descargarImagenProducto.js
// Genera y descarga una imagen del producto usando html2canvas

function descargarImagenProducto() {
  const detalle = document.getElementById('detalle-contenido');
  if (!detalle) return;

  // Creamos un clon del área de detalle para personalizar la imagen
  const clon = detalle.cloneNode(true);
  clon.style.width = '400px';
  clon.style.background = '#faf8f4';
  clon.style.borderRadius = '20px';
  clon.style.padding = '24px';
  clon.style.boxSizing = 'border-box';
  clon.style.fontFamily = 'Roboto, Arial, sans-serif';
  clon.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)';

  // Limpiamos elementos innecesarios
  clon.querySelectorAll('.panel-btn-volver, .btn-carrito, .cantidad, .product-description, .galeria-imagenes, #productos-sugeridos, #detalle-extra, #detalle-envio').forEach(e => e.remove());

  // Personalizamos el badge "Más Vendido"
  const badge = clon.querySelector('.mas-vendido-badge');
  if (badge) {
    badge.style.display = 'inline-block';
    badge.style.background = '#ffe9a7';
    badge.style.color = '#222';
    badge.style.fontWeight = 'bold';
    badge.style.fontSize = '1.1em';
    badge.style.padding = '6px 18px';
    badge.style.borderRadius = '10px';
    badge.style.marginBottom = '12px';
    badge.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
  }

  // Agregamos la url y descuento visual
  const url = document.createElement('div');
  url.textContent = 'www.asereshops.com';
  url.style.fontSize = '1.1em';
  url.style.color = '#888';
  url.style.marginTop = '18px';
  url.style.fontWeight = '500';
  clon.appendChild(url);

  // Si hay descuento, lo mostramos destacado
  const descuento = clon.querySelector('#detalle-descuento');
  if (descuento && descuento.textContent.trim()) {
    descuento.style.display = 'inline-block';
    descuento.style.background = '#ffe9a7';
    descuento.style.color = '#d32f2f';
    descuento.style.fontWeight = 'bold';
    descuento.style.fontSize = '1.1em';
    descuento.style.padding = '4px 12px';
    descuento.style.borderRadius = '8px';
    descuento.style.marginLeft = '0';
    descuento.style.marginTop = '10px';
  }

  // Creamos un contenedor temporal fuera de pantalla
  const temp = document.createElement('div');
  temp.style.position = 'fixed';
  temp.style.left = '-9999px';
  temp.style.top = '0';
  temp.appendChild(clon);
  document.body.appendChild(temp);

  // Usamos html2canvas para capturar el clon
  html2canvas(clon, {backgroundColor: '#faf8f4', scale: 2}).then(canvas => {
    const link = document.createElement('a');
    link.download = 'producto-asere.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    document.body.removeChild(temp);
  });
}

// Vinculamos el evento al botón de compartir si existe
window.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btn-compartir-producto');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      descargarImagenProducto();
    });
  }
});// Script para generar y descargar imagen del producto usando html2canvas
// Requiere: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js

document.addEventListener('DOMContentLoaded', function() {
  const btnDescargar = document.getElementById('btn-descargar-imagen-producto');
  if (!btnDescargar) return;



  btnDescargar.addEventListener('click', function() {
    // Obtener datos del producto actual
    const nombre = document.getElementById('detalle-nombre')?.textContent || '';
    const precio = document.getElementById('detalle-precio')?.textContent || '';
    const pvprEl = document.querySelector('#detalle-pvpr .pvpr-value') || document.getElementById('detalle-pvpr');
    const pvpr = pvprEl ? (pvprEl.dataset && pvprEl.dataset.basePrice ? pvprEl.dataset.basePrice : pvprEl.textContent) : '';
    const descuento = document.getElementById('detalle-descuento')?.textContent || '';
    const imagen = document.getElementById('detalle-imagen')?.src || '';
    const link = window.location.origin.replace(/\/$/, '') + '/producto.html?id=' + (window.productoActualId || '');
    const descripcion = document.getElementById('detalle-descripcion')?.textContent || '';
    const categoria = document.getElementById('detalle-categoria')?.textContent || '';

    // Rellenar el contenedor de captura (promo-captura)
    // Poblar campos para el layout minimalista tipo pasta
    document.getElementById('captura-badge').textContent = categoria || 'FEATURED ITEM';
    document.getElementById('captura-nombre').textContent = nombre;
    // Detectar número independientemente del símbolo y anteponer el símbolo actual
    const priceMatch = precio.match(/([0-9]+(?:[.,][0-9]{1,2})?)/)?.[0];
    const pvprMatch = pvpr.match(/([0-9]+(?:[.,][0-9]{1,2})?)/)?.[0];
    const currentCurrency = (window.getCurrentCurrency && window.getCurrentCurrency()) ? window.getCurrentCurrency() : 'USD';
    const symbolMap = { USD: 'US$', EUR: '€', UYU: 'UYU$' };
    const curSymbol = symbolMap[currentCurrency] || 'US$';
    document.getElementById('captura-precio').textContent = priceMatch ? `${curSymbol}${priceMatch}` : precio;
    document.getElementById('captura-pvpr').textContent = pvprMatch ? `${curSymbol}${pvprMatch}` : '';
    document.getElementById('captura-descuento').textContent = descuento ? descuento : '';
    document.getElementById('captura-imagen').src = imagen;
    document.getElementById('captura-link').textContent = link.replace('https://','').replace('http://','');

    // Fondo degradado dinámico basado en la imagen
    const captura = document.getElementById('captura-producto');
    setDynamicGradient(imagen, captura);

    // También actualizar el fondo blur
    const blur = captura.querySelector('.promo-bg-blur');
    if (blur) {
      blur.style.background = captura.style.background;
    }

    // Esperar a que la imagen cargue
    const img = document.getElementById('captura-imagen');
    if (!img.complete) {
      img.onload = () => generarCaptura();
    } else {
      generarCaptura();
    }
  });

  // Generar fondo degradado dinámico usando la imagen del producto
  function setDynamicGradient(imgUrl, targetDiv) {
    if (!imgUrl || !targetDiv) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;
    img.onload = function() {
      // Extraer color promedio (simple, solo para fondo)
      const canvas = document.createElement('canvas');
      canvas.width = 10; canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 10, 10);
      let r=0,g=0,b=0,count=0;
      const data = ctx.getImageData(0,0,10,10).data;
      for(let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];count++;}
      r=Math.round(r/count);g=Math.round(g/count);b=Math.round(b/count);
      // Crear degradado
      const color1 = `rgba(${r},${g},${b},0.95)`;
      const color2 = `rgba(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)},0.85)`;
      targetDiv.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
      // Actualizar fondo blur si existe
      const blur = targetDiv.querySelector('.promo-bg-blur');
      if (blur) {
        blur.style.background = targetDiv.style.background;
      }
    };
  }

  function generarCaptura() {
    const captura = document.getElementById('captura-producto');
    if (!window.html2canvas) {
      alert('html2canvas no está cargado.');
      return;
    }
    // Ajustar resolución y escala para mejor calidad
    html2canvas(captura, {backgroundColor: null, useCORS: true, scale: 2, width: 480, height: 600}).then(canvas => {
      // Descargar la imagen
      const link = document.createElement('a');
      link.download = 'promo-asere.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
});
