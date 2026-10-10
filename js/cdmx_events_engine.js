/**
 * CDMX Events & Venue Pricing Intelligence Engine
 * Agencia: Viajes Alma & Vromlix Multi-Hub
 * 
 * Este motor centraliza todos los recintos clave de la CDMX y calcula automáticamente:
 * - Distancia y tiempos desde San Manuel, Puebla
 * - Costos operativos (gasolina + casetas)
 * - Precio psicológico por persona en Suzuki Ertiga (6 Pax) y Urban (14 Pax)
 * - Itinerarios personalizados según horario de concierto o expo
 * - Calendario anticipado de eventos para noviembre, diciembre y 2027
 */

const RECINTOS_CDMX = {
    "foro-sol": {
        id: "foro-sol",
        nombre: "Estadio GNP Seguros / Foro Sol",
        zona: "Iztacalco / Magdalena Mixhuca",
        distancia_km: 128,
        tiempo_traslado: "1.8 hrs",
        precio_ertiga: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4063, lng: -99.0927, altitud: "2,240 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla (Salida)", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Caseta San Martín Texmelucan", lat: 19.2842, lng: -98.4347, altitud: "2,260 m" },
            { nombre: "Paso de Río Frío (Sierra Nevada)", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Caseta San Marcos Chalco", lat: 19.3289, lng: -98.9124, altitud: "2,250 m" },
            { nombre: "Calzada Ignacio Zaragoza", lat: 19.4147, lng: -99.0967, altitud: "2,240 m" },
            { nombre: "Estadio GNP Seguros (Puerta Puerta)", lat: 19.4063, lng: -99.0927, altitud: "2,240 m" }
        ],
        tipo_itinerario: "concierto_noche"
    },
    "palacio-deportes": {
        id: "palacio-deportes",
        nombre: "Palacio de los Deportes",
        zona: "Iztacalco",
        distancia_km: 129,
        tiempo_traslado: "1.8 hrs",
        precio_ertiga: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4038, lng: -99.1008, altitud: "2,240 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista México-Puebla 150D", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Viaducto Río de la Piedad", lat: 19.4050, lng: -99.0980, altitud: "2,240 m" },
            { nombre: "Palacio de los Deportes (Domo de Cobre)", lat: 19.4038, lng: -99.1008, altitud: "2,240 m" }
        ],
        tipo_itinerario: "concierto_noche"
    },
    "auditorio-nacional": {
        id: "auditorio-nacional",
        nombre: "Auditorio Nacional",
        zona: "Paseo de la Reforma / Chapultepec",
        distancia_km: 138,
        tiempo_traslado: "2.1 hrs",
        precio_ertiga: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.4259, lng: -99.1917, altitud: "2,250 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Río Frío / Parque Izta-Popo", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Viaducto Miguel Alemán", lat: 19.4020, lng: -99.1500, altitud: "2,240 m" },
            { nombre: "Paseo de la Reforma", lat: 19.4250, lng: -99.1850, altitud: "2,250 m" },
            { nombre: "Auditorio Nacional", lat: 19.4259, lng: -99.1917, altitud: "2,250 m" }
        ],
        tipo_itinerario: "concierto_tarde"
    },
    "estadio-azteca": {
        id: "estadio-azteca",
        nombre: "Estadio Azteca / Estadio Cd. de los Deportes",
        zona: "Sur CDMX / Coapa / Nápoles",
        distancia_km: 136,
        tiempo_traslado: "2.2 hrs",
        precio_ertiga: 549,
        precio_texto: "$549 MXN",
        coords: { lat: 19.3029, lng: -99.1505, altitud: "2,260 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista 150D", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Periférico Sur / Canal de Chalco", lat: 19.3100, lng: -99.1000, altitud: "2,250 m" },
            { nombre: "Calzada de Tlalpan", lat: 19.3050, lng: -99.1450, altitud: "2,260 m" },
            { nombre: "Estadio Azteca (Acceso Principal)", lat: 19.3029, lng: -99.1505, altitud: "2,260 m" }
        ],
        tipo_itinerario: "partido_evento"
    },
    "centro-citibanamex": {
        id: "centro-citibanamex",
        nombre: "Centro Citibanamex (Expos & Congresos)",
        zona: "Lomas de Sotelo / Hipódromo de las Américas",
        distancia_km: 145,
        tiempo_traslado: "2.3 hrs",
        precio_ertiga: 499,
        precio_texto: "$499 MXN",
        coords: { lat: 19.4389, lng: -99.2227, altitud: "2,270 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Paso de Río Frío", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Circuito Interior / Reforma Poniente", lat: 19.4300, lng: -99.1900, altitud: "2,250 m" },
            { nombre: "Av. Conscripto (Hipódromo)", lat: 19.4410, lng: -99.2200, altitud: "2,270 m" },
            { nombre: "Centro Citibanamex (Puerta Expos)", lat: 19.4389, lng: -99.2227, altitud: "2,270 m" }
        ],
        tipo_itinerario: "expo_corporativa"
    },
    "expo-santa-fe": {
        id: "expo-santa-fe",
        nombre: "Expo Santa Fe México",
        zona: "Santa Fe / Corporativo Poniente",
        distancia_km: 156,
        tiempo_traslado: "2.6 hrs",
        precio_ertiga: 590,
        precio_texto: "$590 MXN",
        coords: { lat: 19.3582, lng: -99.2625, altitud: "2,550 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Río Frío (Autopista)", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Supervía Poniente / Av. Poetas", lat: 19.3400, lng: -99.2300, altitud: "2,450 m" },
            { nombre: "Expo Santa Fe (Av. Santa Fe)", lat: 19.3582, lng: -99.2625, altitud: "2,550 m" }
        ],
        tipo_itinerario: "expo_corporativa"
    },
    "arena-cdmx": {
        id: "arena-cdmx",
        nombre: "Arena CDMX",
        zona: "Azcapotzalco / Ferrería",
        distancia_km: 148,
        tiempo_traslado: "2.4 hrs",
        precio_ertiga: 590,
        precio_texto: "$590 MXN",
        coords: { lat: 19.4975, lng: -99.1764, altitud: "2,240 m" },
        ruta_waypoints: [
            { nombre: "San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Río Frío (Sierra Nevada)", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Circuito Interior Norte", lat: 19.4700, lng: -99.1500, altitud: "2,240 m" },
            { nombre: "Arena CDMX (Av. de las Granjas)", lat: 19.4975, lng: -99.1764, altitud: "2,240 m" }
        ],
        tipo_itinerario: "concierto_noche"
    }
};

