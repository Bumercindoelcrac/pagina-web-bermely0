/* =====================================================================
   BER-MELY · app.js
   MENU_DIA_URL → URL raw de GitHub del menú del día, ej.:
   https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/menu-del-dia.json
   (también se puede pasar con ?dia=URL en la dirección de la página)
   ===================================================================== */
const MENU_DIA_URL = "menu-del-dia.json";
const MENU_URL     = "menu.json";
const WHATSAPP     = "525537317794";
/* Coordenadas del restaurante (ajústalas si el pin no cae exacto: clic derecho en Google Maps → copiar coordenadas) */
const REST = { lat: 19.297633, lng: -99.0220159, nombre: "Café Ber-Mely", placeId: "ChIJ2_6tZAADzoURotOTGGvAmZI" };
/* Cargo por empaque (solo para recoger / a domicilio) */
const FEE_DEFAULT  = 10;                                    // $ por platillo
const FEE_LIGHT    = 5;                                     // $ por platillo en estas categorías
const FEE_LIGHT_CATS = ["Cafetería", "La Crepería", "Bebidas", "Coctelería"];
const MENU_EMBED = __MENU__;
const DIA_EMBED  = __DIA__;

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => "$" + Number(n).toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
let toastT;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),1800); }

/* ---------- loader ---------- */
addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 500));
setTimeout(() => $("#loader").classList.add("done"), 3500); // por si algo tarda

/* ---------- nav ---------- */
const nav = $("#nav"), links = $("#navLinks"), burger = $("#burger");
burger.onclick = () => { const o = links.classList.toggle("open"); burger.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
$$("a", links).forEach(a => a.onclick = () => { links.classList.remove("open"); burger.classList.remove("open"); document.body.style.overflow = ""; });
$("#year").textContent = new Date().getFullYear();

let lastY = 0;
addEventListener("scroll", () => {
  const y = scrollY, h = document.documentElement;
  nav.classList.toggle("scrolled", y > 30);
  nav.classList.toggle("hidden", y > lastY && y > 400 && !links.classList.contains("open"));
  lastY = y;
  $("#progress").style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + "%";
  parallax();
}, {passive:true});

/* ---------- parallax suave ---------- */
const pxEls = $$("[data-parallax]");
function parallax(){
  const vh = innerHeight;
  pxEls.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const f = parseFloat(el.dataset.parallax) || 0.12;
    const p = (r.top + r.height/2 - vh/2) / vh;         // -1 .. 1
    el.style.transform = `translateY(${(-p * f * 100).toFixed(2)}px) scale(1.06)`;
  });
}

/* ---------- abierto / cerrado ---------- */
(function openStatus(){
  const d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes()/60;
  const sched = {0:[9.5,20.5],1:[8.5,20.5],2:[8.5,17.5],3:[8.5,17.5],4:[8.5,20.5],5:[8.5,20.5],6:[8.5,20.5]}; // dom,lun,mar,mié,jue,vie,sáb
  const [o,c] = sched[day], open = h >= o && h < c;
  const fmt = x => `${Math.floor(x)}:${String(Math.round((x%1)*60)).padStart(2,"0")}`;
  const el = $("#openStatus");
  el.textContent = open ? `Abierto · cerramos ${fmt(c)}` : `Cerrado · abrimos ${fmt(o)}`;
  el.classList.toggle("closed", !open);
})();

