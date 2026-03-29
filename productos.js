// ==========================================
// 1. BASE DE DATOS COMPLETA
// ==========================================
const productos = [
    {nombre:"Auricular Cable Bose", precio:5000, categoria:"Auriculares", imagen:"auricular-bose-cable.jpg"},
    {nombre:"Marshall Vincha", precio:46900, categoria:"Auriculares", imagen:"marshall-vincha.jpg"},
    {nombre:"Samsung Buds Pro", precio:49900, categoria:"Auriculares", imagen:"samsung-buds-pro.jpg"},
    {nombre:"Redmi Buds 4 lite", precio:24000, categoria:"Auriculares", imagen:"Redmi_4lite.jpg"},
    {nombre:"P47 flux vincha", precio:14880, categoria:"Auriculares", imagen:"P47_flux_vincha.jpg"},
    {nombre:"Auricular M98 Flux", precio:15000, categoria:"Auriculares", imagen:"M98_flux.jpg"},
    {nombre:"Auricular f9 in ear", precio:9000, categoria:"Auriculares", imagen:"f9_in_ear.jpg"},
    {nombre:"JBL wave 380", precio:21000, categoria:"Auriculares", imagen:"jbl_wave_380.jpg"},
    {nombre:"Samsung AKG cable tipo C", precio:6000, categoria:"Auriculares", imagen:"samsung-akg-cable.jpg"},
    {nombre:"Airpods 4ta generación", precio:32000, categoria:"Auriculares", imagen:"airpods-4ta-generacion.jpg"},
    {nombre:"Airpods 2da generación", precio:25000, categoria:"Auriculares", imagen:"airpods-2da-generacion.jpg"},
    {nombre:"Auricular JBL tune 700", precio:22000, categoria:"Auriculares", imagen:"jbl-tune.jpg"},
    {nombre:"Auricular samsung manos libres", precio:4000, categoria:"Auriculares", imagen:"samsung-manos-libres.jpg"},
    {nombre:"Auricular samsung pro3", precio:38000, categoria:"Auriculares", imagen:"samsung-pro3.jpg"},
    {nombre:"Auricular samsung buds pro", precio:25000, categoria:"Auriculares", imagen:"samsung-buds-pro.jpg"},
    {nombre:"Auricular openwear", precio:15000, categoria:"Auriculares", imagen:"openwear.jpg"},
    {nombre:"Auricular P9", precio:15000, categoria:"Auriculares", imagen:"P9.jpg"},

    // Smartwatch
    {nombre:"Smartwatch w10 (10 mallas)", precio:38000, categoria:"Smartwatch", imagen:"Smartwach_w10.jpg"},
    {nombre:"Smartwatch HK10 pro max", precio:75000, categoria:"Smartwatch", imagen:"HK10_pro_max.jpg"},
    {nombre:"Smartwatch watch 4", precio:38000, categoria:"Smartwatch", imagen:"Smartwach_watch_4.jpg"},
    {nombre:"Smartwatch s9 ultra", precio:25000, categoria:"Smartwatch", imagen:"Smartwach_s9_ultra.jpg"},
    {nombre:"Smartwatch t900", precio:30000, categoria:"Smartwatch", imagen:"Smartwach_t900.jpg"},

    // Herramientas
    {nombre:"Caja de tubos 40 piezas", precio:10000, categoria:"Herramientas", imagen:"caja-tubos-40-piezas.jpg"},
    {nombre:"Compresor inflador portatil", precio:47000, categoria:"Herramientas", imagen:"compresor-inflador-portatil.jpg"},
    {nombre:"Caja de herramientas 46 piezas", precio:15000, categoria:"Herramientas", imagen:"caja-herramientas-46-piezas.jpg"},
    {nombre:"Destornillador inalámbrico recargable", precio:25000, categoria:"Herramientas", imagen:"destornillador-inalambrico.jpg"},
    {nombre:"Caja de tubos 53 piezas", precio:27000, categoria:"Herramientas", imagen:"caja-tubos-53-piezas.jpg"},
    {nombre:"Caja de herramientas 108 piezas", precio:72000, categoria:"Herramientas", imagen:"caja-herramientas-108-piezas.jpg"},
    {nombre:"Destornillador eléctrico", precio:35000, categoria:"Herramientas", imagen:"destornillador-electrico.jpg"},
    {nombre:"Valija de herramientas 499 piezas", precio:200000, categoria:"Herramientas", imagen:"valija-herramientas-499-piezas.jpg"},
    {nombre:"Taladro percutor 48v", precio:87000, categoria:"Herramientas", imagen:"taladro-percutor-48v.jpg"},
    {nombre:"Kit bicicleta led", precio:12000, categoria:"Herramientas", imagen:"kit-bicicleta-led.jpg"},

    // Pendrives
    {nombre:"Memoria SD 64gb Kingston", precio:16000, categoria:"Memorias", imagen:"memoria-sd-64gb.jpg"},
    {nombre:"Memoria SD 32gb Sandisk", precio:28000, categoria:"Memorias", imagen:"memoria-sd-32gb.jpg"},
    {nombre:"Pendrve Sandisk 64gb", precio:30000, categoria:"Memorias", imagen:"pendrive-sandisk-64gb.jpg"},
    {nombre:"Pendrive 16gb Kingston", precio:15000, categoria:"Memorias", imagen:"pendrive-16gb-kingston.jpg"},

    // Camping
    {nombre:"Linterna 4led recargable", precio:9000, categoria:"Camping", imagen:"linterna-4led.jpg"},
    {nombre:"Cargador solar 12000mha", precio:20000, categoria:"Camping", imagen:"cargador-solar-12000mha.jpg"},
    {nombre:"Reflector solar 50w", precio:45000, categoria:"Camping", imagen:"reflector-solar-50w.jpg"},
    {nombre:"Manguera extensible 15 metros", precio:20000, categoria:"Camping", imagen:"manguera-extensible-15-metros.jpg"},
    {nombre:"Linterna con panel solar", precio:30000, categoria:"Camping", imagen:"linterna-con-panel-solar.jpg"},
    {nombre:"Pilas AA x60unidades", precio:20000, categoria:"Camping", imagen:"pilas-aa-x60unidades.jpg"},

    // Gaming
    {nombre:"Mouse inalámbrico con RGB Dinax", precio:13000, categoria:"Gaming", imagen:"mouse-inalambrico-rgb-dinax.jpg"},
    {nombre:"Receptor wifi", precio:7000, categoria:"Gaming", imagen:"receptor-wifi.jpg"},
    {nombre:"Repetidor wifi", precio:18000, categoria:"Gaming", imagen:"repetidor_wifi.jpg"},
    {nombre:"Mouse gamer retroiluminado Dinax", precio:14000, categoria:"Gaming", imagen:"mouse-gamer-retroiluminado-dinax.jpg"},
    {nombre:"Torre RBG 1 metro (1 unidad)", precio:20000, categoria:"Gaming", imagen:"torre-rgb-1-metro.jpg"},
    {nombre:"Cargador notebook universal", precio:20000, categoria:"Gaming", imagen:"cargador-notebook-universal.jpg"},
    {nombre:"Joystick complatible ps4/ps5", precio:38000, categoria:"Gaming", imagen:"joystick-ps4-ps5.jpg"},
    {nombre:"Joyatick ps4 sony AAA", precio:45000, categoria:"Gaming", imagen:"joystick-ps4.jpg"},
    {nombre:"Joystick con soporte", precio:22000, categoria:"Gaming", imagen:"joystick-con-soporte.jpg"},
    {nombre:"Consola de juegos R36S", precio:72000, categoria:"Gaming", imagen:"consola-juegos-r36s.jpg"},
    {nombre:"Consola de juegos 2.4 stick", precio:35000, categoria:"Gaming", imagen:"consola-juegos-2.4-stick.jpg"},
    {nombre:"Soporte notebook", precio:15000, categoria:"Gaming", imagen:"soporte-notebook.jpg"},
    {nombre:"Combo teclado y mouse Dinax", precio:25000, categoria:"Gaming", imagen:"combo-teclado-mouse-dinax.jpg"},
    {nombre:"Joystick ps4 version AFA", precio:38000, categoria:"Gaming", imagen:"joystick-ps4-version-afa.jpg"},
    {nombre:"Joystick ps4 negro", precio:45000, categoria:"Gaming", imagen:"joystick-ps4-negro.jpg"},

    // Audio
    {nombre:"Radio Retro", precio:30000, categoria:"Audio", imagen:"radio-retro.jpg"},
    {nombre:"Parlante karaoke con micrófono", precio:22000, categoria:"Audio", imagen:"parlante-karaoke-microfono.jpg"},
    {nombre:"Parlante JBL go4 led RGB", precio:25000, categoria:"Audio", imagen:"parlante-jbl-go4-led-rgb.jpg"},
    {nombre:"Parlante flip 6", precio:30000, categoria:"Audio", imagen:"parlante-flip-6.jpg"},
    {nombre:"Parlante JBL charceg 6", precio:39000, categoria:"Audio", imagen:"parlante-jbl-charceg-6.jpg"},
    {nombre:"Parlante JBL flip 7", precio:45000, categoria:"Audio", imagen:"parlante_flip7.jpg"},
    {nombre:"Parlante OM 6.5 pulgadas", precio:35000, categoria:"Audio", imagen:"parlante6.5.jpg"},
    {nombre:"Parlante OM 2x 6.5 pulgadas", precio:70000, categoria:"Audio", imagen:"parlante2x6.5.jpg"},

    // Botellas y Termos
    {nombre:"Botella infantil 600ml", precio:10000, categoria:"Termos", imagen:"botella-infantil-600ml.jpg"},
    {nombre:"Termito 600ml", precio:18000, categoria:"Termos", imagen:"termito-600ml.jpg"},
    {nombre:"Vaso termico cafetero", precio:16000, categoria:"Termos", imagen:"vaso-termico-cafetero.jpg"},
    {nombre:"Botella 700ml infantil", precio:9000, categoria:"Termos", imagen:"botella-700ml-infantil.jpg"},
    {nombre:"vaso Quencher 900ml", precio:22000, categoria:"Termos", imagen:"vaso-quencher-900ml.jpg"},
    {nombre:"Mate acero 180ml", precio:10000, categoria:"Termos", imagen:"mate-acero-180ml.jpg"},
    {nombre:"Botellas estampadas 500ml", precio:18000, categoria:"Termos", imagen:"botellas-estampadas-500ml.jpg"},
    {nombre:"Termos 1.3 litros", precio:28000, categoria:"Termos", imagen:"termos-1.3-litros.jpg"},
    {nombre:"Mates autocebantes", precio:20000, categoria:"Termos", imagen:"mates-autocebantes.jpg"},

    // Juguetes
    {nombre:"Arco de futbol", precio:25000, categoria:"Juguetes", imagen:"arco-futbol.jpg"},
    {nombre:"Barco a pilas", precio:15000, categoria:"Juguetes", imagen:"barco-a-pilas.jpg"},
    {nombre:"Pelota de voley", precio:15000, categoria:"Juguetes", imagen:"pelota-voley.jpg"},
    {nombre:"Camara digital para niños", precio:25000, categoria:"Juguetes", imagen:"camara-digital-ninos.jpg"},
    {nombre:"Camara impresora para niños", precio:42000, categoria:"Juguetes", imagen:"camara-impresora-ninos.jpg"},

    // Belleza
    {nombre:"Belleza 3 en 1", precio:25000, categoria:"Belleza", imagen:"belleza-3-en-1.jpg"},
    {nombre:"Depiladora facial 2 en 1", precio:12000, categoria:"Belleza", imagen:"depiladora-facial-2-en-1.jpg"},
    {nombre:"Secador de pelo 5 en 1", precio:30000, categoria:"Belleza", imagen:"secador-pelo-5-en-1.jpg"},
    {nombre:"Depiladora facial", precio:9000, categoria:"Belleza", imagen:"depiladora-facial.jpg"},
    {nombre:"Depiladora 4 en 1", precio:28000, categoria:"Belleza", imagen:"depiladora-4-en-1.jpg"},
    {nombre:"Planchita de pelo Dinax", precio:25000, categoria:"Belleza", imagen:"planchita-pelo-dinax.jpg"},
    {nombre:"Secador de pelo Sokany", precio:23000, categoria:"Belleza", imagen:"secador-pelo-sokany.jpg"},
    {nombre:"Depiladora ceja tipo lapiz", precio:9000, categoria:"Belleza", imagen:"depiladora-ceja-tipo-lapiz.jpg"},
    {nombre:"Kit peluqueria + capa", precio:30000, categoria:"Belleza", imagen:"kit-peluqueria-capa.jpg"},
    {nombre:"Maquina de cortar el pelo Kemei profesional", precio:45000, categoria:"Belleza", imagen:"maquina-cortar-pelo-kemei-profesional.jpg"},
    {nombre:"Secador profesional Hythosy", precio:27000, categoria:"Belleza", imagen:"secador-profesional-hythosy.jpg"},
    {nombre:"Espejo con luz redondo", precio:15000, categoria:"Belleza", imagen:"espejo-luz-redondo.jpg"},
    {nombre:"Espejo con luz rectangular", precio:16000, categoria:"Belleza", imagen:"espejo-luz-rectangular.jpg"},
    {nombre:"Clipper Dailing profesional", precio:47500, categoria:"Belleza", imagen:"clipper-dailing-profesional.jpg"},
    {nombre:"Patillera OM", precio:22000, categoria:"Belleza", imagen:"patillera-om.jpg"},

    // Accesorios Celular
    {nombre:"Cargador samsung completo 45w", precio:16000, categoria:"Celulares", imagen:"cargador-samsung-completo-45w.jpg"},
    {nombre:"Cargador completo iphone", precio:18000, categoria:"Celulares", imagen:"cargador-completo-iphone.jpg"},
    {nombre:"Cabezal samsung 45w", precio:10000, categoria:"Celulares", imagen:"cabezal-samsung-45w.jpg"},
    {nombre:"Cabezal iphone 20w", precio:12000, categoria:"Celulares", imagen:"cabezal-iphone-20w.jpg"},
    {nombre:"Cargador solar 12000mha", precio:20000, categoria:"Celulares", imagen:"cargador-solar-12000mha.jpg"},
    {nombre:"Cargador portatil powerbank", precio:22000, categoria:"Celulares", imagen:"cargador-portatil-powerbank.jpg"},
    {nombre:"Cable samsung tipo c", precio:6000, categoria:"Celulares", imagen:"cable-samsung-tipo-c.jpg"},
    {nombre:"Cable iphone c a lightning", precio:6000, categoria:"Celulares", imagen:"cable-iphone-c-a-lightning.jpg"},
    {nombre:"Cable motorola usb-a a tipo c", precio:4000, categoria:"Celulares", imagen:"cable-motorola-usb-a-a-tipo-c.jpg"},
    {nombre:"Cable flux-bolsita usb-a a tipo c", precio:3000, categoria:"Celulares", imagen:"cable-flux-bolsita.jpg"},
    {nombre:"Cable flux c a c mallado", precio:4000, categoria:"Celulares", imagen:"cable-flux-c-a-c-mallado.jpg"},
    {nombre:"Microfono corbatero", precio:12000, categoria:"Celulares", imagen:"microfono-corbatero.jpg"},

    // Vehículos
    {nombre:"Cargador carga rapida auto 18w", precio:12000, categoria:"Vehículos", imagen:"cargador-carga-rapida-auto-18w.jpg"},
    {nombre:"Trasmisor fm bluetooth con cargador", precio:18000, categoria:"Vehículos", imagen:"trasmisor-fm-bluetooth-con-cargador.jpg"},
    {nombre:"Receptor bluetooth 3.5mm", precio:9000, categoria:"Vehículos", imagen:"receptor-bluetooth-3.5mm.jpg"},
    {nombre:"Soporte celular para auto", precio:13000, categoria:"Vehículos", imagen:"soporte-celular-para-auto.jpg"},
    {nombre:"Soporte celular magnetico", precio:19000, categoria:"Vehículos", imagen:"soporte-celular-magnetico.jpg"},

    // Hogar
    {nombre:"Humificador", precio:14000, categoria:"Hogar", imagen:"humificador.jpg"},
    {nombre:"Cesto de ropa doble", precio:27000, categoria:"Hogar", imagen:"cesto-ropa-doble.jpg"},
    {nombre:"Aplique pared bidireccional", precio:10000, categoria:"Hogar", imagen:"aplique-pared-bidireccional.jpg"},
    {nombre:"Balanza digital redonda", precio:20000, categoria:"Hogar", imagen:"balanza-digital-redonda.jpg"},
    {nombre:"Tensiometro digital", precio:27000, categoria:"Hogar", imagen:"tensiometro-digital.jpg"},
    {nombre:"Tendedero Organizador", precio:25000, categoria:"Hogar", imagen:"tendedero-organizador.jpg"},
    {nombre:"Mini aire acondicionado", precio:27000, categoria:"Hogar", imagen:"miniaire.jpg"},
    {nombre:"Pistola masajeadora", precio:25000, categoria:"Hogar", imagen:"pistola-masajeadora.jpg"},
    {nombre:"Timbre inalambrico", precio:10000, categoria:"Hogar", imagen:"timbre-inalambrico.jpg"},
    {nombre:"Calculadora cientifica", precio:10000, categoria:"Hogar", imagen:"calculadora-cientifica.jpg"},
    {nombre:"Luz de emergencia -30 led", precio:15000, categoria:"Hogar", imagen:"luz-emergencia-30-led.jpg"},
    {nombre:"Aspiradora Dinax tacho", precio:60000, categoria:"Hogar", imagen:"aspiradora-dinax-tacho.jpg"},

    // Cocina
    {nombre:"Picador triturador 500ml", precio:15000, categoria:"Cocina", imagen:"picador-triturador-500ml.jpg"},
    {nombre:"Dosificador aceite spray", precio:10000, categoria:"Cocina", imagen:"dosificador-aceite-spray.jpg"},
    {nombre:"Balanza comercial 40kg", precio:77000, categoria:"Cocina", imagen:"balanza-comercial-40kg.jpg"},
    {nombre:"Tostadora Suono 2 rebanadas", precio:30000, categoria:"Cocina", imagen:"tostadora-suono-2-rebanadas.jpg"},
    {nombre:"Especiero giratorio 12 frascos", precio:35000, categoria:"Cocina", imagen:"especiero-giratorio-12-frascos.jpg"},
    {nombre:"Yogurtera Suono 1.4 litros", precio:40000, categoria:"Cocina", imagen:"yogurtera-suono-1.4-litros.jpg"},
    {nombre:"Vaporera electrica 3 cestas 8.5 litros", precio:45000, categoria:"Cocina", imagen:"vaporera-electrica-3-cestas-8.5-litros.jpg"},
    {nombre:"Waflera electrica Dinax 2 porciones", precio:32000, categoria:"Cocina", imagen:"waflera-electrica-dinax-2-porciones.jpg"},
    {nombre:"Sandwichera panini grill Dinax 700w", precio:35000, categoria:"Cocina", imagen:"sandwichera-panini-grill-dinax-700w.jpg"},
    {nombre:"Batidora 3 en 1 inalambrico", precio:25000, categoria:"Cocina", imagen:"batidora-3-en-1-inalambrico.jpg"},
    {nombre:"Afilador de cuchillos manual", precio:5000, categoria:"Cocina", imagen:"afilador-cuchillos-manual.jpg"},
    {nombre:"Freidora de aire Suono 3.2 litros", precio:75000, categoria:"Cocina", imagen:"freidora-aire-suono-3.2-litros.jpg"},
    {nombre:"Bateria de cocina", precio:72000, categoria:"Cocina", imagen:"bateria-cocina.jpg"},
    {nombre:"Sandwichera OM", precio:35000, categoria:"Cocina", imagen:"sandwichera-om.jpg"},
    {nombre:"Mini pimer Lumabella", precio:30000, categoria:"Cocina", imagen:"mini-pimer-lumabella.jpg"},
    {nombre:"Multiprocesadora 4 en 1 - Lumabella", precio:65000, categoria:"Cocina", imagen:"multiprocesadora-4-en-1-lumabella.jpg"},
    {nombre:"Anafe electrico OM", precio:20000, categoria:"Cocina", imagen:"anafe-electrico-om.jpg"},
    {nombre:"Maquina de mini donas", precio:47000, categoria:"Cocina", imagen:"maquina-mini-donas.jpg"},
    {nombre:"Batidora Sokany", precio:25000, categoria:"Cocina", imagen:"batidora-sokany.jpg"},
    {nombre:"Especiero magnetico", precio:18000, categoria:"Cocina", imagen:"especiero-magnetico.jpg"},
    {nombre:"Picador recargable", precio:12000, categoria:"Cocina", imagen:"picador-recargable.jpg"},
    {nombre:"Mandolina", precio:20000, categoria:"Cocina", imagen:"mandolina.jpg"},
    {nombre:"Set especiero", precio:35000, categoria:"Cocina", imagen:"set-especiero.jpg"},
    {nombre:"Dispenser automatico de agua", precio:12000, categoria:"Cocina", imagen:"dispenser-automatico-agua.jpg"}
];


