// ==========================================
// 1. CONFIGURACIÓN Y ESTADO
// ==========================================
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_PD")) || [];
let filtroCat = "Todos";

const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_ptTrZ2OTWhfqb63EL20FS0MfLWFSQWkCEOpvTCEvK_27inAjKNJBenipvkAJQDD-jbqsnzpyy0KP/pub?output=csv";

const categoriasConfig = [
    { nombre: "Todos", icono: "📦" },
    { nombre: "Auriculares", icono: "🎧" },
    { nombre: "Smartwatch", icono: "⌚" },
    { nombre: "Audio", icono: "🔊" },
    { nombre: "Gaming", icono: "🎮" },
    { nombre: "Herramientas", icono: "🛠️" },
    { nombre: "Memorias", icono: "💾" },
    { nombre: "Camping", icono: "⛺" },
    { nombre: "Termos", icono: "🧉" },
    { nombre: "Juguetes", icono: "🧸" },
    { nombre: "Belleza", icono: "✨" },
    { nombre: "Celulares", icono: "📱" },
    { nombre: "Hogar", icono: "🏠" },
    { nombre: "Cocina", icono: "🍳" },
    { nombre: "Vehículos", icono: "🚗" },
    { nombre: "Combos", icono: "🎁" },
];

// ==========================================
// 2. CARGA DE DATOS DESDE GOOGLE SHEETS
// ==========================================
async function obtenerProductos() {
    try {
        const respuesta = await fetch(urlCSV);
        const datos = await respuesta.text();
        
        // Convertimos el CSV en Objetos
        const filas = datos.split("\n").slice(1);
        productos = filas.map(fila => {
            // Usamos una expresión regular para separar por comas respetando si hay comas dentro de comillas
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (columnas.length < 4) return null;

            return {
                nombre: columnas[0].replace(/"/g, "").trim(),
                precio: parseInt(columnas[1].replace(/\D/g, "")),
                categoria: columnas[2].replace(/"/g, "").trim(),
                imagen: columnas[3].replace(/"/g, "").trim()
            };
        }).filter(p => p !== null && p.nombre !== "");

        // Inicializar Interfaz
        cargarCategoriasUI();
        renderizar(productos);
        actualizar();
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// ==========================================
// 3. FUNCIONES DE INTERFAZ (UI)
// ==========================================
function cargarCategoriasUI() {
    const grid = document.getElementById("grid-categorias");
    if(!grid) return;
    grid.innerHTML = categoriasConfig.map(cat => `
        <div class="cat-bubble ${filtroCat === cat.nombre ? 'active' : ''}" onclick="setCat('${cat.nombre}')">
            <span>${cat.icono}</span> <span>${cat.nombre}</span>
        </div>
    `).join('');
}

function setCat(c) { 
    filtroCat = c; 
    cargarCategoriasUI(); 
    filtrar(); 
}

function renderizar(lista) {
    const cont = document.getElementById("contenedor-productos");
    if(!cont) return;
    
    if(lista.length === 0) {
        cont.innerHTML = "<p style='color:white; grid-column:1/-1; text-align:center;'>No se encontraron productos.</p>";
        return;
    }

    cont.innerHTML = lista.map(p => {
        const rutaImg = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;
        return `
            <div class="card" onclick="verDetalle('${p.nombre.replace(/'/g, "\\'")}')">
                <img src="${rutaImg}" onerror="this.src='https://via.placeholder.com/200'">
                <h3>${p.nombre}</h3>
                <div class="precio">$${p.precio.toLocaleString('es-AR')}</div>
                <button class="btn-add" onclick="event.stopPropagation(); agregar('${p.nombre.replace(/'/g, "\\'")}')">Añadir</button>
            </div>
        `;
    }).join('');
}

function filtrar() {
    const texto = document.getElementById("busqueda").value.toLowerCase();
    const res = productos.filter(p => 
        (filtroCat === "Todos" || p.categoria === filtroCat) && 
        p.nombre.toLowerCase().includes(texto)
    );
    renderizar(res);
}

// ==========================================
// 4. LÓGICA DEL CARRITO
// ==========================================
function agregar(nombre) {
    const p = productos.find(i => i.nombre === nombre);
    const ex = carrito.find(i => i.nombre === nombre);
    if(ex) ex.cantidad++; else carrito.push({...p, cantidad: 1});
    actualizar();
}

function cambiarCantidad(idx, valor) {
    carrito[idx].cantidad += valor;
    if(carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    actualizar();
}

function actualizar() {
    localStorage.setItem("carrito_PD", JSON.stringify(carrito));
    const listaUI = document.getElementById("lista-carrito");
    let total = 0;
    
    if(listaUI) {
        listaUI.innerHTML = carrito.map((item, idx) => {
            total += item.precio * item.cantidad;
            const rutaImg = item.imagen.startsWith('http') ? item.imagen : `img/${item.imagen}`;
            return `
                <div style="display:flex; align-items:center; gap:12px; background:#161616; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #222;">
                    <img src="${rutaImg}" style="width:50px; height:50px; background:white; border-radius:6px; object-fit:contain;">
                    <div style="flex:1">
                        <h4 style="margin:0; font-size:13px; color:white;">${item.nombre}</h4>
                        <div style="margin-top:8px; display:flex; align-items:center;">
                            <button class="qty-btn" onclick="cambiarCantidad(${idx}, -1)">-</button>
                            <span style="font-weight:bold; color:#FFD700; min-width:20px; text-align:center;">${item.cantidad}</span>
                            <button class="qty-btn" onclick="cambiarCantidad(${idx}, 1)">+</button>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; color:#FFD700; font-size:14px;">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
                        <button onclick="cambiarCantidad(${idx}, -999)" style="background:none; border:none; color:#555; margin-top:5px; cursor:pointer;">Eliminar</button>
                    </div>
                </div>`;
        }).join('');
    }
    
    document.getElementById("total-monto").innerText = "$" + total.toLocaleString('es-AR');
    document.getElementById("cantidad-badge").innerText = carrito.reduce((acc, i) => acc + i.cantidad, 0);
}

// ==========================================
// 5. MODALES Y WHATSAPP
// ==========================================
function verDetalle(nombre) {
    const p = productos.find(i => i.nombre === nombre);
    if(!p) return;
    const rutaImg = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;
    const modal = document.getElementById("modal-detalle");
    const body = document.getElementById("modal-body");
    
    body.innerHTML = `
        <img src="${rutaImg}" onerror="this.src='https://via.placeholder.com/200'">
        <h2 style="margin:10px 0;">${p.nombre}</h2>
        <div style="font-size:2rem; color:#FFD700; font-weight:700; margin-bottom:20px;">$${p.precio.toLocaleString('es-AR')}</div>
        <button class="btn-add" style="padding:15px; font-size:1.1rem;" onclick="agregar('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
    `;
    modal.style.display = "flex";
}

function cerrarModal(event) {
    if (!event || event.target.id === "modal-detalle" || event.target.className === "modal-close") {
        document.getElementById("modal-detalle").style.display = "none";
    }
}

function toggleCarrito() {
    document.getElementById("carrito-lateral").classList.toggle("open");
}

function enviarWhatsApp() {
    if(carrito.length === 0) return;
    let m = "¡Hola Punto Digital! Mi pedido es:%0A";
    carrito.forEach(i => m += `• ${i.cantidad}x ${i.nombre} ($${(i.precio*i.cantidad).toLocaleString('es-AR')})%0A`);
    m += `%0A*Total: ${document.getElementById("total-monto").innerText}*`;
    window.open(`https://wa.me/5492604401898?text=${m}`);
}

// ==========================================
// 6. EVENTOS DE INICIO
// ==========================================
document.getElementById("busqueda").addEventListener("keyup", filtrar);
window.onload = obtenerProductos;
