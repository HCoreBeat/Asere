const token = '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'; // Reemplázalo con tu Token Personal
const owner = 'HCoreBeat'; // Tu usuario de GitHub
const repo = 'Asere'; // Nombre del repositorio
const path = 'Json/productos.json'; // Ruta del archivo JSON

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json'
};

let productos = [];

// Categorías predefinidas
const categorias = ['combos', 'frutas', 'carnes', 'enlatados', 'aderezos', 'pastas-y-granos', 'lacteos', 'despensa', 'bebidas', 'alcohol', 'cakes','confituras', 'otros'];

const buttons = document.querySelectorAll('.button-group button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active')); // Remueve el 'activo' de todos
        button.classList.add('active'); // Añade 'activo' al botón clickeado
    });
});


function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let isJsonLoaded = false; // Bandera para verificar si el JSON fue cargado

document.getElementById("saveJson").disabled = !isJsonLoaded;
// Función para cargar productos desde GitHub
async function cargarProductos() {
    try {
        mostrarIndicadorCarga(true);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        if (!response.ok) throw new Error('Error al cargar el archivo');
        
        const data = await response.json();
        productos = JSON.parse(atob(data.content)); // Decodificar y parsear el JSON

        isJsonLoaded = true; // Marcamos que el JSON ha sido cargado
        renderizarTabla(); // Llamar a la función para renderizar la tabla

        mostrarMensaje('Productos cargados exitosamente.');
    } catch (error) {
        mostrarError('Hubo un error al cargar los productos: ' + error.message);
    } finally {
        mostrarIndicadorCarga(false);
    }
}

// Función para guardar productos en GitHub
async function guardarProductos() {
    if (!isJsonLoaded) {
        mostrarError('Debes cargar los productos primero antes de guardar.');
        return; // No permite guardar si el JSON no ha sido cargado
    }

    try {
        mostrarIndicadorCarga(true);
        const updatedContent = btoa(JSON.stringify(productos, null, 2)); // Codificar el JSON actualizado

        const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        if (!shaResponse.ok) throw new Error('Error al obtener el SHA del archivo');
        const shaData = await shaResponse.json();

        const body = {
            message: 'Actualización desde la página web',
            content: updatedContent,
            sha: shaData.sha // Necesario para actualizar el archivo
        };

        const saveResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (saveResponse.ok) {
            mostrarMensaje('Productos guardados exitosamente.');
        } else {
            throw new Error('Error al guardar los productos');
        }
    } catch (error) {
        mostrarError('Hubo un error al guardar los productos: ' + error.message);
    } finally {
        mostrarIndicadorCarga(false);
    }
}

//Segmento de graficas
let masVendidoChart = null;
let priceDistributionChart = null;
let categoriaChart = null;

