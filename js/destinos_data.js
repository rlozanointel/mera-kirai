/**
 * Base de Datos Maestra de Destinos y Experiencias Turísticas
 * Integración SECTUR (Pueblos Mágicos, Turismo Comunitario UNESCO y Eventos Masivos)
 * Agencia: Viajes Alma & Vromlix Multi-Hub
 */

const DESTINOS_DB = [
    {
        id: "cuetzalan-magico",
        nombre: "Cuetzalan del Progreso: Niebla, Cascadas y Café",
        categoria: "pueblo_magico",
        subcategoria: "turismo_comunitario",
        estado: "Puebla",
        precio: 799,
        precio_texto: "$799 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax) / Urban (14 Pax)",
        duracion: "1 Día Completo (06:00 a 21:00)",
        distancia: "172 km desde Puebla",
        tiempo_traslado: "2.5 hrs",
        badge: "Pueblo Mágico #1",
        imagen: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Adéntrate en la mágica Sierra Norte de Puebla. Arquitectura de teja roja, callejones empedrados, niebla mística y la impresionante cascada 'Las Brisas'. Experiencia comunitaria con cooperativas indígenas de café de altura.",
        coordenadas: { lat: 20.0182, lng: -97.5218 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963 },
            { nombre: "Parada Técnica: Zacapoaxtla", lat: 19.8711, lng: -97.5898 },
            { nombre: "Llegada: Cuetzalan Centro", lat: 20.0182, lng: -97.5218 },
            { nombre: "Ecoturismo: Cascada Las Brisas", lat: 20.0350, lng: -97.4950 }
        ],
        itinerario: [
            { hora: "06:00 AM", actividad: "Cita y abordaje en Río Nexapa 6101, San Manuel." },
            { hora: "08:30 AM", actividad: "Desayuno serrano tradicional (tlayoyos y cecina de Zacapoaxtla)." },
            { hora: "10:30 AM", actividad: "Visita guiada a la Cascada Las Brisas y poza de agua cristalina." },
            { hora: "01:30 PM", actividad: "Recorrido por la Parroquia de San Francisco y tianguis dominical artesanal." },
            { hora: "03:30 PM", actividad: "Cata y taller de café de sombra en cooperativa comunitaria totonaca." },
            { hora: "06:00 PM", actividad: "Embarque de regreso a la ciudad de Puebla." },
            { hora: "09:00 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: [
            "Transporte redondo ejecutivo con chofer calificado",
            "Seguro de viajero en carretera",
            "Entrada a la Cascada Las Brisas",
            "Degustación y cata de café artesanal",
            "Tiempo libre para compras de artesanías y café"
        ],
        no_incluye: ["Alimentos y bebidas no especificados", "Gastos personales"]
    },
    {
        id: "chignahuapan-zacatlan",
        nombre: "Zacatlán de las Manzanas & Chignahuapan: Esferas y Termales",
        categoria: "pueblo_magico",
        subcategoria: "escapada_express",
        estado: "Puebla",
        precio: 749,
        precio_texto: "$749 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax)",
        duracion: "1 Día Completo (07:00 a 20:30)",
        distancia: "128 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Más Vendido",
        imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Recorrido doble por dos de los pueblos más icónicos de Puebla. El Reloj Floral y mirador de cristal de la Barranca de los Jilgueros en Zacatlán, y los talleres artesanales de esferas navideñas en Chignahuapan.",
        coordenadas: { lat: 19.9328, lng: -97.9602 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963 },
            { nombre: "Parada 1: Chignahuapan Basílica & Talleres", lat: 19.8378, lng: -98.0317 },
            { nombre: "Parada 2: Zacatlán Reloj Floral y Barranca", lat: 19.9328, lng: -97.9602 }
        ],
        itinerario: [
            { hora: "07:00 AM", actividad: "Salida desde San Manuel (Suzuki Ertiga climatizada)." },
            { hora: "09:00 AM", actividad: "Llegada a Chignahuapan: Visita a la Virgen Monumental y Castillo de la Esfera." },
            { hora: "12:00 PM", actividad: "Traslado a Zacatlán: Mirador de cristal en la Barranca de los Jilgueros." },
            { hora: "02:00 PM", actividad: "Comida en los portales (pan de queso tradicional y sidras artesanales)." },
            { hora: "04:30 PM", actividad: "Visita al Reloj Floral monumental y fábrica de licores tradicionales." },
            { hora: "06:30 PM", actividad: "Regreso hacia Puebla capital." },
            { hora: "08:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: [
            "Transporte redondo en Suzuki Ertiga (grupo VIP de 6)",
            "Seguro de cobertura amplia",
            "Visita a taller de esferas y fábrica de sidras",
            "Guía local y degustación de licores artesanales"
        ],
        no_incluye: ["Comida principal", "Compras personales"]
    },
    {
        id: "concierto-estadio-gnp",
        nombre: "Conciertos CDMX: Foro Sol / Estadio GNP & Palacio de los Deportes",
        categoria: "concierto",
        subcategoria: "evento_vip",
        estado: "Ciudad de México",
        precio: 549,
        precio_texto: "$549 MXN",
        tipo_transporte: "Suzuki Ertiga VIP (6 Pax) / Urban Fan (14 Pax)",
        duracion: "Tarde - Madrugada (Salida 13:00 / Retorno al terminar)",
        distancia: "135 km desde Puebla",
        tiempo_traslado: "2 hrs directo a puerta de acceso",
        badge: "Transporte Seguro",
        imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Despreocúpate del tráfico de la autopista México-Puebla, el estacionamiento carísimo o la inseguridad nocturna. Te llevamos directo a la puerta del evento y te esperamos en punto de reunión seguro al finalizar el concierto.",
        coordenadas: { lat: 19.4063, lng: -99.0927 },
        ruta_puntos: [
            { nombre: "Punto de Partida: Jardines de San Manuel, Puebla", lat: 19.0186, lng: -98.1963 },
            { nombre: "Escala Opcional: Caseta San Martín Texmelucan", lat: 19.2842, lng: -98.4347 },
            { nombre: "Destino: Estadio GNP Seguros / Foro Sol CDMX", lat: 19.4063, lng: -99.0927 }
        ],
        itinerario: [
            { hora: "01:00 PM", actividad: "Reunión y registro de pasajeros en San Manuel." },
            { hora: "01:30 PM", actividad: "Salida puntual hacia CDMX (bebidas de cortesía a bordo)." },
            { hora: "04:00 PM", actividad: "Llegada al recinto (Puerta asignada Estadio GNP / Palacio de los Deportes)." },
            { hora: "04:30 PM", actividad: "Tiempo libre para acceso, mercancía oficial y disfrutar del concierto." },
            { hora: "11:30 PM", actividad: "Punto de encuentro al término del show en vehículo seguro." },
            { hora: "12:15 AM", actividad: "Retorno directo y seguro a Puebla." },
            { hora: "02:30 AM", actividad: "Arribo a Puebla (entrega en punto convenido)." }
        ],
        incluye: [
            "Viaje redondo con chofer profesional y relevo",
            "Casetas autopista y combustible incluidos",
            "Seguro de viajero",
            "Espera completa del vehículo hasta el fin del evento",
            "Coordinador de grupo vía WhatsApp en tiempo real"
        ],
        no_incluye: ["Boleto de acceso al concierto", "Alimentos dentro del recinto"]
    },
    {
        id: "cdmx-express-shopping",
        nombre: "CDMX Express VIP: Reforma, Bellas Artes, Polanco o Coyoacán",
        categoria: "express",
        subcategoria: "ejecutivo",
        estado: "Ciudad de México",
        precio: 449,
        precio_texto: "$449 MXN",
        tipo_transporte: "Suzuki Ertiga 2022 (Exclusivo 6 Pasajeros)",
        duracion: "Servicio Diario Redondo (Salida 06:30 / Regreso 18:30)",
        distancia: "130 km",
        tiempo_traslado: "1.8 hrs",
        badge: "Salida Diaria",
        imagen: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Viaja con comodidad total en grupo pequeño (máximo 6 pasajeros). Aire acondicionado, asientos ergonómicos individuales, puertos de carga USB y paradas estratégicas en las mejores zonas de la Ciudad de México.",
        coordenadas: { lat: 19.4326, lng: -99.1332 },
        ruta_puntos: [
            { nombre: "Origen: Río Nexapa 6101, San Manuel", lat: 19.0186, lng: -98.1963 },
            { nombre: "Parada CDMX 1: Metro Aeropuerto / Calzada Ignacio Zaragoza", lat: 19.4147, lng: -99.0967 },
            { nombre: "Parada CDMX 2: Bellas Artes / Monumento a la Revolución", lat: 19.4352, lng: -99.1412 },
            { nombre: "Parada CDMX 3: Polanco / Auditorio Nacional", lat: 19.4259, lng: -99.1917 }
        ],
        itinerario: [
            { hora: "06:30 AM", actividad: "Salida desde San Manuel, Puebla." },
            { hora: "08:45 AM", actividad: "Llegada al Centro Histórico / Bellas Artes." },
            { hora: "09:30 AM", actividad: "Tiempo libre para trámites, compras o museos." },
            { hora: "06:30 PM", actividad: "Abordaje en punto de encuentro céntrico." },
            { hora: "08:45 PM", actividad: "Llegada a Puebla capital." }
        ],
        incluye: [
            "Asiento individual garantizado en camioneta Suzuki Ertiga",
            "Casetas y seguro de autopista",
            "Conexión USB para carga de celulares",
            "Espacio para equipaje mediano o compras"
        ],
        no_incluye: ["Gastos personales", "Estacionamientos adicionales"]
    },
    {
        id: "ruta-cacao-tabasco",
        nombre: "Ruta Biocultural del Cacao: Haciendas Chocolateras y Comalcalco",
        categoria: "turismo_comunitario",
        subcategoria: "sectur_unesco",
        estado: "Tabasco",
        precio: 3499,
        precio_texto: "$3,499 MXN",
        tipo_transporte: "Camioneta Turística Urban Ejecutiva",
        duracion: "3 Días / 2 Noches",
        distancia: "620 km",
        tiempo_traslado: "Ruta Turística Escénica",
        badge: "SECTUR UNESCO",
        imagen: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Directamente de los programas insignia de Turismo Comunitario presentados por SECTUR: Recorre las haciendas cacaoteras ancestrales de Tabasco, vive el proceso artesanal del chocolate criollo con productores mayas-chontales y conoce la zona arqueológica de Comalcalco.",
        coordenadas: { lat: 18.2612, lng: -93.2057 },
        ruta_puntos: [
            { nombre: "Puebla Capital", lat: 19.0186, lng: -98.1963 },
            { nombre: "Veracruz Puerto (Escala)", lat: 19.1738, lng: -96.1342 },
            { nombre: "Villahermosa, Tabasco", lat: 17.9895, lng: -92.9475 },
            { nombre: "Comalcalco y Haciendas del Cacao", lat: 18.2612, lng: -93.2057 }
        ],
        itinerario: [
            { hora: "Día 1", actividad: "Salida de Puebla rumbo a Villahermosa. Hospedaje y cena típica chontal." },
            { hora: "Día 2", actividad: "Visita a Hacienda Jesús María y Chocolates Cacep. Taller de molienda comunitaria y pirámides de Comalcalco." },
            { hora: "Día 3", actividad: "Mercado tradicional de Villahermosa, cata de pozol y retorno a Puebla." }
        ],
        incluye: [
            "Transporte turístico viaje redondo Puebla - Tabasco",
            "2 noches de hospedaje en hotel categoría especial",
            "Entrada a haciendas chocolateras y taller del cacao",
            "Guías comunitarios certificados",
            "Desayunos incluidos"
        ],
        no_incluye: ["Comidas y cenas no especificadas"]
    },
    {
        id: "oaxaca-hierve-el-agua",
        nombre: "Oaxaca Mágico: Cascadas Petrificadas, Mezcal y Monte Albán",
        categoria: "pueblo_magico",
        subcategoria: "cultural",
        estado: "Oaxaca",
        precio: 1899,
        precio_texto: "$1,899 MXN",
        tipo_transporte: "Camioneta Urban 14 Pax",
        duracion: "Fin de Semana (2 Días / 1 Noche)",
        distancia: "340 km desde Puebla",
        tiempo_traslado: "4 hrs",
        badge: "Cultura & Sabor",
        imagen: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Visita la majestuosa ciudad de Oaxaca, el imponente Árbol del Tule, las cascadas petrificadas de Hierve el Agua y vive la experiencia en un palenque de mezcal artesanal en Matatlán.",
        coordenadas: { lat: 17.0654, lng: -96.7236 },
        ruta_puntos: [
            { nombre: "Salida: Puebla", lat: 19.0186, lng: -98.1963 },
            { nombre: "Hierve el Agua", lat: 16.8660, lng: -96.2750 },
            { nombre: "Santiago Matatlán (Cuna del Mezcal)", lat: 16.8631, lng: -96.3800 },
            { nombre: "Oaxaca Centro Histórico", lat: 17.0654, lng: -96.7236 }
        ],
        itinerario: [
            { hora: "Sábado 05:00 AM", actividad: "Salida desde San Manuel, Puebla." },
            { hora: "Sábado 10:00 AM", actividad: "Llegada y recorrido por las pozas de Hierve el Agua." },
            { hora: "Sábado 02:00 PM", actividad: "Comida en Matatlán con degustación de mezcales de agave silvestre." },
            { hora: "Sábado 05:00 PM", actividad: "Check-in en hotel céntrico de Oaxaca y noche libre en el Andador Turístico." },
            { hora: "Domingo 09:00 AM", actividad: "Visita a zona arqueológica de Monte Albán." },
            { hora: "Domingo 02:00 PM", actividad: "Comida en Mercado 20 de Noviembre (Pasillo de Humo)." },
            { hora: "Domingo 05:00 PM", actividad: "Retorno hacia Puebla." },
            { hora: "Domingo 09:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: [
            "Transporte redondo con seguro de viajero",
            "1 noche de hotel céntrico en Oaxaca",
            "Entradas a Hierve el Agua y Monte Albán",
            "Cata de mezcales artesanales"
        ],
        no_incluye: ["Alimentos no detallados"]
    }
];

// Mapeo Rápido de Experiencias
const CATEGORIAS_EXPERIENCIAS = [
    { id: "todas", nombre: "Todos los Destinos", icono: "fas fa-compass" },
    { id: "pueblo_magico", nombre: "Pueblos Mágicos", icono: "fas fa-mountain" },
    { id: "concierto", nombre: "Conciertos CDMX", icono: "fas fa-music" },
    { id: "express", nombre: "Express en Ertiga", icono: "fas fa-car" },
    { id: "turismo_comunitario", nombre: "Turismo Comunitario SECTUR", icono: "fas fa-leaf" }
];
