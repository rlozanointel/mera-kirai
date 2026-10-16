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
    document.body.style.overflow = '';
}

function bookActiveDestinoWhatsApp() {
    if (!activeDestino) return;
    const msg = `Hola Alma, me interesa apartar mi lugar para: *${activeDestino.nombre}* (${activeDestino.precio_texto}). ¿Tienen disponibilidad para el próximo viaje saliendo de San Manuel?`;
    window.open(`https://wa.me/522228016244?text=${encodeURIComponent(msg)}`, '_blank');
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
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    appendChatMessage('user', msg);
    if (input) input.value = '';

    const typingId = showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator(typingId);
        const reply = generateLocalAlmaResponse(msg);
        appendChatMessage('assistant', reply);
    }, 350);
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
    if (!body) return null;
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-chat-bubble assistant typing';
    div.id = id;
    div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span> Consultando cartelera oficial...`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

function generateLocalAlmaResponse(question) {
    const raw = (question || '').trim();
    const q = raw.toLowerCase();

    // 1. RECONOCIMIENTO MULTI-PREGUNTA / MULTI-INTENCIÓN (Hospedaje, Montos de Apartado, Horarios y Llegadas)
    const asksHospedaje = q.includes('hospedaje') || q.includes('hotel') || q.includes('dormir') || q.includes('quedarme') || q.includes('habitacion') || q.includes('habitación');
    const asksMasApartado = q.includes('dar mas') || q.includes('dar más') || q.includes('mas de apartado') || q.includes('más de apartado') || q.includes('liquidar') || q.includes('pagar completo') || q.includes('pagar todo') || q.includes('abonar') || q.includes('anticipo mayor');
    const asksHorariosLlegada = q.includes('tres de la tarde') || q.includes('3 de la tarde') || q.includes('3 pm') || q.includes('3:00') || q.includes('llegar tarde') || q.includes('llegar a las') || q.includes('punto de reunion') || q.includes('punto de reunión') || q.includes('hora de salida');
    const asksCancelacion = q.includes('si no voy') || q.includes('cancelar') || q.includes('cancelo') || q.includes('a la mera hora') || q.includes('devuelven el dinero') || q.includes('politica de cancelacion') || q.includes('no-show');

    // Si el usuario hace una combinación de dudas logísticas comunes:
    if ((asksHospedaje ? 1 : 0) + (asksMasApartado ? 1 : 0) + (asksHorariosLlegada ? 1 : 0) >= 2) {
        let resp = `✨ ¡Hola! Con gusto resuelvo tus dudas punto por punto:\n\n`;
        let count = 1;
        if (asksHospedaje) {
            resp += `${count}. **¿Incluye hospedaje?**: Para nuestras salidas de día o noche como **Xochimilco La Llorona** y **Conciertos CDMX**, no se requiere hospedaje porque son **viajes redondos el mismo día** (salimos en la tarde y regresamos a Puebla al terminar el evento de madrugada). Para circuitos de varios días (Oaxaca, Chiapas o circuitos VIP fraVEO), el hotel 4 o 5 estrellas sí está incluido al 100%.\n\n`;
            count++;
        }
        if (asksMasApartado) {
            resp += `${count}. **¿Puedes dar más de apartado?**: ¡Claro que sí! Los **$200 MXN** son únicamente el anticipo mínimo para asegurar tu asiento en la unidad ejecutiva. Puedes apartar con $500, $1,000 o liquidar la totalidad de tu viaje desde el inicio si lo prefieres (vía transferencia SPEI, OXXO o tarjeta).\n\n`;
            count++;
        }
        if (asksHorariosLlegada) {
            resp += `${count}. **¿Puedes llegar a las 3:00 PM al punto de reunión?**: No es recomendable. La salida oficial desde **Calle Río Nexapa #6101 en San Manuel** para Xochimilco es a las **14:00 hrs puntuales** para llegar con suficiente tiempo antes del anochecer y abordar la trajinera sin filas. Si llegas a las 3:00 PM la camioneta ya estará en la autopista rumbo a CDMX. Te citamos a las 13:45 hrs para abordar con calma.\n\n`;
            count++;
        }
        resp += `¿Te gustaría apartar tus asientos para la próxima fecha disponible?`;
        return resp;
    }

    // 2. ARTISTAS ESPECÍFICOS Y CARTELERA CDMX
    if (q.includes('veronica castro') || q.includes('verónica castro')) {
        return `🎭 ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nActualmente **Verónica Castro** no tiene presentaciones de teatro ni conciertos confirmados en la cartelera oficial de CDMX (se encuentra retirada temporalmente de los escenarios y giras).\n\nSin embargo, en cuanto se anuncie cualquier obra, homenaje o gala en recintos de CDMX (como Bellas Artes o Teatro de los Insurgentes), contaremos con **salida ejecutiva redonda** desde San Manuel, Puebla.\n¿Te gustaría consultar por alguna otra obra de teatro o concierto en CDMX?`;
    }

    if (q.includes('luis miguel') || q.includes('luismiguel') || q.includes('el sol')) {
        return `☀️ ¡Hola! Soy **Alma** de *La Ruta del Águila*.\nActualmente en la cartelera oficial de recintos CDMX (Arena CDMX, Estadio GNP, Auditorio Nacional) no hay fechas próximas confirmadas para Luis Miguel (sus fechas recientes en Arena CDMX ya concluyeron con lleno total).\n\nSin embargo, en cuanto se anuncie una nueva fecha o preventa, organizaremos **transporte ejecutivo redondo** desde San Manuel, Puebla (tarifa redonda desde **$549 MXN** con seguro y chofer sobrio que te espera hasta que termina el concierto).\nApartas tu lugar con solo **$200 MXN**. ¿Te gustaría que te avisemos en cuanto se confirme una nueva fecha?`;
    }

    if (q.includes('shakira') || q.includes('chayanne') || q.includes('temerarios') || q.includes('morat') || q.includes('paul mccartney') || q.includes('bruno mars')) {
        return `🎶 ¡Hola! Soy **Alma**. Para los grandes conciertos en el **Estadio GNP Seguros (Foro Sol)** y **Arena CDMX**:\n- Contamos con salida ejecutiva directa desde San Manuel, Puebla (tarifa redonda desde **$549 MXN**).\n- Te dejamos en la puerta del recinto y nuestra unidad te espera al terminar para que regreses seguro a Puebla la misma noche.\n- Apartas tu asiento con solo **$200 MXN** (100% reembolsable si no se cubre cupo).\n¿Para qué fecha o artista deseas apartar tus lugares?`;
    }

    // 3. LOGÍSTICA DE VIAJES PARTICULARES (Citas médicas, compras, trámites)
    if (q.includes('hospital') || q.includes('medica') || q.includes('médica') || q.includes('doctor') || q.includes('nutricion') || q.includes('nutrición') || q.includes('compras') || q.includes('particular') || q.includes('privado') || q.includes('renta con chofer') || q.includes('aeropuerto') || q.includes('aifa') || q.includes('aicm') || q.includes('visa') || q.includes('embajada')) {
        return `🚗 ¡Hola! Soy **Alma**. Contamos con **Servicio de Transporte Privado y Puerta a Puerta**:\n- **Vehículo a tu medida**: Auto sedán compacto (1 a 3 personas) o camioneta ejecutiva (4 a 6+ personas).\n- **Servicios frecuentes**: Citas médicas de alta especialidad en CDMX (Nutrición, Médica Sur, ABC), compras mayoristas de negocios, trámites de visa/embajada y traslados a aeropuertos (AICM/AIFA).\n- Chofer profesional que te recoge en tu domicilio en Puebla, te espera en tus citas y te regresa con total privacidad y confort.\n¿Qué fecha y destino particular requieres cotizar?`;
    }

    // 4. POLÍTICAS DE CANCELACIÓN Y NO-SHOW
    if (asksCancelacion) {
        return `🛡️ ¡Hola! Soy **Alma**. Te explico con total transparencia nuestras **Políticas de Apartado y Cancelación**:\n1. **Reembolso 100% Garantizado**: Si la agencia cancela la salida por no cubrir el cupo mínimo requerido 48 horas antes, se te devuelve el 100% de tu dinero de inmediato.\n2. **Cancelación del cliente de última hora (No-Show)**: Si faltando poco tiempo para salir decides no viajar, no hay reembolso porque el asiento fue reservado exclusivamente para ti y los boletos/casetas ya están cubiertos; sin embargo, **puedes transferir tu lugar a cualquier amigo o familiar** sin ningún costo extra.\n3. **El viaje no se cancela para los demás**: Si uno o dos pasajeros cancelan a la mera hora pero el viaje ya fue confirmado, la salida opera con normalidad para los demás pasajeros puntuales.\n¿Tienes alguna duda sobre alguna salida específica?`;
    }

    // 5. DESTINOS CONFIRMADOS
    if (q.includes('xochimilco') || q.includes('llorona') || q.includes('trajinera') || q.includes('muertos')) {
        return `🎭 ¡Hola! Soy **Alma**. Nuestra salida confirmada a **La Llorona en Xochimilco (Cuemanco)** opera los fines de semana de Octubre y Noviembre (Temporada Día de Muertos):\n- **Paquete Completo**: **$1,350 MXN** (incluye transporte ejecutivo redondo desde San Manuel, paseo en trajinera iluminada y boleto para la obra teatral en vivo en el islote).\n- *Opción solo transporte redondo*: $650 MXN (si ya tienes tu boleto).\n- Horario: Salida 14:00 hrs desde San Manuel, regreso aprox. 00:30 hrs (no requiere hospedaje).\n- Apartas con solo **$200 MXN** (puedes dar más si lo deseas). ¿Para cuántas personas requieres lugar?`;
    }

    if (q.includes('expo') || q.includes('beauty') || q.includes('ebs') || q.includes('citibanamex')) {
        return `💄 ¡Hola! Soy **Alma**. Tenemos salida ejecutiva directa a la **Expo Beauty Show (EBS 2026)** en Centro Citibanamex (24 al 26 Octubre 2026):\n- Tarifa Redonda: **$790 MXN** (promoción especial para estilistas y profesionales).\n- **Incluye boleto oficial de acceso** a salas B, C y D, transporte redondo en van ejecutiva con seguro y casetas (07:30 a 19:45 hrs).\n- Aparta con solo **$200 MXN**. ¿Para cuántos estilistas o acompañantes deseas apartar?`;
    }

    if (q.includes('estetica') || q.includes('estética') || q.includes('salon') || q.includes('salón') || q.includes('cabello') || q.includes('corte') || q.includes('cupon') || q.includes('cupón') || q.includes('descuento')) {
        return `🌸 ¡Hola! Soy **Alma**. Nuestro salón hermano **Estética Alma** se ubica en Río Nexapa 6101, San Manuel:\n- Servicios: Cortes de vanguardia, colorimetría, keratina brasileña y manicure.\n- 🎁 **Promoción Exclusiva**: Si te atiendes en el salón, usa el cupón **ESTETICA10** para obtener **10% de descuento directo** en cualquiera de nuestras salidas y excursiones de viaje.\n- Puedes agendar tu cita al **222 801 6244** o visitar [Estética Alma](estetica.html).`;
    }

    if (q.includes('concierto') || q.includes('foro sol') || q.includes('gnp') || q.includes('karol') || q.includes('estadio') || q.includes('f1') || q.includes('cisne') || q.includes('chapultepec') || q.includes('nfl') || q.includes('arena') || q.includes('auditorio')) {
        return `🎶 ¡Hola! Soy **Alma**. Contamos con **Transporte Seguro a Conciertos y Eventos en CDMX** con salida y regreso directo a San Manuel:\n- Tarifa Redonda: desde **$549 MXN** (Karol G $549, Cisne Negro Chapultepec $690, NFL $750).\n- Te dejamos en la puerta del recinto y nuestra unidad te espera hasta que termina el evento para que regreses tranquilo y seguro de noche.\n- Aparta tu lugar con solo **$200 MXN** (100% reembolsable si no se cubre cupo).\n¿A qué evento te gustaría asistir?`;
    }

    if (q.includes('taxco') || q.includes('cacahuamilpa') || q.includes('grutas') || q.includes('tolantongo') || q.includes('zacatlan') || q.includes('cuetzalan') || q.includes('excursion') || q.includes('excursión') || q.includes('nacional') || q.includes('pueblo')) {
        return `🌿 ¡Hola! Soy **Alma**. Nuestras excursiones familiares y de descanso incluyen:\n- **Grutas de Tolantongo**: $790 MXN (pozas termales a 36°C, túnel de vapor y río turquesa).\n- **Grutas de Cacahuamilpa & Taxco**: $1,160 MXN (17 Octubre 2026, platería virreinal).\n- **Zacatlán & Chignahuapan**: $650 MXN (mirador de cristal, esferas y sidra).\n- **Cuetzalan del Progreso**: $820 MXN (cascadas, voladores y café de altura).\n- **Bahías de Acapulco**: $980 MXN (escapada de fin de semana).\nTodas salen desde Río Nexapa 6101, San Manuel y apartas con **$200 MXN**. ¿Cuál te llama más la atención?`;
    }

    if (q.includes('vip') || q.includes('internacional') || q.includes('europa') || q.includes('inglaterra') || q.includes('asia') || q.includes('fraveo') || q.includes('lujo') || q.includes('safari') || q.includes('kenia') || q.includes('tailandia')) {
        return `👑 ¡Hola! Soy **Alma**. A través de nuestra franquicia autorizada **fraVEO** operamos circuitos internacionales de alta gama:\n- **Inglaterra al Completo 2026**: desde $1,909 USD (8 días: Londres, Stonehenge, Bath, Oxford).\n- **Guatemala al Completo**: $1,300 USD (Antigua colonial y Lago Atitlán).\n- **Vietnam y Camboya**: $2,265 USD (Bahía de Halong y templos de Angkor Wat).\n- **Tailandia 2027**: $1,432 USD (Bangkok, Chiang Mai y playas exóticas).\n- **Kenia Safari Masai Mara**: $2,135 USD (Lago Nakuru y vida salvaje).\n- **El Clásico Real Madrid vs Barcelona + Europa**: $5,790 USD.\nTodos incluyen vuelos, hoteles 4-5 estrellas y concierge privado. ¿Qué destino internacional sueñas visitar?`;
    }

    if (q.includes('apartar') || q.includes('pago') || q.includes('precio') || q.includes('costo') || q.includes('200') || q.includes('spei') || q.includes('oxxo')) {
        return `🛡️ ¡Hola! Soy **Alma**. En *La Ruta del Águila* tu dinero está protegido:\n- **Apartado Mínimo**: Apartas tu asiento con solo **$200 MXN**.\n- **Garantía 100% Reembolsable**: Si no se cubre el cupo mínimo requerido 48 horas antes de la salida, te devolvemos el 100% de tu dinero de inmediato.\n- **Métodos de Pago**: Transferencia SPEI (BBVA), depósito en cualquier tienda OXXO o tarjeta en línea.\n- Si gustas apartar ahora, contáctame al **222 801 6244** o selecciona tu asiento en la pantalla.`;
    }

    return `🦅 ¡Hola! Soy **Alma**, tu asesora de viajes en *La Ruta del Águila* (San Manuel, Puebla).\nTenemos 3 opciones preparadas para ti:\n1. **Conciertos y Eventos CDMX** con retorno seguro nocturno (desde $549 MXN).\n2. **Excursiones Nacionales** para descansar en familia (Tolantongo, Taxco, Zacatlán, Cuetzalan).\n3. **Destinos VIP Internacionales** (Europa, Asia, África con fraVEO).\n4. **Servicio Privado Puerta a Puerta** para citas médicas, compras o trámites.\nApartas cualquier viaje con solo **$200 MXN**. Además, si eres cliente de *Estética Alma*, tienes 10% con el cupón **ESTETICA10**. ¿Qué tipo de viaje estás planeando?`;
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
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* --- TECLA ESCAPE Y CLIC AFUERA PARA CERRAR MODALES Y CHAT --- */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeAllModals();
    }
});

// Cerrar chat y buscador en vivo al hacer clic afuera (sin borrar la conversación)
document.addEventListener('click', (e) => {
    const aiWin = document.getElementById('ai-chat-window');
    const aiOrb = document.querySelector('.ai-orb-trigger');
    const navAiBtn = document.querySelector('.btn-nav-ai');

    if (aiWin && aiWin.classList.contains('active')) {
        if (!aiWin.contains(e.target) && (!aiOrb || !aiOrb.contains(e.target)) && (!navAiBtn || !navAiBtn.contains(e.target))) {
            aiWin.classList.remove('active');
        }
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
        msg.innerHTML = `✅ ¡Cupón <strong>${code}</strong> aplicado! 10% de descuento en tu viaje.`;
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

