/**
 * CDMX Events & Venue Pricing Intelligence Engine
 * Agencia: Viajes La Ruta del Águila (Alma Luis)
 * Salidas directas desde: Río Nexapa 6101, Jardines de San Manuel, Puebla
 * Teléfono / WhatsApp: 222 801 6244
 * 
 * Centraliza recintos clave de la CDMX, cálculo de precios por persona con retorno nocturno,
 * e integración de eventos con fechas ISO para poda automática nocturna de eventos pasados.
 */

const RECINTOS_CDMX = {
    "foro-sol": {
        id: "foro-sol",
        nombre: "Estadio GNP Seguros / Foro Sol",
        zona: "Iztacalco / Magdalena Mixhuca",
        distancia_km: 128,
        tiempo_traslado: "1.8 hrs",
        precio_redondo: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4063, lng: -99.0927 },
        tipo_itinerario: "concierto_noche"
    },
    "palacio-deportes": {
        id: "palacio-deportes",
        nombre: "Palacio de los Deportes",
        zona: "Iztacalco",
        distancia_km: 129,
        tiempo_traslado: "1.8 hrs",
        precio_redondo: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4038, lng: -99.1008 },
        tipo_itinerario: "concierto_noche"
    },
    "auditorio-nacional": {
        id: "auditorio-nacional",
        nombre: "Auditorio Nacional",
        zona: "Paseo de la Reforma / Chapultepec",
        distancia_km: 138,
        tiempo_traslado: "2.1 hrs",
        precio_redondo: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4259, lng: -99.1917 },
        tipo_itinerario: "concierto_tarde"
    },
    "estadio-azteca": {
        id: "estadio-azteca",
        nombre: "Estadio Azteca / Estadio Ciudad de los Deportes",
        zona: "Sur CDMX / Nápoles",
        distancia_km: 136,
        tiempo_traslado: "2.2 hrs",
        precio_redondo: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.3029, lng: -99.1505 },
        tipo_itinerario: "partido_evento"
    },
    "centro-citibanamex": {
        id: "centro-citibanamex",
        nombre: "Centro Citibanamex (Expos & Congresos)",
        zona: "Lomas de Sotelo / Hipódromo",
        distancia_km: 145,
        tiempo_traslado: "2.3 hrs",
        precio_redondo: 499,
        precio_texto: "$499 MXN",
        coords: { lat: 19.4389, lng: -99.2227 },
        tipo_itinerario: "expo_corporativa"
    },
    "arena-cdmx": {
        id: "arena-cdmx",
        nombre: "Arena CDMX",
        zona: "Azcapotzalco / Ferrería",
        distancia_km: 148,
        tiempo_traslado: "2.4 hrs",
        precio_redondo: 590,
        precio_texto: "$590 MXN",
        coords: { lat: 19.4975, lng: -99.1764 },
        tipo_itinerario: "concierto_noche"
    }
};

/**
 * Generador automático de itinerarios hora por hora según recinto y tipo de evento
 */
function generarItinerarioAutomatico(tipo, nombreEvento, nombreRecinto) {
    if (tipo === "concierto_noche") {
        return [
            { hora: "01:30 PM", actividad: "Cita y abordaje en Río Nexapa 6101, San Manuel, Puebla." },
            { hora: "02:00 PM", actividad: "Salida puntual hacia CDMX con clima y música." },
            { hora: "04:30 PM", actividad: `Llegada directa a ${nombreRecinto} (sin filas de estacionamiento).` },
            { hora: "05:00 PM", actividad: "Tiempo libre para mercancía oficial, alimentos y acceso." },
            { hora: "08:30 PM", actividad: `Inicio del concierto: ${nombreEvento}.` },
            { hora: "11:30 PM", actividad: "Punto de encuentro seguro en la unidad con el chofer inmediatamente al terminar." },
            { hora: "12:15 AM", actividad: "Salida directa de regreso a Puebla." },
            { hora: "02:30 AM", actividad: "Arribo seguro a San Manuel, Puebla." }
        ];
    } else if (tipo === "expo_corporativa") {
        return [
            { hora: "06:30 AM", actividad: "Salida ejecutiva puntual desde San Manuel, Puebla." },
            { hora: "09:00 AM", actividad: `Llegada a ${nombreRecinto} antes de la apertura de puertas.` },
            { hora: "09:30 AM - 16:30 PM", actividad: `Recorrido de negocios y conferencias en ${nombreEvento}.` },
            { hora: "17:00 PM", actividad: "Punto de reunión en estacionamiento asignado." },
            { hora: "17:30 PM", actividad: "Retorno hacia Puebla." },
            { hora: "19:45 PM", actividad: "Llegada segura a San Manuel." }
        ];
    } else {
        return [
            { hora: "11:00 AM", actividad: "Salida desde San Manuel, Puebla." },
            { hora: "01:30 PM", actividad: `Llegada a ${nombreRecinto}.` },
            { hora: "02:00 PM - 18:30 PM", actividad: `Disfrute del evento: ${nombreEvento}.` },
            { hora: "19:00 PM", actividad: "Retorno a Puebla." },
            { hora: "21:30 PM", actividad: "Arribo a San Manuel." }
        ];
    }
}

