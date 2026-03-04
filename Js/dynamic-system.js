// dynamic-system.js
// Sistema Dinámico de Frescura Visual
// Gestiona scores, badges, animaciones y ordenamiento dinámico de productos

/**
 * CONFIGURACIÓN DEL SISTEMA
 */
const DynamicSystem = {
    // Rangos de tiempo para badges
    BADGE_CONFIGS: {
        HOY: 1,              // Productos añadidos hace 1 día
        ESTA_SEMANA: 7,      // Productos añadidos hace 7 días
        HACE_DOS_SEMANAS: 14 // Productos añadidos hace 14 días
    },

    // Variación de layout según el día de la semana
    LAYOUT_VARIANTS: {
        0: 'domingo',
        1: 'lunes',
        2: 'martes',
        3: 'miercoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sabado'
    },

    // Pesos para cálculo de score dinámico
    SCORE_WEIGHTS: {
        freshness: 0.3,      // 30% frescura (qué tan nuevo es)
        popularity: 0.25,    // 25% popularidad (más vendido, oferta)
        engagement: 0.25,    // 25% engagement (interacción)
        category: 0.2        // 20% categoría relevancia
    }
};

/**
 * Calcula la cantidad de días desde un fecha hasta hoy
 * @param {Date|String} fecha - Fecha a calcular (ISO string o Date object)
 * @returns {Number} Cantidad de días
 */
// Mezcla un arreglo en orden aleatorio (Fisher-Yates simplificado)
window.shuffleArray = function(arr) {
    if (!Array.isArray(arr)) return arr;
    return arr.sort(() => Math.random() - 0.5);
};

window.calcularDiasDesde = function(fecha) {
    if (!fecha) return null;
    
    try {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaObj.setHours(0, 0, 0, 0);
        
        const diferencia = hoy - fechaObj;
        return Math.floor(diferencia / (1000 * 60 * 60 * 24));
    } catch (e) {
        console.warn('Error calculando días desde fecha:', e);
        return null;
    }
};

/**
 * Determina el tipo de badge según la fecha de creación
 * @param {Date|String} fechaCreacion - Fecha de creación del producto
 * @returns {String|null} Tipo de badge: 'nuevo-hoy', 'nuevo-semana', 'actualizado', null
 */
window.determinarBadge = function(fechaCreacion) {
    if (!fechaCreacion) return null;
    
    const diasDesde = window.calcularDiasDesde(fechaCreacion);
    if (diasDesde === null) return null;
    
    if (diasDesde <= DynamicSystem.BADGE_CONFIGS.HOY) {
        return 'nuevo-hoy';
    } else if (diasDesde <= DynamicSystem.BADGE_CONFIGS.ESTA_SEMANA) {
        return 'nuevo-semana';
    } else if (diasDesde <= DynamicSystem.BADGE_CONFIGS.HACE_DOS_SEMANAS) {
        return 'actualizado';
    }
    
    return null;
};

/**
 * Calcula el HTML del badge dinámico
 * @param {String} tipoBadge - Tipo de badge
 * @returns {String} HTML del badge
 */
window.generarBadgeHTML = function(tipoBadge) {
    const badges = {
        'nuevo-hoy': '<span class="badge badge-nuevo-hoy" title="Añadido hoy"><i class="fas fa-star"></i> Nuevo hoy</span>',
        'nuevo-semana': '<span class="badge badge-nuevo-semana" title="Añadido esta semana"><i class="fas fa-sparkles"></i> Nuevo</span>',
        'actualizado': '<span class="badge badge-actualizado" title="Actualizado recientemente"><i class="fas fa-refresh"></i> Actualizado</span>'
    };
    
    return badges[tipoBadge] || '';
};

/**
 * Calcula el score dinámico de un producto
 * @param {Object} producto - Objeto del producto
 * @returns {Number} Score entre 0 y 100
 */
