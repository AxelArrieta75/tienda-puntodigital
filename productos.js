// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_PD")) || [];
let filtroCat = "Todos";
let countdownInterval = null; 

// CONFIGURACIÓN DE CUPONES
const listaCupones = {
    "PUNTODIGITAL10": 0.10,
    "CLIENTEVIP": 0.15,
    "BIENVENIDO5": 0.05,
    "DIGITAL20": 0.20
};
let descuentoAplicado = 0;
let cuponActivo = "";

// CONFIGURACIÓN DE TU CUENTA BANCARIA / MERCADO PAGO
const datosBancoPD = {
    banco: "Lemon Cash",
    alias: "punto.digital.sr",
    cbu: "0000168300000026270629",
    titular: "Axel Elias Arrieta"
};

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
        
        const filas = datos.split(/\r?\n/).slice(1);
        
        productos = filas.map(fila => {
            if (!fila.trim()) return null;

            // Procesador inteligente de CSV
            const columnas = [];
            let dentroDeComillas = false;
            let celdaActual = "";

            for (let i = 0; i < fila.length; i++) {
                let char = fila[i];
                if (char === '"') {
                     dentroDeComillas = !dentroDeComillas;
                } else if ((char === ',' || char === ';') && !dentroDeComillas) {
                     columnas.push(celdaActual.trim());
                     celdaActual = "";
                } else {
                     celdaActual += char;
                }
            }
            columnas.push(celdaActual.trim());

            if (columnas.length < 4) return null;

            const limpiar = (texto) => texto ? texto.replace(/^"|"$/g, "").trim() : "";

            // RECOLECCIÓN INDEPENDIENTE DE IMÁGENES EXTRAS
            let imgAdicionales = [];
            if (columnas[5] && columnas[5].trim() !== "") imgAdicionales.push(limpiar(columnas[5]));
            if (columnas[6] && columnas[6].trim() !== "") imgAdicionales.push(limpiar(columnas[6]));
            if (columnas[7] && columnas[7].trim() !== "") imgAdicionales.push(limpiar(columnas[7]));
            
            // Filtramos cualquier celda que haya quedado vacía
            imgAdicionales = imgAdicionales.filter(img => img !== "" && img !== '""');

            // Ajuste de índices para Fecha Oferta (Columna 8) y Stock (Columna 9)
            let fechaOfertaValor = columnas[8] ? limpiar(columnas[8]) : null;
            
            let stockValor = null;
            if (columnas[9] && columnas[9] !== "") {
                stockValor = parseInt(columnas[9].replace(/\D/g, ""));
            }

            return {
                nombre: limpiar(columnas[0]) || "Producto sin nombre",
                precio: columnas[1] ? parseInt(columnas[1].replace(/\D/g, "")) : 0,
                categoria: limpiar(columnas[2]) || "Todos",
                imagen: limpiar(columnas[3]),
                descripcion: limpiar(columnas[4]) || "¡Excelente producto disponible en Punto Digital!",
                imagenesExtra: imgAdicionales,
                fechaOferta: fechaOfertaValor,
                stock: stockValor
            };
        }).filter(p => p !== null && p.nombre !== "");

        inyectarDatosBancoUI();
        cargarCategoriasUI();
        renderizar(productos);
        cargarDatosCliente(); 
        actualizar();
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// ==========================================
// 3. FUNCIONES DE INTERFAZ Y BUSCADOR
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

