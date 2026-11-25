/**
 * App Interactive Engine:
 * 1. Simulador de Ruta Satelital 3D (Cesium / Leaflet 3D)
 * 2. Motion UI (Crossfade, Shared Element, Magnification, Blur)
 * 3. Asistente IA de Viajes (KÚUL Powered by Gemini)
 */

let activeDestino = null;
let leafletMapInstance = null;
let mapRoutePolyline = null;
let mapRouteGlow = null;
let mapMarkers = [];
let cesiumViewer = null;
let currentMapEngine = 'cesium'; // 'cesium' (3D Globe Alejavi / Bilawal Sidhu) o 'leaflet' (2D HD)
let currentCoverflowIndex = 0;
let currentCoverflowList = [];
let wishlistActiveDest = null;

document.addEventListener('DOMContentLoaded', () => {
    checkSubdomainRouting();
    initCoverflowShowcase('todas');
    renderDestinosCards('todas');
    if (typeof renderDynamicSlidersWithViews === 'function') {
        renderDynamicSlidersWithViews();
    }
    setupMotionUI();
    initChatAssistant();

    window.addEventListener('resize', () => {
        updateCoverflowPosition();
    });
});

/* =========================================================================
   0. ENRUTADOR DINÁMICO DE SUBDOMINIOS
   ========================================================================= */

function checkSubdomainRouting() {
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith('estetica.')) {
        setTimeout(() => showView('view-estetica'), 100);
    } else if (host.startsWith('admin.')) {
        setTimeout(() => promptPinModal(), 200);
    } else if (host.startsWith('nexocontable.')) {
        setTimeout(() => showView('view-nexocontable'), 100);
    }
}

/* =========================================================================
   1. MAGNIFICATION COVERFLOW 3D CAROUSEL (@santaia.lab standards)
   ========================================================================= */

function initCoverflowShowcase(categoriaFiltro = 'todas') {
    const track = document.getElementById('coverflow-track');
    const dotsContainer = document.getElementById('coverflow-dots');
    if (!track) return;

    currentCoverflowList = categoriaFiltro === 'todas'
        ? DESTINOS_DB
        : DESTINOS_DB.filter(d => d.categoria === categoriaFiltro || d.subcategoria === categoriaFiltro);

    if (currentCoverflowList.length === 0) {
        currentCoverflowList = DESTINOS_DB;
    }

    currentCoverflowIndex = Math.min(currentCoverflowIndex, currentCoverflowList.length - 1);
    if (currentCoverflowIndex < 0) currentCoverflowIndex = 0;

    track.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    currentCoverflowList.forEach((dest, idx) => {
        const card = document.createElement('div');
        card.className = `coverflow-card ${idx === currentCoverflowIndex ? 'active' : ''}`;
        card.setAttribute('data-index', idx);
        card.style.cursor = 'pointer';
        card.onclick = () => {
            if (idx !== currentCoverflowIndex) {
                goToCoverflowIndex(idx);
            } else {
                openSharedElementModal(dest.id);
            }
        };

        const localVotes = getStoredVotes(dest.id, dest.votos_comunidad || 15);

        card.innerHTML = `
            <div class="destino-img-box">
                <img src="${dest.imagen}" alt="${dest.nombre}" loading="lazy" class="destino-img">
                <span class="destino-badge">${dest.badge}</span>
                <div class="destino-overlay-price">
                    <span class="price-pill">${dest.precio_texto}</span>
                </div>
            </div>
            <div class="destino-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <span class="destino-meta"><i class="fas fa-map-marker-alt"></i> ${dest.estado} • ${dest.duracion}</span>
                    <span class="wishlist-pill-counter" id="badge-vote-${dest.id}">
                        <i class="fas fa-heart" style="color:#ef4444;"></i> ${localVotes} votos
                    </span>
                </div>
                <h3 class="destino-title">${dest.nombre}</h3>
                <p class="destino-desc">${dest.descripcion.substring(0, 110)}...</p>
                <div class="destino-tags">
                    <span><i class="fas fa-shuttle-van"></i> ${dest.tipo_transporte.split('/')[0]}</span>
                    <span><i class="fas fa-route"></i> ${dest.tiempo_traslado}</span>
                </div>
                <div class="destino-actions">
                    <button class="btn-3d-motion" onclick="event.stopPropagation(); openSharedElementModal('${dest.id}')" title="Ver Itinerario y Pre-venta de Asiento">
                        <i class="fas fa-map-marked-alt"></i> Ver Itinerario
                    </button>
                    <button class="btn-wishlist-vote" onclick="event.stopPropagation(); openWishlistModal('${dest.id}')" title="Votar por este destino semanal">
                        <i class="fas fa-heart"></i> Me interesa
                    </button>
                </div>
            </div>
        `;
        track.appendChild(card);

        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = `coverflow-dot ${idx === currentCoverflowIndex ? 'active' : ''}`;
            dot.onclick = () => goToCoverflowIndex(idx);
            dotsContainer.appendChild(dot);
        }
    });

    setupCoverflowGestures();
    updateCoverflowPosition();
}

let touchStartX = 0;
let touchEndX = 0;

function setupCoverflowGestures() {
    const vp = document.getElementById('coverflow-viewport');
    if (!vp || vp.dataset.gesturesBound) return;
    vp.dataset.gesturesBound = "true";

    vp.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    vp.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
            if (diff > 0) nextCoverflow();
            else prevCoverflow();
        }
    }, { passive: true });
}

function updateCoverflowPosition() {
    const track = document.getElementById('coverflow-track');
    const viewport = document.getElementById('coverflow-viewport');
    if (!track || !viewport) return;

    const cards = track.querySelectorAll('.coverflow-card');
    cards.forEach((c, idx) => {
        if (idx === currentCoverflowIndex) {
            c.classList.add('active');
            c.style.transform = 'scale(1.06) perspective(1000px) rotateY(0deg) translateZ(40px)';
            c.style.opacity = '1';
            c.style.filter = 'blur(0px)';
            c.style.zIndex = '10';
        } else if (idx < currentCoverflowIndex) {
            c.classList.remove('active');
            c.style.transform = 'scale(0.85) perspective(1000px) rotateY(18deg)';
            c.style.opacity = '0.55';
            c.style.filter = 'blur(2px)';
            c.style.zIndex = '1';
        } else {
            c.classList.remove('active');
            c.style.transform = 'scale(0.85) perspective(1000px) rotateY(-18deg)';
            c.style.opacity = '0.55';
            c.style.filter = 'blur(2px)';
            c.style.zIndex = '1';
        }
    });

    const dots = document.querySelectorAll('.coverflow-dot');
    dots.forEach((d, idx) => {
        if (idx === currentCoverflowIndex) {
            d.classList.add('active');
        } else {
            d.classList.remove('active');
        }
    });

    // Centrado matemático exacto en viewport
    const activeCard = cards[currentCoverflowIndex];
    if (activeCard) {
        const viewportWidth = viewport.clientWidth;
        const cardCenter = activeCard.offsetLeft + (activeCard.offsetWidth / 2);
        const offset = (viewportWidth / 2) - cardCenter;
        track.style.transform = `translateX(${offset}px)`;
    }

    const counterTxt = document.getElementById('coverflow-counter-txt');
    if (counterTxt) {
        counterTxt.innerText = `Destino ${currentCoverflowIndex + 1} de ${currentCoverflowList.length}`;
    }
}

function prevCoverflow() {
    if (currentCoverflowIndex > 0) {
        currentCoverflowIndex--;
        updateCoverflowPosition();
    }
}

function nextCoverflow() {
    if (currentCoverflowIndex < currentCoverflowList.length - 1) {
        currentCoverflowIndex++;
        updateCoverflowPosition();
    }
}

function goToCoverflowIndex(idx) {
    currentCoverflowIndex = idx;
    updateCoverflowPosition();
}

function getStoredVotes(destId, defaultVotes) {
    try {
        const stored = localStorage.getItem(`viajes_votes_${destId}`);
        return stored ? parseInt(stored, 10) : defaultVotes;
    } catch (e) {
        return defaultVotes;
    }
}

/* =========================================================================
   2. SISTEMA DE LISTA DE DESEOS Y VOTACIÓN DE LA COMUNIDAD
   ========================================================================= */

