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
        card.onclick = () => {
            if (idx !== currentCoverflowIndex) {
                goToCoverflowIndex(idx);
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
        window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
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
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

/* =========================================================================
   5. SIMULADOR DE RUTA SATELITAL 3D (VISTA AÉREA Y ALTIMETRÍA)
   ========================================================================= */

function openRutaSatelital3D(destId) {
    const dest = DESTINOS_DB.find(d => d.id === destId);
    if (!dest) return;
    activeDestino = dest;

    const modal = document.getElementById('simulador-satelital-modal') || document.getElementById('modo-dios-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const titleEl = document.getElementById('simulador-satelital-title') || document.getElementById('modo-dios-title');
    if (titleEl) titleEl.innerText = `🛰️ Simulador de Ruta Satelital 3D: ${dest.nombre}`;

    const statusEl = document.getElementById('simulador-satelital-status') || document.getElementById('modo-dios-status');
    if (statusEl) statusEl.innerText = `Ruta Puebla -> ${dest.estado} (${dest.distancia} • ${dest.tiempo_traslado})`;

    // Rellenar barra de Altimetría
    const altRibbon = document.getElementById('simulador-altimetria-ribbon');
    if (altRibbon && dest.ruta_puntos) {
        altRibbon.innerHTML = dest.ruta_puntos.map(p => `
            <div class="altimetria-stop">
                <span>📍 ${p.nombre}</span>
                <span class="altimetria-badge">${p.altitud || '2,200 m'}</span>
            </div>
        `).join('<span style="color:#475569;">➔</span>');
    }

    const cesiumCanvas = document.getElementById('simulador-cesium-canvas');
    const leafletCanvas = document.getElementById('simulador-satelital-canvas');
    const toggleBtn = document.getElementById('btn-toggle-engine');

    // Por defecto inicializar en Modo Globo 3D Cesium (Motor Alejavi Rivera / Bilawal Sidhu)
    if (currentMapEngine === 'cesium' && typeof Cesium !== 'undefined') {
        if (cesiumCanvas) cesiumCanvas.style.display = 'block';
        if (leafletCanvas) leafletCanvas.style.display = 'none';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-map"></i> 🗺️ Cambiar a Mapa Satelital 2D (Leaflet)';
            toggleBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
        }
        setTimeout(() => {
            initCesium3DGlobe(dest);
        }, 220);
    } else {
        if (cesiumCanvas) cesiumCanvas.style.display = 'none';
        if (leafletCanvas) leafletCanvas.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-globe-americas"></i> 🌍 Cambiar a Globo 3D Cesium (Orbital)';
            toggleBtn.style.background = 'linear-gradient(135deg, #7c3aed, #4f46e5)';
        }
        setTimeout(() => {
            initRutaSatelitalMap(dest);
        }, 220);
    }
}

// Alias de compatibilidad
function openModoDios3D(destId) {
    openRutaSatelital3D(destId);
}

function closeRutaSatelital3D() {
    const modal = document.getElementById('simulador-satelital-modal') || document.getElementById('modo-dios-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModoDios3D() {
    closeRutaSatelital3D();
}

/* =========================================================================
   5A. MOTOR GLOBO 3D CESIUMJS (God's Eye View / Alejavi Rivera Architecture)
   ========================================================================= */

async function initCesium3DGlobe(dest) {
    const cesiumContainer = document.getElementById('simulador-cesium-canvas');
    if (!cesiumContainer || typeof Cesium === 'undefined') {
        toggleMapEngineToLeaflet(dest);
        return;
    }

    if (!cesiumViewer) {
        try {
            // Proveedor satelital ESRI ArcGIS World Imagery de alta resolución
            let imageryProvider = null;
            if (Cesium.ArcGisMapServerImageryProvider && Cesium.ArcGisMapServerImageryProvider.fromUrl) {
                try {
                    imageryProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
                        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
                        { enablePickFeatures: false }
                    );
                } catch (e) {
                    imageryProvider = null;
                }
            }

            cesiumViewer = new Cesium.Viewer('simulador-cesium-canvas', {
                imageryProvider: imageryProvider || undefined,
                baseLayerPicker: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                navigationHelpButton: false,
                sceneModePicker: false,
                timeline: false,
                animation: false,
                fullscreenButton: false,
                selectionIndicator: false,
                skyAtmosphere: new Cesium.SkyAtmosphere()
            });

            cesiumViewer.scene.globe.enableLighting = true;
            cesiumViewer.scene.globe.depthTestAgainstTerrain = false;
        } catch (err) {
            console.warn("Cesium setup fallback:", err);
            if (!cesiumViewer) {
                try {
                    cesiumViewer = new Cesium.Viewer('simulador-cesium-canvas', {
                        baseLayerPicker: false,
                        geocoder: false,
                        homeButton: false,
                        infoBox: false,
                        timeline: false,
                        animation: false
                    });
                } catch (e2) {
                    toggleMapEngineToLeaflet(dest);
                    return;
                }
            }
        }
    }

    if (!cesiumViewer) return;

    // Limpiar entidades anteriores
    cesiumViewer.entities.removeAll();

    const points = dest.ruta_puntos || [
        { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
        { nombre: dest.nombre, lat: dest.coordenadas.lat, lng: dest.coordenadas.lng, altitud: "2,240 m" }
    ];

    // Preparar posiciones 3D (longitud, latitud, elevación)
    const positions = [];
    points.forEach((p, idx) => {
        const altNum = parseInt(p.altitud ? p.altitud.replace(/[^0-9]/g, '') : '2200', 10) || 2200;
        positions.push(p.lng, p.lat, altNum + 200);

        const isStart = idx === 0;
        const isEnd = idx === points.length - 1;
        const pinColor = isStart
            ? Cesium.Color.fromCssColorString('#10b981')
            : isEnd
            ? Cesium.Color.fromCssColorString('#ef4444')
            : Cesium.Color.fromCssColorString('#f59e0b');

        cesiumViewer.entities.add({
            name: p.nombre,
            position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat, altNum + 350),
            point: {
                pixelSize: 14,
                color: pinColor,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3
            },
            label: {
                text: `${p.nombre}\n(${p.altitud || '2,200 m'})`,
                font: '13px Outfit, sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -18)
            }
        });
    });

    // Trazado 3D Resplandeciente Neón Cian (PolylineGlow)
    cesiumViewer.entities.add({
        name: `Ruta ${dest.nombre}`,
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
            width: 7,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.35,
                taperPower: 0.8,
                color: Cesium.Color.fromCssColorString('#38bdf8')
            })
        }
    });

    // Calcular centro y encuadrar cámara con vista cinematográfica inclinada 3D (Pitch -36 grados)
    const centerLat = (points[0].lat + points[points.length - 1].lat) / 2;
    const centerLng = (points[0].lng + points[points.length - 1].lng) / 2;
    const distKm = parseFloat(dest.distancia ? dest.distancia.replace(/[^0-9.]/g, '') : '140') || 140;
    const cameraAlt = Math.max(distKm * 2100, 160000);

    cesiumViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat - 0.32, cameraAlt),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-36.0),
            roll: 0.0
        },
        duration: 2.2
    });
}