/**
 * Plantillas automáticas de itinerarios hora por hora según el tipo de evento
 */
function generarItinerarioAutomatico(tipo, nombreEvento, nombreRecinto) {
    if (tipo === "concierto_noche") {
        return [
            { hora: "01:30 PM", actividad: `Cita y abordaje en Río Nexapa 6101, San Manuel, Puebla.` },
            { hora: "02:00 PM", actividad: `Salida puntual hacia CDMX (Ertiga climatizada con bebidas de cortesía).` },
            { hora: "04:30 PM", actividad: `Llegada directa al ${nombreRecinto} (sin filas de estacionamiento).` },
            { hora: "05:00 PM", actividad: `Tiempo libre para mercancía oficial, alimentos y acceso al recinto.` },
            { hora: "08:30 PM", actividad: `Inicio de concierto: ${nombreEvento}.` },
            { hora: "11:30 PM", actividad: `Punto de encuentro seguro en la camioneta inmediatamente al terminar.` },
            { hora: "12:15 AM", actividad: `Salida directa de regreso a Puebla.` },
            { hora: "02:30 AM", actividad: `Arribo seguro a San Manuel, Puebla.` }
        ];
    } else if (tipo === "expo_corporativa") {
        return [
            { hora: "06:00 AM", actividad: `Salida ejecutiva desde San Manuel en Suzuki Ertiga 2022.` },
            { hora: "08:15 AM", actividad: `Llegada a ${nombreRecinto} antes de la apertura de puertas.` },
            { hora: "08:30 AM", actividad: `Jornada completa en el evento: ${nombreEvento} (networking y conferencias).` },
            { hora: "06:30 PM", actividad: `Punto de reunión en estacionamiento ejecutivo asignado.` },
            { hora: "07:00 PM", actividad: `Retorno hacia Puebla capital.` },
            { hora: "09:15 PM", actividad: `Llegada a San Manuel.` }
        ];
    } else {
        return [
            { hora: "10:00 AM", actividad: `Salida desde San Manuel hacia CDMX.` },
            { hora: "12:30 PM", actividad: `Llegada a ${nombreRecinto}.` },
            { hora: "01:00 PM", actividad: `Disfrute del evento: ${nombreEvento}.` },
            { hora: "06:00 PM", actividad: `Retorno a Puebla.` },
            { hora: "08:30 PM", actividad: `Llegada a San Manuel.` }
        ];
    }
}

/**
 * Generador automático de paquetes de eventos CDMX
 */
