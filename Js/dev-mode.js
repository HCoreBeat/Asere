// Clave de desarrollador (en producción, usar una clave más compleja y encriptada)
const DEV_KEY = 'asere-dev-2025';
let isDev = false;

// Función para activar modo desarrollador
function enableDevMode(key) {
    if (key === DEV_KEY) {
        isDev = true;
        sessionStorage.setItem('devMode', 'true');
        console.log('🛠️ Modo desarrollador activado');
        return true;
    }
    return false;
}

// Función para desactivar modo desarrollador
function disableDevMode() {
    isDev = false;
    sessionStorage.removeItem('devMode');
    console.log('🔒 Modo desarrollador desactivado');
}

// Verificar estado del modo desarrollador
function checkDevMode() {
    return isDev || sessionStorage.getItem('devMode') === 'true';
}

// Prevenir acceso a la consola en modo producción
(function() {
    if (!checkDevMode()) {
        // Guardar referencia segura al console original por si se necesita internamente
        const originalConsole = window.console;

        const methods = [
            'debug', 'log', 'info', 'warn', 'error',
            'assert', 'dir', 'dirxml', 'trace', 'group',
            'groupCollapsed', 'groupEnd', 'time', 'timeEnd',
            'profile', 'profileEnd', 'count'
        ];

        // En lugar de lanzar un error (que rompe la ejecución de otros scripts),
        // reemplazamos por no-op. Internamente podemos usar originalConsole si
        // necesitamos emitir algo sin correr el riesgo de lanzar.
        methods.forEach(method => {
            try {
                originalConsole && (originalConsole[method] = originalConsole[method] || function(){});
                console[method] = function() { /* console disabled in production (no-op) */ };
            } catch (e) {
                // En entornos muy restrictivos simplemente ignorar
            }
        });
    }
})();

// Detectar y prevenir herramientas de desarrollo
function preventDevTools() {
    if (!checkDevMode()) {
        // Usar una referencia segura a console.log original si está disponible,
        // porque en producción lo hemos convertido a no-op.
        const safeLog = window.__originalConsoleLog || window.console.log || function(){};
        setInterval(() => {
            const devtools = /./;
            devtools.toString = function() {
                disableDevMode();
                location.reload();
            };
            try {
                safeLog(devtools);
            } catch (e) {
                // Ignorar cualquier error para no romper la ejecución
            }
        }, 1000);
    }
}

// Auto-ejecutar prevención
preventDevTools();

// Exportar funciones necesarias
window.enableDevMode = enableDevMode;
window.disableDevMode = disableDevMode;
window.checkDevMode = checkDevMode;