function actualizarGrafica() {
    const ctxMasVendido = document.getElementById('masVendidoChart').getContext('2d');
    const ctxPriceDistribution = document.getElementById('priceDistributionChart').getContext('2d');
    const ctxCategoria = document.getElementById('categoriaChart').getContext('2d');

    // Gráfica de Más Vendidos
    const productosMasVendidos = productos.filter(producto => producto.mas_vendido);
    const cantidadMasVendidos = productosMasVendidos.length;
    const cantidadTotal = productos.length;
    const porcentajeMasVendidos = ((cantidadMasVendidos / cantidadTotal) * 100).toFixed(2);

    const dataMasVendido = {
        datasets: [{
            data: [cantidadMasVendidos, cantidadTotal - cantidadMasVendidos],
            backgroundColor: ['#4CAF50', '#E0E0E0'], // Verde pastel para "Más Vendido", gris suave para el otro
            borderWidth: 1,  // Borde fino para no sobrecargar el diseño
            borderColor: ['#388E3C', '#BDBDBD'],  // Bordes de color suave pero con contraste
            hoverBackgroundColor: ['#66BB6A', '#F5F5F5'],  // Colores de hover más suaves
            hoverBorderColor: ['#2C6B29', '#9E9E9E'],  // Bordes ligeramente más oscuros al hacer hover
            hoverBorderWidth: 2,  // Grosor de borde al hacer hover
            borderRadius: 8,  // Bordes ligeramente redondeados (no totalmente circulares)
        }]
    };
    
    const optionsMasVendido = {
        circumference: 360,
        rotation: 270,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,  // Tamaño de fuente de la leyenda ajustado para mayor claridad
                        weight: 'normal',  // Peso de la fuente más ligero para un estilo más suave
                        family: 'Arial, sans-serif'  // Fuente más limpia y moderna
                    },
                    color: '#757575'  // Gris suave para las leyendas
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        const dataset = tooltipItem.dataset;
                        const dataIndex = tooltipItem.dataIndex;
                        const label = dataIndex === 0 ? 'Más Vendido' : 'No Más Vendido';
                        const value = dataset.data[dataIndex];
                        const percentage = ((value / cantidadTotal) * 100).toFixed(2);
                        return `${label}: ${value} (${percentage}%)`;  // Formato limpio en el tooltip
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Fondo oscuro y suave para los tooltips
                titleFont: {
                    size: 12,  // Título de tooltip más pequeño y sutil
                    weight: 'bold'
                },
                bodyFont: {
                    size: 16  // Fuente pequeña para el cuerpo del tooltip
                },
                cornerRadius: 6,  // Bordes redondeados en el tooltip para suavidad
                padding: 10  // Padding para crear espacio dentro del tooltip
            },
            datalabels: {
                display: true,
                color: '#FFFFFF',  // Texto blanco para mayor contraste
                font: {
                    weight: 'bold',  // Mantener el peso de la fuente
                    size: 30  // Aumentamos el tamaño de la fuente a 30 para visibilidad
                },
                formatter: (value, context) => {
                    const percentage = Math.round((value / cantidadTotal) * 100);
                    return context.dataIndex === 0 ? `${percentage}%` : '';  // Mostrar porcentaje solo en "Más Vendido"
                },
                color: (context) => {
                    // Color dinámico para las etiquetas
                    return context.dataIndex === 0 ? '#388E3C' : '#F44336';  // Verde para "Más Vendido", Gris suave para el otro
                },
                align: 'center',  // Centrado de las etiquetas de datos
                anchor: 'center',  // Anclaje en el centro para que se ubiquen bien
                offset: 20,  // Aumentamos el offset para separar las etiquetas del borde
                padding: 25,  // Padding adicional para aumentar la separación entre los porcentajes
                borderRadius: 4,  // Bordes más sutilmente redondeados en los porcentajes
                backgroundColor: 'rgba(0, 0, 0, 0.3)'  // Fondo más suave para las etiquetas para no sobrecargar
            }
        },
        elements: {
            arc: {
                borderWidth: 1,  // Borde más fino para el gráfico
                borderColor: '#FFFFFF'  // Borde blanco para destacar
            }
        },
        aspectRatio: 1,  // Proporción cuadrada para una gráfica más compacta
    };    

    if (masVendidoChart) {
        masVendidoChart.data = dataMasVendido;
        masVendidoChart.update();
    } else {
        masVendidoChart = new Chart(ctxMasVendido, {
            type: 'doughnut',
            data: dataMasVendido,
            options: optionsMasVendido,
        });
    }

    document.getElementById('masVendidoText').textContent = `De un total de ${cantidadTotal} productos, ${cantidadMasVendidos} (${porcentajeMasVendidos}%) son más vendidos.`;

    // Gráfica de Distribución de Precios
    const precios = productos.map(producto => producto.precio);
    const rangosDePrecios = [0, 10, 20, 30, 40, 50];
    const distribucionPrecios = rangosDePrecios.map(rango => 
        precios.filter(precio => precio >= rango && precio < rango + 10).length
    );

    const dataPriceDistribution = {
        labels: rangosDePrecios.map(rango => `${rango} - ${rango + 9}`),
        datasets: [{
            data: distribucionPrecios,
            backgroundColor: '#3498db',  // Azul vibrante para las barras
            borderWidth: 1,  // Bordes finos para no recargar
            borderColor: '#2980b9',  // Azul más oscuro para los bordes
            borderRadius: 6,  // Bordes suavizados sin ser completamente redondos
            hoverBackgroundColor: '#1f75fe',  // Azul más intenso para el hover
            hoverBorderColor: '#1c60b2',  // Azul más oscuro para hover
            hoverBorderWidth: 2,
            datalabels: {
                display: true,
                color: '#2C3E50',  // Gris oscuro para las etiquetas
                font: {
                    weight: 'bold',
                    size: 16  // Tamaño moderado, no excesivo
                },
                formatter: (value) => `${value}`,  // Mostrar solo el valor
                anchor: 'end',
                align: 'top',
                offset: 8,  // Desplazamos un poco para mayor claridad
                color: '#2C3E50'  // Gris oscuro para las etiquetas
            }
        }]
    };

    const optionsPriceDistribution = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,  // Animación más corta pero fluida
            easing: 'easeOutQuad'  // Animación suave y rápida
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14,  // Tamaño de fuente pequeño pero legible
                        weight: 'normal',
                        family: 'Helvetica, sans-serif'
                    },
                    color: '#34495e',  // Gris más oscuro para las etiquetas del eje X
                    padding: 12
                },
                title: {
                    display: true,
                    text: 'Rangos de Precios',
                    font: {
                        size: 16,  // Título más pequeño para no sobrecargar
                        weight: 'bold',
                        family: 'Helvetica, sans-serif'
                    },
                    color: '#2980b9'  // Azul más fuerte para el título del eje X
                },
                grid: {
                    display: false,  // Sin líneas de cuadrícula para mantener la limpieza
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14,  // Tamaño de fuente moderado
                        weight: 'normal',
                        family: 'Helvetica, sans-serif'
                    },
                    color: '#34495e',  // Gris más oscuro para las etiquetas del eje Y
                    stepSize: 1
                },
                title: {
                    display: true,
                    text: 'Cantidad de Productos',
                    font: {
                        size: 16,  // Título pequeño para sutileza
                        weight: 'bold',
                        family: 'Helvetica, sans-serif'
                    },
                    color: '#2980b9'  // Azul más fuerte para el título del eje Y
                },
                grid: {
                    color: '#ecf0f1',  // Gris muy claro para las líneas de la cuadrícula
                    lineWidth: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false,  // No mostrar leyenda para un diseño más limpio
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#FFFFFF',  // Fondo blanco para el tooltip
                titleColor: '#2C3E50',  // Gris oscuro para el título
                bodyColor: '#2980b9',  // Azul fuerte para el cuerpo del tooltip
                borderColor: '#3498db',  // Azul vibrante para el borde del tooltip
                borderWidth: 1,
                cornerRadius: 6,
                bodyFont: {
                    size: 18  // Tamaño de fuente moderado para el tooltip
                },
                callbacks: {
                    label: function(tooltipItem) {
                        const rango = tooltipItem.label;
                        const cantidad = tooltipItem.raw;
                        const percentage = ((cantidad / precios.length) * 100).toFixed(2);
                        return `${rango}: ${cantidad} productos (${percentage}%)`;  // Tooltip limpio con formato simple
                    }
                }
            }
        }
    };


    if (priceDistributionChart) {
        priceDistributionChart.data = dataPriceDistribution;
        priceDistributionChart.update();
    } else {
        priceDistributionChart = new Chart(ctxPriceDistribution, {
            type: 'bar',
            data: dataPriceDistribution,
            options: optionsPriceDistribution,
        });
    }

    // Gráfica de Categorías
    const categoriasData = categorias.map(categoria => productos.filter(producto => producto.categoria === categoria).length);

    const dataCategoria = {
        labels: categorias,
        datasets: [{
            data: categoriasData,
            backgroundColor: categorias.map(() => '#80CBC4'), // Color verde suave
            borderWidth: 1,  // Bordes con grosor leve
            borderColor: categorias.map(() => '#4DB6AC'), // Verde más oscuro para el borde
            borderRadius: 8, // Curvatura suave en las barras
            hoverBackgroundColor: '#4DB6AC', // Cambio a un verde más oscuro al pasar el mouse
            hoverBorderColor: '#00796B', // Más oscuro para hover, para dar contraste
        }]
    };

    const optionsCategoria = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,  // No mostrar leyenda
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#ffffff',  // Fondo blanco para el tooltip
                titleColor: '#00796B',  // Gris oscuro para el título
                bodyColor: '#00796B',  // Gris oscuro para el cuerpo del tooltip
                borderColor: '#B2DFDB',  // Gris claro para el borde del tooltip
                borderWidth: 1,
                cornerRadius: 4,
                bodyFont: {
                    size: 20  // Tamaño de fuente pequeño para el tooltip
                },
                callbacks: {
                    label: function(tooltipItem) {
                        const categoria = tooltipItem.label || '';
                        const cantidad = tooltipItem.raw || 0;
                        return `${categoria}: ${cantidad}`;  // Muestra solo el nombre de la categoría y la cantidad
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 12,  // Tamaño de fuente pequeño y sutil
                        weight: 'normal',
                        family: 'Arial, sans-serif'
                    },
                    color: '#00796B',  // Gris oscuro para las etiquetas del eje X
                    padding: 8  // Espaciado moderado para que no se vea apretado
                },
                grid: {
                    display: false,  // Sin líneas de cuadrícula para un aspecto limpio
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14,  // Fuente moderada para las etiquetas del eje Y
                        weight: 'normal',
                        family: 'Arial, sans-serif'
                    },
                    color: '#00796B',  // Gris oscuro para las etiquetas del eje Y
                    stepSize: 1
                },
                grid: {
                    display: false,  // Sin cuadrícula
                }
            }
        }
    };


    if (categoriaChart) {
        categoriaChart.data = dataCategoria;
        categoriaChart.update();
    } else {
        categoriaChart = new Chart(ctxCategoria, {
            type: 'bar',
            data: dataCategoria,
            options: optionsCategoria,
        });
    }
}
// Asegúrate de que la gráfica se actualice al renderizar la tabla
function renderizarTabla() {
    const tableBody = document.querySelector('#productosTable tbody');
    tableBody.innerHTML = ''; // Limpiar contenido previo

    productos.forEach((producto, index) => {
        const row = document.createElement('tr');
        const defaultImage = 'https://via.placeholder.com/100x100?text=No+Image';
        const descuentoBadge = producto.descuento > 0 
            ? `<span class="badge badge-success">${producto.descuento}% OFF</span>` 
            : '';

        row.innerHTML = `
            <td>
                <div class="upload-container">
                    <img src="${sanitizeUrl(producto.imagen) || defaultImage}" alt="${producto.nombre}">
                    <button class="upload-btn" data-index="${index}">Cambiar Imagen</button>
                    <input type="file" data-index="${index}" data-key="imagen" class="upload-img" style="display: none;">
                </div>
            </td>
            <td>${descuentoBadge} <input type="text" value="${producto.nombre}" data-index="${index}" data-key="nombre"></td>
            <td>
                <select data-index="${index}" data-key="categoria">
                    ${categorias.map(categoria => 
                        `<option value="${categoria}" ${producto.categoria === categoria ? 'selected' : ''}>${categoria}</option>`
                    ).join('')}
                </select>
            </td>
            <td><input type="number" value="${producto.precio}" data-index="${index}" data-key="precio"></td>
            <td><input type="number" value="${producto.descuento}" data-index="${index}" data-key="descuento"></td>
            <td>
                <select data-index="${index}" data-key="oferta">
                    <option value="true" ${producto.oferta ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!producto.oferta ? 'selected' : ''}>No</option>
                </select>
            </td>
            <td>
                <select data-index="${index}" data-key="mas_vendido">
                    <option value="true" ${producto.mas_vendido ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!producto.mas_vendido ? 'selected' : ''}>No</option>
                </select>
            </td>
            <td>
                <select data-index="${index}" data-key="disponible">
                    <option value="true" ${producto.disponible ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!producto.disponible ? 'selected' : ''}>No</option>
                </select>
            </td>
            <td><button class="delete-btn" data-index="${index}">Eliminar</button></td>
        `;

        tableBody.appendChild(row);
    });

    // Actualizar contador de productos
    document.getElementById("productCount").textContent = productos.length;

    // Escuchar los botones de carga de imagen
    document.querySelectorAll('.upload-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            const fileInput = document.querySelector(`.upload-img[data-index="${index}"]`);
            fileInput.click();
        });
    });

    // Escuchar el cambio de archivo de imagen
    document.querySelectorAll('.upload-img').forEach(input => {
        input.addEventListener('change', subirImagen);
    });

    // Escuchar los botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', eliminarProducto);
    });

    // Escuchar cambios en los campos de texto
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', actualizarProducto);
    });

    // Actualizar la gráfica al renderizar la tabla
    actualizarGrafica();
}