/* ---------- carrito ---------- */
let cart = JSON.parse(localStorage.getItem("bermely_cart") || "[]");
const saveCart = () => localStorage.setItem("bermely_cart", JSON.stringify(cart));
function addToCart(nombre, precio, cat){
  const f = cart.find(i => i.nombre === nombre && i.precio === precio);
  if (f) f.qty++; else cart.push({nombre, precio, cat, qty:1});
  saveCart(); renderCart(); toast(`Agregado · ${nombre.split("(")[0].trim()}`);
  const b = $("#cartBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}
function changeQty(idx, d){ cart[idx].qty += d; if (cart[idx].qty <= 0) cart.splice(idx,1); saveCart(); renderCart(); }
const feeFor = cat => FEE_LIGHT_CATS.some(c => norm(c) === norm(cat||"")) ? FEE_LIGHT : FEE_DEFAULT;
const isTakeout = () => $("#cMode").value !== "Para comer aquí";
function cartTotals(){
  const sub = cart.reduce((a,i)=>a+i.precio*i.qty,0);
  const fee = isTakeout() ? cart.reduce((a,i)=>a+feeFor(i.cat)*i.qty,0) : 0;
  return {sub, fee, total: sub+fee};
}
function renderCart(){
  const box = $("#cartItems"), takeout = isTakeout();
  $("#cartCount").textContent = cart.reduce((a,i)=>a+i.qty,0);
  box.innerHTML = cart.length ? cart.map((i,idx)=>`
    <div class="c-item">
      <div class="c-name">${esc(i.nombre)}<small>${esc(i.cat||"")} · ${money(i.precio)}${takeout ? ` <span class="fee">+ ${money(feeFor(i.cat))} empaque</span>` : ""}</small></div>
      <div class="qty"><button data-i="${idx}" data-d="-1" aria-label="Menos">−</button><span>${i.qty}</span><button data-i="${idx}" data-d="1" aria-label="Más">+</button></div>
      <div class="c-sub">${money(i.precio*i.qty)}</div>
    </div>`).join("") : `<p class="cart-empty">Tu carrito está vacío.<br>Toca cualquier platillo de la carta para agregarlo.</p>`;
  const t = cartTotals();
  $("#cartRows").innerHTML = cart.length ? `
    <div><span>Subtotal</span><strong>${money(t.sub)}</strong></div>
    <div><span>Empaque (${takeout ? "recoger / domicilio" : "no aplica al comer aquí"})</span><strong>${money(t.fee)}</strong></div>
    ${takeout ? `<span class="hint">$${FEE_DEFAULT} por platillo · $${FEE_LIGHT} en Cafetería, Crepería y Bebidas</span>` : ""}` : "";
  $("#cartTotal").textContent = money(t.total);
  $$(".qty button", box).forEach(b => b.onclick = () => changeQty(+b.dataset.i, +b.dataset.d));
}
const openCart = () => { $("#cart").classList.add("open"); $("#cartOverlay").classList.add("open"); document.body.style.overflow = "hidden"; };
const closeCart = () => { $("#cart").classList.remove("open"); $("#cartOverlay").classList.remove("open"); document.body.style.overflow = ""; };
$("#cMode").onchange = renderCart;
$("#cartBtn").onclick = openCart; $("#cartClose").onclick = closeCart; $("#cartOverlay").onclick = closeCart;
$("#clearCart").onclick = () => { if (cart.length && confirm("¿Vaciar el carrito?")) { cart=[]; saveCart(); renderCart(); } };
$("#sendWA").onclick = () => {
  if (!cart.length) return toast("Tu carrito está vacío");
  const name = $("#cName").value.trim(), mode = $("#cMode").value, notes = $("#cNotes").value.trim();
  const t = cartTotals(), takeout = isTakeout();
  let msg = `*PEDIDO BER-MELY*\n`;
  if (name) msg += `Nombre: ${name}\n`;
  msg += `Modo: ${mode}\n\n`;
  cart.forEach(i => msg += `• ${i.qty} x ${i.nombre} — ${money(i.precio*i.qty)}${takeout ? ` (+${money(feeFor(i.cat)*i.qty)} empaque)` : ""}\n`);
  msg += `\nSubtotal: ${money(t.sub)}`;
  if (takeout) msg += `\nEmpaque: ${money(t.fee)}`;
  msg += `\n*TOTAL: ${money(t.total)}*`;
  if (notes) msg += `\n\nNotas: ${notes}`;
  msg += `\n\n_Enviado desde la carta digital_`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};
renderCart();

/* ---------- carta ---------- */
let MENU = null;
fetch(MENU_URL).then(r => { if(!r.ok) throw 0; return r.json(); }).catch(() => MENU_EMBED)
  .then(data => { MENU = data; buildCarta(data.categorias); });

function itemHTML(it, cat, i){
  return `<div class="item" style="animation-delay:${Math.min(i*30,500)}ms" data-n="${esc(it.nombre)}" data-p="${it.precio}" data-c="${esc(cat)}">
    <span class="item-name">${esc(it.nombre)}</span><span class="item-dots"></span>
    <span class="item-price">${money(it.precio)}</span><span class="item-add"><iconify-icon icon="ph:plus"></iconify-icon></span></div>`;
}
const bindItems = root => $$(".item", root).forEach(el => el.onclick = () => addToCart(el.dataset.n, +el.dataset.p, el.dataset.c));
const shortName = n => n.split("(")[0].split("·")[0].trim();

function buildCarta(cats, activeId){
  const tabs = $("#tabs"), panels = $("#panels");
  const act = activeId || cats[0].id;
  tabs.innerHTML = cats.map(c=>`<button class="tab ${c.id===act?"active":""}" data-id="${c.id}"><iconify-icon icon="${c.icono}"></iconify-icon>${esc(shortName(c.nombre))}</button>`).join("");
  panels.innerHTML = cats.map(c=>{ let k=0; return `
    <div class="panel ${c.id===act?"active":""}" id="panel-${c.id}">
      ${c.imagen ? `<div class="panel-hero"><img src="${c.imagen}" alt="${esc(c.nombre)}" loading="lazy"><h3>${esc(c.nombre)}</h3></div>` : ""}
      ${c.subcategorias.map(s=>`
        <div class="sub-block">
          <h4><iconify-icon icon="${s.icono||'ph:fork-knife'}"></iconify-icon>${esc(s.nombre)}</h4>
          <div class="items">${s.items.map(it=>itemHTML(it, shortName(c.nombre), k++)).join("")}</div>
        </div>`).join("")}
    </div>`;}).join("");
  $$(".tab").forEach(t => t.onclick = () => {
    $("#search").value = "";
    buildCarta(cats, t.dataset.id);
    t = $(`.tab[data-id="${t.dataset.id}"]`); t.scrollIntoView({behavior:"smooth", block:"nearest", inline:"center"});
    const top = $("#carta").getBoundingClientRect().top + scrollY;
    if (scrollY > top + 200) scrollTo({top: top, behavior:"smooth"});
  });
  bindItems(panels);
}
$("#search").addEventListener("input", e => {
  const q = e.target.value.trim(); if (!MENU) return;
  if (!q){ buildCarta(MENU.categorias); return; }
  const res = [];
  MENU.categorias.forEach(c => c.subcategorias.forEach(s => s.items.forEach(it => { if (norm(it.nombre).includes(norm(q)) || norm(s.nombre).includes(norm(q))) res.push({it, cat:shortName(c.nombre)}); })));
  $$(".tab").forEach(x=>x.classList.remove("active"));
  $("#panels").innerHTML = res.length
    ? `<div class="panel active"><div class="sub-block" style="margin-top:1.8rem"><h4><iconify-icon icon="ph:magnifying-glass"></iconify-icon>${res.length} resultado${res.length>1?"s":""}</h4><div class="items">${res.map((r,i)=>itemHTML(r.it, r.cat, i)).join("")}</div></div></div>`
    : `<p class="no-results">Sin resultados para "${esc(q)}".</p>`;
  bindItems($("#panels"));
});

/* ---------- menú del día (modal) ---------- */
const openDia  = () => { $("#diaModal").classList.add("open"); $("#diaModalBg").classList.add("open"); document.body.style.overflow="hidden"; };
const closeDia = () => { $("#diaModal").classList.remove("open"); $("#diaModalBg").classList.remove("open"); document.body.style.overflow=""; };
$("#openDia").onclick = openDia; $("#diaClose").onclick = closeDia; $("#diaModalBg").onclick = closeDia;
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDia(); closeCart(); } });

