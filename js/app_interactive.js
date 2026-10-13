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
                    <button class="btn-3d-motion" onclick="event.stopPropagation(); openRutaSatelital3D('${dest.id}')" title="Ver Ruta Satelital 3D">
                        <i class="fas fa-satellite"></i> Ruta 3D
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
    document.body.style.overflow = '';
}

function bookActiveDestinoWhatsApp() {
    if (!activeDestino) return;
    const msg = `Hola Alma, me interesa apartar mi lugar para: *${activeDestino.nombre}* (${activeDestino.precio_texto}). ¿Tienen disponibilidad para el próximo viaje saliendo de San Manuel?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}

/* Stubs for backward compatibility (Satellite 3D map removed per user directive) */
function openRutaSatelital3D() {}
function closeRutaSatelital3D() {}
function openModoDios3D() {}
function closeModoDios3D() {}
function toggleMapEngine() {}
function flyOverRoute3D() {}


/* =========================================================================
   4. ASISTENTE IA DE VIAJES: ALMA (LA RUTA DEL ÁGUILA)
   ========================================================================= */

const GEMINI_API_KEY_POOL = "AIzaSyCgJpWoUlVX9iP9BiIvmK-XZrAf02KFr8k";
let chatHistory = [];

function initChatAssistant() {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

function toggleAiChat() {
    const win = document.getElementById('ai-chat-window');
    if (win) {
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

async function sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    // Agregar mensaje del usuario
    appendChatMessage('user', msg);
    input.value = '';

    // Mostrar indicador de escritura
    const typingId = showTypingIndicator();

    try {
        const responseText = await callGeminiAgent(msg);
        removeTypingIndicator(typingId);
        appendChatMessage('assistant', responseText);
    } catch (err) {
        console.warn("Fallo en Gemini API, usando motor de respuesta local Alma:", err);
        removeTypingIndicator(typingId);
        const fallbackAnswer = generateLocalAlmaResponse(msg);
        appendChatMessage('assistant', fallbackAnswer);
    }
}

function appendChatMessage(role, text) {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `ai-chat-bubble ${role}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function showTypingIndicator() {
    const body = document.getElementById('ai-chat-messages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-chat-bubble assistant typing';
    div.id = id;
    div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span> Consultando salidas...`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function callGeminiAgent(userQuestion) {
    const systemPrompt = `Eres Alma, la Asesora Personal de Viajes de 'Viajes La Ruta del Águila' en Río Nexapa 6101, Jardines de San Manuel, Puebla (WhatsApp 222 801 6244).
Preséntate siempre amablemente como Alma al iniciar la conversación. Tu objetivo es orientar con calidez y precisión a los clientes según sus intereses:
1. Conciertos y Eventos CDMX (Jóvenes / Estudiantes): Transporte redondo cómodo y seguro con espera nocturna hasta el término del evento (Estadio GNP, Foro Sol, Palacio de los Deportes, Citibanamex, Auditorio Nacional, Estadio Azteca) desde $549 MXN.
2. Excursiones Nacionales (Familias / Adultos / Jubilados): Pueblos Mágicos, aguas termales y descanso en cómodas unidades (Cacahuamilpa y Taxco $1,160 MXN, Tolantongo $790 MXN, Zacatlán $650 MXN, Cuetzalan $820 MXN, Acapulco $980 MXN).
3. Destinos VIP (Alianza fraVEO): Circuitos internacionales de alta gama (Inglaterra al Completo $1,909 USD, Vietnam y Camboya $2,265 USD, Guatemala $1,300 USD, Tailandia $1,432 USD, Safari en Kenia $2,135 USD, El Clásico Europa $5,790 USD, Cancún All-Inclusive $8,990 MXN).
Garantía comercial: Se aparta con $200 MXN reembolsable si no se reúne el quórum 48 hrs antes.
Responde siempre de forma amable, entusiasta, concisa y en español mexicano profesional. Invita a apartar o contactar por WhatsApp al 222 801 6244.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY_POOL}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nPregunta del cliente: ${userQuestion}` }] }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 350
            }
        })
    });

    if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("Sin respuesta del modelo");
    return reply;
}

function generateLocalAlmaResponse(question) {
    const q = question.toLowerCase();

    if (q.includes('concierto') || q.includes('foro sol') || q.includes('gnp') || q.includes('karol') || q.includes('estadio') || q.includes('shakira') || q.includes('f1')) {
        return `🎶 ¡Hola! Soy **Alma**. Contamos con **Transporte Seguro a Conciertos y Eventos en CDMX** con salida y regreso directo a San Manuel:
- Tarifa Redonda: desde **$549 MXN**.
- Te dejamos en la puerta del recinto y nuestra unidad te espera hasta que termina el evento para que regreses tranquilo.
- Aparta tu lugar con solo **$200 MXN** (100% reembolsable).
¿A qué evento te gustaría asistir?`;
    }

    if (q.includes('taxco') || q.includes('cacahuamilpa') || q.includes('grutas')) {
        return `✨ ¡Hola! Soy **Alma**. Nuestra excursión a **Grutas de Cacahuamilpa & Taxco** sale el sábado 17 de octubre:
- Tarifa Redonda: **$1,160 MXN** p/p.
- Incluye: Transporte ejecutivo con casetas, boleto a las Grutas y visita guiada a Taxco.
- Salida 05:30 AM desde Río Nexapa 6101, San Manuel.
¿Te gustaría apartar tus lugares?`;
    }

    if (q.includes('tolantongo') || q.includes('termas') || q.includes('pozas')) {
        return `🌿 ¡Hola! Soy **Alma**. Te recomiendo nuestras salidas a **Grutas de Tolantongo**:
- Tarifa Redonda: **$790 MXN** por persona.
- Disfruta de las pozas termales a 36°C, el túnel de vapor y el río turquesa en un día completo de relajación.
¿Cuántos lugares buscas para esta escapada?`;
    }

    if (q.includes('vip') || q.includes('internacional') || q.includes('europa') || q.includes('inglaterra') || q.includes('asia') || q.includes('fraveo')) {
        return `👑 ¡Hola! Soy **Alma**. A través de nuestra alianza **fraVEO** contamos con paquetes internacionales de alta gama:
- **Inglaterra al Completo 2026**: desde $1,909 USD.
- **Vietnam y Camboya**: $2,265 USD.
- **Tailandia 2027**: $1,432 USD.
- **Kenia Safari Masai Mara**: $2,135 USD.
- **El Clásico Real Madrid vs Barcelona + Europa**: $5,790 USD.
Todos incluyen vuelos, hoteles 4-5 estrellas y guías en español. ¿Qué destino internacional te interesa cotizar?`;
    }

    return `🦅 ¡Hola! Soy **Alma**, tu asesora de viajes en *La Ruta del Águila* (San Manuel, Puebla).
Tenemos 3 opciones ideales para ti:
1. **Conciertos y Eventos CDMX** con espera nocturna (desde $549 MXN).
2. **Excursiones Nacionales** para descansar en familia (Taxco, Tolantongo, Zacatlán, Cuetzalan).
3. **Destinos VIP Internacionales** de alta gama (Europa, Asia, África).
Apartas cualquier viaje con solo $200 MXN. ¿Qué tipo de experiencia tienes en mente?`;
}

/* =========================================================================
   5. BÚSQUEDA GLOBAL RÁPIDA (FILTRADO EN VIVO)
   ========================================================================= */

function handleLiveGlobalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('btn-clear-search');
    if (clearBtn) clearBtn.style.display = q ? 'inline-block' : 'none';

    const cards = document.querySelectorAll('.slider-card, .confirmed-trip-card');
    cards.forEach(card => {
        if (!q) {
            card.style.display = card.classList.contains('confirmed-trip-card') ? 'flex' : 'flex';
            return;
        }
        const text = card.innerText.toLowerCase();
        if (text.includes(q)) {
            card.style.display = card.classList.contains('confirmed-trip-card') ? 'flex' : 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function clearLiveGlobalSearch() {
    const input = document.getElementById('main-live-search');
    if (input) {
        input.value = '';
        handleLiveGlobalSearch('');
        input.focus();
    }
}

/* =========================================================================
   6. MODAL CATÁLOGO NACIONAL DE MÉXICO (290 DESTINOS)
   ========================================================================= */

let catalogoNacionalFiltroCat = 'todos';

function openCatalogoNacionalModal() {
    const modal = document.getElementById('modal-catalogo-nacional');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCatalogoNacionalGrid();
}

function closeCatalogoNacionalModal() {
    const modal = document.getElementById('modal-catalogo-nacional');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function filterCatalogoCat(cat, btn) {
    catalogoNacionalFiltroCat = cat;
    document.querySelectorAll('.catalogo-filter-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderCatalogoNacionalGrid();
}

function renderCatalogoNacionalGrid() {
    const container = document.getElementById('catalogo-grid-container');
    const searchInput = document.getElementById('catalogo-modal-search');
    if (!container) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const lista = typeof CATALOGO_NACIONAL_290 !== 'undefined' ? CATALOGO_NACIONAL_290 : [];

    const filtrados = lista.filter(item => {
        const coincideCat = catalogoNacionalFiltroCat === 'todos' || item.cat === catalogoNacionalFiltroCat;
        const coincideTxt = !query || item.nombre.toLowerCase().includes(query) || item.estado.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
        return coincideCat && coincideTxt;
    });

    const countLabel = document.getElementById('catalogo-count-label');
    if (countLabel) countLabel.innerText = `${filtrados.length} destinos disponibles`;

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
                <i class="fas fa-search" style="font-size:2rem; margin-bottom:1rem; display:block;"></i>
                <p>No se encontraron destinos que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtrados.map(d => `
        <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:14px; padding:1.2rem; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span style="font-size:0.75rem; font-weight:800; background:rgba(22,163,74,0.12); color:var(--brand-green); padding:3px 8px; border-radius:12px;">📍 ${d.estado}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${d.cat}</span>
                </div>
                <h4 style="font-family:'Outfit'; font-size:1.1rem; font-weight:800; color:var(--text-title); margin-bottom:0.4rem;">${d.nombre}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:1rem;">${d.desc}</p>
            </div>
            <button onclick="bookDirectWhatsAppDestino('${d.nombre}', '${d.estado}')" style="background:var(--brand-red); color:#fff; border:none; padding:8px 14px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:6px;">
                <i class="fab fa-whatsapp"></i> Cotizar Salida
            </button>
        </div>
    `).join('');
}

function bookDirectWhatsAppDestino(nombre, estado) {
    const msg = `Hola Alma, me interesa cotizar una salida para el destino: *${nombre}* (${estado}) saliendo desde San Manuel, Puebla. ¿Tienen fechas próximas disponibles?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
}

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