window.calcularScoreDinamico = function(producto) {
    let score = 50; // Score base
    
    // Factor 1: Frescura (30%)
    const diasDesde = window.calcularDiasDesde(producto.fecha_creacion);
    const frescura = diasDesde !== null 
        ? Math.max(0, 100 - (diasDesde * 10))  // Decrece 10 puntos por día, mínimo 0
        : 50;
    score += (frescura * DynamicSystem.SCORE_WEIGHTS.freshness);
    
    // Factor 2: Popularidad (25%)
    let popularidad = 50;
    if (producto.mas_vendido) popularidad += 30;
    if (producto.oferta) popularidad += 20;
    if (producto.descuento && producto.descuento > 20) popularidad += 10;
    score += (Math.min(100, popularidad) * DynamicSystem.SCORE_WEIGHTS.popularity);
    
    // Factor 3: Engagement (25%)
    let engagement = 50;
    if (producto.nuevo) engagement += 25;
    if (producto.disponible) engagement += 15;
    score += (Math.min(100, engagement) * DynamicSystem.SCORE_WEIGHTS.engagement);
    
    // Factor 4: Categoría (20%)
    // Penalización para categorías especiales
    let categoriaScore = 50;
    if (producto.categoria && (producto.categoria.toLowerCase().includes('electrodomesticos') || 
                              producto.categoria.toLowerCase().includes('vehículos'))) {
        categoriaScore = 40; // Menor prioridad para categorías especiales
    }
    if (producto.categoria && producto.categoria.toLowerCase().includes('frutas')) {
        categoriaScore = 70; // Mayor prioridad para frutas (alto movimiento)
    }
    score += (categoriaScore * DynamicSystem.SCORE_WEIGHTS.category);
    
    // Normalizar score final
    return Math.round(Math.min(100, score));
};

/**
 * Enriquece un array de productos con datos dinámicos
 * @param {Array} productos - Array de productos a enriquecer
 * @returns {Array} Array de productos enriquecidos
 */
window.enrichProductsWithDynamicData = function(productos) {
    if (!Array.isArray(productos)) return productos;
    
    return productos.map(producto => ({
        ...producto,
        // Calcular badge dinámico
        badge_dinamico: window.determinarBadge(producto.fecha_creacion),
        // Calcular score dinámico
        score_dinamico: window.calcularScoreDinamico(producto),
        // Guardar días desde para referencia
        diasDesde: window.calcularDiasDesde(producto.fecha_creacion)
    }));
};

/**
 * Ordena productos por score dinámico (mayor primero)
 * @param {Array} productos - Array de productos
 * @returns {Array} Array ordenado
 */
window.sortProductsDynamic = function(productos) {
    if (!Array.isArray(productos)) return productos;

    const enriquecidos = window.enrichProductsWithDynamicData(productos);

    // Aplicar ligera variación aleatoria para cada reload/llamada
    enriquecidos.forEach(p => {
        const jitter = (Math.random() - 0.5) * 10; // -5..+5
        let base = p.score_dinamico || 0;
        // énfasis adicional para nuevos y más vendidos
        if (p.badge_dinamico === 'nuevo-hoy') base += 5;
        if (p.mas_vendido) base += 5;
        p._score_variado = base + jitter;
    });

    return [...enriquecidos].sort((a, b) => {
        // Ordenar por score variado descendente
        if (b._score_variado !== a._score_variado) {
            return b._score_variado - a._score_variado;
        }
        // Si aún empatados, ordenar por score original
        if (b.score_dinamico !== a.score_dinamico) {
            return b.score_dinamico - a.score_dinamico;
        }
        // Si tienen el mismo score, ordenar por fecha más reciente
        return window.calcularDiasDesde(b.fecha_creacion) - window.calcularDiasDesde(a.fecha_creacion);
    });
};

/**
 * Ordena best sellers dinámicamente
 * @param {Array} bestSellers - Array de productos más vendidos
 * @returns {Array} Array ordenado
 */