(async function loadMenuDia(){
  const url = new URLSearchParams(location.search).get("dia") || MENU_DIA_URL;
  const card = $("#diaCard");
  try {
    let d;
    try { const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), {cache:"no-store"}); if (!r.ok) throw 0; d = await r.json(); }
    catch { d = DIA_EMBED; }

    if (d.horario) $("#diaHorario").textContent = d.horario;
    if (d.fecha) { const f = new Date(d.fecha + "T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"}); $("#diaFecha").textContent = f.charAt(0).toUpperCase() + f.slice(1); }

    const tiempos = (d.tiempos||[]).map((t,i,arr) => ({
      nombre: t.nombre,
      incluido: t.incluido !== undefined ? !!t.incluido : i < arr.length-1,
      opciones: (t.opciones||[]).map(o => typeof o === "string" ? {nombre:o, precio:0} : {nombre:o.nombre, precio:+o.precio||0})
    }));
    const mainIdx = tiempos.findIndex(t => !t.incluido);
    const sel = tiempos.map(() => null);

    card.innerHTML = `
      ${tiempos.map((t,ti)=>`
        <div class="tiempo">
          <h4><span class="num">0${ti+1}</span>${esc(t.nombre)}<span class="tag ${t.incluido?"":"pay"}">${t.incluido ? "Incluido" : "Define el precio"}</span></h4>
          ${t.opciones.map((o,oi)=>`
            <div class="opcion" data-t="${ti}" data-o="${oi}" role="radio" aria-checked="false">
              <span class="radio"></span><span class="op-name">${esc(o.nombre)}</span>
              ${t.incluido ? "" : `<span class="op-price">${money(o.precio)}</span>`}
            </div>`).join("")}
        </div>`).join("")}
      <p class="dia-extra">Incluye agua del día.</p>
      <div class="dia-foot">
        <div class="dia-sum"><span class="dia-msg" id="diaMsg">Elige tu guisado para continuar</span><span class="dia-price" id="diaTotal">$0.00</span></div>
        <button class="btn btn-dark full" id="addDia" disabled>Agregar al pedido <iconify-icon icon="ph:arrow-right"></iconify-icon></button>
      </div>`;

    const refresh = () => {
      $$(".opcion", card).forEach(el => { const on = sel[+el.dataset.t] === +el.dataset.o; el.classList.toggle("sel", on); el.setAttribute("aria-checked", on); });
      const main = mainIdx >= 0 && sel[mainIdx] !== null ? tiempos[mainIdx].opciones[sel[mainIdx]] : null;
      $("#diaTotal").textContent = money(main ? main.precio : 0);
      $("#addDia").disabled = !main;
      const incl = tiempos.map((t,ti)=> t.incluido && sel[ti]!==null ? t.opciones[sel[ti]].nombre : null).filter(Boolean);
      $("#diaMsg").textContent = main ? [main.nombre, ...incl].join(" · ") : "Elige tu guisado para continuar";
      $("#diaMsg").classList.toggle("ok", !!main);
    };
    $$(".opcion", card).forEach(el => el.onclick = () => { const t=+el.dataset.t, o=+el.dataset.o; sel[t] = sel[t]===o ? null : o; refresh(); });
    $("#addDia").onclick = () => {
      if (mainIdx < 0 || sel[mainIdx] === null) return toast("Elige el guisado (tercer tiempo)");
      const main = tiempos[mainIdx].opciones[sel[mainIdx]];
      const incl = tiempos.map((t,ti)=> t.incluido && sel[ti]!==null ? t.opciones[sel[ti]].nombre : null).filter(Boolean);
      addToCart(`Menú del día – ${main.nombre}` + (incl.length ? ` (con ${incl.join(" y ")})` : " (solo guisado)"), main.precio, "Menú del día");
      sel.fill(null); refresh(); closeDia(); setTimeout(openCart, 250);
    };
    refresh();
  } catch(e) {
    console.error(e);
    card.innerHTML = `<p class="muted center" style="padding:2rem 0">Hoy no hay menú del día publicado.<br>Pregúntanos por WhatsApp.</p>`;
  }
})();