function toggleMapEngine() {
    const cesiumCanvas = document.getElementById('simulador-cesium-canvas');
    const leafletCanvas = document.getElementById('simulador-satelital-canvas');
    const toggleBtn = document.getElementById('btn-toggle-engine');

    if (currentMapEngine === 'cesium') {
        currentMapEngine = 'leaflet';
        if (cesiumCanvas) cesiumCanvas.style.display = 'none';
        if (leafletCanvas) leafletCanvas.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-globe-americas"></i> 🌍 Cambiar a Globo 3D Cesium (Orbital)';
            toggleBtn.style.background = 'linear-gradient(135deg, #7c3aed, #4f46e5)';
        }
        if (activeDestino) {
            initRutaSatelitalMap(activeDestino);
        }
    } else {
        currentMapEngine = 'cesium';
        if (leafletCanvas) leafletCanvas.style.display = 'none';
        if (cesiumCanvas) cesiumCanvas.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-map"></i> 🗺️ Cambiar a Mapa Satelital 2D (Leaflet)';
            toggleBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
        }
        if (activeDestino) {
            initCesium3DGlobe(activeDestino);
        }
    }
}

function toggleMapEngineToLeaflet(dest) {
    currentMapEngine = 'leaflet';
    const cesiumCanvas = document.getElementById('simulador-cesium-canvas');
    const leafletCanvas = document.getElementById('simulador-satelital-canvas');
    const toggleBtn = document.getElementById('btn-toggle-engine');
    if (cesiumCanvas) cesiumCanvas.style.display = 'none';
    if (leafletCanvas) leafletCanvas.style.display = 'block';
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-globe-americas"></i> 🌍 Cambiar a Globo 3D Cesium (Orbital)';
        toggleBtn.style.background = 'linear-gradient(135deg, #7c3aed, #4f46e5)';
    }
    initRutaSatelitalMap(dest);
}