function comprobarOfertaActiva(fechaOfertaStr) {
    if (!fechaOfertaStr) return false;
    const formateada = fechaOfertaStr.replace(/\//g, "-");
    const partes = formateada.split('-');
    if (partes.length !== 3) return false;
    
    let anio, mes, dia;
    if (partes[0].length === 4) { 
        anio = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        dia = parseInt(partes[2], 10);
    } else { 
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        anio = parseInt(partes[2], 10);
    }
    
    const fechaLimite = new Date(anio, mes, dia, 23, 59, 59);
    const fechaActual = new Date();
    
    return fechaActual <= fechaLimite;
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
        const esOferta = comprobarOfertaActiva(p.fechaOferta);
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
    const inputBusqueda = document.getElementById("busqueda");
    const btnLimpiar = document.getElementById("btn-limpiar-busqueda");
    const texto = inputBusqueda.value.toLowerCase();
    
    if (btnLimpiar) {
        btnLimpiar.style.display = texto.length > 0 ? "block" : "none";
    }

    const res = productos.filter(p => 
        (filtroCat === "Todos" || p.categoria === filtroCat) && 
        p.nombre.toLowerCase().includes(texto)
    );
    renderizar(res);
}

function limpiarBuscador() {
    const inputBusqueda = document.getElementById("busqueda");
    if (inputBusqueda) {
        inputBusqueda.value = "";
        inputBusqueda.focus();
    }
    filtrar();
}

// ==========================================
// 4. LÓGICA DEL CARRITO E INTERACCIONES
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
    
    animarBotonCarrito();
    mostrarToastNotif(`¡Añadido: ${p.nombre.substring(0, 22)}...! 🛒`);
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

function vaciarCarrito() {
    if (carrito.length === 0) return;
    if (confirm("¿Estás seguro de que querés vaciar por completo tu carrito?")) {
        carrito = [];
        actualizar();
    }
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
    
    const todasLasImagenes = [p.imagen, ...p.imagenesExtra].filter(img => img && img.trim() !== "");
    
    let miniaturasHTML = "";
    if (todasLasImagenes.length > 1) {
        miniaturasHTML = `<div class="modal-thumbnails">` + 
            todasLasImagenes.map((img, index) => {
                const url = img.startsWith('http') ? img : `img/${img}`;
                return `<img src="${url}" class="${index === 0 ? 'active-thumb' : ''}" onclick="cambiarFotoModal(this, '${url}')" onerror="this.src='https://via.placeholder.com/70'">`;
            }).join('') + `</div>`;
    }

    let bannerOfertaHTML = "";
    const esOfertaValida = comprobarOfertaActiva(p.fechaOferta);
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
            badgeStockHTML = `<p class="modal-escasez-badge">⚡ ¡Solo quedan ${p.stock} ${p.stock === 1 ? 'unidad' : 'unidades'}!</p>`;
        } else {
            badgeStockHTML = `<p class="modal-escasez-badge" style="color:#25d366;">✅ Stock Disponible (${p.stock} un.)</p>`;
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

function iniciarContador(fechaFinStr) {
    const formateada = fechaFinStr.replace(/\//g, "-");
    const partes = formateada.split('-');
    
    let anio, mes, dia;
    if (partes[0].length === 4) {
        anio = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        dia = parseInt(partes[2], 10);
    } else {
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        anio = parseInt(partes[2], 10);
    }
    
    const destino = new Date(anio, mes, dia, 23, 59, 59).getTime(); 
    
    function actualizarReloj() {
        const ahora = new Date().getTime();
        const totalDistCalculada = destino - ahora;
        const contenedorReloj = document.getElementById("countdown-reloj");
        
        if (!contenedorReloj) return;

        if (totalDistCalculada < 0) {
            contenedorReloj.innerText = "¡OFERTA TERMINADA!";
            clearInterval(countdownInterval);
            return;
        }

        const dias = Math.floor(totalDistCalculada / (1000 * 60 * 60 * 24));
        const horas = Math.floor((totalDistCalculada % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((totalDistCalculada % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((totalDistCalculada % (1000 * 60)) / 1000);

        const textoDias = dias > 0 ? `${dias}d ` : "";
        contenedorReloj.innerText = `${textoDias}${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
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

function animarBotonCarrito() {
    const btnFloat = document.getElementById("cart-float");
    if (!btnFloat) return;
    btnFloat.classList.remove("rebote-anim");
    void btnFloat.offsetWidth; 
    btnFloat.classList.add("rebote-anim");
}

function mostrarToastNotif(mensaje) {
    const contenedor = document.getElementById("toast-container");
    if (!contenedor) return;
    
    const toast = document.createElement("div");
    toast.className = "toast-notif";
    toast.innerHTML = `<span>✨</span> <span>${mensaje}</span>`;
    
    contenedor.appendChild(toast);
    
    setTimeout(() => { toast.remove(); }, 2500);
}

function alternarCampoDireccion() {
    const metodo = document.getElementById("metodo-entrega").value;
    const campoDireccion = document.getElementById("cliente-direccion");
    if (!campoDireccion) return;

    if (metodo === "envio") {
        campoDireccion.style.display = "block";
    } else {
        campoDireccion.style.display = "none";
    }
}

// ==========================================
// 6. DETALLES BANCARIOS Y CLIENTE
// ==========================================
function inyectarDatosBancoUI() {
    const txtBanco = document.getElementById("txt-datos-banco");
    if (!txtBanco) return;
    txtBanco.innerHTML = `
        <strong>Banco:</strong> ${datosBancoPD.banco}<br>
        <strong>Alias:</strong> ${datosBancoPD.alias}<br>
        <strong>CBU:</strong> ${datosBancoPD.cbu}<br>
        <strong>Titular:</strong> ${datosBancoPD.titular}
    `;
}

function alternarDatosTransferencia() {
    const metodoPago = document.getElementById("metodo-pago").value;
    const boxTransferencia = document.getElementById("datos-transferencia-box");
    if (!boxTransferencia) return;

    boxTransferencia.style.display = metodoPago === "transferencia" ? "block" : "none";
}

function cargarDatosCliente() {
    const nombreGuardado = localStorage.getItem("cliente_nombre_PD");
    const telefonoGuardado = localStorage.getItem("cliente_telefono_PD");
    
    if (nombreGuardado && document.getElementById("cliente-nombre")) {
        document.getElementById("cliente-nombre").value = nombreGuardado;
    }
    // CORREGIDO: Se reemplazó el typo 'telephoneGuardado' por la variable correcta 'telefonoGuardado'
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
        actualizar();
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
    // Agregado: Actualiza los cálculos numéricos en tiempo real tras verificar el estado del código
    actualizar(); 
}

function actualizar() {
    localStorage.setItem("carrito_PD", JSON.stringify(carrito));
    const listaUI = document.getElementById("lista-carrito");
    let subtotal = 0;
    
    if (!listaUI) return;

    if (carrito.length === 0) {
        listaUI.innerHTML = `
            <div class="carrito-vacio-box">
                <span>🛒</span>
                <p>Tu carrito está vacío.</p>
                <p style="font-size:12px; margin-top:5px; color:#555;">¡Aprovechá nuestras ofertas!</p>
            </div>
        `;
        const totalContenedor = document.getElementById("total-monto");
        if (totalContenedor) totalContenedor.innerText = "$0";
        document.getElementById("cantidad-badge").innerText = "0";
        return;
    }
    
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
    
    let montoDescuento = subtotal * descuentoAplicado;
    let totalCalculado = subtotal - montoDescuento;
    const totalContenedor = document.getElementById("total-monto");

    if (totalContenedor) {
        if (descuentoAplicado > 0) {
            // Renderizado detallado con desglose del descuento aplicado
            totalContenedor.innerHTML = `
                <div style="font-size: 13px; color: #aaa; text-decoration: line-through; font-weight: normal;">Subtotal: $${subtotal.toLocaleString('es-AR')}</div>
                <div style="font-size: 13px; color: #25d366; font-weight: normal; margin-bottom: 4px;">Desc. (${descuentoAplicado * 100}%): -$${montoDescuento.toLocaleString('es-AR')}</div>
                <div>$${totalCalculado.toLocaleString('es-AR')}</div>
            `;
        } else {
            totalContenedor.innerText = "$" + totalCalculado.toLocaleString('es-AR');
        }
    }
    
    document.getElementById("cantidad-badge").innerText = Math.max(0, carrito.reduce((acc, i) => acc + i.cantidad, 0));
}

// ==========================================
// 7. ENVÍO WHATSAPP MEJORADO
// ==========================================
function enviarWhatsApp() {
    if (carrito.length === 0) return;
    
    const nombreCliente = document.getElementById("cliente-nombre").value.trim();
    const telephoneCliente = document.getElementById("cliente-telefono").value.trim();
    const metodoEntrega = document.getElementById("metodo-entrega").value;
    const direccionCliente = document.getElementById("cliente-direccion").value.trim();
    const metodoPago = document.getElementById("metodo-pago").value;

    if (nombreCliente === "" || telephoneCliente === "") {
        alert("Por favor, completa tu Nombre y Teléfono antes de enviar el pedido.");
        return;
    }

    if (metodoEntrega === "envio" && direccionCliente === "") {
        alert("Por favor, ingresá la dirección para coordinar el envío a domicilio.");
        return;
    }

    localStorage.setItem("cliente_nombre_PD", nombreCliente);
    localStorage.setItem("cliente_telefono_PD", telephoneCliente);

    let m = `🛒 *NUEVO PEDIDO - PUNTO DIGITAL* %0A`;
    m += `👤 *Cliente:* ${nombreCliente}%0A`;
    m += `📞 *Teléfono:* ${telephoneCliente}%0A`;
    
    if (metodoEntrega === "envio") {
        m += `🚚 *Entrega:* Envío a Domicilio%0A`;
        m += `📍 *Dirección:* ${direccionCliente}%0A`;
    } else {
        m += `🏬 *Entrega:* Retira en el Local%0A`;
    }

    if (metodoPago === "transferencia") {
        m += `💳 *Método de Pago:* Transferencia Bancaria%0A`;
    } else {
        m += `💵 *Método de Pago:* Efectivo%0A`;
    }
    
    m += `────────────────────%0A`;
    carrito.forEach(i => m += `• ${i.cantidad}x ${i.nombre} ($${(i.precio*i.cantidad).toLocaleString('es-AR')})%0A`);
    m += `────────────────────%0A`;
    
    if (cuponActivo !== "") {
        m += `🎟️ *Cupón Aplicado:* ${cuponActivo} (-${descuentoAplicado * 100}%)%0A`;
    }
    m += `*Total a Pagar: ${document.getElementById("total-monto").innerText.replace(/\n/g, ' ')}*`;
    
    window.open(`https://wa.me/5492604401898?text=${m}`);
}

// ==========================================
// 8. LISTENERS E INICIALIZACIÓN
// ==========================================
document.getElementById("busqueda").addEventListener("keyup", filtrar);

document.addEventListener("DOMContentLoaded", () => {
    const cuponInput = document.getElementById("cupon-input");
    if (cuponInput) {
        cuponInput.addEventListener("keyup", evaluarCupon);
    }
    obtenerProductos();
});