function filtrarProductos() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const categoriaFiltro = document.getElementById("categoriaFiltro").value;
    const masVendidoFiltro = document.getElementById("masVendidoFiltro").value;

    const table = document.querySelector('#productosTable tbody');
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const nombreCelda = row.querySelector('td:nth-child(2) input'); // Columna de nombre
        const categoriaCelda = row.querySelector('td:nth-child(3) select'); // Columna de categoría
        const masVendidoCelda = row.querySelector('td:nth-child(7) select'); // Columna de más vendido

        let mostrarFila = true;

        // Filtrar por nombre (si contiene el texto de búsqueda)
        if (nombreCelda && !nombreCelda.value.toLowerCase().includes(searchInput)) {
            mostrarFila = false;
        }

        // Filtrar por categoría
        if (categoriaFiltro && categoriaCelda && categoriaCelda.value !== categoriaFiltro) {
            mostrarFila = false;
        }

        // Filtrar por "Más Vendido"
        if (masVendidoFiltro && masVendidoCelda && masVendidoCelda.value !== masVendidoFiltro) {
            mostrarFila = false;
        }

        // Mostrar u ocultar la fila
        if (mostrarFila) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}



function cargarCategorias() {
    const categoriaSelect = document.getElementById("categoriaFiltro");

    // Limpiar el select antes de agregar las categorías
    categoriaSelect.innerHTML = '<option value="">Todas las Categorías</option>';

    // Insertar las opciones de categorías en el select
    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        categoriaSelect.appendChild(option);
    });
}