/* ---------- scroll reveal + contadores ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in"); io.unobserve(e.target);
  $$("[data-count]", e.target).forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now(), dur = 1400;
    const step = now => { const p = Math.min((now - t0)/dur, 1), ease = 1 - Math.pow(1-p, 3); el.textContent = (end*ease).toFixed(dec); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}), {threshold:.15});
$$(".reveal").forEach(el => io.observe(el));
parallax();

/* ---------- ubicación: mapa + distancia ---------- */
(function geo(){
  const q = encodeURIComponent(`${REST.lat},${REST.lng}`);
  const frame = $("#mapFrame"), bar = $("#distBar"), main = $("#distMain"), sub = $("#distSub"), btn = $("#geoBtn");
  const baseDir = `https://www.google.com/maps/dir/?api=1&destination=${q}&destination_place_id=${REST.placeId}&travelmode=driving`;
  frame.src = `https://www.google.com/maps?q=${encodeURIComponent("Café Ber-Mely, San Rafael Atlixco, San Francisco Tlaltenco, Tláhuac")}&ll=${q}&z=17&output=embed`;
  $("#dirLink").href = baseDir;
  $("#wazeLink").href = `https://waze.com/ul?ll=${REST.lat},${REST.lng}&navigate=yes`;

  const R = 6371, rad = x => x*Math.PI/180;
  const km = (a,b,c,d) => { const dLat=rad(c-a), dLng=rad(d-b); const h=Math.sin(dLat/2)**2 + Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
  const fmtKm = k => k < 1 ? `${Math.round(k*1000)} m` : `${k.toFixed(k<10?1:0)} km`;
  const mins = (k, kmh) => Math.max(1, Math.round(k/kmh*60*1.3)); // ×1.3 por calles vs. línea recta

  function ok(pos){
    const {latitude:la, longitude:lo} = pos.coords;
    const d = km(la, lo, REST.lat, REST.lng);
    bar.classList.remove("loading"); bar.classList.add("ok");
    main.textContent = `Estás a ${fmtKm(d)} de Ber-Mely`;
    sub.textContent = d < 3 ? `Aprox. ${mins(d,4.5)} min caminando · ${mins(d,25)} min en auto` : `Aprox. ${mins(d,28)} min en auto · ${mins(d,18)} min en transporte`;
    btn.innerHTML = `<iconify-icon icon="ph:arrows-clockwise"></iconify-icon> Actualizar`;
    frame.src = `https://www.google.com/maps?saddr=${la},${lo}&daddr=${q}&output=embed`;
    $("#dirLink").href = `https://www.google.com/maps/dir/?api=1&origin=${la},${lo}&destination=${q}&destination_place_id=${REST.placeId}&travelmode=driving`;
    sessionStorage.setItem("bermely_geo", "1");
  }
  function fail(err){
    bar.classList.remove("loading");
    main.textContent = err && err.code === 1 ? "Permiso de ubicación denegado" : "No pudimos obtener tu ubicación";
    sub.textContent = err && err.code === 1 ? "Actívalo en la configuración del navegador o abre la ruta en Google Maps." : "Revisa que el GPS esté encendido e inténtalo de nuevo.";
    btn.innerHTML = `<iconify-icon icon="ph:crosshair"></iconify-icon> Reintentar`;
  }
  function ask(){
    if (!navigator.geolocation) return fail();
    bar.classList.add("loading"); main.textContent = "Obteniendo tu ubicación…"; sub.textContent = "Acepta el permiso en tu navegador.";
    navigator.geolocation.getCurrentPosition(ok, fail, {enableHighAccuracy:true, timeout:12000, maximumAge:60000});
  }
  btn.onclick = ask;
  // pedir permiso al abrir la página (después del loader)
  const auto = () => setTimeout(ask, 1200);
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({name:"geolocation"}).then(p => { if (p.state !== "denied") auto(); else fail({code:1}); }).catch(auto);
  } else auto();
})();