function openWishlistModal(destId) {
    const dest = DESTINOS_DB.find(d => d.id === destId);
    if (!dest) return;
    wishlistActiveDest = dest;

    const modal = document.getElementById('wishlist-vote-modal');
    if (!modal) return;

    document.getElementById('wishlist-modal-title').innerText = `¿Te gustaría viajar a ${dest.nombre}?`;
    document.getElementById('wishlist-modal-dest-name').innerText = dest.nombre;
    document.getElementById('wishlist-modal-dest-price').innerText = `Tarifa estimada: ${dest.precio_texto} redondo`;
    
    const votes = getStoredVotes(dest.id, dest.votos_comunidad || 15);
    document.getElementById('wishlist-modal-vote-count').innerText = `${votes} personas han votado esta semana`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeWishlistModal() {
    const modal = document.getElementById('wishlist-vote-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function submitWishlistVote(e) {
    if (e) e.preventDefault();
    if (!wishlistActiveDest) return;

    const nombre = document.getElementById('vote-user-name').value.trim();
    const tel = document.getElementById('vote-user-phone').value.trim();
    const plazas = document.getElementById('vote-user-seats').value;

    if (!nombre || !tel) {
        alert("Por favor ingresa tu nombre y WhatsApp para poder notificarte de la salida.");
        return;
    }

    // Incrementar votos
    const current = getStoredVotes(wishlistActiveDest.id, wishlistActiveDest.votos_comunidad || 15);
    const newVotes = current + 1;
    try {
        localStorage.setItem(`viajes_votes_${wishlistActiveDest.id}`, newVotes);
        
        // Guardar registro de prospecto para Alma y Rogerman
        const registros = JSON.parse(localStorage.getItem('viajes_prospectos') || '[]');
        registros.push({
            destino: wishlistActiveDest.nombre,
            precio: wishlistActiveDest.precio_texto,
            nombre,
            telefono: tel,
            plazas,
            fecha: new Date().toLocaleDateString('es-MX')
        });
        localStorage.setItem('viajes_prospectos', JSON.stringify(registros));
    } catch (err) {}

    // Actualizar badge en UI
    const badge = document.getElementById(`badge-vote-${wishlistActiveDest.id}`);
    if (badge) badge.innerHTML = `<i class="fas fa-heart" style="color:#ef4444;"></i> ${newVotes} votos`;

    closeWishlistModal();

    // Confirmación y opción de WhatsApp directo
    const msg = `¡Gracias ${nombre}! Tu interés por *${wishlistActiveDest.nombre}* (${plazas} lugares) ha sido registrado.\n\n¿Deseas enviar tu petición directamente a Alma por WhatsApp para asegurar prioridad de salida?`;
    if (confirm(msg)) {
        const waText = `Hola Alma, me interesa unirme a la salida grupal para: *${wishlistActiveDest.nombre}*. Somos *${plazas} personas*. Mi nombre es *${nombre}*. ¿Cuándo abren la próxima fecha?`;
        window.open(`https://wa.me/522228016244?text=${encodeURIComponent(waText)}`, '_blank');
    }
}

/* =========================================================================
   3. CATÁLOGO INTERACTIVO CON MOTION UI (@santaia.lab)
   ========================================================================= */

function renderDestinosCards(categoriaFiltro = 'todas') {
    const container = document.getElementById('destinos-cards-grid');
    if (!container) return;

    // Crossfade effect: desvanecer antes de cargar nuevos
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';

    setTimeout(() => {
        container.innerHTML = '';
        const filtrados = categoriaFiltro === 'todas'
            ? DESTINOS_DB
            : DESTINOS_DB.filter(d => d.categoria === categoriaFiltro || d.subcategoria === categoriaFiltro);

        filtrados.forEach((dest, index) => {
            const card = document.createElement('div');
            card.className = 'destino-card-motion';
            card.setAttribute('data-id', dest.id);
            card.style.animationDelay = `${index * 0.08}s`;
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                if (!e.target.closest('button')) {
                    openSharedElementModal(dest.id);
                }
            };

            card.innerHTML = `
                <div class="destino-img-box">
                    <img src="${dest.imagen}" alt="${dest.nombre}" loading="lazy" class="destino-img">
                    <span class="destino-badge">${dest.badge}</span>
                    <div class="destino-overlay-price">
                        <span class="price-pill">${dest.precio_texto}</span>
                    </div>
                </div>
                <div class="destino-content">
                    <span class="destino-meta"><i class="fas fa-map-marker-alt"></i> ${dest.estado} • ${dest.duracion}</span>
                    <h3 class="destino-title">${dest.nombre}</h3>
                    <p class="destino-desc">${dest.descripcion.substring(0, 115)}...</p>
                    <div class="destino-tags">
                        <span><i class="fas fa-shuttle-van"></i> ${dest.tipo_transporte.split('/')[0]}</span>
                        <span><i class="fas fa-route"></i> ${dest.tiempo_traslado}</span>
                    </div>
                    <div class="destino-actions">
                        <button class="btn-detail-motion" onclick="openSharedElementModal('${dest.id}')">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                        <button class="btn-3d-motion" onclick="openRutaSatelital3D('${dest.id}')" title="Explorar Ruta Satelital 3D">
                            <i class="fas fa-satellite"></i> Ruta Satelital 3D
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Crossfade In
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 180);
}

function filterDestinosByCat(catId, btnElem) {
    document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    initCoverflowShowcase(catId);
    renderDestinosCards(catId);
}

/* =========================================================================
   4. SHARED ELEMENT EXPANSION MODAL
   ========================================================================= */

function openSharedElementModal(destId) {
    const dest = DESTINOS_DB.find(d => d.id === destId);
    if (!dest) return;
    activeDestino = dest;

    if (typeof recordCatalogView === 'function') {
        recordCatalogView(dest.id, 'view_item');
    }

    const modal = document.getElementById('destino-detail-modal');
    if (!modal) return;

    // Rellenar datos
    document.getElementById('modal-dest-img').src = dest.imagen;
    document.getElementById('modal-dest-badge').innerText = dest.badge;
    document.getElementById('modal-dest-title').innerText = dest.nombre;
    document.getElementById('modal-dest-meta').innerHTML = `📍 ${dest.estado} | ⏱️ ${dest.duracion} | 🚗 ${dest.tipo_transporte}`;
    document.getElementById('modal-dest-desc').innerText = dest.descripcion;
    document.getElementById('modal-dest-price').innerText = dest.precio_texto;

    // Render Itinerario Hora por Hora
    const itinContainer = document.getElementById('modal-dest-itinerario');
    itinContainer.innerHTML = dest.itinerario.map(it => `
        <div class="itin-item">
            <span class="itin-hour">${it.hora}</span>
            <span class="itin-text">${it.actividad}</span>
        </div>
    `).join('');

    // Render Qué Incluye
    const incContainer = document.getElementById('modal-dest-incluye');
    incContainer.innerHTML = dest.incluye.map(inc => `<li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> ${inc}</li>`).join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSharedElementModal() {
    const modal = document.getElementById('destino-detail-modal');
    if (modal) modal.classList.remove('active');
    const catModal = document.getElementById('modal-catalogo-nacional');
    if (!catModal || !catModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

function closeDestinoDetailModal() {
    closeSharedElementModal();
}

function bookActiveDestinoPayment() {
    if (!activeDestino) return;
    const pkgName = activeDestino.nombre || 'Destino Nacional';
    let amount = 200;
    if (activeDestino.precio_texto) {
        const numMatch = activeDestino.precio_texto.replace(/,/g, '').match(/\d+/);
        if (numMatch && parseInt(numMatch[0]) > 200) {
            amount = parseInt(numMatch[0]);
        }
    }
    if (typeof openPaymentModal === 'function') {
        openPaymentModal(pkgName, amount);
    }
}

function openWhatsAppChoiceModal(name, state) {
    if (name) {
        activeDestino = activeDestino || {};
        activeDestino.nombre = name;
        if (state) activeDestino.estado = state;
    }
    sendWhatsAppDirect('alma');
}

function closeWhatsAppChoiceModal() {
    const modal = document.getElementById('whatsapp-choice-modal');
    if (modal) modal.classList.remove('active');
}

function sendWhatsAppDirect(target) {
    const dName = activeDestino ? (activeDestino.nombre || 'Destino Nacional') : 'Destino Nacional';
    const dState = activeDestino && activeDestino.estado ? ` (${activeDestino.estado})` : '';
    const dPrice = activeDestino && activeDestino.precio_texto ? ` [${activeDestino.precio_texto}]` : '';
    
    const msg = `Hola Alma, me interesa asegurar en Pre-venta el viaje a: *${dName}${dState}*${dPrice} saliendo desde San Manuel, Puebla. ¿Tienen disponibilidad y fechas programadas?`;

    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
    closeWhatsAppChoiceModal();
}

function bookActiveDestinoWhatsApp() {
    if (!activeDestino) return;
    const msg = `Hola Alma, me interesa asegurar mi asiento en Pre-venta para: *${activeDestino.nombre}* (${activeDestino.precio_texto || ''}). ¿Tienen disponibilidad para el próximo viaje saliendo de San Manuel?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}

function openWaDirectQuote(tourName, price) {
    const pText = price ? ` (${price})` : '';
    const msg = `Hola Alma, me interesa cotizar el paquete de viaje VIP: *${tourName}*${pText} vía Fraveo / La Ruta del Águila desde Puebla. ¿Podrías darme detalles de itinerario y próximas fechas de salida?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}
window.openWaDirectQuote = openWaDirectQuote;

function openRutaSatelital3D(id) { openSharedElementModal(id); }
function closeRutaSatelital3D() { closeAllModals(); }

/* =========================================================================
   4. ASISTENTE IA DE VIAJES: ALMA (LA RUTA DEL ÁGUILA)
   ========================================================================= */

let chatHistory = [];

function initChatAssistant() {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

function toggleAiChat(ev) {
    if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
    window._lastAiOpenTimestamp = Date.now();
    const win = document.getElementById('ai-chat-window');
    if (win) {
        win.style.zIndex = '10055';
        win.classList.toggle('active');
        if (win.classList.contains('active')) {
            const input = document.getElementById('ai-chat-input');
            if (input) input.focus();
        }
    }
}

function askChipPrompt(promptText) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.value = promptText;
        sendChatMessage();
    }
}

function normalizeSearchText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function findRelevantCatalogContext(userQuery) {
    const qNorm = normalizeSearchText(userQuery);
    const stopWords = new Set(['hola', 'como', 'para', 'quiero', 'cuanto', 'cuesta', 'tienen', 'viaje', 'viajes', 'salida', 'salidas', 'ir', 'ver', 'donde', 'que', 'cual', 'cuales', 'hay', 'puedo', 'hacer', 'visitar', 'comer', 'platillos', 'museos', 'boleto', 'boletos', 'precio', 'cotizar', 'desde', 'puebla', 'san', 'manuel', 'alma']);
    const tokens = qNorm.split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !stopWords.has(t));
    if (tokens.length === 0) return [];

    const lista = getCatalogo737List();
    const scored = [];

    for (const item of lista) {
        const nameNorm = normalizeSearchText(item.name);
        const stateNorm = normalizeSearchText(item.state);
        const descNorm = normalizeSearchText(item.desc);
        const attrNorm = normalizeSearchText(item.attractions);
        const gastNorm = normalizeSearchText(item.gastronomy);

        let score = 0;
        if (qNorm.includes(nameNorm) && nameNorm.length > 3) score += 25;
        for (const tk of tokens) {
            if (nameNorm.includes(tk)) score += 10;
            if (stateNorm.includes(tk)) score += 5;
            if (attrNorm.includes(tk)) score += 4;
            if (gastNorm.includes(tk)) score += 4;
            if (descNorm.includes(tk)) score += 2;
        }
        if (score > 0) {
            scored.push({ score, item });
        }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(s => ({
        name: s.item.name,
        state: s.item.state,
        category: s.item.sub || s.item.macro,
        price_ref: s.item.price_ref || '',
        attractions: s.item.attractions || '',
        gastronomy: s.item.gastronomy || '',
        crafts: s.item.crafts || '',
        festivities: s.item.festivities || '',
        desc: s.item.desc || ''
    }));
}

async function fetchLiveWebContextForChat(query) {
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*&srlimit=2`;
        const resp = await fetch(url);
        if (!resp.ok) return '';
        const data = await resp.json();
        const hits = (data && data.query && data.query.search) || [];
        if (hits.length === 0) return '';
        return hits.map(h => `${h.title}: ${String(h.snippet || '').replace(/<[^>]+>/g, '')}`).join(' | ');
    } catch (e) {
        return '';
    }
}

async function sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    appendChatMessage('user', msg);
    if (input) input.value = '';

    const typingId = showTypingIndicator();
    // RAG Multi-turno: combina último mensaje + últimos 2 mensajes del usuario para mantener contexto
    const recentUserContext = chatHistory.filter(h => h.role === 'user').slice(-2).map(h => h.content).join(' ');
    const matchedContext = findRelevantCatalogContext(`${msg} ${recentUserContext}`);

    if (window.__vromlixTelemetry) {
        window.__vromlixTelemetry.track('ai_chat_query', { query: msg, matches: matchedContext.length });
    }

    const augmentedHistory = chatHistory.slice(-6);
    if (matchedContext.length > 0) {
        const ragLines = matchedContext.map(item => {
            let line = `Destino/Evento: ${item.name} (${item.state} | ${item.category}). ${item.desc}`;
            if (item.attractions) line += ` | Lugares: ${item.attractions}.`;
            if (item.gastronomy) line += ` | Gastronomía: ${item.gastronomy}.`;
            if (item.price_ref) line += ` | Tarifa Ref.: ${item.price_ref}.`;
            return line;
        }).join(' || ');
        augmentedHistory.push({
            role: 'user',
            content: `[CONTEXTO DEL CATÁLOGO VIGENTE: ${ragLines}. RECUERDA: No inventes precios de hotel ni reveles códigos de cupón. Actúa como vendedor consultivo y emite [LEAD_CARD] cuando aplique.]`
        });
        augmentedHistory.push({
            role: 'assistant',
            content: 'Entendido, usaré estos datos reales para cotizar con claridad y generar la ficha lista para WhatsApp.'
        });
    } else if (msg.length > 4) {
        const lowerMsg = msg.toLowerCase();
        const isPoeticOrCurious = lowerMsg.includes('nube') || lowerMsg.includes('olor') || lowerMsg.includes('filosof') || lowerMsg.includes('sentido') || lowerMsg.includes('chiste') || lowerMsg.includes('broma') || lowerMsg.includes('vuelo') || lowerMsg.includes('cielo');
        if (!isPoeticOrCurious) {
            const liveWiki = await fetchLiveWebContextForChat(msg);
            if (liveWiki) {
                augmentedHistory.push({
                    role: 'user',
                    content: `[CONTEXTO WEB EN VIVO: ${liveWiki}. Si es un concierto o lugar vigente, ofrece transporte desde San Manuel o cotización a medida y califica pasajeros y fecha.]`
                });
                augmentedHistory.push({
                    role: 'assistant',
                    content: 'Entendido, responderé con este contexto actualizado y guiaré al cierre.'
                });
            }
        }
    }

    let apiData = null;
    if (window.AlmaAiWidget && typeof window.AlmaAiWidget.callAlmaChatWorker === 'function') {
        apiData = await window.AlmaAiWidget.callAlmaChatWorker({
            mode: 'viajes',
            message: msg,
            history: augmentedHistory,
            context_items: matchedContext
        });
    } else {
        const endpoints = ['/api/chat', 'https://mera-kirai.com/api/chat', 'https://alma-ai-assistant.mera-kirai-cloud.workers.dev'];
        for (const url of endpoints) {
            try {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'viajes', message: msg, history: augmentedHistory, context_items: matchedContext })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.reply) { apiData = data; break; }
                }
            } catch (err) {}
        }
    }

    removeTypingIndicator(typingId);
    const finalReply = (apiData && apiData.reply) ? apiData.reply : generateLocalAlmaResponse(msg, matchedContext);
    const extraCardHtml = (apiData && apiData.leadCard && window.AlmaAiWidget)
        ? window.AlmaAiWidget.renderAlmaLeadCardHtml(apiData.leadCard, apiData)
        : '';

    chatHistory.push({ role: 'user', content: msg });
    chatHistory.push({ role: 'assistant', content: finalReply });
    appendChatMessage('assistant', finalReply, extraCardHtml);
}