// Llamamos a esta función para cargar las categorías cuando se cargue la página
cargarCategorias();


// Validación y actualización del producto al editar
function actualizarProducto(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    let value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;

    if (key === 'precio' && value < 0) {
        mostrarError('El precio no puede ser negativo');
        e.target.value = productos[index][key]; // Revertir al valor previo
        return;
    }

    if (key === 'nombre' && value.trim() === '') {
        mostrarError('El nombre no puede estar vacío');
        e.target.value = productos[index][key]; // Revertir al valor previo
        return;
    }

    productos[index][key] = key === 'oferta' || key === 'mas_vendido' || key === 'disponible' ? value === 'true' : value;
}

// Funciones auxiliares para mensajes
function mostrarError(mensaje) {
    console.error(mensaje);
    alert(mensaje);
}

function mostrarMensaje(mensaje) {
    console.log(mensaje);
    alert(mensaje);
}

function mostrarIndicadorCarga(visible) {
    const loader = document.querySelector('#loader');
    loader.style.display = visible ? 'block' : 'none';
}

// Función para eliminar un producto
async function eliminarProducto(e) {
    const index = e.target.dataset.index;
    const producto = productos[index];

    productos.splice(index, 1); // Eliminar del array

    // Si el producto tiene imagen, elimínala del repositorio
    if (producto.imagen) {
        const imagePath = producto.imagen.split('/main/')[1];
        try {
            const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, { headers });
            const shaData = await shaResponse.json();

            if (shaData.sha) {
                const deleteResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, {
                    method: 'DELETE',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Eliminando imagen del producto',
                        sha: shaData.sha
                    })
                });

                if (!deleteResponse.ok) throw new Error('Error al eliminar la imagen');
                alert('Producto y su imagen eliminados exitosamente.');
            } else {
                throw new Error('No se encontró la imagen para eliminar');
            }
        } catch (error) {
            alert('Error al eliminar la imagen: ' + error.message);
        }
    }

    renderizarTabla();
}