window.sortBestSellersDynamic = function(bestSellers) {
    if (!Array.isArray(bestSellers)) return bestSellers;

    const enriquecidos = window.enrichProductsWithDynamicData(bestSellers);

    enriquecidos.forEach(p => {
        const base = (p.oferta ? 50 : 0) + (p.score_dinamico || 0);
        const jitter = (Math.random() - 0.5) * 10; // pequeña variación
        p._score_variado = base + jitter;
        // énfasis adicional si es nuevo hoy
        if (p.badge_dinamico === 'nuevo-hoy') p._score_variado += 5;
    });

    return [...enriquecidos].sort((a, b) => {
        return b._score_variado - a._score_variado;
    });
};

/**
 * Filtra productos "Recién Añadidos" (últimos N días)
 * @param {Array} productos - Array de productos
 * @param {Number} diasLimite - Límite de días (default 7)
 * @returns {Array} Array de productos recientes
 */
window.filterRecientementeAnnadidos = function(productos, diasLimite = 7) {
    if (!Array.isArray(productos)) return [];

    const enriquecidos = window.enrichProductsWithDynamicData(productos);
    let recientes = enriquecidos.filter(p => {
        if (!p.fecha_creacion) return false;
        const diasDesde = window.calcularDiasDesde(p.fecha_creacion);
        return diasDesde !== null && diasDesde <= diasLimite;
    }).sort((a, b) => {
        // Ordenar por más reciente primero
        const diasA = window.calcularDiasDesde(a.fecha_creacion);
        const diasB = window.calcularDiasDesde(b.fecha_creacion);
        return diasA - diasB;
    });

    // Shuffle ligeramente para variar presentación si hay más de limite
    if (recientes.length > diasLimite) {
        recientes = recientes.sort(() => Math.random() - 0.5);
    }
    return recientes;
};

/**
 * Obtiene la variante de layout según el día de la semana
 * @returns {String} Nombre del día
 */
window.getLayoutVariant = function() {
    const hoy = new Date();
    const dia = hoy.getDay();
    return DynamicSystem.LAYOUT_VARIANTS[dia];
};

/**
 * Añade clases CSS de animación a un elemento producto
 * @param {HTMLElement} element - Elemento del producto
 * @param {string} tipoBadge - Tipo de badge para determinar animación
 */
window.aplicarMicroAnimacion = function(element, tipoBadge) {
    if (!element) return;
    
    // Aplicar animación de entrada
    element.classList.add('producto-animated');
    
    // Animación específica según badge
    if (tipoBadge === 'nuevo-hoy') {
        element.classList.add('nuevo-hoy-pulse');
    } else if (tipoBadge === 'nuevo-semana') {
        element.classList.add('nuevo-semana-fade');
    } else if (tipoBadge === 'actualizado') {
        element.classList.add('actualizado-slide');
    }
    
    // Agregar delay basado en posición
    const index = Array.from(element.parentElement?.children || []).indexOf(element);
    if (index >= 0) {
        element.style.animationDelay = `${index * 0.05}s`;
    }
};

/**
 * Retorna clases CSS adicionales basadas en el score dinámico
 * @param {number} score - Score dinámico (0-100)
 * @returns {string} Clases CSS
 */
window.getScoreClasses = function(score) {
    score = Number(score) || 0;
    if (score >= 80) return 'score-premium';
    if (score >= 60) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-normal';
};

/**
 * Genera HTML con visualización del score dinámico (debug/info)
 * @param {number} score - Score dinámico
 * @returns {string} HTML del indicador
 */
window.generarIndicadorScore = function(score) {
    score = Number(score) || 0;
    const barWidth = Math.round(score);
    const color = score >= 80 ? '#2ecc71' : (score >= 60 ? '#f39c12' : '#e74c3c');
    return `<div class="score-indicator" style="width: ${barWidth}%; background-color: ${color};"></div>`;
};