function formatChatMarkdown(text) {
    if (window.AlmaAiWidget && typeof window.AlmaAiWidget.formatAlmaMarkdown === 'function') {
        return window.AlmaAiWidget.formatAlmaMarkdown(text);
    }
    return String(text || '')
        .replace(/\[LEAD_CARD\][\s\S]*?(?:\[?\/LEAD_CARD\]|$)/gi, '')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function appendChatMessage(role, text, extraHtml = '') {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `ai-chat-bubble ${role}`;
    div.innerHTML = role === 'assistant'
        ? formatChatMarkdown(text) + extraHtml
        : escapeHtml(text).replace(/\n/g, '<br>');
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function showTypingIndicator() {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return null;
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-chat-bubble assistant typing';
    div.id = id;
    div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span> Consultando con Alma IA en la nube...`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

function generateLocalAlmaResponse(question, matchedContext = []) {
    const raw = (question || '').trim();
    const q = raw.toLowerCase();

    // 1. RECONOCIMIENTO MULTI-PREGUNTA / MULTI-INTENCIÓN (Hospedaje, Montos de Apartado, Horarios y Llegadas)
    const asksHospedaje = q.includes('hospedaje') || q.includes('hotel') || q.includes('dormir') || q.includes('quedarme') || q.includes('habitacion') || q.includes('habitación');
    const asksMasApartado = q.includes('dar mas') || q.includes('dar más') || q.includes('mas de apartado') || q.includes('más de apartado') || q.includes('liquidar') || q.includes('pagar completo') || q.includes('pagar todo') || q.includes('abonar') || q.includes('anticipo mayor');
    const asksHorariosLlegada = q.includes('tres de la tarde') || q.includes('3 de la tarde') || q.includes('3 pm') || q.includes('3:00') || q.includes('llegar tarde') || q.includes('llegar a las') || q.includes('punto de reunion') || q.includes('punto de reunión') || q.includes('hora de salida');
    const asksCancelacion = q.includes('si no voy') || q.includes('cancelar') || q.includes('cancelo') || q.includes('a la mera hora') || q.includes('devuelven el dinero') || q.includes('politica de cancelacion') || q.includes('no-show');

    if ((asksHospedaje ? 1 : 0) + (asksMasApartado ? 1 : 0) + (asksHorariosLlegada ? 1 : 0) >= 2) {
        let resp = `✨ ¡Hola! Con gusto resuelvo tus dudas punto por punto:\n\n`;
        let count = 1;
        if (asksHospedaje) {
            resp += `${count}. **¿Incluye hospedaje?**: Para nuestras salidas de 1 día o noche como **Xochimilco La Llorona** y **Conciertos CDMX**, no se requiere hospedaje porque son **viajes redondos el mismo día** (salimos en la tarde y regresamos a Puebla al terminar el evento). Para circuitos de varios días o destinos VIP fraVEO, el hotel sí está incluido.\n\n`;
            count++;
        }
        if (asksMasApartado) {
            resp += `${count}. **¿Puedes dar un anticipo mayor en Pre-venta?**: ¡Claro que sí! Los **$200 MXN** son únicamente el anticipo mínimo de Pre-venta por persona. Puedes abonar un monto mayor o liquidar desde el inicio si lo prefieres.\n\n`;
            count++;
        }
        if (asksHorariosLlegada) {
            resp += `${count}. **¿Puedes llegar a las 3:00 PM al punto de reunión?**: La salida oficial desde **Calle Río Nexapa #6101 en San Manuel** para excursiones vespertinas es puntual (con 15 minutos de tolerancia máxima). Te recomendamos llegar a tiempo para no perder el abordaje.\n\n`;
            count++;
        }
        resp += `¿Te gustaría asegurar tus asientos en Pre-venta para la próxima fecha disponible?`;
        return resp;
    }

    // 1.45. TOUR CONFIRMADO EN PREVENTA: ZACATLÁN & CHIGNAHUAPAN MÁGICO (PUEBLA)
    if (q.includes('zacatlan') || q.includes('zacatlán') || q.includes('chignahuapan') || q.includes('esfera') || q.includes('esferas') || q.includes('sidra') || q.includes('manzana')) {
        return `🍎✨ ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*. ¡Qué gran viaje!
Nuestro tour de temporada confirmado en Pre-venta es **Zacatlán & Chignahuapan Mágico** (Salidas Noviembre y Diciembre 2026):

🚌 **Logística & Salida:**
- Salida puntual: **07:00 AM** desde **Calle Río Nexapa #6101, Jardines de San Manuel, Puebla**.
- Transporte redondo en unidad ejecutiva climatizada, seguro de viajero a bordo y retorno a Puebla el mismo día (20:30 hrs aprox).

🏛️ **Itinerario & Experiencias Incluidas:**
1. **Chignahuapan:** Fábricas artesanales de esferas navideñas en vidrio soplado, opción de **Aguas Termales**, Basílica de la Inmaculada Concepción y quiosco mudéjar.
2. **Zacatlán de las Manzanas:** Reloj Floral monumental, Exconvento Franciscano, Mirador de Cristal en la Barranca de los Jilgueros y **degustación guiada de sidras artesanales**.

💰 **Inversión y Pre-venta:**
- **Tarifa:** Desde **$650 MXN** por persona (transporte redondo ejecutivo; acceso a Aguas Termales u opción de paquete completo aparte).
- **Entras en Pre-venta con solo $200 MXN** por asiento (vía Transferencia SPEI o en efectivo en OXXO / Elektra / Banco Azteca).
- El resto se liquida 48 a 24 horas antes del viaje.
- Si te realizaste servicios mayores en el *Estudio de Belleza Imagen y Estilo "Alma"*, recibes **10% de descuento directo** al confirmar con Alma.

¿Para cuántas personas te gustaría asegurar en Pre-venta o qué fin de semana prefieres?`;
    }

    // 1.5. PREGUNTAS POÉTICAS, CURIOSAS O INFORMALES (Nubes, sentido de la vida, etc.)
    if (q.includes('nube') || q.includes('nubes') || q.includes('olor a nube') || q.includes('olor de las nubes') || q.includes('filosof') || q.includes('sentido de la vida')) {
        return `☁️✨ ¡Huelen a aire puro, libertad y a ese primer respiro fresco cuando vas en carretera saliendo de la ciudad!\n\nEn *Ruta del Águila by Fraveo* nos fascina llevarte a donde el cielo se toca con las montañas (como Cuetzalan, Zacatlán de las Manzanas o Real del Monte). ¿Listo para escaparte a despejar la mente este fin de semana?`;
    }

    // 1.6. GRANDES EXPEDICIONES NACIONALES Y LUNA DE MIEL (El Chepe, Barrancas, Cancún, Los Cabos, fraVEO)
    if (q.includes('chepe') || q.includes('barrancas') || q.includes('luna de miel') || q.includes('cancun') || q.includes('cancún') || q.includes('cabos') || q.includes('riviera maya') || q.includes('huasteca potosina') || q.includes('avion') || q.includes('avión')) {
        return `✈️ ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\nPara grandes expediciones como **El Tren Chepe (Barrancas del Cobre)** o viajes de **Luna de Miel / Playa**, operamos en alianza oficial con **fraVEO** para armarte un **Paquete Integral a la Medida** (vuelos redondos, traslados ejecutivos, noches de hotel seleccionadas y boletos turísticos).\n\nTe preparamos tu **cotización formal desglosada en PDF en un lapso de 24 a 48 horas hábiles**:\n1. ¿Para cuántas personas y cuántos días sería el viaje?\n2. ¿En qué mes o fecha tentativa tienen planeado viajar?\n3. ¿Prefieres recibir la propuesta detallada por **WhatsApp** o por **correo electrónico**?`;
    }

    // 1.7. CONCIERTOS CDMX Y SODA STEREO (Kit Concierto: Botana + Agua + Gafete + Seguro)
    if (q.includes('soda stereo') || q.includes('soda estereo') || q.includes('cerati') || q.includes('pata de perro') || q.includes('kit concierto')) {
        return `🎸 ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\n¡Tenemos transporte ejecutivo redondo a conciertos en CDMX con la mejor experiencia de Puebla!\n\n🎁 **Todas nuestras salidas a conciertos incluyen el Kit Concierto Ejecutivo:**\n- **Snack Pack de cortesía:** Botana/galleta + Agua fría embotellada.\n- **Gafete Conmemorativo de Colección** del concierto.\n- **Seguro de Cobertura Amplia de Viajero a Bordo**.\n- **Chofer sobrio asignado** que te deja en la puerta del recinto y te espera hasta el final de la última canción.\n\n*Nota:* El transporte es independiente de la boletera (llevas tu boleto en la zona que tú elijas). Entras en Pre-venta con solo **$200 MXN**. ¿Aseguramos tus lugares?`;
    }

    // 2. ARTISTAS FALLECIDOS (José José, Juan Gabriel, Jenni Rivera, etc.)
    if (q.includes('jose jose') || q.includes('josé josé') || q.includes('juan gabriel') || q.includes('jenni rivera') || q.includes('valentin elizalde') || q.includes('joan sebastian')) {
        return `🕊️ ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\nLamentablemente ese gran artista ya falleció, por lo que no existen conciertos en vivo suyos. Sin embargo, cuando se presentan **homenajes sinfónicos oficiales o tributos en CDMX** (en recintos como el Auditorio Nacional, Bellas Artes o Teatro Metropólitan), organizamos **transporte ejecutivo redondo desde San Manuel, Puebla** desde **$549 MXN**.\n\n¿Te gustaría que te avise cuando haya un concierto sinfónico u homenaje en CDMX?`;
    }

    // 3. SHOWS INFANTILES Y FAMILIARES (Tatiana, Bely y Beto, Luli Pampín)
    if (q.includes('tatiana') || q.includes('bely') || q.includes('luli pampin') || q.includes('infantil') || q.includes('niños')) {
        return `🎠 ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\n¡Claro que sí! Para los shows familiares e infantiles en **Arena CDMX, Auditorio Nacional o Teatro Metropólitan**, organizamos salidas ejecutivas seguras desde San Manuel, Puebla (transporte redondo desde **$549 a $750 MXN** por persona según recinto, con seguro de viajero y espera al terminar la función, o bien en **modalidad privada familiar**).\n\nRecuerda que aseguras en Pre-venta con solo **$200 MXN**. ¿Para qué fecha o cuántos lugares familiares te gustaría cotizar?`;
    }

    if (q.includes('veronica castro') || q.includes('verónica castro')) {
        return `🎭 ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\nActualmente **Verónica Castro** no tiene presentaciones de teatro ni conciertos confirmados en la cartelera oficial de CDMX (se encuentra retirada temporalmente de los escenarios y giras).\n\nSin embargo, en cuanto se anuncie cualquier obra, homenaje o gala en recintos de CDMX, contaremos con **salida ejecutiva redonda** desde San Manuel, Puebla.\n¿Te gustaría consultar por alguna otra obra de teatro o concierto en CDMX?`;
    }

    if (q.includes('luis miguel') || q.includes('luismiguel') || q.includes('el sol')) {
        return `☀️ ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\nActualmente en la cartelera oficial de recintos CDMX (Arena CDMX, Estadio GNP, Auditorio Nacional) no hay fechas próximas confirmadas para Luis Miguel (sus fechas recientes ya concluyeron).\n\nEn cuanto se anuncie una nueva fecha, organizaremos **transporte ejecutivo redondo** desde San Manuel, Puebla (desde **$549 MXN**). ¿Te gustaría que te registremos en la lista prioritaria por WhatsApp?`;
    }

    if (q.includes('shakira') || q.includes('chayanne') || q.includes('temerarios') || q.includes('morat') || q.includes('zayn') || q.includes('weeknd')) {
        return `🎶 ¡Hola! Soy **Alma**. Para los grandes conciertos en el **Estadio GNP Seguros**, **Arena CDMX**, **Palacio de los Deportes** o **Auditorio Nacional** (transporte redondo desde **$549 – $750 MXN** según recinto):\n- Salida ejecutiva directa desde Calle Río Nexapa #6101, San Manuel, Puebla.\n- Te dejamos en el recinto y nuestra unidad te espera al terminar para que regreses seguro la misma noche.\n- Entras en Pre-venta con solo **$200 MXN** (y aplicas 10% de descuento preferencial con tu bono del Estudio de Belleza Alma). ¿Para qué artista o fecha deseas Pre-venta?`;
    }

    if (q.includes('hospital') || q.includes('medica') || q.includes('médica') || q.includes('doctor') || q.includes('nutricion') || q.includes('nutrición') || q.includes('compras') || q.includes('particular') || q.includes('privado') || q.includes('aeropuerto') || q.includes('aifa') || q.includes('aicm') || q.includes('visa') || q.includes('embajada')) {
        return `🚗 ¡Hola! Soy **Alma**. Contamos con **Servicio de Transporte Privado y Puerta a Puerta**:\n- **Vehículo a tu medida**: Auto sedán ejecutivo (1 a 3 personas) o camioneta ejecutiva para grupos.\n- **Servicios frecuentes**: Citas médicas en CDMX (Nutrición, Médica Sur, ABC), compras de mayoreo, trámites de visa/embajada y traslados a aeropuertos (AICM/AIFA).\n¿Qué fecha y destino particular requieres cotizar?`;
    }

    if (asksCancelacion) {
        return `🛡️ ¡Hola! Soy **Alma**. Nuestras **Políticas de Pre-venta y Cancelación** son 100% transparentes:\n1. **Reembolso 100% Garantizado**: Si un viaje grupal no reúne el cupo mínimo 48 horas antes, se te devuelve el **100% íntegro de tu dinero de inmediato**.\n2. **Cancelación de última hora (<48h) o No-Show**: No aplica reembolso porque tu asiento ya fue comprometido operativamente, pero **tu boleto es 100% transferible sin costo** a cualquier familiar o amigo, y el viaje nunca se cancela para los pasajeros puntuales.\nPuedes consultar todos los detalles en nuestra página de [Términos y Condiciones](terminos.html).`;
    }

    if (q.includes('xochimilco') || q.includes('llorona') || q.includes('trajinera') || q.includes('muertos')) {
        return `🎭 ¡Hola! Soy **Alma**. Nuestra temporada 2026 de *La Llorona en Xochimilco* ya concluyó, pero puedes cotizar con nosotros **salidas culturales y recorridos en trajinera por Xochimilco** o viajes grupales a medida desde San Manuel, Puebla:\n- **Solo Transporte Redondo:** **Desde $650 MXN**.\n- **Pre-venta desde $200 MXN** por persona (100% reembolsable si no se reúne cupo mínimo). ¿Para cuántas personas y qué fecha te gustaría cotizar?`;
    }

    if (q.includes('expo') || q.includes('beauty') || q.includes('ebs') || q.includes('citibanamex')) {
        return `💄 ¡Hola! Soy **Alma**. Para próximas exposiciones profesionales y convenciones en **Centro Banamex / Citibanamex** o **WTC CDMX**, organizamos **transporte redondo ejecutivo desde $700 MXN** saliendo de San Manuel, Puebla.\n- Entras en Pre-venta con **$200 MXN** por persona o cotizamos unidad privada para tu salón/equipo.\n¿Para qué expo y cuántas personas deseas cotizar?`;
    }

    if (q.includes('acapulco')) {
        return `🎆🌊 ¡Hola! Soy **Alma IA** de *Ruta del Águila by Fraveo*.\nPara **Acapulco Fin de Año (Gala de Pirotecnia — 31 de Diciembre)** estamos organizando salida en **autobús turístico (40–45 pax)** o **camioneta ejecutiva (12–15 pax)** desde San Manuel, Puebla.\n- *Importante:* La tarifa referencial base de fin de semana solo transporte parte desde **$980 MXN**; para Fin de Año (Solo Transporte o Paquete con Hotel 2–3 noches), Alma cotiza la tarifa exacta según noches, tipo de habitación y cantidad de personas.\n\n¿Para cuántas personas sería y prefieres solo transporte o paquete con hotel?`;
    }

    if (q.includes('estetica') || q.includes('estética') || q.includes('salon') || q.includes('salón') || q.includes('cupon') || q.includes('cupón') || q.includes('descuento') || q.includes('corte') || q.includes('tinte') || q.includes('alisado') || q.includes('nanoplastia') || q.includes('botox') || q.includes('pestañas') || q.includes('novia') || q.includes('xv') || q.includes('lendan')) {
        return `🌸 ¡Hola! Soy **Alma IA** de **Estudio de Belleza Imagen y Estilo "Alma"** (más de 30 años nos respaldan en Río Nexapa #6101, San Manuel).\n\n✨ **Promociones Vigentes al 30 de Noviembre:**\n- **Efectos de Color:** 10% de descuento\n- **Limpieza facial profunda con aparatología + laminado de ceja:** $500 MXN\n- **Corte para dama + ampolleta:** $250 MXN\n- **Paquete XV Años:** $4,000 MXN (con prueba) / $3,000 MXN (sin prueba)\n- **Cortes sin costo (alumna supervisada por Alma):** Lun, Mié y Vie de 4:00 a 5:00 PM *(incluye corte únicamente, sin lavado ni tinte)*.\n- 🎁 **10% de Descuento en Viajes:** Beneficio que Alma entrega presencialmente en el salón al realizarte servicios participantes. ¿Qué servicio te gustaría agendar?`;
    }

    // 4. SI HAY COINCIDENCIA EN LA BASE DE DATOS DE 908 DESTINOS Y EVENTOS (MUSEOS, GASTRONOMÍA Y TARIFAS)
    if (Array.isArray(matchedContext) && matchedContext.length > 0) {
        const top = matchedContext[0];
        let detail = `🦅 ¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo*.\nSobre **${top.name}** (${top.state}):\n- ${top.desc}\n`;
        if (top.attractions) detail += `- 🏛️ **Lugares y museos por visitar:** ${top.attractions}.\n`;
        if (top.gastronomy) detail += `- 🍽️ **Platillos típicos imperdibles:** ${top.gastronomy}.\n`;
        if (top.price_ref) detail += `- 💰 **Tarifa estimada:** ${top.price_ref}.\n`;
        detail += `\nRecuerda que entras en Pre-venta con solo **$200 MXN** y liquidas 48-24h antes de salir. ¿Para cuántas personas y en qué fecha te gustaría viajar?`;
        return detail;
    }

    return `🦅 ¡Hola! Soy **Alma**, tu asesora en *Ruta del Águila by Fraveo* (San Manuel, Puebla).\nRespecto a tu consulta sobre **"${escapeHtml(raw)}"**, podemos organizarlo tanto en **salida grupal programada** (con mínimo 12 interesados de nuestro catálogo de **908 destinos de México y eventos CDMX**) como en **traslado privado a tu medida**.\n\nRecuerda que entras en Pre-venta en cualquier viaje con solo **$200 MXN** y liquidas 48-24h antes de salir. ¿En qué fecha aproximada y para cuántas personas te gustaría viajar?`;
}

