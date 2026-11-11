// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_PD")) || [];
let filtroCat = "Ofertas";
let countdownInterval = null; 

// CUPONES
const listaCupones = {
    "PUNTODIGITAL10": 0.10,
    "CLIENTEVIP": 0.05,
    "BIENVENIDO15": 0.15,
    "DIGITAL20": 0.20
};
let descuentoAplicado = 0;
let cuponActivo = "";
const PORCENTAJE_OFERTA_BOMBA = 0.20; 

// DATOS BANCARIOS
const datosBancoPD = {
    banco: "Lemon Cash",
    alias: "digital.sr",
    cbu: "0000168300000026270629",
    titular: "Axel Elias Arrieta"
};

const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_ptTrZ2OTWhfqb63EL20FS0MfLWFSQWkCEOpvTCEvK_27inAjKNJBenipvkAJQDD-jbqsnzpyy0KP/pub?output=csv";

// ==========================================
// 2. CARGA Y PROCESAMIENTO SEGURO DEL CSV
// ==========================================
async function obtenerProductos() {
    try {
        const respuesta = await fetch(urlCSV);
        const datos = await respuesta.text();
        
        const filas = datos.split(/\r?\n/);
        if (filas.length <= 1) return;
        
        productos = filas.slice(1).map((fila, index) => {
            if (!fila.trim()) return null;

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

            let imgAdicionales = [];
            if (columnas[5] && columnas[5].trim() !== "") imgAdicionales.push(limpiar(columnas[5]));
            if (columnas[6] && columnas[6].trim() !== "") imgAdicionales.push(limpiar(columnas[6]));
            if (columnas[7] && columnas[7].trim() !== "") imgAdicionales.push(limpiar(columnas[7]));
            
            imgAdicionales = imgAdicionales.filter(img => img !== "" && img !== '""');

            let fechaOfertaValor = columnas[8] ? limpiar(columnas[8]) : null;
            let stockValor = null;
            if (columnas[9] && columnas[9] !== "") {
                stockValor = parseInt(columnas[9].replace(/\D/g, ""));
            }

            let descTexto = limpiar(columnas[4]);
            if (!descTexto || descTexto === '""' || descTexto === "") {
                descTexto = "¡Excelente producto disponible en Punto Digital!";
            }

            return {
                id: index + 1,
                nombre: limpiar(columnas[0]) || "Producto sin nombre",
                precio: columnas[1] ? parseInt(columnas[1].replace(/\D/g, "")) : 0,
                categoria: limpiar(columnas[2]) || "General", 
                imagen: limpiar(columnas[3]),
                descripcion: descTexto,
                imagenesExtra: imgAdicionales,
                fechaOferta: fechaOfertaValor,
                stock: stockValor
            };
        }).filter(p => p !== null && p.nombre !== "" && p.nombre !== "Producto sin nombre");

        inyectarDatosBancoUI();
        cargarDatosCliente(); 
        
        // Renderizar secciones principales
        renderizarPaginaPrincipal();
        actualizar();

        // Renderizar detalle si estamos en producto.html
        const urlParams = new URLSearchParams(window.location.search);
        const idParam = urlParams.get('id');
        if (idParam && document.getElementById("detalle-producto-container")) {
            mostrarDetalleEnPagina(idParam);
        }
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// ==========================================
// 3. RENDERIZADO DE SECCIONES EN INDEX.HTML
// ==========================================
function renderizarPaginaPrincipal() {
    // 1. Nuestros Destacados (Últimos modificados / cargados primero)
    const contDestacados = document.getElementById("grid-destacados");
    const destacados = [...productos].reverse().slice(0, 10);
    if (contDestacados) {
        contDestacados.innerHTML = destacados.length > 0 
            ? destacados.map(p => crearTarjetaHTML(p)).join('')
            : '<p style="color:#888;">No hay productos destacados cargados.</p>';
    }

    // 2. Ofertas Especiales
    const contOfertas = document.getElementById("grid-ofertas");
    const ofertas = productos.filter(p => comprobarOfertaActiva(p.fechaOferta));
    if (contOfertas) {
        contOfertas.innerHTML = ofertas.length > 0
            ? ofertas.map(p => crearTarjetaHTML(p)).join('')
            : '<p style="color:#888;">No hay ofertas activas en este momento.</p>';
    }

    // 3. Todos los productos
    const contTodos = document.getElementById("grid-todos");
    if (contTodos) {
        contTodos.innerHTML = productos.length > 0
            ? productos.map(p => crearTarjetaHTML(p)).join('')
            : '<p style="color:#888;">No hay productos disponibles.</p>';
    }
}

function crearTarjetaHTML(p) {
    let rutaImg = 'https://via.placeholder.com/150';
    if (p.imagen && p.imagen.trim() !== '') {
        rutaImg = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;
    }

    const esOferta = comprobarOfertaActiva(p.fechaOferta);
    const badgeHTML = esOferta ? `<span class="card-badge-oferta">🔥 OFERTA</span>` : '';
    
    let precioHTML = `<div class="precio">$${p.precio.toLocaleString('es-AR')}</div>`;
    if (esOferta) {
        const precioRebajado = Math.round(p.precio * (1 - PORCENTAJE_OFERTA_BOMBA));
        precioHTML = `
            <div class="precio-contenedor-stack" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 10px;">
                <span class="precio-original-tachado" style="font-size: 13px; color: #888; text-decoration: line-through;">$${p.precio.toLocaleString('es-AR')}</span>
                <span class="precio" style="font-size: 1.3rem; font-weight: bold; color: #FFD700; margin-top: 2px;">$${precioRebajado.toLocaleString('es-AR')}</span>
            </div>
        `;
    }
    
    const sinStock = p.stock !== null && p.stock <= 0;
    const btnHTML = sinStock 
        ? `<button class="btn-add" style="background:#444; color:#aaa; cursor:not-allowed;" disabled>Agotado</button>`
        : `<button class="btn-add" onclick="event.stopPropagation(); agregar('${p.nombre.replace(/'/g, "\\'")}')">Añadir</button>`;

    return `
        <div class="card" onclick="verProducto('${p.nombre.replace(/'/g, "\\'")}')">
            ${badgeHTML}
            <img src="${rutaImg}" onerror="this.src='https://via.placeholder.com/150'">
            <h3>${p.nombre}</h3>
            ${precioHTML}
            ${btnHTML}
        </div>
    `;
}

function verProducto(nombre) {
    const producto = productos.find(p => p.nombre === nombre);
    if (producto) {
        window.location.href = `producto.html?id=${producto.id}`;
    }
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
    return new Date() <= fechaLimite;
}

function obtenerPrecioFinal(p) {
    if (comprobarOfertaActiva(p.fechaOferta)) {
        return Math.round(p.precio * (1 - PORCENTAJE_OFERTA_BOMBA));
    }
    return p.precio;
}

// ==========================================
// 4. VISTAS Y FILTROS APARTE (Categorías / Búsqueda)
// ==========================================
function filtrarCategoria(catNombre) {
    const vistaInicio = document.getElementById("vista-inicio-completa");
    const seccionFiltro = document.getElementById("seccion-resultado-filtro");
    const tituloFiltro = document.getElementById("titulo-filtro-activo");
    const gridFiltro = document.getElementById("grid-resultado-filtro");

    if (vistaInicio) vistaInicio.style.display = "none";
    if (seccionFiltro) seccionFiltro.style.display = "block";

    if (tituloFiltro) tituloFiltro.innerText = `📂 Categoría: ${catNombre}`;

    const filtrados = productos.filter(p => p.categoria && p.categoria.toLowerCase().trim() === catNombre.toLowerCase().trim());

    if (gridFiltro) {
        gridFiltro.innerHTML = filtrados.length > 0 
            ? filtrados.map(p => crearTarjetaHTML(p)).join('')
            : `<p style="grid-column: span 4; text-align: center; color: #888; padding: 40px 0;">No se encontraron productos en la categoría "${catNombre}".</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const sideNav = document.getElementById('side-nav');
    if (sideNav) sideNav.classList.remove('open');
}

function filtrarBusquedaGeneral(texto) {
    const query = texto.toLowerCase().trim();
    const vistaInicio = document.getElementById("vista-inicio-completa");
    const seccionFiltro = document.getElementById("seccion-resultado-filtro");
    const tituloFiltro = document.getElementById("titulo-filtro-activo");
    const gridFiltro = document.getElementById("grid-resultado-filtro");

    if (!query) {
        mostrarInicioCompleto();
        return;
    }

    if (vistaInicio) vistaInicio.style.display = "none";
    if (seccionFiltro) seccionFiltro.style.display = "block";

    if (tituloFiltro) tituloFiltro.innerText = `🔍 Resultados para: "${texto}"`;

    const encontrados = productos.filter(p => p.nombre.toLowerCase().includes(query) || p.categoria.toLowerCase().includes(query));

    if (gridFiltro) {
        gridFiltro.innerHTML = encontrados.length > 0 
            ? encontrados.map(p => crearTarjetaHTML(p)).join('')
            : `<p style="grid-column: span 4; text-align: center; color: #888; padding: 40px 0;">No se encontraron productos coincidentes.</p>`;
    }
}

function mostrarInicioCompleto() {
    const vistaInicio = document.getElementById("vista-inicio-completa");
    const seccionFiltro = document.getElementById("seccion-resultado-filtro");

    if (vistaInicio) vistaInicio.style.display = "block";
    if (seccionFiltro) seccionFiltro.style.display = "none";
    
    const inputBusqueda = document.getElementById("busqueda");
    if (inputBusqueda) inputBusqueda.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollearA(idSeccion) {
    mostrarInicioCompleto();
    setTimeout(() => {
        const el = document.getElementById(idSeccion);
        if (el) {
            const pos = el.getBoundingClientRect().top + window.pageYOffset - 140;
            window.scrollTo({ top: pos, behavior: 'smooth' });
        }
    }, 50);
}

// ==========================================
// 5. DETALLE EN PÁGINA INDIVIDUAL CON SELECTOR Y CONTADOR ROJO
// ==========================================
function mostrarDetalleEnPagina(idProducto) {
    const p = productos.find(i => i.id == idProducto || i.nombre === decodeURIComponent(idProducto));
    const cont = document.getElementById("detalle-producto-container");
    
    if (!p || !cont) {
        if (cont) cont.innerHTML = `<p style="color: #ff3838; text-align: center; grid-column: span 2;">No se encontró el producto seleccionado.</p>`;
        return;
    }
    
    clearInterval(countdownInterval);
    
    const todasLasImagenes = [p.imagen, ...p.imagenesExtra].filter(img => img && img.trim() !== "");
    let miniaturasHTML = "";
    if (todasLasImagenes.length > 1) {
        miniaturasHTML = `<div class="modal-thumbnails" style="display: flex; gap: 8px; justify-content: center; margin-top: 12px; overflow-x: auto;">` + 
            todasLasImagenes.map((img, index) => {
                const url = img.startsWith('http') ? img : `img/${img}`;
                return `<img src="${url}" class="${index === 0 ? 'active-thumb' : ''}" style="width: 60px; height: 60px; object-fit: contain; background: white; border-radius: 8px; cursor: pointer; border: 2px solid ${index === 0 ? 'var(--amarillo)' : 'transparent'};" onclick="cambiarFotoModal(this, '${url}')" onerror="this.src='https://via.placeholder.com/70'">`;
            }).join('') + `</div>`;
    }

    let bannerOfertaHTML = "";
    let precioModalHTML = `<div class="modal-precio-tag">$${p.precio.toLocaleString('es-AR')}</div>`;
    const esOfertaValida = comprobarOfertaActiva(p.fechaOferta);
    
    if (esOfertaValida) {
        const precioRebajado = obtenerPrecioFinal(p);
        bannerOfertaHTML = `
            <div class="modal-banner-oferta" style="background: rgba(255, 56, 56, 0.15); border: 1px solid #ff3838; padding: 10px 15px; border-radius: 10px; margin: 12px 0;">
                <span style="font-size: 0.85rem; font-weight: 700; color: #ff6b6b; display: block; margin-bottom: 3px;">⏳ OFERTA POR TIEMPO LIMITADO:</span>
                <div id="countdown-reloj" class="reloj" style="font-size: 1.3rem; font-weight: 800; color: #ff3838; text-shadow: 0 0 10px rgba(255, 56, 56, 0.4);">Calculando...</div>
            </div>
        `;
        precioModalHTML = `
            <div class="modal-precio-contenedor-stack" style="display: flex; align-items: baseline; gap: 15px; margin-top: 5px;">
                <span class="modal-precio-original-tachado" style="font-size: 1.1rem; color: #ff4d4d; text-decoration: line-through; font-weight: normal;">$${p.precio.toLocaleString('es-AR')}</span>
                <span class="modal-precio-tag" style="margin: 0; color: var(--amarillo); font-size: 2rem; font-weight: bold;">$${precioRebajado.toLocaleString('es-AR')}</span>
            </div>
        `;
        iniciarContador(p.fechaOferta);
    }

    let badgeStockHTML = "";
    let btnAccionHTML = "";

    if (p.stock !== null && p.stock <= 0) {
        badgeStockHTML = `<p class="modal-escasez-badge" style="color:#ff3838;">❌ ¡Producto temporalmente agotado!</p>`;
        btnAccionHTML = `<button class="btn-add" style="padding:15px; font-size:1.1rem; margin-top:15px; background:#444; color:#aaa; cursor:not-allowed;" disabled>Agotado</button>`;
    } else {
        if (p.stock !== null && p.stock <= 5) {
            badgeStockHTML = `<p class="modal-escasez-badge" style="color:#ffb300;">⚡ ¡Solo quedan ${p.stock} unidades!</p>`;
        } else if (p.stock !== null) {
            badgeStockHTML = `<p class="modal-escasez-badge" style="color:#25d366;">✅ Stock Disponible (${p.stock} un.)</p>`;
        }
        btnAccionHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                <div style="display: flex; align-items: center; background: #161616; border: 1px solid #333; border-radius: 8px; padding: 5px;">
                    <button class="qty-btn" onclick="cambiarCantidadDetalle(-1)" style="width: 32px; height: 32px;">-</button>
                    <span id="cantidad-detalle-input" style="font-weight: bold; color: #FFD700; min-width: 30px; text-align: center; font-size: 1.1rem;">1</span>
                    <button class="qty-btn" onclick="cambiarCantidadDetalle(1)" style="width: 32px; height: 32px;">+</button>
                </div>
                <button class="btn-add" style="flex: 1; padding: 15px; font-size: 1.1rem; margin: 0;" onclick="agregarDesdeDetalle('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
            </div>
        `;
    }

    const rutaImgPrincipal = p.imagen.startsWith('http') ? p.imagen : `img/${p.imagen}`;

    cont.innerHTML = `
        <div class="modal-col-galeria" style="display: flex; flex-direction: column; align-items: center;">
            <div class="modal-zoom-container" style="width: 100%; height: 320px; background: white; border-radius: 15px; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;">
                <img id="foto-principal-modal" src="${rutaImgPrincipal}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            ${miniaturasHTML}
        </div>
        
        <div class="modal-col-info" style="display: flex; flex-direction: column; justify-content: center;">
            <h2 style="font-size: 2rem; margin-top: 0; margin-bottom: 10px; color: white;">${p.nombre}</h2>
            ${bannerOfertaHTML}
            ${precioModalHTML}
            ${badgeStockHTML}
            <div class="modal-descripcion-contenedor" style="margin-top: 15px; border-top: 1px solid #222; padding-top: 12px;">
                <h3 style="font-size: 0.85rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">Descripción</h3>
                <p style="color: #ddd; font-size: 0.95rem; line-height: 1.5; margin: 0;">${p.descripcion}</p>
            </div>
            ${btnAccionHTML}
        </div>
    `;
}

function cambiarFotoModal(elemento, urlNueva) {
    const fotoPrincipal = document.getElementById("foto-principal-modal");
    if (fotoPrincipal) fotoPrincipal.src = urlNueva;
    document.querySelectorAll(".modal-thumbnails img").forEach(img => {
        img.classList.remove("active-thumb");
        img.style.borderColor = "transparent";
    });
    elemento.classList.add("active-thumb");
    elemento.style.borderColor = "var(--amarillo)";
}

function cambiarCantidadDetalle(valor) {
    const spanCant = document.getElementById("cantidad-detalle-input");
    if (!spanCant) return;
    let actual = parseInt(spanCant.innerText) || 1;
    let nueva = actual + valor;
    if (nueva < 1) nueva = 1;
    spanCant.innerText = nueva;
}

function agregarDesdeDetalle(nombre) {
    const spanCant = document.getElementById("cantidad-detalle-input");
    const cantidadAComprar = spanCant ? parseInt(spanCant.innerText) || 1 : 1;
    
    const p = productos.find(i => i.nombre === nombre);
    if (!p) return;
    
    const ex = carrito.find(i => i.nombre === nombre);
    const cantActualEnCarrito = ex ? ex.cantidad : 0;
    
    if (p.stock !== null && (cantActualEnCarrito + cantidadAComprar) > p.stock) {
        alert(`Lo sentimos, stock insuficiente. Solo quedan ${p.stock} unidades disponibles.`);
        return;
    }

    if (ex) {
        ex.cantidad += cantidadAComprar; 
    } else {
        carrito.push({
            ...p, 
            precioCalculado: obtenerPrecioFinal(p), 
            cantidad: cantidadAComprar
        });
    }
    
    animarBotonCarrito();
    mostrarToastNotif(`¡Añadido (${cantidadAComprar} un.): ${p.nombre.substring(0, 18)}...! 🛒`);
    actualizar();
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

// ==========================================
// 6. CARRITO Y CHECKOUT WHATSAPP
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

    if (ex) {
        ex.cantidad++; 
    } else {
        carrito.push({
            ...p, 
            precioCalculado: obtenerPrecioFinal(p), 
            cantidad: 1
        });
    }
    
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

function toggleCarrito() {
    const carritoLateral = document.getElementById("carrito-lateral");
    if (carritoLateral) carritoLateral.classList.toggle("open");
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

function toggleSubmenu() {
    const sub = document.getElementById("submenu-productos");
    if (sub) sub.style.display = sub.style.display === "none" ? "block" : "none";
}

function toggleSubmenuContacto() {
    const sub = document.getElementById("submenu-contacto");
    if (sub) sub.style.display = sub.style.display === "none" ? "block" : "none";
}

function alternarCampoDireccion() {
    const metodo = document.getElementById("metodo-entrega").value;
    const campoDireccion = document.getElementById("cliente-direccion");
    if (!campoDireccion) return;
    campoDireccion.style.display = (metodo === "envio") ? "block" : "none";
}

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
    boxTransferencia.style.display = (metodoPago === "transferencia") ? "block" : "none";
}

function cargarDatosCliente() {
    const nombreGuardado = localStorage.getItem("cliente_nombre_PD");
    const telephoneGuardado = localStorage.getItem("cliente_telefono_PD");
    if (nombreGuardado && document.getElementById("cliente-nombre")) {
        document.getElementById("cliente-nombre").value = nombreGuardado;
    }
    if (telephoneGuardado && document.getElementById("cliente-telefono")) {
        document.getElementById("cliente-telefono").value = telephoneGuardado;
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
            </div>
        `;
        const totalContenedor = document.getElementById("total-monto");
        if (totalContenedor) totalContenedor.innerText = "$0";
        const cantidadBadge = document.getElementById("cantidad-badge");
        if (cantidadBadge) cantidadBadge.innerText = "0";
        return;
    }
    
    listaUI.innerHTML = carrito.map((item, idx) => {
        const precioUnitario = item.precioCalculado !== undefined ? item.precioCalculado : item.precio;
        subtotal += precioUnitario * item.cantidad;
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
                    <div style="font-weight:bold; color:#FFD700; font-size:14px;">$${(precioUnitario * item.cantidad).toLocaleString('es-AR')}</div>
                    <button onclick="cambiarCantidad(${idx}, -999)" style="background:none; border:none; color:#555; margin-top:5px; cursor:pointer;">Eliminar</button>
                </div>
            </div>`;
    }).join('');
    
    let montoDescuento = subtotal * (descuentoAplicado || 0);
    let totalCalculado = subtotal - montoDescuento;
    const totalContenedor = document.getElementById("total-monto");

    if (totalContenedor) {
        if (descuentoAplicado > 0) {
            totalContenedor.innerHTML = `
                <div style="font-size: 13px; color: #aaa; text-decoration: line-through;">Subtotal: $${subtotal.toLocaleString('es-AR')}</div>
                <div style="font-size: 13px; color: #25d366; margin-bottom: 4px;">Desc. (${descuentoAplicado * 100}%): -$${montoDescuento.toLocaleString('es-AR')}</div>
                <div>$${totalCalculado.toLocaleString('es-AR')}</div>
            `;
        } else {
            totalContenedor.innerText = "$" + totalCalculado.toLocaleString('es-AR');
        }
    }
    
    const cantidadBadge = document.getElementById("cantidad-badge");
    if (cantidadBadge) {
        cantidadBadge.innerText = Math.max(0, carrito.reduce((acc, i) => acc + i.cantidad, 0));
    }
}

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

    let m = `🛒 *NUEVO PEDIDO - PUNTO DIGITAL*%0A`;
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
    carrito.forEach(i => {
        m += `${i.cantidad}x ${i.nombre}%0A`;
    });
    m += `────────────────────%0A`;
    
    const totalMontoElem = document.getElementById("total-monto");
    const textoTotal = totalMontoElem ? totalMontoElem.innerText.replace(/\n/g, ' ') : "$0";
    m += `*Total a Pagar:* ${textoTotal}`;
    
    window.open(`https://wa.me/5492604401898?text=${m}`);
}

// ==========================================
// 7. INICIALIZACIÓN AUTOMÁTICA AL CARGAR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const inputBusqueda = document.getElementById("busqueda");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("keyup", (e) => filtrarBusquedaGeneral(e.target.value));
    }

    const cuponInput = document.getElementById("cupon-input");
    if (cuponInput) {
        cuponInput.addEventListener("keyup", evaluarCupon);
    }

    obtenerProductos();
});