// currency.js
// Maneja selector de moneda (USD, EUR, UYU) y actualiza visualmente los precios.
// Regla: solo UYU aplica multiplicador de 39. USD y EUR mantienen el precio base.

(function(){
  'use strict';

  const RATE = { USD: 1, EUR: 1, UYU: 39 };
  const SYMBOL = { USD: 'US$', EUR: '€', UYU: 'U$' };
  const STORAGE_KEY = 'currency';
  // Guard para evitar reentradas en la normalización
  let isNormalizing = false;

  function getCurrency(){
    return localStorage.getItem(STORAGE_KEY) || 'USD';
  }
  function setCurrency(c){
    localStorage.setItem(STORAGE_KEY, c);
    // actualizar meta (si existe)
    const meta = document.querySelector('meta[property="product:price:currency"]');
    if(meta) meta.setAttribute('content', c);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: c }));
  }

  function parseNumberFromString(text){
    if(!text) return NaN;
    // encontrar primer número con decimales (coma o punto)
    const match = text.replace(/\s/g,'').match(/([0-9]+(?:[.,][0-9]{1,2})?)/);
    if(!match) return NaN;
    return Number(match[1].replace(',', '.'));
  }

  function ensureBasePrice(el, numericValue){
    if(!el) return;
    if(el.dataset.basePrice) return;
    // if numericValue provided use it, otherwise parse from text
    let val = (typeof numericValue === 'number' && !isNaN(numericValue)) ? numericValue : parseNumberFromString(el.textContent || el.innerText);
    if(isNaN(val)) return;
    el.dataset.basePrice = Number(val).toString();
  }

  function formatPrice(base, currency){
    const rate = RATE[currency] || 1;
    const value = Number(base) * rate;
    return value.toFixed(2);
  }

  function updateAllPrices(currency){
    // productos: .precio elements (contain <span.currency> and numeric)
    document.querySelectorAll('.precio').forEach(p => {
      // try to find numeric node (text node after .currency span)
      const curSpan = p.querySelector('.currency');
      // if the HTML includes <span class="currency">US$</span>123.00
      // ensure base price
      // numeric value may be in textContent after span or inside p text
      const numericText = p.textContent.replace((curSpan && curSpan.textContent) || '', '').trim();
      ensureBasePrice(p, parseNumberFromString(numericText));
      const base = Number(p.dataset.basePrice);
      const formatted = formatPrice(base, currency);
      if(curSpan) curSpan.textContent = SYMBOL[currency] + '\u00A0';
      // remove current numeric text nodes and append formatted
      // Keep existing spacing / structure
      // If p contains a child node for numeric, update it
      // Simplest: set p.innerHTML = `<span class="currency">SYMBOL</span>${formatted}` but preserve pvpr if exists separately
      p.innerHTML = `<span class="currency">${SYMBOL[currency]}</span>${formatted}`;
    });

    // product-price (used in some templates)
    document.querySelectorAll('.product-price').forEach(p => {
      ensureBasePrice(p, parseNumberFromString(p.textContent));
      const base = Number(p.dataset.basePrice);
      p.textContent = `${SYMBOL[currency]}${formatPrice(base, currency)}`;
    });

    // pvpr (strike-through <s>) or .pvpr-value (detalle)
    document.querySelectorAll('.pvpr s, .pvpr .pvpr-value').forEach(el => {
      ensureBasePrice(el, parseNumberFromString(el.textContent));
      const base = Number(el.dataset.basePrice);
      const formatted = formatPrice(base, currency);
      const parent = el.closest('.pvpr');
      if(!parent) return;
      if(el.tagName.toLowerCase() === 's'){
        el.textContent = formatted;
        parent.innerHTML = `PVPR: ${SYMBOL[currency]}<s>${el.textContent}</s>`;
      } else {
        // span variant (detalle)
        parent.innerHTML = `PVPR: <span class="pvpr-value" data-base-price="${base}">${SYMBOL[currency]}${formatted}</span>`;
      }
    });

    // detalle-precio: has .entero and .decimales spans and a .simbolo
    const detalle = document.getElementById('detalle-precio');
    if(detalle){
      // The control that contains entero and decimales; we rely on hidden #valor-precio-total to get base price
      const hidden = document.getElementById('valor-precio-total');
      if(hidden){
        let base = parseNumberFromString(hidden.textContent) || parseNumberFromString(detalle.textContent);
        // if data not set, set on hidden
        if(!hidden.dataset.basePrice) hidden.dataset.basePrice = base;
        base = Number(hidden.dataset.basePrice);
        const formatted = formatPrice(base, currency);
        const parts = formatted.split('.');
        const entero = parts[0];
        const dec = parts[1] || '00';
        const simboloSpan = detalle.querySelector('.simbolo');
        if(simboloSpan) simboloSpan.textContent = `Precio: ${SYMBOL[currency]}`;
        const enteroSpan = detalle.querySelector('.entero');
        const decSpan = detalle.querySelector('.decimales');
        if(enteroSpan) enteroSpan.textContent = entero;
        if(decSpan) decSpan.textContent = `.${dec}`;
        hidden.textContent = `Precio: ${SYMBOL[currency]}${formatted}`;
      }
    }

    // carrito rendering uses producto.precio from localStorage, so normalizeCartPrices should handle values
    // but also update any direct carrito displayed prices (if present) for added safety
    document.querySelectorAll('.carrito-precio').forEach(p => {
      ensureBasePrice(p, parseNumberFromString(p.textContent));
      const base = Number(p.dataset.basePrice);
      p.textContent = `Precio: ${SYMBOL[currency]}${formatPrice(base, currency)}`;
    });

    // pack price elements (packs / combos)
    document.querySelectorAll('.pack-original-price, .pack-current-price').forEach(p => {
      ensureBasePrice(p, parseNumberFromString(p.textContent));
      const base = Number(p.dataset.basePrice);
      p.innerHTML = `<span class="currency">${SYMBOL[currency]}</span>${formatPrice(base, currency)}`;
    });

    // order total and summary elements - try to update if exist (they usually are generated)
    const orderTotal = document.getElementById('order-total-amount');
    if(orderTotal){
      // attempt to parse current numeric, but better to rely on pago.js recalculation after cart normalization
      const val = parseNumberFromString(orderTotal.textContent);
      if(!isNaN(val) && orderTotal.dataset.basePrice){
        const base = Number(orderTotal.dataset.basePrice);
        orderTotal.textContent = `${SYMBOL[currency]}${formatPrice(base, currency)}`;
      }
    }

    // Update smaller price places (suggested etc.)
    document.querySelectorAll('.precio, .product-price, .pvpr s, .carrito-precio, #detalle-precio, #valor-precio-total').forEach(()=>{});
  }

  function normalizeCartPrices(targetCurrency){
    if(isNormalizing) return;
    isNormalizing = true;
    try{
      const raw = localStorage.getItem('carrito');
      if(!raw) return;
      const cart = JSON.parse(raw);
      const targetRate = RATE[targetCurrency] || 1;
      // Ensure precioBase is the canonical base price (assumed USD/EUR base), try to infer when missing
      let changed = false;
      cart.forEach(item => {
        let precioBase;
        if (typeof item.precioBase !== 'undefined') {
          precioBase = Number(item.precioBase);
        } else {
          // If item stored a currency, try to reverse it to base
          if (item.currency && RATE[item.currency]) {
            const originalRate = RATE[item.currency];
            if (originalRate && originalRate !== 1) {
              precioBase = Number(item.precio) / originalRate;
            } else {
              precioBase = Number(item.precio);
            }
          } else {
            // No metadata: assume stored price is base
            precioBase = Number(item.precio);
          }
          if (!isNaN(precioBase)) {
            item.precioBase = Number(precioBase.toFixed(2));
            changed = true;
          }
        }

        // Now compute price in target currency from precioBase
        if(typeof item.precioBase !== 'undefined' && !isNaN(item.precioBase)){
          const newPrecio = Number((Number(item.precioBase) * targetRate).toFixed(2));
          if (item.precio !== newPrecio) { item.precio = newPrecio; changed = true; }
        }
        item.currency = targetCurrency;
      });

      if(changed){
        localStorage.setItem('carrito', JSON.stringify(cart));
      }

      // trigger UI re-render of carrito and pago
      // Avoid calling cargarCarrito here to prevent recursion (cargarCarrito normalizes on load)
      if(window.renderCarrito) window.renderCarrito();
      if(window.updatePagoTotals) window.updatePagoTotals();
    }catch(e){
      console.error('Error normalizing cart prices:', e);
    } finally {
      isNormalizing = false;
    }
  }

  function injectSelector(){
    // find header container
    const headerContainer = document.querySelector('.header-container') || document.querySelector('header');
    if(!headerContainer) return;

    // Avoid duplicate
    if(document.getElementById('currency-select')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'currency-switcher';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';

    const select = document.createElement('select');
    select.id = 'currency-select';
    select.setAttribute('aria-label', 'Selector de moneda');
    select.innerHTML = `
      <option value="USD">US$</option>
      <option value="EUR">EUR€</option>
      <option value="UYU">UYU$</option>
    `;

    wrapper.appendChild(select);

    // place near cart or search-bar
    const searchBar = headerContainer.querySelector('.search-bar');
    if (searchBar) {
      // Append inside the search bar so the switcher stays next to the input in responsive layouts
      wrapper.style.marginTop = '0';
      searchBar.appendChild(wrapper);
    } else {
      headerContainer.appendChild(wrapper);
    }

    select.addEventListener('change', (e)=>{
      const currency = e.target.value;
      setCurrency(currency);
      updateAllPrices(currency);
      normalizeCartPrices(currency);
    });

    // Set initial value
    const current = getCurrency();
    select.value = current;
  }

  function init(){
    // Inject selector in header
    injectSelector();

    // Ensure base prices for displayed elements
    document.querySelectorAll('.precio, .product-price, .pvpr s, .pvpr .pvpr-value, .pack-current-price, .pack-original-price, .carrito-precio, #valor-precio-total').forEach(el=>{
      ensureBasePrice(el, parseNumberFromString(el.textContent));
    });

    // Apply stored currency or detect by IP for first-time visitors
    const stored = localStorage.getItem(STORAGE_KEY);
    if(!stored){
      // Try detecting country; once resolved, apply currency & normalization
      detectCountryAndSetCurrency().then(c => {
        const currency = getCurrency();
        const sel = document.getElementById('currency-select'); if(sel) sel.value = currency;
        updateAllPrices(currency);
        normalizeCartPrices(currency);
      }).catch(() => {
        const currency = getCurrency();
        const sel = document.getElementById('currency-select'); if(sel) sel.value = currency;
        updateAllPrices(currency);
        normalizeCartPrices(currency);
      });
    } else {
      const currency = getCurrency();
      updateAllPrices(currency);
      normalizeCartPrices(currency);
    }

    // Listen for external currency changes (other tabs)
    window.addEventListener('storage', (e)=>{
      if(e.key === STORAGE_KEY){
        const c = e.newValue || 'USD';
        const sel = document.getElementById('currency-select');
        if(sel) sel.value = c;
        updateAllPrices(c);
        normalizeCartPrices(c);
      }
    });

    // Also react to custom event
    window.addEventListener('currencyChanged', (ev)=>{
      const c = ev.detail || getCurrency();
      const sel = document.getElementById('currency-select');
      if(sel) sel.value = c;
      updateAllPrices(c);
      normalizeCartPrices(c);
    });

    // Expose helper for other scripts
    window.getCurrentCurrency = getCurrency;
    window.normalizeCartPrices = normalizeCartPrices;
    // Expose price updater so other renderers can call it after inserting DOM
    window.updateAllPrices = updateAllPrices;
    // Expose rate helper and conversion helper
    window.getRate = function(currency){ return RATE[currency] || 1; };
    window.convertBaseToCurrency = function(base, currency){ return Number((Number(base) * (RATE[currency] || 1)).toFixed(2)); };

    // IP geolocation helper: detect country (with timeout) and set default currency for first-time visitors
    function fetchWithTimeout(url, timeout = 1500){
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), timeout);
        fetch(url, { cache: 'no-store' }).then(res => { clearTimeout(timer); resolve(res); }).catch(err => { clearTimeout(timer); reject(err); });
      });
    }

    async function detectCountryAndSetCurrency(){
      try{
        // Don't override an explicit stored preference
        if(localStorage.getItem(STORAGE_KEY)) return getCurrency();
        const res = await fetchWithTimeout('https://ipapi.co/json/', 1500);
        if(!res || !res.ok) return getCurrency();
        const data = await res.json();
        const countryCode = (data && (data.country || data.country_code)) ? (data.country || data.country_code) : (data.country_name || '').toUpperCase();
        if(countryCode === 'UY' || (data && data.country_name && /uruguay/i.test(data.country_name))){
          setCurrency('UYU');
          const sel = document.getElementById('currency-select');
          if(sel) sel.value = 'UYU';
          return 'UYU';
        }
      }catch(e){
        // ignore errors and fall back
      }
      // Ensure we have a sane default for new visitors
      if(!localStorage.getItem(STORAGE_KEY)){
        setCurrency('USD');
        const sel = document.getElementById('currency-select'); if(sel) sel.value = 'USD';
      }
      return getCurrency();
    }

    // Re-apply currency on pageshow/popstate/hashchange (back/forward navigation / hash routing)
    window.addEventListener('pageshow', () => {
      const c = getCurrency();
      updateAllPrices(c);
      normalizeCartPrices(c);
    });
    window.addEventListener('hashchange', () => {
      const c = getCurrency();
      updateAllPrices(c);
      normalizeCartPrices(c);
    });
    window.addEventListener('popstate', () => {
      const c = getCurrency();
      updateAllPrices(c);
      normalizeCartPrices(c);
    });

    // Observe DOM for newly inserted price elements (dynamic renderings) and apply current currency
    let mutationTimer = null;
    const observer = new MutationObserver((mutations)=>{
      let found = false;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if(!(node instanceof HTMLElement)) return;
          if(node.matches && (node.matches('.precio') || node.matches('.product-price') || node.matches('.pvpr') || node.matches('.pvpr .pvpr-value') || node.matches('.pack-current-price') || node.matches('.pack-original-price') || node.matches('#valor-precio-total'))){
            found = true;
            // ensure base price for discovered nodes
            ensureBasePrice(node, parseNumberFromString(node.textContent));
          }
          // check subtree
          const subPrices = node.querySelectorAll && node.querySelectorAll('.precio, .product-price, .pvpr s, .pvpr .pvpr-value, .pack-current-price, .pack-original-price, .carrito-precio, #valor-precio-total');
          if(subPrices && subPrices.length) {
            found = true;
            subPrices.forEach(el => ensureBasePrice(el, parseNumberFromString(el.textContent)));
          }
        });
      });
      if(found){
        clearTimeout(mutationTimer);
        mutationTimer = setTimeout(()=>{
          const c = getCurrency();
          updateAllPrices(c);
        }, 40);
      }
    });
    if(document.body) observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize when DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