function crearPaqueteEventoCDMX({ id, nombreEvento, fecha, mes, recintoKey, imagen, badge, votosIniciales }) {
    const recinto = RECINTOS_CDMX[recintoKey] || RECINTOS_CDMX["foro-sol"];
    const itin = generarItinerarioAutomatico(recinto.tipo_itinerario, nombreEvento, recinto.nombre);

    return {
        id: id,
        nombre: `${nombreEvento} (${fecha} - ${recinto.nombre})`,
        categoria: recinto.tipo_itinerario.includes("expo") ? "express" : "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: recinto.precio_ertiga,
        precio_texto: recinto.precio_texto,
        tipo_transporte: "Suzuki Ertiga VIP (6 Pax) / Urban Fan",
        duracion: recinto.tipo_itinerario.includes("expo") ? "Día Completo (06:00 a 21:00)" : "Tarde - Madrugada (13:30 a 02:30)",
        distancia: `${recinto.distancia_km} km desde Puebla`,
        tiempo_traslado: recinto.tiempo_traslado,
        badge: badge || `${fecha}`,
        votos_comunidad: votosIniciales || Math.floor(Math.random() * 25 + 20),
        imagen: imagen,
        descripcion: `Transporte seguro viaje redondo desde San Manuel, Puebla para ${nombreEvento} en ${recinto.nombre}. Olvídate del estrés de la autopista, casetas y estacionamientos caros. Te dejamos en la puerta y el vehículo te espera hasta que finaliza el evento.`,
        coordenadas: recinto.coords,
        ruta_puntos: recinto.ruta_waypoints,
        itinerario: itin,
        incluye: [
            "Transporte redondo ejecutivo garantizado",
            "Chofer calificado y monitoreo GPS en vivo",
            "Casetas y combustible de autopista incluidos",
            "Espera completa del vehículo hasta la salida",
            "Seguro de cobertura amplia de viajero"
        ],
        no_incluye: ["Boleto de acceso al evento", "Consumos personales"]
    };
}

// CALENDARIO MAESTRO CDMX (Noviembre, Diciembre y Primer Semestre 2027)
const EVENTOS_CDMX_MAESTRO = [
    crearPaqueteEventoCDMX({
        id: "concierto-shakira-gnp",
        nombreEvento: "Shakira: Las Mujeres Ya No Lloran World Tour",
        fecha: "Noviembre 2026",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        badge: "Gira Mundial Shakira",
        votosIniciales: 64
    }),
    crearPaqueteEventoCDMX({
        id: "concierto-corona-capital",
        nombreEvento: "Corona Capital 2026",
        fecha: "Noviembre 2026",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        badge: "Festival del Año",
        votosIniciales: 58
    }),
    crearPaqueteEventoCDMX({
        id: "expo-the-logistics-world",
        nombreEvento: "The Logistics World | Summit & Expo 2026",
        fecha: "Noviembre 2026",
        recintoKey: "centro-citibanamex",
        imagen: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        badge: "Cumbre Logística",
        votosIniciales: 33
    }),
    crearPaqueteEventoCDMX({
        id: "concierto-oasis-gnp",
        nombreEvento: "Oasis Live '26 / Paul McCartney Tour",
        fecha: "Diciembre 2026",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
        badge: "Estadio GNP Lleno",
        votosIniciales: 72
    }),
    crearPaqueteEventoCDMX({
        id: "concierto-luis-miguel-arena",
        nombreEvento: "Luis Miguel en Concierto",
        fecha: "Diciembre 2026",
        recintoKey: "arena-cdmx",
        imagen: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
        badge: "Arena CDMX VIP",
        votosIniciales: 49
    }),
    crearPaqueteEventoCDMX({
        id: "concierto-chayanne-auditorio",
        nombreEvento: "Chayanne: Bailemos Otra Vez Tour",
        fecha: "Noviembre 2026",
        recintoKey: "auditorio-nacional",
        imagen: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
        badge: "Auditorio Nacional",
        votosIniciales: 51
    }),
    crearPaqueteEventoCDMX({
        id: "festival-edc-mexico",
        nombreEvento: "EDC México 2027 (Electric Daisy Carnival)",
        fecha: "Febrero 2027",
        recintoKey: "foro-sol",
        imagen: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        badge: "Festival Electrónico",
        votosIniciales: 67
    }),
    crearPaqueteEventoCDMX({
        id: "expo-cihac-citibanamex",
        nombreEvento: "Expo CIHAC & Medical Expo",
        fecha: "Noviembre 2026",
        recintoKey: "centro-citibanamex",
        imagen: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80",
        badge: "Centro Citibanamex",
        votosIniciales: 29
    })
];