// Función para subir una nueva imagen al repositorio de GitHub
async function subirImagen(e) {
    const index = e.target.dataset.index;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async function(upload) {
        const fileContent = upload.target.result.split(',')[1]; // Base64 del archivo
        const fileName = file.name.replace(/\s+/g, '_'); // Reemplazar espacios por guiones bajos

        // Obtener la imagen anterior
        const oldImagePath = productos[index].imagen;

        try {
            // Si hay una imagen anterior, eliminarla del servidor
            if (oldImagePath) {
                const imagePath = oldImagePath.split('/contents/')[1];
                const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, { headers });
                const shaData = await shaResponse.json();
                if (shaData.sha) {
                    const deleteResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`, {
                        method: 'DELETE',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: 'Eliminando imagen antigua del producto',
                            sha: shaData.sha
                        })
                    });
                    if (!deleteResponse.ok) throw new Error('Error al eliminar la imagen antigua');
                }
            }

            // Subir la nueva imagen a GitHub en la carpeta correspondiente
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/img/products/${fileName}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Subiendo nueva imagen de producto: ${fileName}`,
                    content: fileContent
                })
            });

            if (response.ok) {
                // Actualizar la ruta de la imagen en el JSON
                productos[index].imagen = `img/products/${fileName}`;
                alert('Imagen subida correctamente');
                renderizarTabla(); // Renderizar nuevamente la tabla
            } else {
                throw new Error('Error al subir la nueva imagen');
            }
        } catch (error) {
            alert('Hubo un error al subir la imagen: ' + error.message);
        }
    };

    reader.readAsDataURL(file);
}


