// Funciones de seguridad y ofuscación
(function() {
    'use strict';
    
    // Ofuscar strings
    function obfuscateString(str) {
        return btoa(encodeURIComponent(str)).split('').reverse().join('');
    }
    
    // Desofuscar strings
    function deobfuscateString(str) {
        return decodeURIComponent(atob(str.split('').reverse().join('')));
    }
    
    // Proteger valores sensibles
    function protectValue(value) {
        if (typeof value === 'string') {
            return obfuscateString(value);
        } else if (typeof value === 'number') {
            return obfuscateString(value.toString());
        } else if (typeof value === 'object') {
            return obfuscateString(JSON.stringify(value));
        }
        return value;
    }
    
    // Función para ofuscar nombres de funciones y variables
    function obfuscateNames() {
        if (!window.checkDevMode()) {
            // Renombrar funciones comunes con nombres ofuscados
            const newNames = {
                'getCartItems': '_' + Math.random().toString(36).substr(2, 9),
                'calculateTotal': '_' + Math.random().toString(36).substr(2, 9),
                'enviarEstadisticaCompra': '_' + Math.random().toString(36).substr(2, 9),
                'validatePaymentForm': '_' + Math.random().toString(36).substr(2, 9)
            };
            
            // Guardar referencia a funciones originales
            const originalFunctions = {};
            
            Object.keys(newNames).forEach(oldName => {
                if (typeof window[oldName] === 'function') {
                    originalFunctions[newNames[oldName]] = window[oldName];
                    window[newNames[oldName]] = function(...args) {
                        return originalFunctions[newNames[oldName]].apply(this, args);
                    };
                    window[oldName] = undefined;
                }
            });
        }
    }
    
    // Proteger localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.call(this, key, protectValue(value));
    };
    
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function(key) {
        const value = originalGetItem.call(this, key);
        try {
            return deobfuscateString(value);
        } catch {
            return value;
        }
    };
    
    // Anti-tampering para funciones críticas
    function protectFunction(funcName) {
        // Sólo proteger si la función ya está definida en window.
        // Si la función aún no existe, no hacemos nada para evitar
        // crear una propiedad no-configurable que impida declaraciones
        // posteriores (esto causaba "Identifier ... already been declared").
        if (typeof window[funcName] !== 'function') return;

        const original = window[funcName];
        Object.defineProperty(window, funcName, {
            configurable: false,
            get: function() {
                return original;
            },
            set: function() {
                throw new Error('Modificación no permitida');
            }
        });
    }
    
    // Proteger funciones críticas
    ['validatePaymentForm', 'enviarEstadisticaCompra', 'calculateTotal'].forEach(protectFunction);
    
    // Inicializar protecciones
    function initSecurity() {
        if (!window.checkDevMode()) {
            obfuscateNames();
            
            // Prevenir debugging
            setInterval(() => {
                const startTime = performance.now();
                debugger;
                const endTime = performance.now();
                
                if (endTime - startTime > 100) {
                    location.reload();
                }
            }, 1000);
        }
    }
    
    // Auto-ejecutar inicialización
    initSecurity();
    
    // Exportar funciones necesarias (versiones protegidas)
    window.protectValue = protectValue;
    window.deobfuscateString = deobfuscateString;
    
})();