/**
 * Catálogo Maestro de Eventos CDMX con fechas ISO para Poda Automática
 */
const EVENTOS_CDMX_MAESTRO = [
    {
        id: "karol-g-estadio-gnp",
        nombreEvento: "Karol G: Concierto Estadio GNP Seguros",
        fecha: "13 Noviembre 2026",
        fecha_iso: "2026-11-13",
        recintoKey: "foro-sol",
        imagen: "img/IMG-20260926-WA0009.jpg",
        badge: "Estadio GNP CDMX",
        precio_texto: "$549 MXN"
    },
    {
        id: "cisne-negro-chapultepec",
        nombreEvento: "El Cisne Negro en Castillo Chapultepec",
        fecha: "7 Nov - 6 Dic 2026",
        fecha_iso: "2026-12-06",
        recintoKey: "auditorio-nacional",
        imagen: "img/IMG-20260926-WA0013.jpg",
        badge: "Chapultepec CDMX",
        precio_texto: "$690 MXN"
    },
    {
        id: "nfl-mexico-estadio-banorte",
        nombreEvento: "NFL en México: 49ers vs Vikings",
        fecha: "22 Noviembre 2026",
        fecha_iso: "2026-11-22",
        recintoKey: "estadio-azteca",
        imagen: "img/IMG-20260926-WA0016.jpg",
        badge: "Estadio Banorte CDMX",
        precio_texto: "$690 MXN"
    },
    {
        id: "f1-gp-mexico-2026",
        nombreEvento: "Fórmula 1: GP de México 2026",
        fecha: "30 Oct - 1 Nov 2026",
        fecha_iso: "2026-11-01",
        recintoKey: "foro-sol",
        imagen: "img/IMG-20260926-WA0017.jpg",
        badge: "Autódromo Hnos. R.",
        precio_texto: "$750 MXN"
    },
    {
        id: "america-vs-monterrey-cdmx",
        nombreEvento: "Club América vs Monterrey",
        fecha: "28 Octubre 2026",
        fecha_iso: "2026-10-28",
        recintoKey: "estadio-azteca",
        imagen: "img/IMG-20260926-WA0010.jpg",
        badge: "Liga MX",
        precio_texto: "$549 MXN"
    },
    {
        id: "expo-beauty-show-citibanamex",
        nombreEvento: "Expo Beauty Show (EBS 2026)",
        fecha: "24 al 26 Octubre 2026",
        fecha_iso: "2026-10-26",
        recintoKey: "centro-citibanamex",
        imagen: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        badge: "Centro Citibanamex",
        precio_texto: "$700 MXN"
    },
    {
        id: "concierto-shakira-gnp",
        nombreEvento: "Shakira: Las Mujeres Ya No Lloran Tour",
        fecha: "18 Noviembre 2026",
        fecha_iso: "2026-11-18",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        badge: "Gira Mundial",
        precio_texto: "$549 MXN"
    },
    {
        id: "concierto-corona-capital",
        nombreEvento: "Corona Capital 2026",
        fecha: "20-22 Noviembre 2026",
        fecha_iso: "2026-11-22",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        badge: "Festival del Año",
        precio_texto: "$549 MXN"
    },
    {
        id: "expo-the-logistics-world",
        nombreEvento: "The Logistics World Summit 2026",
        fecha: "25 Noviembre 2026",
        fecha_iso: "2026-11-25",
        recintoKey: "centro-citibanamex",
        imagen: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        badge: "Cumbre Logística",
        precio_texto: "$499 MXN"
    },
    {
        id: "concierto-oasis-gnp",
        nombreEvento: "Oasis Live '26 / Paul McCartney Tour",
        fecha: "12 Diciembre 2026",
        fecha_iso: "2026-12-12",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
        badge: "Estadio GNP Lleno",
        precio_texto: "$549 MXN"
    },
    {
        id: "festival-edc-mexico-2027",
        nombreEvento: "EDC México 2027 (Electric Daisy Carnival)",
        fecha: "26-28 Febrero 2027",
        fecha_iso: "2027-02-28",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        badge: "Festival Electrónico",
        precio_texto: "$549 MXN"
    }
];

/**
 * Poda Automática de Eventos:
 * Retorna únicamente eventos cuya fecha_iso es igual o posterior a la fecha actual.
 * Los eventos pasados son automáticamente archivados y omitidos de la cartelera pública.
 */
function obtenerEventosActivosCDMX() {
    const hoyStr = new Date().toISOString().split('T')[0]; // Ej: "2026-10-12"
    return EVENTOS_CDMX_MAESTRO.filter(ev => {
        if (!ev.fecha_iso) return true;
        return ev.fecha_iso >= hoyStr;
    });
}

/**
 * Filtrar eventos activos por recinto
 */
function filtrarEventosPorRecinto(recintoKey) {
    const activos = obtenerEventosActivosCDMX();
    if (!recintoKey || recintoKey === 'todos') return activos;
    return activos.filter(ev => ev.recintoKey === recintoKey);
}
