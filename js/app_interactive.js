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
                    <button class="btn-3d-motion" onclick="event.stopPropagation(); openSharedElementModal('${dest.id}')" title="Ver Itinerario y Apartar Asiento">
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
    const modal = document.getElementById('whatsapp-choice-modal');
    if (modal) modal.classList.add('active');
}

function closeWhatsAppChoiceModal() {
    const modal = document.getElementById('whatsapp-choice-modal');
    if (modal) modal.classList.remove('active');
}

function sendWhatsAppDirect(target) {
    const dName = activeDestino ? (activeDestino.nombre || 'Destino Nacional') : 'Destino Nacional';
    const dState = activeDestino && activeDestino.estado ? ` (${activeDestino.estado})` : '';
    const dPrice = activeDestino && activeDestino.precio_texto ? ` [${activeDestino.precio_texto}]` : '';
    
    const msg = `Hola, me interesa información y cotización para el viaje a: *${dName}${dState}*${dPrice} con salida desde San Manuel, Puebla. ¿Tienen disponibilidad y fechas programadas?`;

    if (target === 'alma') {
        window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (target === 'rogerman') {
        window.open(`https://wa.me/353877665536?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (target === 'ambos') {
        window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
        setTimeout(() => {
            window.open(`https://wa.me/353877665536?text=${encodeURIComponent(msg)}`, '_blank');
        }, 400);
    }
    closeWhatsAppChoiceModal();
}