/**
 * Crea la sección "Recién Añadidos" con productos dinámicos
 * @param {Array} productos - Array de todos los productos
 * @param {number} limite - Cantidad máxima de productos a mostrar (default 6)
 * @returns {HTMLElement} Elemento contenedor de recién añadidos
 */
window.crearSeccionRecienAnnadidos = function(productos, limite = 6) {
    const recientes = window.filterRecientementeAnnadidos(productos, 7);
    
    if (recientes.length === 0) {
        return null; // No hay recién añadidos, no crear sección
    }
    
    const seccion = document.createElement('div');
    seccion.className = 'recien-annadidos-container';
    seccion.id = 'recien-annadidos';
    
    const titulo = document.createElement('h2');
    titulo.className = 'recien-annadidos-titulo';
    titulo.innerHTML = '<i class="fas fa-new-line"></i> Recién Añadidos';
    seccion.appendChild(titulo);
    
    const grid = document.createElement('div');
    grid.className = 'recien-annadidos-grid';
    
    recientes.slice(0, limite).forEach((producto, index) => {
        const card = document.createElement('div');
        card.className = 'recien-annadido-card';
        card.dataset.nombre = producto.nombre;
        card.dataset.categoria = window.slugify ? window.slugify(producto.categoria) : producto.categoria;
        
        // Aplicar animación
        window.aplicarMicroAnimacion(card, producto.badge_dinamico);
        
        const badgeHTML = producto.badge_dinamico ? window.generarBadgeHTML(producto.badge_dinamico) : '';
        
        card.innerHTML = `
            <div class="recien-annadido-imagen-container">
                ${badgeHTML}
                <img src="${producto.imagen}" alt="${producto.nombre}" class="recien-annadido-imagen">
            </div>
            <div class="recien-annadido-info">
                <h3 class="recien-annadido-nombre">${producto.nombre}</h3>
                <p class="recien-annadido-precio">
                    <span class="currency">US$</span>
                    <span class="precio-valor">${Number(producto.precio).toFixed(2)}</span>
                </p>
                ${producto.oferta ? `<span class="recien-annadido-oferta">-${producto.descuento}%</span>` : ''}
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (window.mostrarDetallesProducto) {
                window.mostrarDetallesProducto(producto);
            }
        });
        
        grid.appendChild(card);
    });
    
    seccion.appendChild(grid);
    return seccion;
};

/**
 * Aplica variación de layout según el día de la semana
 * @param {HTMLElement} container - Contenedor de productos
 */
window.aplicarVariacionLayoutPorDia = function(container) {
    if (!container) return;
    
    const dias = document.querySelector('[data-current-day]');
    if (dias) dias.dataset.currentDay = window.getLayoutVariant();
    
    container.classList.add(`layout-${window.getLayoutVariant()}`);
};

/**
 * Inicializa el sistema dinámico para un conjunto de productos
 * Este es el punto de entrada principal después de cargar productos
 * @param {Array} productosArray - Array de productos a procesar
 * @returns {Object} Objeto con datos procesados
 */
window.initializeDynamicSystem = function(productosArray) {
    if (!Array.isArray(productosArray)) {
        console.warn('[Dynamic System] No es un array válido');
        return null;
    }
    
    try {
        const enriquecidos = window.enrichProductsWithDynamicData(productosArray);
        const recientes = window.filterRecientementeAnnadidos(enriquecidos, 7);
        
        return {
            products: enriquecidos,
            recently: recientes,
            timestamp: new Date().toISOString(),
            layout_variant: window.getLayoutVariant()
        };
    } catch (e) {
        console.error('[Dynamic System] Error inicializando sistema:', e);
        return null;
    }
};

// Exportar al window para disponibilidad global
window.DynamicSystem = DynamicSystem;

console.log('[Dynamic System] Sistema dinámico de frescura visual cargado correctamente');