/* =========================================================================
   5. BÚSQUEDA GLOBAL RÁPIDA (FILTRADO EN VIVO)
   ========================================================================= */

function handleLiveGlobalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('btn-clear-search');
    const dropdown = document.getElementById('live-search-results-dropdown');
    if (clearBtn) clearBtn.style.display = q ? 'inline-block' : 'none';

    if (!dropdown) return;

    if (!q) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    const todayIso = typeof getLocalTodayIso === 'function' ? getLocalTodayIso() : new Date().toISOString().split('T')[0];
    const matches = [];
    const seenSearch = new Set();
    if (typeof DESTINOS_DB !== 'undefined') {
        DESTINOS_DB.forEach(d => {
            if (d.fecha_iso && d.fecha_iso < todayIso) return;
            if (d.nombre.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q) || d.estado.toLowerCase().includes(q) || d.categoria.toLowerCase().includes(q)) {
                seenSearch.add(d.id);
                matches.push({
                    id: d.id,
                    source: 'dest',
                    nombre: d.nombre,
                    imagen: d.imagen,
                    precio: d.precio_texto,
                    badge: d.badge,
                    meta: `${d.estado} • ${d.duracion}`
                });
            }
        });
    }
    if (typeof collectActiveConcerts === 'function') {
        collectActiveConcerts(todayIso).forEach(ev => {
            if (seenSearch.has(ev.id)) return;
            if (`${ev.title} ${ev.desc} ${ev.attractions}`.toLowerCase().includes(q)) {
                const vis = resolveConcertVisual(ev);
                matches.push({
                    id: ev.id,
                    source: ev.source,
                    nombre: ev.title,
                    imagen: vis.img,
                    precio: `Desde $${estimateConcertTransportPrice(ev)} MXN`,
                    badge: ev.dateLabel,
                    meta: `Ciudad de México • ${vis.badge}`
                });
            }
        });
    }

    if (matches.length === 0) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = `
            <div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">
                <i class="fas fa-search" style="font-size:1.5rem; margin-bottom:8px; display:block; color:var(--brand-cyan);"></i>
                No se encontraron salidas directas para "<strong>${escapeHtml(q)}</strong>".<br>
                <button onclick="bookCustomSearchWhatsApp('${escapeHtml(q)}')" style="margin-top:10px; background:#25d366; color:#000; border:none; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer;">
                    <i class="fab fa-whatsapp"></i> Preguntar a Alma por esta salida
                </button>
            </div>
        `;
        return;
    }

    dropdown.style.display = 'block';
    dropdown.innerHTML = `
        <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; padding:6px 12px 10px; letter-spacing:0.5px;">
            Encontramos ${matches.length} salidas disponibles:
        </div>
        ${matches.slice(0, 6).map(m => `
            <div class="live-search-item" onclick="${m.source === 'catalog' ? `openCatalogDetailModal('${m.id}')` : `openSharedElementModal('${m.id}')`}; clearLiveGlobalSearch();">
                <img src="${m.imagen}" alt="${m.nombre}" style="width:48px; height:48px; border-radius:10px; object-fit:cover; flex-shrink:0;">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.92rem; color:var(--text-title); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.nombre}</strong>
                        <span style="font-weight:800; color:var(--brand-red); font-size:0.9rem; flex-shrink:0;">${m.precio}</span>
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${m.meta} • <span style="color:var(--brand-cyan); font-weight:700;">${m.badge}</span></div>
                </div>
            </div>
        `).join('')}
    `;
}

