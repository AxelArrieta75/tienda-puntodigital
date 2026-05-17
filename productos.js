// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_PD")) || [];
let filtroCat = "Todos";
let countdownInterval = null; 

const listaCupones = {
    "PUNTODIGITAL10": 0.10,
    "CLIENTEVIP": 0.15,
    "BIENVENIDO5": 0.05
};
let descuentoAplicado = 0;
let cuponActivo = "";

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
    { nombre: "Mascotas", icono: "🐾"},
    { nombre: "Perfumería", icono: "🌸"},
    { nombre: "Combos", icono: "🎁" }
];

// ==========================================
// 2. CARGA DE DATOS DESDE GOOGLE SHEETS
// ==========================================
async function obtenerProductos() {
    try {
        const respuesta = await fetch(urlCSV);
        const datos = await respuesta.text();
        
        const filas = datos.split("\n").slice(1);
        productos = filas.map(fila => {
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (columnas.length < 4) return null;

            let imgAdicionales = [];
            if (columnas[5] && columnas[5].trim() !== "") {
                imgAdicionales = columnas[5].replace(/"/g, "").trim().split(";").filter(img => img !== "");
            }

            let stockValor = null;
            if (columnas[7] && columnas[7].trim() !== "") {
                stockValor = parseInt(columnas[7].replace(/\D/g, ""));
            }

            return {
                nombre: columnas[0] ? columnas[0].replace(/"/g, "").trim() : "Producto",
                precio: columnas[1] ? parseInt(columnas[1].replace(/\D/g, "")) : 0,
                categoria: columnas[2] ? columnas[2].replace(/"/g, "").trim() : "Todos",
                imagen: columnas[3] ? columnas[3].replace(/"/g, "").trim() : "",
                descripcion: (columnas[4] && columnas[4].trim() !== "") ? columnas[4].replace(/"/g, "").trim() : "¡Excelente producto disponible en Punto Digital!",
                imagenesExtra: imgAdicionales,
                fechaOferta: (columnas[6] && columnas[6].trim() !== "") ? columnas[6].replace(/"/g, "").trim() : null,
                stock: stockValor
            };
        }).filter(p => p !== null && p.nombre !== "");

        cargarCategoriasUI();
        renderizar(productos);
        cargarDatosCliente(); 
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
    if (!grid) return; 
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
    if (!cont) return; 
    
    if (lista.length === 0) {
        cont.innerHTML = "<p style='color:white; grid-column:1/-1; text-align:center;'>No se encontraron productos.</p>";
        return;
    }

    cont.innerHTML = lista.map(p => {
        const rutaImg = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;
        const esOferta = p.fechaOferta && new Date(p.fechaOferta) > new Date();
        const badgeHTML = esOferta ? `<span class="card-badge-oferta">🔥 OFERTA</span>` : '';
        
        const sinStock = p.stock !== null && p.stock <= 0;
        const btnHTML = sinStock 
            ? `<button class="btn-add" style="background:#444; color:#aaa; cursor:not-allowed;" disabled>Agotado</button>`
            : `<button class="btn-add" onclick="event.stopPropagation(); agregar('${p.nombre.replace(/'/g, "\\'")}')">Añadir</button>`;

        return `
            <div class="card" onclick="verDetalle('${p.nombre.replace(/'/g, "\\'")}')">
                ${badgeHTML}
                <img src="${rutaImg}" onerror="this.src='https://via.placeholder.com/200'">
                <h3>${p.nombre}</h3>
                <div class="precio">$${p.precio.toLocaleString('es-AR')}</div>
                ${btnHTML}
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
    if (!p) return;
    
    const ex = carrito.find(i => i.nombre === nombre);
    const cantActual = ex ? ex.cantidad : 0;
    
    if (p.stock !== null && cantActual >= p.stock) {
        alert(`Lo sentimos, solo quedan ${p.stock} unidades disponibles.`);
        return;
    }

    if (ex) ex.cantidad++; else carrito.push({...p, cantidad: 1});
    actualizar();
}

function cambiarCantidad(idx, valor) {
    const itemCarrito = carrito[idx];
    const pOriginal = productos.find(i => i.nombre === itemCarrito.nombre);
    
    if (valor > 0 && pOriginal && pOriginal.stock !== null && itemCarrito.cantidad >= pOriginal.stock) {
        alert(`Alcanzaste el límite de stock.`);
        return;
    }

    itemCarrito.cantidad += valor;
    if (itemCarrito.cantidad <= 0) carrito.splice(idx, 1);
    actualizar();
}

// ==========================================
// 5. MODALES Y CUENTA REGRESIVA
// ==========================================
function verDetalle(nombre) {
    const p = productos.find(i => i.nombre === nombre);
    if (!p) return;
    
    clearInterval(countdownInterval); 
    const modal = document.getElementById("modal-detalle");
    const body = document.getElementById("modal-body");
    
    const todasLasImagenes = [p.imagen, ...p.imagenesExtra];
    
    let miniaturasHTML = "";
    if (todasLasImagenes.length > 1 && p.imagenesExtra.length > 0) {
        miniaturasHTML = `<div class="modal-thumbnails">` + 
            todasLasImagenes.map((img, index) => {
                const url = img.startsWith('http') ? img : `img/${img}`;
                return `<img src="${url}" class="${index === 0 ? 'active-thumb' : ''}" onclick="cambiarFotoModal(this, '${url}')" onerror="this.src='https://via.placeholder.com/70'">`;
            }).join('') + `</div>`;
    }

    let bannerOfertaHTML = "";
    const esOfertaValida = p.fechaOferta && new Date(p.fechaOferta) > new Date();
    
    if (esOfertaValida) {
        bannerOfertaHTML = `
            <div class="modal-banner-oferta">
                <span>⏳ OFERTA POR TIEMPO LIMITADO:</span>
                <div id="countdown-reloj" class="reloj">Calculando...</div>
            </div>
        `;
        iniciarContador(p.fechaOferta);
    }

    let badgeStockHTML = "";
    let btnAccionHTML = `<button class="btn-add" style="padding:15px; font-size:1.1rem; margin-top:15px;" onclick="agregar('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>`;

    if (p.stock !== null) {
        if (p.stock <= 0) {
            badgeStockHTML = `<p class="modal-escasez-badge" style="color:#ff3838;">❌ ¡Producto temporalmente agotado!</p>`;
            btnAccionHTML = `<button class="btn-add" style="padding:15px; font-size:1.1rem; margin-top:15px; background:#444; color:#aaa; cursor:not-allowed;" disabled>Agotado</button>`;
        } else if (p.stock <= 5) {
            badgeStockHTML = `<p class="modal-escasez-badge">⚡ ¡Solo quedan ${p.stock} unidades!</p>`;
        } else {
            badgeStockHTML = `<p class="modal-escasez-badge" style="color:#25d366;">✅ Stock Disponible</p>`;
        }
    }

    const rutaImgPrincipal = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;

    body.innerHTML = `
        <div class="modal-layout-grid">
            <div class="modal-col-galeria">
                <div class="modal-zoom-container">
                    <img id="foto-principal-modal" src="${rutaImgPrincipal}" onerror="this.src='https://via.placeholder.com/300'">
                </div>
                ${miniaturasHTML}
            </div>
            
            <div class="modal-col-info">
                <h2>${p.nombre}</h2>
                ${bannerOfertaHTML}
                <div class="modal-precio-tag">$${p.precio.toLocaleString('es-AR')}</div>
                ${badgeStockHTML}
                <div class="modal-descripcion-contenedor">
                    <h3>Descripción</h3>
                    <p>${p.descripcion}</p>
                </div>
                ${btnAccionHTML}
            </div>
        </div>
    `;
    modal.style.display = "flex";
}

function cambiarFotoModal(elemento, urlNueva) {
    document.getElementById("foto-principal-modal").src = urlNueva;
    document.querySelectorAll(".modal-thumbnails img").forEach(img => img.classList.remove("active-thumb"));
    elemento.classList.add("active-thumb");
}

function iniciarContador(fechaFin) {
    const destino = new Date(fechaFin + "T23:59:59").getTime(); 
    
    function actualizarReloj() {
        const ahora = new Date().getTime();
        const totalDist = destino - ahora;
        const contenedorReloj = document.getElementById("countdown-reloj");
        
        if (!contenedorReloj) return;

        if (totalDist < 0) {
            contenedorReloj.innerText = "¡OFERTA TERMINADA!";
            clearInterval(countdownInterval);
            return;
        }

        const dias = Math.floor(totalDist / (1000 * 60 * 60 * 24));
        const horas = Math.floor((totalDist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((totalDist % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((totalDist % (1000 * 60)) / 1000);

        const textoDias = dias > 0 ? `${dias}d ` : "";
        contenedorReloj.innerText = `${textoDias}${horas.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
    }
    
    actualizarReloj();
    countdownInterval = setInterval(actualizarReloj, 1000);
}

function cerrarModal(event) {
    if (!event || event.target.id === "modal-detalle" || event.target.className === "modal-close") {
        document.getElementById("modal-detalle").style.display = "none";
        clearInterval(countdownInterval); 
    }
}

window.cerrarModal = cerrarModal;

function toggleCarrito() {
    document.getElementById("carrito-lateral").classList.toggle("open");
}

function cargarDatosCliente() {
    const nombreGuardado = localStorage.getItem("cliente_nombre_PD");
    const telefonoGuardado = localStorage.getItem("cliente_telefono_PD");
    
    if (nombreGuardado && document.getElementById("cliente-nombre")) {
        document.getElementById("cliente-nombre").value = nombreGuardado;
    }
    if (telefonoGuardado && document.getElementById("cliente-telefono")) {
        document.getElementById("cliente-telefono").value = telefonoGuardado;
    }
}

function evaluarCupon() {
    const input = document.getElementById("cupon-input");
    const mensaje = document.getElementById("cupon-mensaje");
    if (!input || !mensaje) return;

    const codigo = input.value.trim().toUpperCase();

    if (codigo === "") {
        descuentoAplicado = 0;
        cuponActivo = "";
        mensaje.style.display = "none";
        return;
    }

    if (listaCupones[codigo] !== undefined) {
        descuentoAplicado = listaCupones[codigo];
        cuponActivo = codigo;
        mensaje.innerText = `✅ ¡Cupón aplicado! -${descuentoAplicado * 100}%`;
        mensaje.style.color = "#25d366";
        mensaje.style.display = "block";
    } else {
        descuentoAplicado = 0;
        cuponActivo = "";
        mensaje.innerText = "❌ Cupón inválido";
        mensaje.style.color = "#ff3838";
        mensaje.style.display = "block";
    }
}

function actualizar() {
    localStorage.setItem("carrito_PD", JSON.stringify(carrito));
    const listaUI = document.getElementById("lista-carrito");
    let subtotal = 0;
    
    if (listaUI) {
        listaUI.innerHTML = carrito.map((item, idx) => {
            subtotal += item.precio * item.cantidad;
            const rutaImg = item.imagen.startsWith('http') ? item.imagen : `img/${item.imagen}`;
            return `
                <div style="display:flex; align-items:center; gap:12px; background:#161616; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #222;">
                    <img src="${rutaImg}" style="width:50px; height:50px; background:white; border-radius:6px; object-fit:contain;" onerror="this.src='https://via.placeholder.com/50'">
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
    
    let totalFinal = subtotal - (subtotal * descuentoAplicado);
    document.getElementById("total-monto").innerText = "$" + totalFinal.toLocaleString('es-AR');
    document.getElementById("cantidad-badge").innerText = carrito.reduce((acc, i) => acc + i.cantidad, 0);
}

// ==========================================
// 6. ENVÍO WHATSAPP
// ==========================================
function enviarWhatsApp() {
    if (carrito.length === 0) return;
    
    const nombreCliente = document.getElementById("cliente-nombre").value.trim();
    const telefonoCliente = document.getElementById("cliente-telefono").value.trim();

    if (nombreCliente === "" || telefonoCliente === "") {
        alert("Por favor, completa tu Nombre y Teléfono antes de enviar el pedido.");
        return;
    }

    localStorage.setItem("cliente_nombre_PD", nombreCliente);
    localStorage.setItem("cliente_telefono_PD", telefonoCliente);

    let m = `🛒 *NUEVO PEDIDO - PUNTO DIGITAL* %0A`;
    m += `👤 *Cliente:* ${nombreCliente}%0A`;
    m += `📞 *Teléfono:* ${telefonoCliente}%0A`;
    m += `────────────────────%0A`;
    
    carrito.forEach(i => m += `• ${i.cantidad}x ${i.nombre} ($${(i.precio*i.cantidad).toLocaleString('es-AR')})%0A`);
    m += `────────────────────%0A`;
    
    if (cuponActivo !== "") {
        m += `🎟️ *Cupón Aplicado:* ${cuponActivo} (-${descuentoAplicado * 100}%)%0A`;
    }
    m += `*Total a Pagar: ${document.getElementById("total-monto").innerText}*`;
    
    window.open(`https://wa.me/5492604401898?text=${m}`);
}

// ==========================================
// 7. LISTENERS E INICIALIZACIÓN
// ==========================================
document.getElementById("busqueda").addEventListener("keyup", filtrar);

document.addEventListener("DOMContentLoaded", () => {
    const cuponInput = document.getElementById("cupon-input");
    if (cuponInput) {
        cuponInput.addEventListener("keyup", () => {
            evaluarCupon();
            actualizar();
        });
    }
});

window.onload = obtenerProductos;