/* =========================================================================
   5B. MOTOR MAPA SATELITAL LEAFLET 2D HD (Relieve y Trayecto)
   ========================================================================= */

function initRutaSatelitalMap(dest) {
    const containerId = document.getElementById('simulador-satelital-canvas') ? 'simulador-satelital-canvas' : 'modo-dios-canvas-container';
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;

    if (!leafletMapInstance) {
        leafletMapInstance = L.map(containerId, {
            zoomControl: true,
            attributionControl: false
        }).setView([19.0186, -98.1963], 8);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        }).addTo(leafletMapInstance);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        }).addTo(leafletMapInstance);
    } else {
        leafletMapInstance.invalidateSize();
    }

    if (mapMarkers.length) {
        mapMarkers.forEach(m => leafletMapInstance.removeLayer(m));
        mapMarkers = [];
    }
    if (mapRoutePolyline) {
        leafletMapInstance.removeLayer(mapRoutePolyline);
    }
    if (mapRouteGlow) {
        leafletMapInstance.removeLayer(mapRouteGlow);
    }

    const latlngs = dest.ruta_puntos.map(p => [p.lat, p.lng]);

    mapRouteGlow = L.polyline(latlngs, {
        color: '#0284c7',
        weight: 9,
        opacity: 0.5,
        lineCap: 'round'
    }).addTo(leafletMapInstance);

    mapRoutePolyline = L.polyline(latlngs, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round'
    }).addTo(leafletMapInstance);

    dest.ruta_puntos.forEach((p, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === dest.ruta_puntos.length - 1;
        const color = isStart ? '#10b981' : isEnd ? '#ef4444' : '#f59e0b';

        const customIcon = L.divIcon({
            className: 'satelital-custom-pin',
            html: `<div style="background:${color}; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 14px ${color};"></div>`,
            iconSize: [22, 22]
        });

        const marker = L.marker([p.lat, p.lng], { icon: customIcon })
            .bindPopup(`
                <div style="font-family:'Outfit', sans-serif;">
                    <strong style="color:#0f172a; font-size:0.95rem;">${p.nombre}</strong><br>
                    <span style="font-size:0.8rem; color:#0284c7; font-weight:700;">⛰️ Altitud: ${p.altitud || '2,200 m'}</span><br>
                    <span style="font-size:0.75rem; color:#64748b;">Parada #${idx + 1} del trayecto</span>
                </div>
            `)
            .addTo(leafletMapInstance);

        mapMarkers.push(marker);
    });

    leafletMapInstance.fitBounds(mapRoutePolyline.getBounds(), { padding: [50, 50] });
}

function flyOverRoute3D() {
    if (!activeDestino) return;

    if (currentMapEngine === 'cesium' && cesiumViewer) {
        const points = activeDestino.ruta_puntos || [];
        if (points.length === 0) return;

        let step = 0;
        function flyNextCesium() {
            if (step >= points.length) return;
            const p = points[step];
            const altNum = parseInt(p.altitud ? p.altitud.replace(/[^0-9]/g, '') : '2200', 10) || 2200;

            cesiumViewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(p.lng, p.lat - 0.04, altNum + 3500),
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-32.0),
                    roll: 0.0
                },
                duration: 2.2,
                complete: () => {
                    step++;
                    setTimeout(flyNextCesium, 700);
                }
            });
        }
        flyNextCesium();
    } else if (leafletMapInstance) {
        const points = activeDestino.ruta_puntos;
        let step = 0;
        const interval = setInterval(() => {
            if (step >= points.length) {
                clearInterval(interval);
                return;
            }
            const p = points[step];
            leafletMapInstance.flyTo([p.lat, p.lng], 13, { duration: 1.8, easeLinearity: 0.25 });
            if (mapMarkers[step]) mapMarkers[step].openPopup();
            step++;
        }, 2400);
    }
}