const categoriasConfig = [
    { nombre: "Todos", icono: "📦" },
    { nombre: "Auriculares", icono: "🎧" },
    { nombre: "Smartwatch", icono: "⌚" },
    { nombre: "Audio", icono: "🔊" },
    { nombre: "Gaming", icono: "🎮" },
    { nombre: "Herramientas", icono: "🛠️" },
    { nombre: "Memorias", icono: "💾" }, // Corregido para que coincida con productos
    { nombre: "Camping", icono: "⛺" },
    { nombre: "Termos", icono: "🧉" },
    { nombre: "Juguetes", icono: "🧸" },
    { nombre: "Belleza", icono: "✨" },
    { nombre: "Celulares", icono: "📱" }, // Corregido
    { nombre: "Hogar", icono: "🏠" },
    { nombre: "Cocina", icono: "🍳" },
    { nombre: "Vehículos", icono: "🚗" }
];








let carrito = JSON.parse(localStorage.getItem("carrito_PD")) || [];
let filtroCat = "Todos";

function cargarCategoriasUI() {
    const grid = document.getElementById("grid-categorias");
    grid.innerHTML = categoriasConfig.map(cat => `
        <div class="cat-bubble ${filtroCat === cat.nombre ? 'active' : ''}" onclick="setCat('${cat.nombre}')">
            <span>${cat.icono}</span> <span>${cat.nombre}</span>
        </div>
    `).join('');
}