// Función para sanitizar URLs y convertir caracteres especiales
function sanitizeUrl(url) {
    return encodeURIComponent(url);
}

// Función para agregar un nuevo producto
document.getElementById('addProduct').addEventListener('click', () => {
    const nuevoProducto = {
        nombre: '',
        categoria: '',
        precio: 0,
        descuento: 0,
        oferta: false,
        mas_vendido: false,
        imagen: '',
        disponible: true
    };
    productos.push(nuevoProducto);
    renderizarTabla();
});

// Asociar eventos a los botones
document.getElementById('loadJson').addEventListener('click', cargarProductos);
document.getElementById('saveJson').addEventListener('click', guardarProductos);


async function cargarImagenes() {
    try {
        mostrarIndicadorCarga(true);
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/img/products`, { headers });
        if (!response.ok) throw new Error('Error al cargar las imágenes');

        const data = await response.json();
        const imageHolder = document.getElementById('imageHolder');
        imageHolder.innerHTML = '';

        data.forEach(file => {
            if (file.type === 'file' && file.name.match(/\.(jpeg|jpg|gif|png)$/)) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('image-container');
                
                const img = document.createElement('img');
                img.src = file.download_url;
                img.alt = file.name;
                imgContainer.appendChild(img);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.textContent = 'Eliminar';
                deleteBtn.onclick = () => eliminarImagen(file.path, imgContainer);
                imgContainer.appendChild(deleteBtn);

                imageHolder.appendChild(imgContainer);
            }
        });

        mostrarIndicadorCarga(false);
    } catch (error) {
        mostrarError('Hubo un error al cargar las imágenes: ' + error.message);
    } finally {
        mostrarIndicadorCarga(false);
    }
}

async function eliminarImagen(path, imgContainer) {
  try {
      const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
      if (!shaResponse.ok) throw new Error('Error al obtener el SHA de la imagen');
      
      const shaData = await shaResponse.json();
      if (shaData.sha) {
          const deleteResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
              method: 'DELETE',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  message: 'Eliminando imagen del servidor',
                  sha: shaData.sha
              })
          });

          if (!deleteResponse.ok) throw new Error('Error al eliminar la imagen');
          imgContainer.remove(); // Eliminar la imagen del DOM
          alert('Imagen eliminada correctamente');
      }
  } catch (error) {
      mostrarError('Hubo un error al eliminar la imagen: ' + error.message);
  }
}


//---segmento para el panel de las imagenes de promocion-------
const promotionImages = [
    { mobile: 'img/24_de_Diciembre.jpg', pc: 'img/24_de_Diciembre_PC.jpg' },
    { mobile: 'img/Promocion_2.jpg', pc: 'img/Promocion_2_PC.jpg' },
    { mobile: 'img/Promocion_3.jpg', pc: 'img/Promocion_3_PC.jpg' },
];

async function cargarPromociones() {
    try {
        mostrarIndicadorCarga(true);
        const promotionsHolder = document.getElementById('promotionsHolder');
        promotionsHolder.innerHTML = '';

        const fetchPromotions = promotionImages.map(async ({ mobile, pc }) => {
            try {
                const [mobileResponse, pcResponse] = await Promise.all([ 
                    fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${mobile}`, { headers }),
                    fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pc}`, { headers }),
                ]);

                if (!mobileResponse.ok || !pcResponse.ok) throw new Error('Error al cargar las imágenes de promoción');

                const [mobileFile, pcFile] = await Promise.all([mobileResponse.json(), pcResponse.json()]);
                return { mobileFile, pcFile, mobile, pc };
            } catch (error) {
                console.error(`Error al cargar promoción ${mobile} o ${pc}: ${error.message}`);
                return null;
            }
        });

        const resultados = await Promise.all(fetchPromotions);

        resultados.forEach((result) => {
            if (result) {
                const { mobileFile, pcFile, mobile, pc } = result;
                const promoContainer = document.createElement('div');
                promoContainer.classList.add('promotion-container');

                const promoTitle = document.createElement('h3');
                promoTitle.textContent = `Promoción - ${mobile.split('/').pop().replace('.jpg', '')}`;
                promoContainer.appendChild(promoTitle);

                const promoImages = document.createElement('div');
                promoImages.classList.add('promotion-images');

                const createImageElement = (file, altText, onDelete, onUpdate) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('image-container');

                    const img = document.createElement('img');
                    img.src = file.download_url;
                    img.alt = altText;
                    img.classList.add('promotion-image');
                    img.loading = 'lazy'; 
                    imgContainer.appendChild(img);

                    const updateBtn = document.createElement('button');
                    updateBtn.classList.add('update-btn');
                    updateBtn.textContent = '+';
                    updateBtn.onclick = onUpdate;
                    imgContainer.appendChild(updateBtn);

                    const title = document.createElement('p');
                    title.textContent = altText;
                    imgContainer.appendChild(title);

                    return imgContainer;
                };

                const onDeleteMobile = () => eliminarImagen(mobile, promoContainer);
                const onDeletePC = () => eliminarImagen(pc, promoContainer);

                const onUpdateMobile = () => seleccionarImagen('mobile', mobile, promoContainer);
                const onUpdatePC = () => seleccionarImagen('pc', pc, promoContainer);

                promoImages.appendChild(createImageElement(mobileFile, 'Imagen móvil', onDeleteMobile, onUpdateMobile));
                promoImages.appendChild(createImageElement(pcFile, 'Imagen de escritorio', onDeletePC, onUpdatePC));

                promoContainer.appendChild(promoImages);
                promotionsHolder.appendChild(promoContainer);
            } else {
                console.warn('Promoción no disponible');
            }
        });

    } catch (error) {
        mostrarError('Hubo un error al cargar las promociones: ' + error.message);
    } finally {
        mostrarIndicadorCarga(false);
    }
}


function seleccionarImagen(tipo, oldImage, promoContainer) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/jpeg') {
            const formData = new FormData();
            formData.append('file', file);

            // Lógica para subir la imagen
            actualizarImagen(tipo, oldImage, file, promoContainer);
        } else {
            alert('Solo se permiten imágenes JPG.');
        }
    };
    input.click();
}

async function actualizarImagen(tipo, oldImage, newFile, promoContainer) {
    try {
        // Subir nueva imagen al repositorio reemplazando la antigua
        const newImageURL = await reemplazarImagenGitHub(oldImage, newFile);

        // Actualiza la imagen en el DOM
        const imgElement = promoContainer.querySelector('img');
        imgElement.src = newImageURL;

        const title = promoContainer.querySelector('p');
        title.textContent = `${tipo === 'mobile' ? 'Imagen móvil' : 'Imagen de escritorio'}`;

        alert('Imagen actualizada con éxito');
    } catch (error) {
        console.error('Error al actualizar la imagen:', error);
    }
}

async function reemplazarImagenGitHub(oldImage, newFile) {
    const path = oldImage; // Usar la misma ruta del archivo viejo, por ejemplo 'img/24_de_Diciembre.jpg'

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
    };

    try {
        // Obtener el SHA del archivo existente
        const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: headers
        });

        if (!shaResponse.ok) {
            throw new Error('No se pudo obtener el SHA del archivo existente.');
        }

        const shaData = await shaResponse.json();
        const sha = shaData.sha; // SHA del archivo actual

        // Ahora, reemplazamos la imagen con el nuevo archivo
        const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                message: 'Reemplazando imagen existente',
                content: await convertirImagenABase64(newFile), // Convertir el archivo a base64
                sha: sha // Usar el SHA del archivo existente para reemplazarlo
            })
        });

        if (!uploadResponse.ok) {
            throw new Error('Error al reemplazar la imagen en el repositorio.');
        }

        const responseData = await uploadResponse.json();
        return responseData.content.download_url; // URL de la imagen actualizada

    } catch (error) {
        console.error('Error al reemplazar la imagen en GitHub:', error);
        throw error;
    }
}

// Función para convertir un archivo a Base64 (necesaria para subirlo a GitHub)
async function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extraer solo la parte base64
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


async function eliminarImagen(image, promoContainer) {
    try {
        // Aquí debes agregar la lógica para eliminar la imagen del servidor
        console.log(`Eliminando la imagen ${image}`);

        // Elimina la imagen del contenedor
        promoContainer.remove();

        alert('Imagen eliminada correctamente');
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarImagenes();
    cargarPromociones();
});