/* =========================================================================
   4. ASISTENTE IA DE VIAJES (KÚUL ENGINE CON GEMINI)
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
        // Enviar a Gemini API
        const responseText = await callGeminiAgent(msg);
        removeTypingIndicator(typingId);
        appendChatMessage('assistant', responseText);
    } catch (err) {
        console.warn("Fallo en Gemini API, usando motor de respuesta local KÚUL:", err);
        removeTypingIndicator(typingId);
        const fallbackAnswer = generateLocalKuulResponse(msg);
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
    div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span> Analizando destinos...`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function callGeminiAgent(userQuestion) {
    const systemPrompt = `Eres KÚUL, el Asistente Inteligente de Viajes de 'Viajes Alma & Vromlix Multi-Hub' en Jardines de San Manuel, Puebla.
Tu objetivo es asesorar a los clientes, recomendar el destino perfecto, dar precios exactos y animarlos a apartar lugares.
Base de Datos de Paquetes y Salidas Disponibles:
1. CDMX Express VIP (Suzuki Ertiga 6 pax): $449 MXN redondo diario. Salida 06:30 AM desde San Manuel, regreso 18:30 hrs.
2. Conciertos Foro Sol / Estadio GNP / Palacio de los Deportes CDMX: $549 MXN redondo. Te dejamos en la puerta y te esperamos al terminar.
3. Cuetzalan Mágico (Cascadas y café totonaca tradicional): $799 MXN redondo.
4. Zacatlán & Chignahuapan (Barranca de los Jilgueros y esferas): $749 MXN redondo.
5. Oaxaca Mágico (Hierve el Agua y Tule): $1,899 MXN (2 días / 1 noche).
6. Ruta Biocultural del Cacao Tabasco (Haciendas y Chocolateras): $3,499 MXN (3 días / 2 noches).
Servicio extra: Estética Alma en San Manuel (al agendar cualquier servicio de estética obtienes 10% de descuento en tus viajes).
Instrucciones: Responde siempre de forma amable, entusiasta, concisa, profesional y en español mexicano. Siempre invita a apartar sus asientos por WhatsApp o en la plataforma.`;

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

function generateLocalKuulResponse(question) {
    const q = question.toLowerCase();

    if (q.includes('concierto') || q.includes('foro sol') || q.includes('gnp') || q.includes('estadio')) {
        return `🎶 ¡Claro que sí! Contamos con **Transporte Seguro a Conciertos en CDMX** (Estadio GNP / Foro Sol / Palacio de los Deportes).
- Tarifa Redonda: **$549 MXN**.
- Salida desde San Manuel, Puebla.
- Te dejamos en la puerta y el vehículo te espera hasta que finalice el evento.
¿Te gustaría apartar tus lugares con $500 MXN para tu evento?`;
    }

    if (q.includes('cuetzalan') || q.includes('cascada') || q.includes('café') || q.includes('naturaleza')) {
        return `🌿 Te recomendamos nuestra excursión a **Cuetzalan del Progreso**:
- Tarifa Redonda: **$799 MXN** por persona.
- Incluye: Transporte ejecutivo, entrada a la Cascada Las Brisas y cata de café artesanal totonaca.
- Salida 06:00 AM desde San Manuel.
¿Deseas apartar tus asientos en la camioneta?`;
    }

    if (q.includes('barato') || q.includes('presupuesto') || q.includes('menor') || q.includes('1000') || q.includes('500')) {
        return `💰 Para un presupuesto accesible te recomiendo:
1. **CDMX Express VIP en Suzuki Ertiga**: **$449 MXN** redondo diario.
2. **Conciertos CDMX**: **$549 MXN** redondo.
3. **Zacatlán & Chignahuapan**: **$749 MXN** día completo.
¡Además, si agendas un corte o tratamiento en Estética Alma, recibes un 10% de descuento adicional!`;
    }

    if (q.includes('ertiga') || q.includes('camioneta') || q.includes('asiento') || q.includes('vehiculo')) {
        return `🚗 Nuestro servicio VIP en **Suzuki Ertiga 2022** es exclusivo para **máximo 6 pasajeros**.
Viajas con clima, asientos independientes ergonómicos y cargadores USB. Puedes seleccionar tus asientos específicos en la maqueta interactiva del inicio. Tarifa desde **$449 MXN**.`;
    }

    return `✈️ ¡Hola! Soy **KÚUL**, tu asesor de viajes en San Manuel, Puebla.
Tenemos salidas ejecutivas diarias a CDMX ($449 MXN), transporte a conciertos masivos ($549 MXN), Pueblos Mágicos como Cuetzalan y Zacatlán ($749-$799 MXN) y tours de fin de semana a Oaxaca y Tabasco.
¿Para cuántas personas buscas viajar o qué tipo de experiencia tienes en mente?`;
}

function setupMotionUI() {
    // Escuchar scroll para micro-interacciones suaves
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