function setCat(c) { filtroCat = c; cargarCategoriasUI(); filtrar(); }

function renderizar(lista) {
    const cont = document.getElementById("contenedor-productos");
    cont.innerHTML = lista.map(p => `
        <div class="card" onclick="verDetalle('${p.nombre.replace(/'/g, "\\'")}')">
            <img src="img/${p.imagen}" onerror="this.src='https://via.placeholder.com/200'">
            <h3>${p.nombre}</h3>
            <div class="precio">$${p.precio.toLocaleString('es-AR')}</div>
            <button class="btn-add" onclick="event.stopPropagation(); agregar('${p.nombre.replace(/'/g, "\\'")}')">Añadir</button>
        </div>
    `).join('');
}

function verDetalle(nombre) {
    const p = productos.find(i => i.nombre === nombre);
    const modal = document.getElementById("modal-detalle");
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <img src="img/${p.imagen}" onerror="this.src='https://via.placeholder.com/200'">
        <h2 style="margin:10px 0;">${p.nombre}</h2>
        <div style="font-size:2rem; color:var(--amarillo); font-weight:700; margin-bottom:20px;">$${p.precio.toLocaleString('es-AR')}</div>
        <button class="btn-add" style="padding:15px; font-size:1.1rem;" onclick="agregar('${p.nombre.replace(/'/g, "\\'")}')">Agregar al Carrito</button>
    `;
    modal.style.display = "flex";
}

function cerrarModal(event) {
    if (!event || event.target.id === "modal-detalle" || event.target.className === "modal-close") {
        document.getElementById("modal-detalle").style.display = "none";
    }
}

function filtrar() {
    const texto = document.getElementById("busqueda").value.toLowerCase();
    const res = productos.filter(p => (filtroCat === "Todos" || p.categoria === filtroCat) && p.nombre.toLowerCase().includes(texto));
    renderizar(res);
}

function agregar(nombre) {
    const p = productos.find(i => i.nombre === nombre);
    const ex = carrito.find(i => i.nombre === nombre);
    if(ex) ex.cantidad++; else carrito.push({...p, cantidad: 1});
    actualizar();
    document.getElementById("modal-detalle").style.display = "none";
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
    
    listaUI.innerHTML = carrito.map((item, idx) => {
        total += item.precio * item.cantidad;
        return `
            <div style="display:flex; align-items:center; gap:12px; background:#161616; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #222;">
                <img src="img/${item.imagen}" style="width:50px; height:50px; background:white; border-radius:6px; object-fit:contain;">
                <div style="flex:1">
                    <h4 style="margin:0; font-size:13px; color:white;">${item.nombre}</h4>
                    <div style="margin-top:8px; display:flex; align-items:center;">
                        <button class="qty-btn" onclick="cambiarCantidad(${idx}, -1)">-</button>
                        <span style="font-weight:bold; color:var(--amarillo); min-width:20px; text-align:center;">${item.cantidad}</span>
                        <button class="qty-btn" onclick="cambiarCantidad(${idx}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:var(--amarillo); font-size:14px;">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
                    <button onclick="cambiarCantidad(${idx}, -999)" style="background:none; border:none; color:#555; margin-top:5px; cursor:pointer;">Eliminar</button>
                </div>
            </div>`;
    }).join('');
    
    document.getElementById("total-monto").innerText = "$" + total.toLocaleString('es-AR');
    document.getElementById("cantidad-badge").innerText = carrito.reduce((acc, i) => acc + i.cantidad, 0);
}

function toggleCarrito() { document.getElementById("carrito-lateral").classList.toggle("open"); }

function enviarWhatsApp() {
    if(carrito.length === 0) return;
    let m = "¡Hola Punto Digital! Mi pedido es:%0A";
    carrito.forEach(i => m += `• ${i.cantidad}x ${i.nombre} ($${(i.precio*i.cantidad).toLocaleString('es-AR')})%0A`);
    m += `%0A*Total: ${document.getElementById("total-monto").innerText}*`;
    window.open(`https://wa.me/5492625460527?text=${m}`);
}

document.getElementById("busqueda").addEventListener("keyup", filtrar);
window.onload = () => { cargarCategoriasUI(); renderizar(productos); actualizar(); };