function bookActiveDestinoWhatsApp(targetNumber) {
    if (!activeDestino) return;
    const phone = targetNumber || '522228016244';
    const contactName = phone === '353877665536' ? 'Rogerman' : 'Alma';
    const msg = `Hola ${contactName}, me interesa apartar mi lugar para: *${activeDestino.nombre}* (${activeDestino.precio_texto}). ¿Tienen disponibilidad para el próximo viaje saliendo de San Manuel?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

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
    const matchedContext = findRelevantCatalogContext(msg);

    if (window.__vromlixTelemetry) {
        window.__vromlixTelemetry.track('ai_chat_query', { query: msg, matches: matchedContext.length });
    }

    // Construir inyección RAG desde nuestros 908 destinos/eventos o búsqueda web en vivo para grupos virales
    const augmentedHistory = chatHistory.slice(-6);
    if (matchedContext.length > 0) {
        const ragLines = matchedContext.map(item => {
            let line = `Destino/Evento: ${item.name} (${item.state} | ${item.category}). ${item.desc}`;
            if (item.attractions) line += ` | Museos y lugares a visitar: ${item.attractions}.`;
            if (item.gastronomy) line += ` | Platillos típicos: ${item.gastronomy}.`;
            if (item.crafts) line += ` | Artesanías: ${item.crafts}.`;
            if (item.price_ref) line += ` | Tarifa / Boleto: ${item.price_ref}.`;
            return line;
        }).join(' || ');
        augmentedHistory.push({
            role: 'user',
            content: `[DATOS DE NUESTRO CATÁLOGO DE 908 DESTINOS Y EVENTOS (NO MENCIONES LA PALABRA SECTUR): ${ragLines}. DIRECTIVAS CLAVE DE ALMA: 
1) Si es una gran expedición nacional de larga distancia (El Chepe, Barrancas del Cobre, Cancún, Los Cabos, Riviera Maya o Luna de Miel), explica que es un Paquete Integral a la Medida operado con fraVEO (incluye vuelos, traslados, hoteles o tren turístico); no des tarifa de camioneta de $200 y pide fecha estimada, pasajeros y menciona que les enviaremos su cotización formal desglosada en PDF en un lapso de 24 a 48 horas hábiles a su WhatsApp o correo.
2) Si es un concierto o evento CDMX, resalta que incluye Kit Concierto: Botana + Agua fría + Gafete Conmemorativo de Colección + Seguro de Viajero con chofer sobrio que espera hasta el final.
3) Mantén respuestas concisas, juveniles y entusiastas.]`
        });
        augmentedHistory.push({
            role: 'assistant',
            content: 'Entendido, usaré estos datos para responder con calidez, agilidad juvenil y claridad entre salidas locales y grandes paquetes fraVEO.'
        });
    } else if (msg.length > 4) {
        const lowerMsg = msg.toLowerCase();
        // Evitar lecciones enciclopédicas de Wikipedia para preguntas filosóficas, poéticas o curiosas
        const isPoeticOrCurious = lowerMsg.includes('nube') || lowerMsg.includes('olor') || lowerMsg.includes('filosof') || lowerMsg.includes('sentido') || lowerMsg.includes('chiste') || lowerMsg.includes('broma') || lowerMsg.includes('vuelo') || lowerMsg.includes('cielo');
        
        if (isPoeticOrCurious) {
            augmentedHistory.push({
                role: 'user',
                content: `[DIRECTIVA DE AGILIDAD Y TONO JUVENIL: El usuario hace una pregunta poética, curiosa o informal ("${msg}"). Responde en MÁXIMO 2 a 3 líneas con chispa, encanto, calidez juvenil y simpatía, relacionándolo con la emoción de viajar, el viento fresco en carretera o salir de la rutina hacia la naturaleza (como Cuetzalan o Zacatlán). NUNCA des explicaciones científicas ni lecciones de física/meteorología.]`
            });
            augmentedHistory.push({
                role: 'assistant',
                content: 'Entendido, responderé de forma breve, fresca, poética y divertida, conectando de inmediato con las ganas de viajar.'
            });
        } else {
            const liveWiki = await fetchLiveWebContextForChat(msg);
            if (liveWiki) {
                augmentedHistory.push({
                    role: 'user',
                    content: `[CONTEXTO WEB EN VIVO PARA IDENTIFICAR GRUPOS VIRALES, ARTISTAS O LUGARES: ${liveWiki}. Si es un grupo musical o artista activo que aún no tiene fecha en nuestra cartelera CDMX, ofrece abrir salida ejecutiva desde San Manuel ($549-$580 MXN redondo) o armar viaje privado desde 6 personas en Suzuki Ertiga VIP con Kit Concierto incluido.]`
                });
                augmentedHistory.push({
                    role: 'assistant',
                    content: 'Entendido, responderé con este contexto actualizado de la web y ofreceré nuestras opciones de transporte.'
                });
            }
        }
    }

    // 1. Consultar Cloud AI Worker en Cloudflare Edge (24/7 en la nube, Meta Llama 3.3 70B + RAG)
    const endpoints = [
        '/api/chat',
        'https://mera-kirai.com/api/chat',
        'https://alma-ai-assistant.mera-kirai-cloud.workers.dev'
    ];

    let cloudReply = null;
    for (const url of endpoints) {
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: augmentedHistory,
                    context_items: matchedContext
                })
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.reply) {
                    cloudReply = data.reply;
                    break;
                }
            }
        } catch (err) {
            // Intenta siguiente endpoint o respaldo en navegador
        }
    }

    removeTypingIndicator(typingId);
    const finalReply = cloudReply || generateLocalAlmaResponse(msg, matchedContext);
    chatHistory.push({ role: 'user', content: msg });
    chatHistory.push({ role: 'assistant', content: finalReply });
    appendChatMessage('assistant', finalReply);
}

function formatChatMarkdown(text) {
    return String(text || '')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function appendChatMessage(role, text) {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `ai-chat-bubble ${role}`;
    div.innerHTML = role === 'assistant' ? formatChatMarkdown(text) : escapeHtml(text).replace(/\n/g, '<br>');
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
            resp += `${count}. **¿Puedes dar más de apartado?**: ¡Claro que sí! Los **$200 MXN** son únicamente el anticipo mínimo por persona. Puedes abonar un monto mayor o liquidar desde el inicio si lo prefieres.\n\n`;
            count++;
        }
        if (asksHorariosLlegada) {
            resp += `${count}. **¿Puedes llegar a las 3:00 PM al punto de reunión?**: La salida oficial desde **Calle Río Nexapa #6101 en San Manuel** para Xochimilco es a las **14:30 hrs puntuales** (con 15 minutos de tolerancia máxima). Te recomendamos llegar a tiempo para no perder el abordaje.\n\n`;
            count++;
        }
        resp += `¿Te gustaría apartar tus asientos para la próxima fecha disponible?`;
        return resp;
    }

    // 1.5. PREGUNTAS POÉTICAS, CURIOSAS O INFORMALES (Nubes, sentido de la vida, etc.)
    if (q.includes('nube') || q.includes('nubes') || q.includes('olor a nube') || q.includes('olor de las nubes') || q.includes('filosof') || q.includes('sentido de la vida')) {
        return `☁️✨ ¡Huelen a aire puro, libertad y a ese primer respiro fresco cuando vas en carretera saliendo de la ciudad!\n\nEn *La Ruta del Águila* nos fascina llevarte a donde el cielo se toca con las montañas (como Cuetzalan, Zacatlán de las Manzanas o Real del Monte). ¿Listo para escaparte a despejar la mente este fin de semana?`;
    }

    // 1.6. GRANDES EXPEDICIONES NACIONALES Y LUNA DE MIEL (El Chepe, Barrancas, Cancún, Los Cabos, fraVEO)
    if (q.includes('chepe') || q.includes('barrancas') || q.includes('luna de miel') || q.includes('cancun') || q.includes('cancún') || q.includes('cabos') || q.includes('riviera maya') || q.includes('huasteca potosina') || q.includes('avion') || q.includes('avión')) {
        return `✈️ ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nPara grandes expediciones como **El Tren Chepe (Barrancas del Cobre)** o viajes de **Luna de Miel / Playa**, operamos en alianza oficial con **fraVEO** para armarte un **Paquete Integral a la Medida** (vuelos redondos, traslados ejecutivos, noches de hotel seleccionadas y boletos turísticos).\n\nTe preparamos tu **cotización formal desglosada en PDF en un lapso de 24 a 48 horas hábiles**:\n1. ¿Para cuántas personas y cuántos días sería el viaje?\n2. ¿En qué mes o fecha tentativa tienen planeado viajar?\n3. ¿Prefieres recibir la propuesta detallada por **WhatsApp** o por **correo electrónico**?`;
    }

    // 1.7. CONCIERTOS CDMX Y SODA STEREO (Kit Concierto: Botana + Agua + Gafete + Seguro)
    if (q.includes('soda stereo') || q.includes('soda estereo') || q.includes('cerati') || q.includes('pata de perro') || q.includes('kit concierto')) {
        return `🎸 ¡Hola! Soy **Alma** de *La Ruta del Águila*.\n¡Tenemos transporte ejecutivo redondo a conciertos en CDMX con la mejor experiencia de Puebla!\n\n🎁 **Todas nuestras salidas a conciertos incluyen el Kit Concierto Ejecutivo:**\n- **Snack Pack de cortesía:** Botana/galleta + Agua fría embotellada.\n- **Gafete Conmemorativo de Colección** del concierto.\n- **Seguro de Cobertura Amplia de Viajero a Bordo**.\n- **Chofer sobrio asignado** que te deja en la puerta del recinto y te espera hasta el final de la última canción.\n\n*Nota:* El transporte es independiente de la boletera (llevas tu boleto en la zona que tú elijas). Apartas con solo **$200 MXN** y tienes 10% de descuento con el cupón **ESTETICA10**. ¿Te apartamos lugares?`;
    }

    // 2. ARTISTAS FALLECIDOS (José José, Juan Gabriel, Jenni Rivera, etc.)
    if (q.includes('jose jose') || q.includes('josé josé') || q.includes('juan gabriel') || q.includes('jenni rivera') || q.includes('valentin elizalde') || q.includes('joan sebastian')) {
        return `🕊️ ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nLamentablemente ese gran artista ya falleció, por lo que no existen conciertos en vivo suyos. Sin embargo, cuando se presentan **homenajes sinfónicos oficiales o tributos en CDMX** (en recintos como el Auditorio Nacional, Bellas Artes o Teatro Metropólitan), organizamos **transporte ejecutivo redondo desde San Manuel, Puebla** desde **$549 MXN**.\n\n¿Te gustaría que te avise cuando haya un concierto sinfónico u homenaje en CDMX?`;
    }

    // 3. SHOWS INFANTILES Y FAMILIARES (Tatiana, Bely y Beto, Luli Pampín)
    if (q.includes('tatiana') || q.includes('bely') || q.includes('luli pampin') || q.includes('infantil') || q.includes('niños')) {
        return `🎠 ¡Hola! Soy **Alma** de *La Ruta del Águila*.\n¡Claro que sí! Para los shows familiares e infantiles como **Tatiana** en **Arena CDMX, Auditorio Nacional o Teatro Metropólitan**, organizamos salidas ejecutivas seguras desde San Manuel, Puebla (transporte redondo desde **$549 a $580 MXN** por persona con seguro de viajero y espera al terminar la función, o bien en **modalidad privada familiar**).\n\nRecuerda que apartas con **$200 MXN** y puedes usar el cupón **ESTETICA10** (10% de descuento). ¿Para qué fecha o cuántos lugares familiares te gustaría cotizar?`;
    }

    if (q.includes('veronica castro') || q.includes('verónica castro')) {
        return `🎭 ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nActualmente **Verónica Castro** no tiene presentaciones de teatro ni conciertos confirmados en la cartelera oficial de CDMX (se encuentra retirada temporalmente de los escenarios y giras).\n\nSin embargo, en cuanto se anuncie cualquier obra, homenaje o gala en recintos de CDMX, contaremos con **salida ejecutiva redonda** desde San Manuel, Puebla.\n¿Te gustaría consultar por alguna otra obra de teatro o concierto en CDMX?`;
    }

    if (q.includes('luis miguel') || q.includes('luismiguel') || q.includes('el sol')) {
        return `☀️ ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nActualmente en la cartelera oficial de recintos CDMX (Arena CDMX, Estadio GNP, Auditorio Nacional) no hay fechas próximas confirmadas para Luis Miguel (sus fechas recientes en Arena CDMX ya concluyeron).\n\nEn cuanto se anuncie una nueva fecha o preventa, organizaremos **transporte ejecutivo redondo** desde San Manuel, Puebla (desde **$549 MXN**). ¿Te gustaría que te registremos en la lista prioritaria por WhatsApp?`;
    }

    if (q.includes('shakira') || q.includes('chayanne') || q.includes('temerarios') || q.includes('morat') || q.includes('zayn') || q.includes('weeknd')) {
        return `🎶 ¡Hola! Soy **Alma**. Para los grandes conciertos en el **Estadio GNP Seguros** ($549 MXN) y **Arena CDMX** ($580 MXN):\n- Contamos con salida ejecutiva directa desde San Manuel, Puebla.\n- Te dejamos en el recinto y nuestra unidad te espera al terminar para que regreses seguro a Puebla la misma noche.\n- Apartas tu asiento con solo **$200 MXN** y tienes 10% de descuento con el cupón **ESTETICA10**. ¿Para qué artista o fecha deseas apartar?`;
    }

    if (q.includes('hospital') || q.includes('medica') || q.includes('médica') || q.includes('doctor') || q.includes('nutricion') || q.includes('nutrición') || q.includes('compras') || q.includes('particular') || q.includes('privado') || q.includes('aeropuerto') || q.includes('aifa') || q.includes('aicm') || q.includes('visa') || q.includes('embajada')) {
        return `🚗 ¡Hola! Soy **Alma**. Contamos con **Servicio de Transporte Privado y Puerta a Puerta**:\n- **Vehículo a tu medida**: Auto sedán ejecutivo (1 a 3 personas) o camioneta ejecutiva para grupos.\n- **Servicios frecuentes**: Citas médicas en CDMX (Nutrición, Médica Sur, ABC), compras de mayoreo, trámites de visa/embajada y traslados a aeropuertos (AICM/AIFA).\n¿Qué fecha y destino particular requieres cotizar?`;
    }

    if (asksCancelacion) {
        return `🛡️ ¡Hola! Soy **Alma**. Nuestras **Políticas de Apartado y Cancelación** son 100% transparentes:\n1. **Reembolso 100% Garantizado**: Si un viaje grupal no reúne el cupo mínimo 48 horas antes, se te devuelve el **100% íntegro de tu dinero de inmediato**.\n2. **Cancelación de última hora (<48h) o No-Show**: No aplica reembolso porque tu asiento ya fue comprometido operativamente, pero **tu boleto es 100% transferible sin costo** a cualquier familiar o amigo, y el viaje nunca se cancela para los pasajeros puntuales.\nPuedes consultar todos los detalles en nuestra página de [Términos y Condiciones](terminos.html).`;
    }

    if (q.includes('xochimilco') || q.includes('llorona') || q.includes('trajinera') || q.includes('muertos')) {
        return `🎭 ¡Hola! Soy **Alma**. Nuestra primera salida confirmada a **La Llorona en Xochimilco (Cuemanco)** registró **CUPO AGOTADO** gracias a su preferencia, ¡pero estamos abriendo lista para la siguiente salida de noviembre!\n- **Paquete Completo**: **Desde $1,350 MXN** (transporte ejecutivo redondo desde San Manuel + paseo en trajinera + boleto oficial a la obra).\n- **Solo Transporte Redondo**: **Desde $650 MXN**.\n- Apartas con **$200 MXN** y el resto se liquida 48-24h antes de salir. ¿Para cuántas personas te anotamos en la próxima fecha?`;
    }

    if (q.includes('expo') || q.includes('beauty') || q.includes('ebs') || q.includes('citibanamex')) {
        return `💄 ¡Hola! Soy **Alma**. Nuestra salida del 24 al 26 de octubre a **Expo Beauty Show (EBS)** en Centro Citibanamex tuvo **CUPO AGOTADO** total.\n- Si deseas asistir a próximas exposiciones profesionales en Centro Citibanamex o WTC CDMX, organizamos **transporte redondo ejecutivo desde $700 MXN** saliendo de San Manuel, Puebla.\n- ¿Te gustaría que te registremos para la próxima expo o cotizar un traslado privado?`;
    }

    if (q.includes('estetica') || q.includes('estética') || q.includes('salon') || q.includes('salón') || q.includes('cupon') || q.includes('cupón') || q.includes('descuento') || q.includes('corte') || q.includes('tinte') || q.includes('alisado') || q.includes('nanoplastia') || q.includes('botox') || q.includes('pestañas') || q.includes('novia') || q.includes('lendan')) {
        return `🌸 ¡Hola! Soy **Alma** de **Estudio de Belleza Imagen y Estilo "Alma"** (más de 30 años nos respaldan en Río Nexapa #6101, San Manuel).\n\n✨ **Lista Oficial de Servicios y Precios:**\n- **Corte Dama:** $200 | **Caballero:** $150 | **Planchado Express:** $200\n- **Aplicación de Tintes:** Desde $500 | **Diseños de Color (Balayage/Mechas):** Desde $1,000\n- **Alisados Progresivos:** Desde $850 (Promo especial desde $800) | **Nanoplastia:** Desde $600 | **Botox Capilar:** Desde $500 | **Sinergia Capilar:** Desde $300\n- **Peinado Social:** Desde $500 | **Maquillaje Social:** $600\n- **Paquete Novia:** $5,000 | **Paquete XV Años:** $4,000\n- **Pestañas:** Clásicas $400, Efecto Rímel $450, Volumen Tecnológico $500 | **Lifting:** $350 | **Laminado Cejas:** $200\n- **Depilaciones:** Ceja $70, Facial $250, Cera Roll-On (Piernas $650, Brazos $400, Axilas $200)\n- **Cortes sin costo (Práctica supervisada):** Lun, Mié y Vie de 4:00 a 5:00 PM.\n- 🎁 **10% de Descuento en Viajes (Cupón ESTETICA10):** Al realizarte cualquier Diseño de Color, Alisado Progresivo, Paquete de Faciales, XV Años o Novias. ¿Qué servicio te gustaría agendar?`;
    }

    // 4. SI HAY COINCIDENCIA EN LA BASE DE DATOS DE 908 DESTINOS Y EVENTOS (MUSEOS, GASTRONOMÍA Y TARIFAS)
    if (Array.isArray(matchedContext) && matchedContext.length > 0) {
        const top = matchedContext[0];
        let detail = `🦅 ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nSobre **${top.name}** (${top.state}):\n- ${top.desc}\n`;
        if (top.attractions) detail += `- 🏛️ **Lugares y museos por visitar:** ${top.attractions}.\n`;
        if (top.gastronomy) detail += `- 🍽️ **Platillos típicos imperdibles:** ${top.gastronomy}.\n`;
        if (top.price_ref) detail += `- 💰 **Tarifa estimada:** ${top.price_ref}.\n`;
        detail += `\nRecuerda que apartas con **$200 MXN**, liquidas 48-24h antes de salir y tienes **10% de descuento** con el cupón **ESTETICA10**. ¿Para cuántas personas y qué fecha te gustaría cotizar?`;
        return detail;
    }

    return `🦅 ¡Hola! Soy **Alma**, tu asesora en *La Ruta del Águila* (San Manuel, Puebla).\nRespecto a tu consulta sobre **"${escapeHtml(raw)}"**, podemos organizarlo tanto en **salida grupal programada** (con mínimo 12 interesados de nuestro catálogo de **908 destinos de México y eventos CDMX**) como en **traslado privado a tu medida**.\n\nRecuerda que apartas cualquier viaje con **$200 MXN**, liquidas 48-24h antes de salir y tienes **10% de descuento** con el cupón **ESTETICA10**. ¿En qué fecha aproximada y para cuántas personas te gustaría viajar?`;
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

    const matches = [];
    if (typeof DESTINOS_DB !== 'undefined') {
        DESTINOS_DB.forEach(d => {
            if (d.nombre.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q) || d.estado.toLowerCase().includes(q) || d.categoria.toLowerCase().includes(q)) {
                matches.push({
                    id: d.id,
                    nombre: d.nombre,
                    imagen: d.imagen,
                    precio: d.precio_texto,
                    badge: d.badge,
                    meta: `${d.estado} • ${d.duracion}`
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
            <div class="live-search-item" onclick="openSharedElementModal('${m.id}'); clearLiveGlobalSearch();">
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

    return `¡Hola! Soy **Alma** de *La Ruta del Águila* 🦅.\nVeo que te interesa viajar a **${nombre} (${estado})**${highlight}\n\n¿Te gustaría visitarlo pronto? Cuéntame: ¿para cuántas personas sería el viaje y aproximadamente en qué fecha o cuántos días tienes pensado viajar?`;
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

    const filtrados = lista.filter(item => {
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
    if (item.macro === 'cdmx_evento' || item.macro === 'cartelera_cdmx') {
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
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Apartado en Pre-venta con solo $200 MXN por persona</li>
        <li><i class="fas fa-check-circle" style="color:var(--brand-green);"></i> Atención directa y personalizada con Alma Luis (222 801 6244) y soporte internacional Rogerman (+353 8 77 66 55 36)</li>
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
        msg.innerHTML = `✅ ¡Cupón <strong>${code}</strong> aplicado! 10% de descuento en el total de tu viaje.`;
        const amtEl = document.getElementById('modal-pkg-amount');
        if (amtEl && typeof currentModalPkgAmount === 'number') {
            const discounted = Math.round(currentModalPkgAmount * 0.90);
            amtEl.innerHTML = `<del style="color:var(--text-muted); font-size:0.85rem;">$${currentModalPkgAmount.toLocaleString('es-MX')}</del> $${discounted.toLocaleString('es-MX')} MXN (-10%)`;
        }
        if (typeof updateModalSeatDisplay === 'function') updateModalSeatDisplay();
    } else if (code) {
        msg.style.display = 'block';
        msg.style.color = 'var(--brand-red)';
        msg.innerHTML = `❌ El cupón <strong>${escapeHtml(code)}</strong> no es válido o ha expirado.`;
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


