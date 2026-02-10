// afiliados.js
// Lógica de afiliados

function getRefParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

async function verifyAffiliate(ref) {
    try {
        const response = await fetch('Json/afiliados.json');
        const affiliates = await response.json();
        const affiliate = affiliates.find(affiliate => affiliate.id === ref);
        return affiliate ? affiliate : null;
    } catch (error) {
        console.error('Error al cargar el archivo JSON', error);
        return null;
    }
}

// Función principal para manejar la lógica de afiliados
async function handleAffiliate() {
    const ref = getRefParameter();
    const affiliateMessage = document.getElementById('affiliate-message');
    
    if (ref) {
        const affiliate = await verifyAffiliate(ref);
        if (affiliate) {
            localStorage.setItem('affiliateRef', ref);
            localStorage.setItem('affiliateName', affiliate.nombre);
            console.log("Afiliado:" + affiliate.nombre);
            affiliateMessage.textContent = `Gracias por venir a través de uno de nuestros afiliados!`;
        } else {
            console.warn(`El afiliado con ID ${ref} no es válido.`);
            affiliateMessage.textContent = `¡Bienvenido a Asere Online Shop!`;
        }
    } else {
        affiliateMessage.textContent = `¡Bienvenido a Asere Online Shop!`;
    }
}
// Ejecutar la función principal
handleAffiliate();