function clearLiveGlobalSearch() {
    const input = document.getElementById('main-live-search');
    const dropdown = document.getElementById('live-search-results-dropdown');
    if (input) input.value = '';
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    }
    const clearBtn = document.getElementById('btn-clear-search');
    if (clearBtn) clearBtn.style.display = 'none';
}

function focusMainSearch() {
    const input = document.getElementById('main-live-search');
    if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => input.focus(), 350);
    }
}

function bookCustomSearchWhatsApp(term) {
    const msg = `Hola Alma, estoy buscando informes sobre la salida a: *${term}* desde San Manuel, Puebla. ¿Tienen fechas disponibles?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* --- TECLA ESCAPE Y CLIC AFUERA PARA CERRAR MODALES Y CHAT --- */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeAllModals();
    }
});

// Cerrar chat, modales y buscador en vivo al hacer clic afuera (sin borrar la conversación)
document.addEventListener('click', (e) => {
    const aiWin = document.getElementById('ai-chat-window');
    const aiOrb = document.querySelector('.ai-orb-trigger');
    const navAiBtn = document.querySelector('.btn-nav-ai');

    if (aiWin && aiWin.classList.contains('active')) {
        const isTriggerBtn = e.target && e.target.closest && e.target.closest('[onclick*="quoteWithAI"], [onclick*="toggleAiChat"], .btn-cotizar-ai, .ai-orb-trigger, .btn-nav-ai');
        const justOpened = (Date.now() - (window._lastAiOpenTimestamp || 0)) < 450;
        if (!justOpened && !isTriggerBtn && !aiWin.contains(e.target) && (!aiOrb || !aiOrb.contains(e.target)) && (!navAiBtn || !navAiBtn.contains(e.target))) {
            aiWin.classList.remove('active');
        }
    }

    // Cerrar cualquier modal backdrop si se hace clic directamente en el fondo oscuro
    if (e.target && (e.target.classList.contains('lux-modal-backdrop') || e.target.classList.contains('modal-overlay'))) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }

    const dropdown = document.getElementById('live-search-results-dropdown');
    const searchInput = document.getElementById('main-live-search');
    if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && e.target !== searchInput) {
            dropdown.style.display = 'none';
        }
    }
});

function closeAllModals() {
    const dropdown = document.getElementById('live-search-results-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    document.querySelectorAll('.lux-modal-backdrop, .modal-overlay').forEach(m => {
        m.classList.remove('active');
    });

    const aiWin = document.getElementById('ai-chat-window');
    if (aiWin) aiWin.classList.remove('active');

    document.body.style.overflow = '';
}

/* =========================================================================
   6. MODAL GRAN CATÁLOGO MAESTRO (1,000 DESTINOS, EVENTOS CDMX Y RUTAS)
   ========================================================================= */

let catalogoMacroFilter = 'todos';
let catalogoSubFilter = 'todas';
let catalogoStateFilter = 'todos';
let catalogoCurrentPage = 1;
const CATALOGO_PAGE_SIZE = 24;

function resetCatalogoPage() {
    catalogoCurrentPage = 1;
}

function loadMoreCatalogoItems() {
    catalogoCurrentPage++;
    renderCatalogoNacionalGrid();
}

const MACRO_LABELS = {
    'pueblo_magico': '🏔️ Pueblo Mágico',
    'barrio_magico': '🎨 Barrio Mágico',
    'ruta_turistica': '🛣️ Ruta Turística',
    'experiencia_comunitaria': '🌿 Experiencia Comunitaria',
    'patrimonio_unesco': '🏛️ Patrimonio UNESCO',
    'paquete_armado': '🚐 Paquete Confirmado',
    'vip_internacional': '👑 Destino VIP fraVEO',
    'evento_cdmx': '🎟️ Evento CDMX'
};

function getCatalogo737List() {
    if (Array.isArray(window.MASTER_CATALOG_1000) && window.MASTER_CATALOG_1000.length > 0) {
        return window.MASTER_CATALOG_1000;
    }
    if (Array.isArray(window.SECTUR_737_CATALOG) && window.SECTUR_737_CATALOG.length > 0) {
        return window.SECTUR_737_CATALOG;
    }
    return [];
}

function openCatalogoNacionalModal(initialMacro) {
    const modal = document.getElementById('modal-catalogo-nacional');
    if (!modal) return;
    if (initialMacro) {
        catalogoMacroFilter = initialMacro;
        catalogoSubFilter = 'todas';
    }
    resetCatalogoPage();
    populateCatalogoStatesDropdown();
    renderCatalogoSubPills();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCatalogoNacionalGrid();
}

function closeCatalogoNacionalModal() {
    const modal = document.getElementById('modal-catalogo-nacional');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function populateCatalogoStatesDropdown() {
    const sel = document.getElementById('catalogo-state-select');
    if (!sel || sel.options.length > 1) return;
    const lista = getCatalogo737List();
    const states = new Set();
    lista.forEach(item => {
        if (item.state && !item.state.includes(',')) {
            states.add(item.state.trim());
        }
    });
    Array.from(states).sort().forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = `📍 ${st}`;
        sel.appendChild(opt);
    });
}

function filterCatalogoCat(macro, btn) {
    catalogoMacroFilter = macro;
    catalogoSubFilter = 'todas';
    resetCatalogoPage();
    document.querySelectorAll('.catalogo-macro-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderCatalogoSubPills();
    renderCatalogoNacionalGrid();
}

function filterCatalogoSub(sub, btn) {
    if (catalogoSubFilter === sub) {
        catalogoSubFilter = 'todas';
    } else {
        catalogoSubFilter = sub;
    }
    resetCatalogoPage();
    renderCatalogoSubPills();
    renderCatalogoNacionalGrid();
}

function filterCatalogoState(stateVal) {
    catalogoStateFilter = stateVal || 'todos';
    resetCatalogoPage();
    renderCatalogoNacionalGrid();
}

function renderCatalogoSubPills() {
    const subBar = document.getElementById('catalogo-sub-pills');
    if (!subBar) return;
    if (catalogoMacroFilter === 'todos') {
        subBar.style.display = 'none';
        subBar.innerHTML = '';
        return;
    }
    subBar.style.display = 'flex';
    const lista = getCatalogo737List();
    const base = lista.filter(x => x.macro === catalogoMacroFilter);

    const counts = {};
    base.forEach(x => {
        const s = x.sub || 'General';
        counts[s] = (counts[s] || 0) + 1;
    });

    const subs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    let html = `<button class="catalogo-filter-pill ${catalogoSubFilter === 'todas' ? 'active' : ''}" onclick="filterCatalogoSub('todas', this)">Todas (${base.length})</button>`;

    subs.forEach(([subName, cnt]) => {
        const isAct = catalogoSubFilter === subName;
        const safeSub = subName.replace(/'/g, "\\'");
        html += `<button class="catalogo-filter-pill ${isAct ? 'active' : ''}" onclick="filterCatalogoSub('${safeSub}', this)">${escapeHtml(subName)} (${cnt})</button>`;
    });

    subBar.innerHTML = html;
}

function voteCatalogoItem(itemId, itemName, itemState, btnEl) {
    const key = 'kuul_votes_' + itemId;
    let current = parseInt(localStorage.getItem(key) || '4', 10);
    current += 1;
    localStorage.setItem(key, String(current));
    if (btnEl) {
        btnEl.innerHTML = `❤️ ${current}/12 Interesados`;
        btnEl.style.background = 'rgba(244,63,94,0.22)';
        btnEl.style.borderColor = '#fb7185';
        btnEl.style.color = '#fda4af';
    }
    if (window.__vromlixTelemetry) {
        window.__vromlixTelemetry.track('vote_catalogo_nacional', { id: itemId, name: itemName, state: itemState, votes: current });
    }
}

function buildAlmaContextualQuoteGreeting(nombre, estado) {
    const list = typeof getCatalogo737List === 'function' ? getCatalogo737List() : [];
    const item = list.find(d => d.name.toLowerCase() === (nombre || '').toLowerCase()) ||
                 list.find(d => d.name.toLowerCase().includes((nombre || '').toLowerCase()));

    let highlight = '';
    const nLow = (nombre || '').toLowerCase();
    const sLow = (estado || '').toLowerCase();

    if (nLow.includes('acapulco') || sLow.includes('guerrero') || nLow.includes('cancun') || nLow.includes('playa') || (item && item.macro === 'playa_caribe')) {
        highlight = ', ¡un destino soñado por sus hermosas playas, atardeceres y deliciosa comida costeña! 🌊🍤';
    } else if ((item && (item.macro === 'cdmx_evento' || item.macro === 'cartelera_cdmx')) || nLow.includes('concierto') || nLow.includes('arena') || nLow.includes('estadio')) {
        highlight = '. ¡Te llevamos en salida ejecutiva directa desde San Manuel con chofer sobrio que te espera hasta el final del evento! 🎶🚐';
    } else if (item && (item.macro === 'pueblo_magico' || item.macro === 'barrio_magico')) {
        const dish = item.gastronomy ? ` y saborear delicias locales como ${item.gastronomy.split(',')[0]}` : '';
        highlight = `, un lugar con magia colonial, arquitectura hermosa${dish}. 🏔️☕`;
    } else if (item && (item.macro === 'ruta_turistica' || item.macro === 'experiencia_comunitaria')) {
        highlight = ', una ruta panorámica fascinante para disfrutar de paisajes, aventura y aire libre. 🌿🛣️';
    } else if (item && item.macro === 'vip_internacional') {
        highlight = ', una expedición de ensueño que coordinamos con vuelos, hoteles de lujo y traslados ejecutivos fraVEO. ✈️👑';
    } else {
        highlight = ', un destino excelente para viajar con toda la tranquilidad y comodidad desde San Manuel, Puebla.';
    }

    return `¡Hola! Soy **Alma** de *Ruta del Águila by Fraveo* 🦅.\nVeo que te interesa viajar a **${nombre} (${estado})**${highlight}\n\n¿Te gustaría visitarlo pronto? Cuéntame: ¿para cuántas personas sería el viaje y aproximadamente en qué fecha o cuántos días tienes pensado viajar?`;
}

function quoteWithAI(nombre, estado, ev) {
    if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
    else if (window.event && typeof window.event.stopPropagation === 'function') window.event.stopPropagation();
    window._lastAiOpenTimestamp = Date.now();

    const win = document.getElementById('ai-chat-window');
    if (win) {
        win.style.zIndex = '10055';
        win.classList.add('active');
    }
    const greeting = buildAlmaContextualQuoteGreeting(nombre, estado);
    appendChatMessage('assistant', greeting);

    const chipsContainer = document.querySelector('.ai-chat-chips');
    if (chipsContainer) {
        const safeN = escapeHtml(nombre).replace(/'/g, "\\'");
        const safeS = escapeHtml(estado).replace(/'/g, "\\'");
        chipsContainer.innerHTML = `
            <span class="ai-chip" onclick="askChipPrompt('Somos 2 personas para cotizar salida a ${safeN}')">👥 2 Personas</span>
            <span class="ai-chip" onclick="askChipPrompt('Somos una familia de 4 a 6 personas para ${safeN}')">👨‍👩‍👧‍👦 Familia (4-6)</span>
            <span class="ai-chip" onclick="askChipPrompt('Queremos viajar el próximo fin de semana a ${safeN}')">🗓️ Fin de Semana</span>
            <span class="ai-chip" onclick="openWhatsAppChoiceModal('${safeN}', '${safeS}')">📱 WhatsApp</span>
        `;
    }

    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.placeholder = `Responde a Alma: ¿cuántas personas o fechas para ${nombre}?`;
        setTimeout(() => input.focus(), 80);
    }
}

function renderCatalogoNacionalGrid() {
    const container = document.getElementById('catalogo-grid-container');
    const searchInput = document.getElementById('catalogo-modal-search');
    if (!container) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const lista = getCatalogo737List();
    const todayIso = typeof getLocalTodayIso === 'function' ? getLocalTodayIso() : new Date().toISOString().split('T')[0];
    const popularMap = window.__vromlixPopularViews || {};

    const filtrados = lista.filter(item => {
        if (item.macro === 'evento_cdmx') {
            const rawDates = `${item.attractions || ''} ${item.desc || ''}`.match(/\b(202[6-9]-\d{2}-\d{2})\b/g) || [];
            if (rawDates.length && rawDates.slice().sort().pop() < todayIso) return false;
        }
        const matchMacro = catalogoMacroFilter === 'todos' || item.macro === catalogoMacroFilter;
        const matchSub = catalogoSubFilter === 'todas' || item.sub === catalogoSubFilter;
        const matchState = catalogoStateFilter === 'todos' || (item.state && item.state.toLowerCase().includes(catalogoStateFilter.toLowerCase()));
        const matchTxt = !query ||
            item.name.toLowerCase().includes(query) ||
            item.state.toLowerCase().includes(query) ||
            item.sub.toLowerCase().includes(query) ||
            (item.desc && item.desc.toLowerCase().includes(query)) ||
            (item.attractions && item.attractions.toLowerCase().includes(query)) ||
            (item.gastronomy && item.gastronomy.toLowerCase().includes(query));
        return matchMacro && matchSub && matchState && matchTxt;
    });

    filtrados.sort((a, b) => Number(popularMap[b.id] || 0) - Number(popularMap[a.id] || 0));

    const visibleItems = filtrados.slice(0, catalogoCurrentPage * CATALOGO_PAGE_SIZE);

    const countLabel = document.getElementById('catalogo-count-label');
    if (countLabel) {
        countLabel.innerHTML = `Mostrando <strong>${visibleItems.length}</strong> de <strong>${filtrados.length}</strong> opciones disponibles (Base Maestra de ${lista.length} destinos y eventos)`;
    }

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
                <i class="fas fa-search" style="font-size:2rem; margin-bottom:1rem; display:block;"></i>
                <p>No se encontraron opciones que coincidan con tu filtro.</p>
            </div>
        `;
        return;
    }

    let cardsHtml = visibleItems.map(d => {
        const safeName = escapeHtml(d.name).replace(/'/g, "\\'");
        const safeState = escapeHtml(d.state).replace(/'/g, "\\'");
        const safeId = escapeHtml(String(d.id || d.name)).replace(/'/g, "\\'");
        const shortDesc = d.desc ? (d.desc.length > 95 ? d.desc.substring(0, 95) + '...' : d.desc) : 'Destino turístico con salida desde Puebla.';

        return `
        <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:16px; padding:1.35rem; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:0.55rem; flex-wrap:wrap;">
                    <span style="font-size:0.78rem; font-weight:800; background:rgba(22,163,74,0.14); color:var(--brand-green); padding:4px 10px; border-radius:12px;">📍 ${escapeHtml(d.state)}</span>
                    <span style="font-size:0.76rem; color:var(--brand-cyan); font-weight:700;">${MACRO_LABELS[d.macro] || d.macro}</span>
                </div>
                <div style="font-size:0.75rem; color:var(--brand-gold); font-weight:700; text-transform:uppercase; margin-bottom:0.35rem; letter-spacing:0.3px;">${escapeHtml(d.sub)}</div>
                <h4 style="font-family:'Outfit'; font-size:1.18rem; font-weight:800; color:var(--text-title); margin-bottom:0.5rem; line-height:1.38;">${escapeHtml(d.name)}</h4>
                <p style="font-size:0.93rem; color:var(--text-muted); line-height:1.65; margin-bottom:0.85rem;">${escapeHtml(shortDesc)}</p>
                ${d.price_ref ? `<div style="font-size:0.84rem; font-weight:700; color:var(--brand-green); margin-bottom:0.9rem; line-height:1.45;"><i class="fas fa-tag"></i> ${escapeHtml(d.price_ref)}</div>` : ''}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding-top:0.8rem; border-top:1px solid var(--border-color);">
                <button type="button" onclick="openCatalogDetailModal('${safeId}')" style="background:var(--bg-card); color:var(--text-title); border:1px solid var(--border-color); padding:10px 10px; border-radius:10px; font-weight:700; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;" title="Ver detalles completos con museos, platillos y amenidades">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
                <button type="button" class="btn-cotizar-ai" onclick="quoteWithAI('${safeName}', '${safeState}', event)" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; border:none; padding:10px 10px; border-radius:10px; font-weight:700; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;" title="Cotizar salida ejecutiva con Alma">
                    <i class="fas fa-wand-magic-sparkles"></i> Cotizar
                </button>
            </div>
        </div>`;
    }).join('');

    if (filtrados.length > visibleItems.length) {
        cardsHtml += `
            <div style="grid-column: 1 / -1; text-align:center; padding:1.5rem 0 1rem;">
                <button type="button" onclick="loadMoreCatalogoItems()" class="btn-search-main" style="width:auto; padding:11px 26px; background:linear-gradient(135deg, #0284c7, #0369a1); font-size:0.9rem; border-radius:30px; box-shadow:0 4px 15px rgba(2, 132, 199, 0.35); cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> Cargar más opciones (+24) — Mostrando ${visibleItems.length} de ${filtrados.length}
                </button>
            </div>
        `;
    }

    container.innerHTML = cardsHtml;
}

function openCatalogDetailModal(itemId) {
    const list = getCatalogo737List();
    const item = list.find(d => String(d.id) === String(itemId)) || list.find(d => d.name.toLowerCase() === String(itemId).toLowerCase());
    if (!item) return;

    if (typeof recordCatalogView === 'function') {
        recordCatalogView(item.id || item.name, 'view_item');
    }

    // Check if it's already in DESTINOS_DB (curated trips with pre-configured itinerary)
    if (typeof DESTINOS_DB !== 'undefined') {
        const destExisting = DESTINOS_DB.find(d => d.id === item.id || d.nombre.toLowerCase().includes(item.name.toLowerCase()));
        if (destExisting) {
            openSharedElementModal(destExisting.id);
            return;
        }
    }

    const modal = document.getElementById('destino-detail-modal');
    if (!modal) return;

    // Rich fallback images based on category/state
    let fallbackImg = 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80';
    if (item.macro === 'cdmx_evento' || item.macro === 'cartelera_cdmx' || item.macro === 'evento_cdmx') {
        fallbackImg = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80';
    } else if (item.macro === 'playa_caribe' || (item.state && (item.state.includes('Quintana') || item.state.includes('Baja California') || item.state.includes('Guerrero')))) {
        fallbackImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
    } else if (item.macro === 'vip_internacional') {
        fallbackImg = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
    } else if (item.macro === 'bosque_montana' || item.macro === 'pueblo_magico') {
        fallbackImg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    }

    document.getElementById('modal-dest-img').src = item.imagen || fallbackImg;
    document.getElementById('modal-dest-badge').innerText = item.sub || (MACRO_LABELS[item.macro] || 'Destino de México');
    document.getElementById('modal-dest-title').innerText = item.name;
    document.getElementById('modal-dest-meta').innerHTML = `📍 ${item.state} | ☀️ Clima: ${item.climate || 'Templado'} | 🚐 Saliendo de San Manuel, Puebla`;
    document.getElementById('modal-dest-desc').innerText = item.desc;
    document.getElementById('modal-dest-price').innerText = item.price_ref || 'Cotización a tu medida (Pre-venta $200)';

    // Rich Attractions & Gastronomy into Itinerary container
    const itinContainer = document.getElementById('modal-dest-itinerario');
    itinContainer.innerHTML = `
        <div class="itin-item" style="margin-bottom:0.8rem;">
            <span class="itin-hour" style="color:var(--brand-cyan);"><i class="fas fa-landmark"></i> Lugares & Museos</span>
            <span class="itin-text" style="color:var(--text-body);">${escapeHtml(item.attractions || 'Centro histórico, plazas tradicionales y miradores paisajísticos.')}</span>
        </div>
        <div class="itin-item" style="margin-bottom:0.8rem;">
            <span class="itin-hour" style="color:var(--brand-gold);"><i class="fas fa-utensils"></i> Gastronomía Típica</span>
            <span class="itin-text" style="color:var(--text-body);">${escapeHtml(item.gastronomy || 'Platillos tradicionales, antojitos y sabores de la región.')}</span>
        </div>
        ${item.festivities ? `
        <div class="itin-item">
            <span class="itin-hour" style="color:var(--brand-red);"><i class="fas fa-calendar-star"></i> Festividades</span>
            <span class="itin-text" style="color:var(--text-body);">${escapeHtml(item.festivities)}</span>
        </div>` : ''}
    `;

    // Qué Incluye
    const incContainer = document.getElementById('modal-dest-incluye');
    incContainer.innerHTML = `
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Transporte ejecutivo redondo saliendo de Jardines de San Manuel, Puebla</li>
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Chofer sobrio profesional y combustible incluido</li>
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Seguro de cobertura amplia de viajero a bordo</li>
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Pre-venta garantizada con solo $200 MXN por persona</li>
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Atención directa y personalizada con Alma (WhatsApp 222 801 6244)</li>
    `;

    activeDestino = {
        nombre: item.name,
        precio_texto: item.price_ref || 'Cotización personalizada',
        estado: item.state
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function bookDirectWhatsAppDestino(nombre, estado) {
    const msg = `Hola Alma, me interesa cotizar una salida (grupal o privada) para: *${nombre}* (${estado}) saliendo desde San Manuel, Puebla. ¿Me das informes?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}

/* =========================================================================
   7. MOTOR SWIPER 3D COVERFLOW (TARJETA CENTRAL AL FRENTE + SOMBRA DE PISO)
   ========================================================================= */

function updateTrack3DState(track) {
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.slider-card')).filter(c => c.style.display !== 'none');
    if (cards.length === 0) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let closestIdx = 0;
    let minDiff = Infinity;

    cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const diff = Math.abs(cardCenter - trackCenter);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
        }
    });

    cards.forEach((card, idx) => {
        card.classList.remove('is-center-3d', 'is-side-3d-left', 'is-side-3d-right', 'is-far-3d');
        if (idx === closestIdx) {
            card.classList.add('is-center-3d');
        } else if (idx === closestIdx - 1) {
            card.classList.add('is-side-3d-left');
        } else if (idx === closestIdx + 1) {
            card.classList.add('is-side-3d-right');
        } else {
            card.classList.add('is-far-3d');
        }
    });
    track.dataset.activeIndex = String(closestIdx);
}

function centerCardInTrack(track, index, smooth = true) {
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.slider-card')).filter(c => c.style.display !== 'none');
    if (cards.length === 0) return;
    const wrappedIdx = ((index % cards.length) + cards.length) % cards.length;
    const targetCard = cards[wrappedIdx];
    if (!targetCard) return;

    // Centrado exacto: cada tarjeta (incluida la última) se centra sin ser topada prematuramente
    const scrollTarget = targetCard.offsetLeft - (track.clientWidth / 2) + (targetCard.offsetWidth / 2);
    track.scrollTo({
        left: scrollTarget,
        behavior: smooth ? 'smooth' : 'auto'
    });
    track.dataset.activeIndex = String(wrappedIdx);
    setTimeout(() => updateTrack3DState(track), smooth ? 320 : 30);
}

// Navegación Swiper 3D Circular Infinito
window.scrollSlider = function(sliderId, offset) {
    const track = document.getElementById(sliderId);
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.slider-card')).filter(c => c.style.display !== 'none');
    if (cards.length === 0) return;

    const currentIdx = parseInt(track.dataset.activeIndex || '0', 10);
    const step = offset > 0 ? 1 : -1;
    const nextIdx = ((currentIdx + step) % cards.length + cards.length) % cards.length;
    centerCardInTrack(track, nextIdx, true);
};

function initSwiper3DCoverflow() {
    const tracks = document.querySelectorAll('.slider-track');
    tracks.forEach(track => {
        // Actualizar estado 3D al hacer scroll
        let ticking = false;
        track.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTrack3DState(track);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Soporte Mouse Drag-to-Scroll en escritorio
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let dragged = false;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            dragged = false;
            track.classList.add('is-dragging');
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                track.classList.remove('is-dragging');
                updateTrack3DState(track);
            }
        });

        track.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                track.classList.remove('is-dragging');
                updateTrack3DState(track);
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.35;
            if (Math.abs(walk) > 8) dragged = true;
            if (dragged) {
                e.preventDefault();
                track.scrollLeft = scrollLeft - walk;
            }
        });

        // Arrancar centrando la segunda tarjeta para mostrar 1 izquierda + 1 central grande + 1 derecha
        setTimeout(() => {
            centerCardInTrack(track, 1, false);
        }, 120);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSwiper3DCoverflow();
});

function setupMotionUI() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 40) {
                header.style.backdropFilter = 'blur(20px)';
                header.style.backgroundColor = 'rgba(0, 9, 30, 0.92)';
            } else {
                header.style.backdropFilter = 'blur(10px)';
                header.style.backgroundColor = 'var(--bg-header)';
            }
        }
    });
}

let activeCouponDiscount = 0;
let appliedCouponCode = '';

function applyCheckoutCoupon() {
    const input = document.getElementById('checkout-coupon-input');
    const msg = document.getElementById('coupon-feedback-msg');
    if (!input || !msg) return;
    const code = (input.value || '').trim().toUpperCase();
    if (code === 'ESTETICA10' || code === 'ALMA10') {
        activeCouponDiscount = 0.10;
        appliedCouponCode = code;
        msg.style.display = 'block';
        msg.style.color = 'var(--brand-green)';
        msg.innerHTML = `✅ ¡Código <strong>${code}</strong> verificado! 10% de descuento aplicado en el total de tu viaje por cortesía de Estudio de Belleza Imagen y Estilo "Alma".`;
        const amtEl = document.getElementById('modal-pkg-amount');
        if (amtEl && typeof currentModalPkgAmount === 'number') {
            const discounted = Math.round(currentModalPkgAmount * 0.90);
            amtEl.innerHTML = `<del style="color:var(--text-muted); font-size:0.85rem;">$${currentModalPkgAmount.toLocaleString('es-MX')}</del> $${discounted.toLocaleString('es-MX')} MXN (-10%)`;
        }
        if (typeof updateModalSeatDisplay === 'function') updateModalSeatDisplay();
    } else if (code) {
        msg.style.display = 'block';
        msg.style.color = 'var(--brand-red)';
        msg.innerHTML = `❌ El código <strong>${escapeHtml(code)}</strong> no es válido. Recuerda que Alma entrega tu cupón exclusivo al realizarte servicios mayores en el salón.`;
    }
}

function setXochimilcoPackage(price) {
    currentModalPkgAmount = price;
    const amtEl = document.getElementById('modal-pkg-amount');
    if (amtEl) amtEl.innerText = `$${price.toLocaleString('es-MX')} MXN`;
    if (typeof updateModalSeatDisplay === 'function') updateModalSeatDisplay();
}

function toggleMobileNav() {
    const drawer = document.getElementById('lux-mobile-drawer');
    if (drawer) drawer.classList.toggle('active');
}

/* =========================================================================
   8. TELEMETRÍA LIGERA, MONITOREO DE ERRORES Y SUSCRIPCIÓN CATÁLOGO PDF
   ========================================================================= */

window.__vromlixTelemetry = {
    events: [],
    errorCount: 0,
    track(eventName, payload = {}) {
        const entry = {
            event: eventName,
            payload,
            ts: new Date().toISOString(),
            path: window.location.pathname
        };
        this.events.push(entry);
        try {
            const stored = JSON.parse(localStorage.getItem('vromlix_telemetry_log') || '[]');
            stored.push(entry);
            localStorage.setItem('vromlix_telemetry_log', JSON.stringify(stored.slice(-150)));
        } catch (e) {}

        // Sincronizar con Cloudflare Edge CRM / Telemetry (/api/telemetry)
        try {
            fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
                keepalive: true
            }).catch(() => {});
        } catch (e) {}
    }
};

window.addEventListener('error', (event) => {
    window.__vromlixTelemetry.errorCount += 1;
    const badge = document.getElementById('sentry-health-badge');
    if (badge) {
        badge.innerText = `${window.__vromlixTelemetry.errorCount} ALERTA(S) JS`;
        badge.style.color = '#fde047';
    }
    window.__vromlixTelemetry.track('js_runtime_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    window.__vromlixTelemetry.track('js_unhandled_promise', {
        reason: String(event.reason || 'unknown')
    });
});

function subscribeMonthlyCatalog(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('newsletter-email-input');
    const feedback = document.getElementById('newsletter-feedback');
    const email = (emailInput ? emailInput.value : '').trim();
    if (!email || !email.includes('@')) {
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.color = '#fb7185';
            feedback.innerText = 'Por favor ingresa un correo electrónico válido.';
        }
        return false;
    }
    try {
        const subs = JSON.parse(localStorage.getItem('alma_newsletter_subs') || '[]');
        if (!subs.includes(email)) subs.push(email);
        localStorage.setItem('alma_newsletter_subs', JSON.stringify(subs));
    } catch (err) {}
    window.__vromlixTelemetry.track('subscribe_monthly_pdf_catalog', { email });
    try {
        fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, ts: new Date().toISOString() }),
            keepalive: true
        }).catch(() => {});
    } catch (err) {}
    if (emailInput) emailInput.value = '';
    if (feedback) {
        feedback.style.display = 'block';
        feedback.style.color = '#34d399';
        feedback.innerHTML = '✅ ¡Registrado! Recibirás nuestro Catálogo Mensual en PDF desde <strong>contacto@mera-kirai.com</strong>.';
    }
    return false;
}

/* =========================================================================
   9. RENDERIZADO DINÁMICO DE CARTELERA VIGENTE & RANKING POR VISTAS (KV)
   ========================================================================= */

function getLocalTodayIso() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function recordCatalogView(itemId, eventName = 'view_item') {
    const id = String(itemId || '').trim();
    if (!id) return;
    try {
        const cache = JSON.parse(localStorage.getItem('vromlix_popular_cache') || '{}');
        cache[id] = (Number(cache[id]) || 0) + (eventName === 'booking_open' ? 3 : eventName === 'quote_click' ? 2 : 1);
        localStorage.setItem('vromlix_popular_cache', JSON.stringify(cache));
    } catch (e) {}

    if (window.__vromlixTelemetry && typeof window.__vromlixTelemetry.track === 'function') {
        window.__vromlixTelemetry.track(eventName, { itemId: id });
    }
}

function resolveConcertVisual(ev) {
    if (ev.imagen) return { img: ev.imagen, badge: ev.badge || 'CDMX', color: ev.badgeColor || '#0284c7' };
    const text = `${ev.name || ''} ${ev.attractions || ''} ${ev.sub || ''}`.toLowerCase();
    if (text.includes('arena ciudad') || text.includes('arena cdmx')) {
        return { img: 'img/IMG-20260926-WA0009.jpg', badge: 'Arena CDMX', color: '#ec4899' };
    }
    if (text.includes('estadio gnp') || text.includes('foro sol') || text.includes('autódromo')) {
        return { img: 'img/IMG-20260926-WA0017.jpg', badge: 'Estadio GNP / Autódromo', color: '#16a34a' };
    }
    if (text.includes('palacio de los deportes')) {
        return { img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80', badge: 'Palacio Deportes', color: '#7c3aed' };
    }
    if (text.includes('auditorio') || text.includes('metropólitan') || text.includes('metropolitan') || text.includes('bellas artes')) {
        return { img: 'img/IMG-20260926-WA0013.jpg', badge: 'Auditorio / Teatro', color: '#0284c7' };
    }
    if (text.includes('estadio') || text.includes('azteca') || text.includes('nfl') || text.includes('américa')) {
        return { img: 'img/IMG-20260926-WA0010.jpg', badge: 'Estadio CDMX', color: '#d97706' };
    }
    return { img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80', badge: 'Cartelera CDMX', color: '#0284c7' };
}

function estimateConcertTransportPrice(ev) {
    const p = `${ev.price_ref || ''} ${ev.attractions || ''}`.toLowerCase();
    if (ev.numericPrice) return ev.numericPrice;
    if (p.includes('arena ciudad') || p.includes('arena cdmx')) return 590;
    if (p.includes('citibanamex')) return 499;
    const match = String(ev.price_ref || '').match(/transporte[^$]*\$([\d,]+)/i);
    if (match) return parseInt(match[1].replace(/,/g, ''), 10) || 549;
    return 549;
}

function buildConcertCardHtml(ev, viewsCount, showHotBadge) {
    const safeId = escapeHtml(ev.id);
    const safeTitle = escapeHtml(ev.title);
    const safeDate = escapeHtml(ev.dateLabel);
    const safeDesc = escapeHtml(ev.desc);
    const visual = resolveConcertVisual(ev);
    const priceNum = estimateConcertTransportPrice(ev);
    const jsTitle = String(ev.title).replace(/'/g, "\\'");
    const openCall = ev.source === 'curated'
        ? `openSharedElementModal('${safeId}')`
        : `openCatalogDetailModal('${safeId}')`;

    const hotPill = showHotBadge
        ? `<span style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.88); color:#fde047; border:1px solid rgba(250,204,21,0.5); padding:4px 10px; border-radius:20px; font-size:0.72rem; font-weight:800; z-index:4;">🔥 Muy buscado (${viewsCount})</span>`
        : '';

    return `
        <div class="slider-card" onclick="${openCall}">
            <div class="slider-card-img" style="background-image: url('${visual.img}');">
                <span class="slider-badge" style="background:${visual.color};">${escapeHtml(visual.badge)}</span>
                ${hotPill}
            </div>
            <div class="slider-card-body">
                <div class="slider-card-date">📅 ${safeDate} • CDMX</div>
                <div class="slider-card-title">${safeTitle}</div>
                <div class="slider-card-desc">${safeDesc}</div>
                <div style="font-size:0.75rem; color:var(--brand-gold); font-weight:700; margin: 4px 0 8px;"><i class="fas fa-gift"></i> Salida San Manuel • Espera al finalizar</div>
                <div class="slider-card-footer">
                    <div>
                        <span style="font-size:0.72rem; color:var(--text-muted); display:block; font-weight:700;">TRANSPORTE REDONDO</span>
                        <div class="slider-price">Desde $${priceNum.toLocaleString('es-MX')} MXN</div>
                    </div>
                    <button type="button" class="slider-card-btn" onclick="event.stopPropagation(); recordCatalogView('${safeId}', 'booking_open'); openPaymentModal('Transporte ${jsTitle}', ${priceNum})">
                        Pre-venta ($200)
                    </button>
                </div>
            </div>
        </div>`;
}

function collectActiveConcerts(todayIso) {
    const collected = [];
    const seenKeys = new Set();

    // 1. Eventos curados activos de cdmx_events_engine.js (poda automática < todayIso)
    if (typeof EVENTOS_CDMX_MAESTRO !== 'undefined' && Array.isArray(EVENTOS_CDMX_MAESTRO)) {
        for (const ev of EVENTOS_CDMX_MAESTRO) {
            if (ev.fecha_iso && ev.fecha_iso < todayIso) continue;
            const norm = String(ev.nombreEvento || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
            seenKeys.add(norm);
            const recObj = (typeof RECINTOS_CDMX !== 'undefined' && RECINTOS_CDMX[ev.recintoKey]) ? RECINTOS_CDMX[ev.recintoKey] : null;
            const priceNum = parseInt(String(ev.precio_texto || '549').replace(/[^0-9]/g, ''), 10) || 549;
            collected.push({
                id: ev.id,
                source: 'curated',
                title: ev.nombreEvento,
                dateLabel: ev.fecha || ev.fecha_iso || 'Próximamente',
                dateIso: ev.fecha_iso || '2099-12-31',
                desc: `Traslado redondo directo a ${recObj ? recObj.nombre : 'CDMX'} con espera nocturna garantizada.`,
                attractions: recObj ? recObj.nombre : ev.badge,
                imagen: ev.imagen,
                badge: ev.badge,
                numericPrice: priceNum,
                priority: 2
            });
        }
    }

    // 2. Cartelera diaria vigente de MASTER_CATALOG_1000 (solo conciertos / grandes recintos)
    const masterList = getCatalogo737List();
    const majorVenueRx = /(arena ciudad|arena cdmx|estadio gnp|foro sol|palacio de los deportes|auditorio nacional|teatro metrop|pepsi center|autódromo|bellas artes|estadio azteca|banorte)/i;
    for (const item of masterList) {
        if (item.macro !== 'evento_cdmx') continue;
        const rawDates = `${item.attractions || ''} ${item.desc || ''}`.match(/\b(202[6-9]-\d{2}-\d{2})\b/g) || [];
        const maxDate = rawDates.length ? rawDates.slice().sort().pop() : '';
        if (maxDate && maxDate < todayIso) continue;

        const isMega = String(item.sub || '').includes('Mega Espectáculo') || majorVenueRx.test(`${item.attractions || ''} ${item.name || ''}`);
        if (!isMega) continue;

        const norm = String(item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
        if (!norm || seenKeys.has(norm)) continue;
        seenKeys.add(norm);

        collected.push({
            id: item.id,
            source: 'catalog',
            title: item.name,
            dateLabel: rawDates.length ? rawDates[0] : 'Temporada Activa',
            dateIso: rawDates.length ? rawDates[0] : '2027-06-01',
            desc: String(item.desc || '').replace(/^📍\s*/, '').slice(0, 118),
            attractions: item.attractions || '',
            sub: item.sub || '',
            price_ref: item.price_ref || '',
            priority: 1
        });
    }

    return collected;
}

function buildPromotedExcursionCard(item, views) {
    const safeId = escapeHtml(String(item.id));
    const safeName = escapeHtml(item.name);
    const safeState = escapeHtml(item.state || 'México');
    const jsName = String(item.name).replace(/'/g, "\\'");
    const jsState = String(item.state || 'México').replace(/'/g, "\\'");
    let img = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';
    if (item.macro === 'playa_caribe' || /guerrero|quintana|baja|oaxaca/i.test(safeState)) {
        img = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
    }
    const priceTxt = escapeHtml(item.price_ref || 'Desde $650 MXN');
    const div = document.createElement('div');
    div.className = 'slider-card';
    div.setAttribute('data-cat', 'pueblo');
    div.setAttribute('data-promoted-id', safeId);
    div.setAttribute('onclick', `openCatalogDetailModal('${safeId}')`);
    div.innerHTML = `
        <div class="slider-card-img" style="background-image: url('${img}');">
            <span class="slider-badge" style="background:var(--brand-green);">${escapeHtml(item.sub || 'Catálogo Popular')}</span>
            <span class="popular-view-pill" style="position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.88); color:#fde047; border:1px solid rgba(250,204,21,0.5); padding:4px 10px; border-radius:20px; font-size:0.72rem; font-weight:800; z-index:4;">🔥 ${views} vistas</span>
        </div>
        <div class="slider-card-body">
            <div class="slider-card-date">${safeState.toUpperCase()} • TOP CATÁLOGO</div>
            <div class="slider-card-title">${safeName}</div>
            <div class="slider-card-desc">${escapeHtml(String(item.desc || '').slice(0, 105))}</div>
            <div class="slider-card-footer">
                <div>
                    <span style="font-size:0.72rem; color:var(--text-muted); display:block; font-weight:700;">TARIFA REFERENCIAL</span>
                    <div class="slider-price">${priceTxt}</div>
                </div>
                <button type="button" class="slider-card-btn" onclick="event.stopPropagation(); quoteWithAI('${jsName}', '${jsState}', event)">Cotizar</button>
            </div>
        </div>`;
    return div;
}

const INITIAL_SLIDER_SNAPSHOTS = {};

function rankTrackWithCatalog(trackId, viewsMap, macroAllowList, isVip, maxCards = 8) {
    const track = document.getElementById(trackId);
    if (!track) return;

    if (!INITIAL_SLIDER_SNAPSHOTS[trackId]) {
        INITIAL_SLIDER_SNAPSHOTS[trackId] = Array.from(track.querySelectorAll('.slider-card:not([data-promoted-id])'));
    }

    const todayIso = getLocalTodayIso();
    const baseCards = INITIAL_SLIDER_SNAPSHOTS[trackId].slice();
    const existingIds = new Set();
    const scored = [];

    baseCards.forEach((card, origIdx) => {
        const exp = card.getAttribute('data-expire-iso');
        if (exp && exp < todayIso) return;
        const oc = card.getAttribute('onclick') || '';
        const m = oc.match(/openSharedElementModal\(['"]([^'"]+)['"]\)/);
        const destId = m ? m[1] : '';
        if (destId) existingIds.add(destId);
        // Limpiar badge previo para no duplicar o mantener badges obsoletos al re-ordenar
        card.querySelectorAll('.popular-view-pill').forEach(p => p.remove());
        scored.push({ card, origIdx, views: Number(viewsMap[destId] || 0), destId });
    });

    // Promover ítems más vistos y vigentes del Gran Catálogo Maestro reemplazando los de menor vista sin acumular
    const masterList = getCatalogo737List();
    for (const item of masterList) {
        if (!item.id || existingIds.has(item.id)) continue;
        if (!macroAllowList.includes(item.macro)) continue;
        const rawDates = `${item.attractions || ''} ${item.desc || ''}`.match(/\b(202[6-9]-\d{2}-\d{2})\b/g) || [];
        const maxDate = rawDates.length ? rawDates.slice().sort().pop() : '';
        if (maxDate && maxDate < todayIso) continue;
        const v = Number(viewsMap[item.id] || 0);
        if (v < 2) continue;
        const alreadyInNamedCard = scored.some(s => (s.card.textContent || '').toLowerCase().includes(String(item.name || '').toLowerCase().slice(0, 14)));
        if (alreadyInNamedCard) continue;
        const cardEl = buildPromotedExcursionCard(item, v);
        if (isVip) cardEl.classList.add('gold-card-vip');
        scored.push({ card: cardEl, origIdx: 999, views: v, destId: item.id, promoted: true });
    }

    if (scored.some(s => s.views > 0)) {
        scored.sort((a, b) => (b.views - a.views) || (a.origIdx - b.origIdx));
    }

    const capped = scored.slice(0, maxCards);
    track.innerHTML = '';
    let hotMarked = 0;
    capped.forEach(({ card, views }) => {
        card.querySelectorAll('.popular-view-pill').forEach(p => p.remove());
        track.appendChild(card);
        if (views > 0 && hotMarked < 3) {
            hotMarked += 1;
            const imgBox = card.querySelector('.slider-card-img');
            if (imgBox) {
                const pill = document.createElement('span');
                pill.className = 'popular-view-pill';
                pill.style.cssText = 'position:absolute; top:12px; right:12px; background:rgba(15,23,42,0.88); color:#fde047; border:1px solid rgba(250,204,21,0.5); padding:4px 10px; border-radius:20px; font-size:0.72rem; font-weight:800; z-index:4;';
                pill.innerText = `🔥 ${views} vistas`;
                imgBox.appendChild(pill);
            }
        }
    });
}

function rankExcursionsByViews(viewsMap) {
    rankTrackWithCatalog('slider-pueblos', viewsMap, [
        'paquete_armado', 'pueblo_magico', 'barrio_magico', 'playa_caribe',
        'bosque_montana', 'ruta_tematica', 'experiencia_comunitaria', 'patrimonio_unesco'
    ], false, 8);
    rankTrackWithCatalog('slider-fraveo', viewsMap, ['vip_internacional'], true, 8);
}

async function renderDynamicSlidersWithViews() {
    const concertTrack = document.getElementById('slider-conciertos');
    const todayIso = getLocalTodayIso();

    let viewsMap = {};
    try {
        const localCache = JSON.parse(localStorage.getItem('vromlix_popular_cache') || '{}');
        viewsMap = { ...localCache };
    } catch (e) {}

    // Pintar primero con caché local para carga instantánea sin parpadeo
    const paintAll = (mergedViews) => {
        if (concertTrack) {
            const events = collectActiveConcerts(todayIso);
            events.sort((a, b) => {
                const va = Number(mergedViews[a.id] || 0);
                const vb = Number(mergedViews[b.id] || 0);
                if (vb !== va) return vb - va;
                if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
                return (b.priority || 0) - (a.priority || 0);
            });
            const topEvents = events.slice(0, 12);
            if (topEvents.length > 0) {
                let hotCount = 0;
                concertTrack.innerHTML = topEvents.map(ev => {
                    const v = Number(mergedViews[ev.id] || 0);
                    const isHot = v > 0 && hotCount < 3;
                    if (isHot) hotCount += 1;
                    return buildConcertCardHtml(ev, v, isHot);
                }).join('');
            } else {
                concertTrack.innerHTML = `
                    <div class="slider-card" onclick="quoteWithAI('Próximo Concierto en CDMX', 'Ciudad de México', event)">
                        <div class="slider-card-img" style="background-image:url('img/IMG-20260926-WA0009.jpg');">
                            <span class="slider-badge" style="background:#0284c7;">Cartelera CDMX</span>
                        </div>
                        <div class="slider-card-body">
                            <div class="slider-card-date">📅 SALIDAS DESDE SAN MANUEL</div>
                            <div class="slider-card-title">Conciertos y Eventos a la Medida CDMX</div>
                            <div class="slider-card-desc">Cotiza transporte redondo a Estadio GNP, Arena CDMX, Palacio de los Deportes o Auditorio Nacional.</div>
                            <div class="slider-card-footer">
                                <div><span style="font-size:0.72rem; color:var(--text-muted); display:block; font-weight:700;">TRANSPORTE REDONDO</span><div class="slider-price">Desde $549 MXN</div></div>
                                <button type="button" class="slider-card-btn" onclick="event.stopPropagation(); quoteWithAI('Próximo Concierto CDMX', 'Ciudad de México', event)">Cotizar</button>
                            </div>
                        </div>
                    </div>`;
            }
        }
        rankExcursionsByViews(mergedViews);
    };

    window.__vromlixPopularViews = viewsMap;
    paintAll(viewsMap);

    // Actualizar fecha mínima/default del cotizador personalizado para nunca mostrar fechas pasadas
    const quoteDateEl = document.getElementById('custom-quote-date');
    if (quoteDateEl) {
        quoteDateEl.min = todayIso;
        if (!quoteDateEl.value || quoteDateEl.value < todayIso) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            quoteDateEl.value = nextWeek.toISOString().split('T')[0];
        }
    }

    // Sincronizar vistas reales desde Cloudflare KV (/api/popular)
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2800);
        const resp = await fetch('https://mera-kirai.com/api/popular', { signal: controller.signal });
        clearTimeout(timer);
        if (resp.ok) {
            const data = await resp.json();
            if (data && data.views && typeof data.views === 'object') {
                const merged = { ...viewsMap };
                for (const [k, v] of Object.entries(data.views)) {
                    merged[k] = Math.max(Number(merged[k] || 0), Number(v || 0));
                }
                window.__vromlixPopularViews = merged;
                paintAll(merged);
            }
        }
    } catch (e) {}
}



