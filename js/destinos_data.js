/**
 * Base de Datos Maestra de Destinos y Experiencias Turísticas
 * Agencia: Viajes La Ruta del Águila (Alma Luis) & Alianza Fraveo
 * Salidas directas desde: Río Nexapa 6101, Jardines de San Manuel, Puebla, Pue.
 * Teléfono / WhatsApp oficial: 222 801 6244
 */

const DESTINOS_DB = [
    // =========================================================================
    // SALIDAS CONFIRMADAS INMEDIATAS (OCTUBRE / NOVIEMBRE 2026)
    // =========================================================================
    {
        id: "expo-beauty-show-citibanamex",
        nombre: "Expo Beauty Show (EBS 2026) en Centro Citibanamex",
        categoria: "concierto",
        subcategoria: "express",
        estado: "Ciudad de México",
        precio: 700,
        precio_texto: "$700 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Ejecutivo Redondo (Boleto Expo Aparte)",
        duracion: "Día Completo (07:30 a 19:45)",
        distancia: "145 km desde Puebla",
        tiempo_traslado: "2.3 hrs directo",
        badge: "Salida Confirmada 24-26 Octubre",
        imagen: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Traslado ejecutivo redondo directo desde San Manuel, Puebla al evento de belleza y estilismo más grande de América Latina en Centro Citibanamex CDMX. Ideal para estilistas, barberos y profesionales que buscan lanzamientos e insumos a precio de mayoreo (boleto de acceso a EBS se adquiere por separado).",
        coordenadas: { lat: 19.4389, lng: -99.2227 },
        itinerario: [
            { hora: "07:30 AM", actividad: "Cita y abordaje en Río Nexapa 6101, San Manuel, Puebla." },
            { hora: "10:00 AM", actividad: "Llegada directa al Centro Citibanamex." },
            { hora: "10:15 AM - 16:30 PM", actividad: "Tiempo libre para recorrido y compras en Expo Beauty Show (EBS 2026)." },
            { hora: "17:00 PM", actividad: "Abordaje en la unidad e inicio de regreso a Puebla." },
            { hora: "19:45 PM", actividad: "Arribo seguro a San Manuel, Puebla." }
        ],
        incluye: [
            "Transporte redondo ejecutivo garantizado Puebla ↔ Centro Citibanamex",
            "Amplio espacio de equipaje para tus compras de insumos y herramientas",
            "Combustible, peajes de autopista y seguro de viajero a bordo"
        ],
        no_incluye: ["Boleto de acceso a Expo Beauty Show (se adquiere por separado)", "Alimentos y compras personales"]
    },
    {
        id: "llorona-xochimilco-nocturna",
        nombre: "La Llorona en Xochimilco: Obra Nocturna en Trajinera",
        categoria: "concierto",
        subcategoria: "express",
        estado: "Ciudad de México",
        precio: 1350,
        precio_texto: "$1,350 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Ejecutivo Redondo",
        duracion: "Tarde - Noche (14:30 a 00:00)",
        distancia: "130 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Temporada Día de Muertos",
        imagen: "img/xochimilco_clean_card.jpg",
        descripcion: "Mística experiencia en los canales ancestrales de Xochimilco. Paseo en trajinera tradicional al atardecer por el Embarcadero Cuemanco y acceso al espectáculo multidisciplinario 'La Llorona' en el islote de la Laguna con danza prehispánica y música en vivo.",
        coordenadas: { lat: 19.2882, lng: -99.1037 },
        itinerario: [
            { hora: "14:30 PM", actividad: "Salida puntual desde San Manuel, Puebla." },
            { hora: "16:45 PM", actividad: "Llegada al Embarcadero Cuemanco. Tiempo libre para antojitos típicos." },
            { hora: "17:45 PM - 18:45 PM", actividad: "Paseo nocturno en trajinera por los canales de Xochimilco." },
            { hora: "19:00 PM - 21:00 PM", actividad: "Espectáculo en vivo 'La Llorona' en el islote de la laguna." },
            { hora: "21:30 PM", actividad: "Abordaje en unidad y retorno tranquilo a Puebla." },
            { hora: "00:00 AM", actividad: "Llegada segura a San Manuel." }
        ],
        incluye: [
            "Transporte redondo ejecutivo con chofer asignado",
            "Paseo en trajinera tradicional iluminada",
            "Boleto oficial de acceso VIP a La Llorona",
            "Casetas, combustible y seguro de viajero"
        ],
        no_incluye: ["Alimentos y bebidas"]
    },

    // =========================================================================
    // TIER 1: CONCIERTOS, FESTIVALES & EVENTOS CDMX (JUVENIL / ESTUDIANTES)
    // =========================================================================
    {
        id: "karol-g-estadio-gnp",
        nombre: "Karol G: Concierto Estadio GNP Seguros",
        categoria: "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: 549,
        precio_texto: "$549 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Redondo con Espera Nocturna",
        duracion: "Tarde - Madrugada (14:00 a 02:30)",
        distancia: "128 km desde Puebla",
        tiempo_traslado: "1.8 hrs",
        badge: "Estadio GNP CDMX",
        imagen: "img/IMG-20260926-WA0009.jpg",
        descripcion: "Salida ejecutiva directa al Estadio GNP Seguros (Foro Sol) para el concierto de Karol G. Te dejamos en la puerta del recinto y la unidad te espera hasta el final del concierto para un regreso 100% seguro a Puebla sin batallar por metro ni taxis caros.",
        coordenadas: { lat: 19.4063, lng: -99.0927 },
        itinerario: [
            { hora: "14:00 PM", actividad: "Abordaje puntual en Río Nexapa 6101, San Manuel, Puebla." },
            { hora: "16:15 PM", actividad: "Llegada al Estadio GNP Seguros / Foro Sol. Tiempo para mercancía y alimentos." },
            { hora: "20:30 PM", actividad: "Inicio de concierto Karol G." },
            { hora: "23:45 PM", actividad: "Reunión en punto de encuentro asignado con el chofer." },
            { hora: "02:30 AM", actividad: "Llegada segura a San Manuel, Puebla." }
        ],
        incluye: [
            "Transporte redondo Puebla - Estadio GNP - Puebla",
            "Espera completa del vehículo hasta terminar el concierto",
            "Casetas, gasolina y seguro de viajero"
        ],
        no_incluye: ["Boleto de acceso al concierto", "Consumos personales"]
    },
    {
        id: "cisne-negro-chapultepec",
        nombre: "El Cisne Negro en Castillo Chapultepec",
        categoria: "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: 690,
        precio_texto: "$690 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Redondo Ejecutivo",
        duracion: "Tarde - Noche (14:00 a 23:30)",
        distancia: "135 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Castillo Chapultepec",
        imagen: "img/IMG-20260926-WA0013.jpg",
        descripcion: "Majestuoso espectáculo de ballet clásico en el emblemático escenario del Castillo de Chapultepec. Temporada exclusiva con traslado redondo y cómodo desde San Manuel.",
        coordenadas: { lat: 19.4204, lng: -99.1819 },
        itinerario: [
            { hora: "14:00 PM", actividad: "Salida desde San Manuel, Puebla." },
            { hora: "16:30 PM", actividad: "Llegada a Paseo de la Reforma / Bosque de Chapultepec." },
            { hora: "19:00 PM", actividad: "Función de ballet en el Castillo." },
            { hora: "21:30 PM", actividad: "Abordaje para retorno a Puebla." },
            { hora: "23:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: ["Transporte redondo ejecutivo", "Casetas y chofer certificado", "Seguro de cobertura amplia"],
        no_incluye: ["Boleto de acceso a la función", "Alimentos"]
    },
    {
        id: "nfl-mexico-estadio-banorte",
        nombre: "NFL en México: 49ers vs Vikings",
        categoria: "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: 690,
        precio_texto: "$690 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Redondo Deportivo",
        duracion: "Día Completo (10:00 a 21:00)",
        distancia: "136 km desde Puebla",
        tiempo_traslado: "2.1 hrs",
        badge: "NFL México 2026",
        imagen: "img/IMG-20260926-WA0016.jpg",
        descripcion: "El magno evento de la NFL en territorio mexicano con el duelo 49ers vs Vikings. Traslado redondo directo sin estrés de estacionamiento ni tráfico de autopista.",
        coordenadas: { lat: 19.3029, lng: -99.1505 },
        itinerario: [
            { hora: "10:00 AM", actividad: "Salida desde San Manuel hacia el estadio." },
            { hora: "12:30 PM", actividad: "Llegada al estadio, tiempo para Fan Zone y comida." },
            { hora: "15:25 PM", actividad: "Kickoff del partido NFL." },
            { hora: "19:00 PM", actividad: "Abordaje y regreso a Puebla." },
            { hora: "21:15 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: ["Transporte redondo ejecutivo", "Casetas y gasolina", "Seguro de viajero"],
        no_incluye: ["Boleto del partido", "Consumos dentro del estadio"]
    },
    {
        id: "f1-gp-mexico-2026",
        nombre: "Fórmula 1: Gran Premio de México 2026",
        categoria: "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: 750,
        precio_texto: "$750 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Redondo Ejecutivo por Día",
        duracion: "Día Completo (07:00 a 19:30)",
        distancia: "128 km desde Puebla",
        tiempo_traslado: "1.8 hrs",
        badge: "Autódromo Hnos. Rodríguez",
        imagen: "img/IMG-20260926-WA0017.jpg",
        descripcion: "Servicio de transporte diario para las prácticas, clasificación y carrera de la F1 en el Autódromo Hermanos Rodríguez. Llegada puntual a puertas y retorno al finalizar.",
        coordenadas: { lat: 19.4042, lng: -99.0886 },
        itinerario: [
            { hora: "07:00 AM", actividad: "Salida matutina desde San Manuel, Puebla." },
            { hora: "09:00 AM", actividad: "Arribo al Autódromo Hermanos Rodríguez." },
            { hora: "09:30 AM - 16:30 PM", actividad: "Jornada de actividades de pista y Gran Premio F1." },
            { hora: "17:15 PM", actividad: "Retorno organizado a Puebla." },
            { hora: "19:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: ["Transporte redondo por jornada", "Casetas y chofer designado", "Seguro de cobertura amplia"],
        no_incluye: ["Boleto de acceso F1"]
    },
    {
        id: "america-vs-monterrey-cdmx",
        nombre: "Club América vs Monterrey en CDMX",
        categoria: "concierto",
        subcategoria: "evento_cdmx",
        estado: "Ciudad de México",
        precio: 549,
        precio_texto: "$549 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Redondo de Fútbol",
        duracion: "Tarde - Noche (14:00 a 23:30)",
        distancia: "136 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Liga MX Apertura",
        imagen: "img/IMG-20260926-WA0010.jpg",
        descripcion: "Emocionante encuentro de la Liga MX con salida garantizada desde San Manuel, Puebla. Ambiente seguro y retorno inmediato al terminar el partido.",
        coordenadas: { lat: 19.3029, lng: -99.1505 },
        itinerario: [
            { hora: "14:00 PM", actividad: "Salida desde San Manuel." },
            { hora: "16:30 PM", actividad: "Llegada al recinto y tiempo previo al silbatazo." },
            { hora: "19:00 PM", actividad: "Partido Club América vs Monterrey." },
            { hora: "21:30 PM", actividad: "Abordaje y regreso a Puebla." },
            { hora: "23:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: ["Transporte redondo", "Casetas de autopista", "Seguro de viajero"],
        no_incluye: ["Boleto del partido", "Consumos personales"]
    },

    // =========================================================================
    // TIER 2: EXCURSIONES NACIONALES (CLASE MEDIA / FAMILIAS / JUBILADOS)
    // =========================================================================
    {
        id: "cacahuamilpa-taxco",
        nombre: "Grutas de Cacahuamilpa & Taxco de Alarcón",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Guerrero",
        precio: 1160,
        precio_texto: "$1,160 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Camioneta Ejecutiva / Autobús Turístico",
        duracion: "Día Completo (05:30 a 21:00)",
        distancia: "195 km desde Puebla",
        tiempo_traslado: "3 hrs",
        badge: "Grutas & Plata 925",
        imagen: "img/IMG-20260926-WA0020.jpg",
        descripcion: "Exploración de los imponentes salones subterráneos iluminados en el Parque Nacional Grutas de Cacahuamilpa, y visita al histórico pueblo platero de Taxco con su Parroquia de Santa Prisca y tianguis de plata 925.",
        coordenadas: { lat: 18.5564, lng: -99.6050 },
        itinerario: [
            { hora: "05:30 AM", actividad: "Salida desde San Manuel por Autopista Siglo XXI." },
            { hora: "08:45 AM", actividad: "Llegada al Parque Nacional Grutas de Cacahuamilpa." },
            { hora: "09:15 AM - 11:45 AM", actividad: "Recorrido subterráneo guiado por 2 km de cavernas." },
            { hora: "12:15 PM - 13:00 PM", actividad: "Traslado al Pueblo Mágico de Taxco." },
            { hora: "13:00 PM - 17:15 PM", actividad: "Tiempo para comida, Santa Prisca y compras de plata." },
            { hora: "17:30 PM", actividad: "Retorno a Puebla. Arribo 21:00 PM." }
        ],
        incluye: [
            "Transporte redondo con peajes incluidos",
            "Boleto oficial a Grutas de Cacahuamilpa con guía",
            "Visita libre a Taxco de Alarcón",
            "Seguro de cobertura amplia de viajero"
        ],
        no_incluye: ["Alimentos y compras de platería"]
    },
    {
        id: "grutas-tolantongo",
        nombre: "Grutas de Tolantongo: Pozas Termales de Hidalgo",
        categoria: "pueblo_magico",
        subcategoria: "turismo_comunitario",
        estado: "Hidalgo",
        precio: 790,
        precio_texto: "$790 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Unidad Confortable de 14 a 20 Pasajeros",
        duracion: "Día Completo (05:30 a 20:30)",
        distancia: "210 km desde Puebla",
        tiempo_traslado: "3.5 hrs",
        badge: "Aguas Termales 36°C",
        imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Paraíso de aguas termales a 36°C enclavado en un cañón natural. Incluye acceso a las pozas escalonadas en el acantilado, la cueva de vapor, el río turquesa y cascadas.",
        coordenadas: { lat: 20.6481, lng: -98.9958 },
        itinerario: [
            { hora: "05:30 AM", actividad: "Salida de Puebla por la Autopista Arco Norte." },
            { hora: "09:00 AM", actividad: "Llegada al Parque Tolantongo." },
            { hora: "09:15 AM - 16:00 PM", actividad: "Disfrute de pozas termales, río, túnel de vapor y cascadas." },
            { hora: "16:30 PM", actividad: "Salida de regreso a Puebla." },
            { hora: "20:30 PM", actividad: "Llegada a San Manuel." }
        ],
        incluye: ["Transporte redondo con peajes Arco Norte", "Boleto de acceso completo al parque", "Seguro de viajero"],
        no_incluye: ["Alimentos y tirolesa"]
    },
    {
        id: "zacatlan-chignahuapan",
        nombre: "Zacatlán de las Manzanas & Chignahuapan",
        categoria: "pueblo_magico",
        subcategoria: "escapada_express",
        estado: "Puebla",
        precio: 650,
        precio_texto: "$650 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Camioneta Ejecutiva / Autobús Turístico",
        duracion: "Día Completo (06:30 a 20:30)",
        distancia: "128 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Sierra Norte",
        imagen: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Mirador de cristal sobre la Barranca de los Jilgueros, fábrica de sidras tradicionales, Reloj Floral, Virgen Monumental y talleres artesanales de esferas navideñas en Chignahuapan.",
        coordenadas: { lat: 19.9328, lng: -97.9602 },
        itinerario: [
            { hora: "06:30 AM", actividad: "Salida desde San Manuel hacia la Sierra Norte." },
            { hora: "08:45 AM", actividad: "Llegada a Zacatlán. Desayuno tradicional con pan de queso." },
            { hora: "09:30 AM - 12:00 PM", actividad: "Mirador de Cristal, vitromurales y fábrica de sidra." },
            { hora: "12:30 PM - 16:30 PM", actividad: "Chignahuapan: Taller de esferas y Virgen Monumental." },
            { hora: "17:00 PM", actividad: "Regreso a Puebla. Llegada 20:30 PM." }
        ],
        incluye: ["Transporte redondo", "Visitas guiadas a talleres", "Seguro de cobertura amplia"],
        no_incluye: ["Alimentos y compras"]
    },
    {
        id: "queretaro-queso-vino",
        nombre: "Ruta del Queso, Vino & Peña de Bernal",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Querétaro",
        precio: 890,
        precio_texto: "$890 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Camioneta Ejecutiva / Autobús",
        duracion: "Día Completo (06:00 a 21:00)",
        distancia: "260 km desde Puebla",
        tiempo_traslado: "3.5 hrs",
        badge: "Ruta Enológica & Peña",
        imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Paseo por cavas subterráneas de vino espumoso Freixenet a 25 metros de profundidad, degustación en queserías artesanales y tarde libre en el Pueblo Mágico de Bernal frente al tercer monolito más grande del mundo.",
        coordenadas: { lat: 20.7397, lng: -99.9404 },
        itinerario: [
            { hora: "06:00 AM", actividad: "Salida de San Manuel vía Arco Norte." },
            { hora: "09:45 AM", actividad: "Tour en cavas Freixenet y cata." },
            { hora: "12:30 PM", actividad: "Pueblo Mágico de Bernal y comida tradicional." },
            { hora: "16:00 PM", actividad: "Paseo por el Centro Histórico de Querétaro." },
            { hora: "17:30 PM", actividad: "Retorno a Puebla. Llegada 21:00 PM." }
        ],
        incluye: ["Transporte redondo con casetas", "Tour guiado en cavas con copa de vino", "Seguro de viajero"],
        no_incluye: ["Comida y compras"]
    },
    {
        id: "cuetzalan-magico",
        nombre: "Cuetzalan del Progreso: Niebla, Cascadas y Café",
        categoria: "pueblo_magico",
        subcategoria: "turismo_comunitario",
        estado: "Puebla",
        precio: 820,
        precio_texto: "$820 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Camioneta Ejecutiva / Autobús",
        duracion: "Día Completo (05:30 a 21:30)",
        distancia: "175 km desde Puebla",
        tiempo_traslado: "3 hrs",
        badge: "Niebla & Tradición Totonaca",
        imagen: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Callejones empedrados de arquitectura blanca, cascada Las Brisas en medio de la vegetación selvática, cata de café de altura y danza ancestral de voladores frente a la Parroquia de San Francisco.",
        coordenadas: { lat: 20.0175, lng: -97.5228 },
        itinerario: [
            { hora: "05:30 AM", actividad: "Salida desde San Manuel hacia la Sierra Nororiental." },
            { hora: "09:00 AM", actividad: "Llegada a Cuetzalan. Desayuno con tlacoyos y café de olla." },
            { hora: "10:00 AM - 13:00 PM", actividad: "Caminata y baño en la Cascada Las Brisas." },
            { hora: "13:30 PM - 16:30 PM", actividad: "Centro de Cuetzalan, telares de cintura y voladores." },
            { hora: "17:00 PM", actividad: "Retorno a Puebla. Arribo 21:30 PM." }
        ],
        incluye: ["Transporte redondo con peajes", "Entrada a Cascada Las Brisas", "Guía local y seguro de viajero"],
        no_incluye: ["Alimentos y compras artesanales"]
    },
    {
        id: "acapulco-playa",
        nombre: "Bahías de Acapulco: Fin de Semana de Playa",
        categoria: "pueblo_magico",
        subcategoria: "playa",
        estado: "Guerrero",
        precio: 980,
        precio_texto: "$980 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Transporte Terrestre Confortable",
        duracion: "Fin de Semana (Salida Viernes Noche)",
        distancia: "390 km desde Puebla",
        tiempo_traslado: "4.5 hrs",
        badge: "Sol & Mar Pacífico",
        imagen: "https://images.unsplash.com/photo-1512815046276-89dfb82432af?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Escapada directa a la Costa Dorada de Acapulco con llegada directa a la zona hotelera. Ideal para familias y grupos de descanso sin el desgaste de manejar.",
        coordenadas: { lat: 16.8531, lng: -99.8237 },
        itinerario: [
            { hora: "23:00 PM (Viernes)", actividad: "Salida nocturna desde San Manuel, Puebla." },
            { hora: "06:00 AM (Sábado)", actividad: "Llegada a Acapulco. Desayuno frente al mar y día libre en la playa." },
            { hora: "17:00 PM (Domingo)", actividad: "Abordaje para regreso seguro a Puebla." },
            { hora: "23:00 PM", actividad: "Arribo a San Manuel." }
        ],
        incluye: ["Transporte redondo Puebla - Acapulco - Puebla", "Casetas Autopista del Sol", "Seguro de viajero"],
        no_incluye: ["Hospedaje (opcional paquete con hotel)", "Alimentos"]
    },

    // =========================================================================
    // TIER 3: DESTINOS VIP (ALIANZA fraVEO - ALTA GAMA & CIRCUITOS MUNDIALES)
    // =========================================================================
    {
        id: "inglaterra-completo",
        nombre: "Inglaterra al Completo 2026",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Reino Unido",
        precio: 1909,
        precio_texto: "$1,909 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vuelos + Circuito en Autocar de Gran Lujo",
        duracion: "8 Días / 7 Noches",
        distancia: "Europa",
        tiempo_traslado: "Vuelo Trasatlántico",
        badge: "Reino Unido VIP",
        imagen: "img/IMG-20260926-WA0005.jpg",
        descripcion: "Circuito exclusivo por Inglaterra: Londres, Stonehenge, Bath, Bristol, Stratford-upon-Avon (tierra de Shakespeare), Liverpool y Oxford. Hoteles 4 estrellas con desayunos y guías oficiales en español.",
        coordenadas: { lat: 51.5074, lng: -0.1278 },
        itinerario: [
            { hora: "Día 1-2", actividad: "Llegada a Londres. Visita panorámica por Big Ben, Abadía de Westminster y Palacio de Buckingham." },
            { hora: "Día 3-4", actividad: "Monolitos sagrados de Stonehenge, baños romanos de Bath y cuna de The Beatles en Liverpool." },
            { hora: "Día 5-6", actividad: "Stratford-upon-Avon, Oxford y colegios universitarios históricos." },
            { hora: "Día 7-8", actividad: "Día libre en Londres para compras y vuelo de retorno a México." }
        ],
        incluye: ["Vuelos internacionales", "Hoteles 4 estrellas con desayuno buffet", "Guía en español", "Traslados privados"],
        no_incluye: ["Gastos personales", "Tours opcionales"]
    },
    {
        id: "guatemala-completo",
        nombre: "Guatemala al Completo 2026",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Centroamérica",
        precio: 1300,
        precio_texto: "$1,300 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vuelo + Traslados Privados",
        duracion: "8 Días / 7 Noches",
        distancia: "Centroamérica",
        tiempo_traslado: "Vuelo Directo",
        badge: "Mundo Maya",
        imagen: "img/IMG-20260926-WA0007.jpg",
        descripcion: "Antigua Guatemala colonial con sus iglesias barrocas y volcanes de fondo, Lago Atitlán rodeado de pueblos indígenas mayas, mercado textil de Chichicastenango y sitio arqueológico Iximché.",
        coordenadas: { lat: 14.5586, lng: -90.7295 },
        itinerario: [
            { hora: "Día 1-2", actividad: "Ciudad de Guatemala y traslado a Antigua colonial." },
            { hora: "Día 3-4", actividad: "Navegación en lancha por los pueblos del Lago Atitlán." },
            { hora: "Día 5-6", actividad: "Mercado indígena de Chichicastenango y ruinas de Iximché." },
            { hora: "Día 7-8", actividad: "Retorno a Ciudad de Guatemala y vuelo de regreso." }
        ],
        incluye: ["Vuelo redondo", "Hoteles coloniales con desayuno", "Lancha en Lago Atitlán", "Guía certificado"],
        no_incluye: ["Alimentos no detallados"]
    },
    {
        id: "vietnam-camboya",
        nombre: "Vietnam y Camboya al Completo",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Sureste Asiático",
        precio: 2265,
        precio_texto: "$2,265 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vuelos + Crucero Bahía de Halong",
        duracion: "11 Días / 10 Noches",
        distancia: "Asia",
        tiempo_traslado: "Vuelo Internacional",
        badge: "Maravillas de Asia",
        imagen: "img/IMG-20260926-WA0006.jpg",
        descripcion: "Travesía por la exótica Indochina: Hanoi, noche a bordo de crucero tradicional en la Bahía de Halong, templos milenarios de Angkor Wat en Siem Reap, Hoi An y Ciudad Ho Chi Minh.",
        coordenadas: { lat: 20.9101, lng: 107.1839 },
        itinerario: [
            { hora: "Día 1-3", actividad: "Hanoi: Templo de la Literatura y barrio antiguo." },
            { hora: "Día 4-5", actividad: "Crucero de lujo y noche mágica en Bahía de Halong." },
            { hora: "Día 6-8", actividad: "Siem Reap (Camboya): Amanecer en los templos de Angkor Wat." },
            { hora: "Día 9-11", actividad: "Hoi An colonial y vuelo de retorno a México." }
        ],
        incluye: ["Vuelos internos y traslados", "Crucero en Bahía Halong con pensión completa", "Entradas a Angkor Wat", "Guías en español"],
        no_incluye: ["Visas y propinas"]
    },
    {
        id: "tailandia-completo",
        nombre: "Tailandia al Completo 2027",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Tailandia",
        precio: 1432,
        precio_texto: "$1,432 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vuelos + Hoteles 4 y 5 Estrellas",
        duracion: "8 Días / 7 Noches",
        distancia: "Asia",
        tiempo_traslado: "Vuelo",
        badge: "Reino de Siam",
        imagen: "img/IMG-20260926-WA0025.jpg",
        descripcion: "Bangkok con el Palacio Real y Buda Esmeralda, ruinas sagradas de Ayutthaya, santuario ético de elefantes en Chiang Mai y playas de arena blanca en Phuket.",
        coordenadas: { lat: 13.7563, lng: 100.5018 },
        itinerario: [
            { hora: "Día 1-3", actividad: "Bangkok: Templos dorados, mercados flotantes y río Chao Phraya." },
            { hora: "Día 4-5", actividad: "Ayutthaya y Chiang Mai en el norte montañoso." },
            { hora: "Día 6-8", actividad: "Playas e islas de Phuket o Krabi." }
        ],
        incluye: ["Hoteles con desayuno", "Vuelos internos", "Guías en español", "Visitas a templos"],
        no_incluye: ["Gastos personales"]
    },
    {
        id: "breve-kenia",
        nombre: "Breve Kenia & Safari 2027",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Kenia",
        precio: 2135,
        precio_texto: "$2,135 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Jeep 4x4 Land Cruiser con Techo Elevable",
        duracion: "6 Días / 5 Noches",
        distancia: "África",
        tiempo_traslado: "Vuelo + 4x4",
        badge: "Safari Masai Mara",
        imagen: "img/IMG-20260926-WA0024.jpg",
        descripcion: "Safari fotográfico en la mítica Reserva Nacional Masai Mara y Lago Nakuru. Avistamiento de los 'Cinco Grandes' (león, leopardo, elefante, rinoceronte y búfalo) con alojamiento en lodges de lujo en plena sabana.",
        coordenadas: { lat: -1.4061, lng: 35.0085 },
        itinerario: [
            { hora: "Día 1", actividad: "Llegada a Nairobi y traslado al lodge." },
            { hora: "Día 2", actividad: "Parque Nacional Lago Nakuru y flamencos rosas." },
            { hora: "Día 3-4", actividad: "Safaris de mañana y tarde en la Reserva Masai Mara." },
            { hora: "Día 5-6", actividad: "Visita a poblado Masai y regreso a Nairobi para vuelo." }
        ],
        incluye: ["Pensión completa en lodges de safari", "Vehículo 4x4 con conductor-guía de habla hispana", "Entradas a parques nacionales", "Seguro de evacuación médica Flying Doctors"],
        no_incluye: ["Propinas y visado de Kenia"]
    },
    {
        id: "tanzania-esencial",
        nombre: "Tanzania Esencial 2027",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Tanzania",
        precio: 3565,
        precio_texto: "$3,565 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vehículos 4x4 de Safari",
        duracion: "7 Días / 6 Noches",
        distancia: "África",
        tiempo_traslado: "Vuelo + 4x4",
        badge: "Cráter Ngorongoro",
        imagen: "img/IMG-20260926-WA0028.jpg",
        descripcion: "El espectáculo de vida salvaje más grandioso del planeta en el Cráter del Ngorongoro, Parque Nacional Serengeti y Lago Manyara.",
        coordenadas: { lat: -3.2427, lng: 35.4856 },
        itinerario: [
            { hora: "Día 1-2", actividad: "Arusha y Parque Nacional Tarangire con sus baobabs." },
            { hora: "Día 3-4", actividad: "Llanuras infinitas del Serengeti." },
            { hora: "Día 5-7", actividad: "Descenso al Cráter del Ngorongoro y retorno." }
        ],
        incluye: ["Alojamiento en Tented Camps de lujo", "Pensión completa", "Entradas a reservas", "Guía especializado"],
        no_incluye: ["Vuelos internacionales", "Bebidas premium"]
    },
    {
        id: "clasico-espana-europa",
        nombre: "El Clásico Real Madrid vs Barcelona & Circuito Europa",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Europa",
        precio: 5790,
        precio_texto: "$5,790 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vuelos + Autocar de Gran Confort",
        duracion: "18 Días / 17 Noches",
        distancia: "Europa",
        tiempo_traslado: "Vuelos + Autocar",
        badge: "El Clásico + 4 Países",
        imagen: "img/IMG-20260926-WA0018.jpg",
        descripcion: "Paquete estelar que incluye boleto oficial al Clásico en el Estadio Santiago Bernabéu de Madrid, seguido por un gran circuito por España, Francia (París), Italia (Venecia, Florencia, Roma) y Alemania.",
        coordenadas: { lat: 40.4530, lng: -3.6883 },
        itinerario: [
            { hora: "Días 1-4", actividad: "Madrid: Asistencia al partido El Clásico en el Bernabéu y tour por Toledo." },
            { hora: "Días 5-8", actividad: "Burdeos y París (Torre Eiffel, Museo del Louvre y crucero por el Sena)." },
            { hora: "Días 9-13", actividad: "Alpes suizos, Venecia en góndola y Florencia renacentista." },
            { hora: "Días 14-18", actividad: "Roma monumental (Coliseo, Vaticano) y vuelo de regreso." }
        ],
        incluye: ["Boleto oficial a El Clásico", "Vuelo redondo México - Madrid - Roma - México", "Hoteles céntricos con desayuno", "Guía correo en español durante todo el viaje"],
        no_incluye: ["Cenas y propinas"]
    },
    {
        id: "fantasia-oman",
        nombre: "Fantasía de Omán: Desiertos y Oasis 2027",
        categoria: "fraveo_lujo",
        subcategoria: "internacional",
        estado: "Medio Oriente",
        precio: 1520,
        precio_texto: "$1,520 USD",
        anticipo_apartado: "Cotizar WhatsApp",
        tipo_transporte: "Vehículos 4x4 + Campamentos en el Desierto",
        duracion: "6 Días / 5 Noches",
        distancia: "Medio Oriente",
        tiempo_traslado: "Vuelo",
        badge: "Las Mil y Una Noches",
        imagen: "img/IMG-20260926-WA0031.jpg",
        descripcion: "Mezquitas de mármol en Mascate, dunas doradas del Desierto de Wahiba Sands con noche en campamento beduino bajo las estrellas, castillos medievales de Nizwa y cañones esmeralda de Wadi Bani Khalid.",
        coordenadas: { lat: 23.5880, lng: 58.3829 },
        itinerario: [
            { hora: "Día 1-2", actividad: "Mascate: Gran Mezquita del Sultán Qaboos y zoco de Mutrah." },
            { hora: "Día 3", actividad: "Travesía 4x4 por las dunas de Wahiba Sands y puesta de sol." },
            { hora: "Día 4-5", actividad: "Pozas esmeralda de Wadi Bani Khalid y fuerte de Nizwa." },
            { hora: "Día 6", actividad: "Retorno a Mascate y vuelo de salida." }
        ],
        incluye: ["Hoteles y campamento en el desierto con media pensión", "Transporte en 4x4 con chofer-guía", "Entradas a monumentos"],
        no_incluye: ["Vuelos y bebidas"]
    },
    {
        id: "cancun-all-inclusive",
        nombre: "Cancún & Riviera Maya All-Inclusive",
        categoria: "fraveo_lujo",
        subcategoria: "playa_internacional",
        estado: "Quintana Roo",
        precio: 8990,
        precio_texto: "$8,990 MXN",
        anticipo_apartado: "Aparta con $1,500",
        tipo_transporte: "Vuelo Redondo + Traslados Privados",
        duracion: "4 Días / 3 Noches",
        distancia: "Caribe Mexicano",
        tiempo_traslado: "Vuelo directo",
        badge: "Todo Incluido 5 Estrellas",
        imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Resort todo incluido frente a las playas de arena blanca y mar turquesa del Caribe Mexicano. Alimentos gourmet, bebidas ilimitadas, deportes acuáticos y traslados privados aeropuerto-hotel.",
        coordenadas: { lat: 21.1619, lng: -86.8515 },
        itinerario: [
            { hora: "Día 1", actividad: "Vuelo a Cancún y traslado al resort. Cóctel de bienvenida y check-in." },
            { hora: "Día 2", actividad: "Día de playa, albercas y restaurantes de especialidad." },
            { hora: "Día 3", actividad: "Día libre o tour opcional a Isla Mujeres o Tulum." },
            { hora: "Día 4", actividad: "Desayuno buffet frente al mar y traslado al aeropuerto." }
        ],
        incluye: ["Vuelo redondo desde CDMX/Puebla", "Resort All-Inclusive 4 o 5 estrellas", "Traslados privados aeropuerto-hotel-aeropuerto"],
        no_incluye: ["Tours extras y propinas"]
    }
];

// =========================================================================
// CATÁLOGO NACIONAL DE MÉXICO (290 DESTINOS PARA CONSULTA PROFUNDA)
// =========================================================================
const CATALOGO_NACIONAL_290 = [
    // Puebla
    { nombre: "Cholula", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Gran Pirámide con Iglesia de los Remedios en la cima y 365 cúpulas virreinales." },
    { nombre: "Zacatlán de las Manzanas", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Barranca de los Jilgueros, puente de cristal, sidras artesanales y reloj floral." },
    { nombre: "Chignahuapan", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Talleres de esferas navideñas sopladas en vidrio y baños termales a 38°C." },
    { nombre: "Cuetzalan del Progreso", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Calles empedradas en la niebla, cascadas y cata de café totonaca de altura." },
    { nombre: "Atlixco de las Flores", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Viveros monumentales al pie del volcán Popocatépetl y Villa Iluminada." },
    { nombre: "Pahuatlán", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Cuna del papel amate prehispánico en la Sierra Norte de Puebla." },
    { nombre: "Tlatlauquitepec", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Cerro Cabezón con tirolesa extrema, presa La Soledad y niebla boscosa." },
    { nombre: "Tetela de Ocampo", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Pueblo heroico minero, cascadas de Aconco y paisajes de montaña." },
    { nombre: "Huauchinango", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Presa de Necaxa, cascadas de Totolapa y flores de azalea." },
    { nombre: "Xicotepec de Juárez", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Virgen de Guadalupe monumental y centro ceremonial La Xochipila." },
    { nombre: "Teziutlán", estado: "Puebla", cat: "Pueblos Mágicos", desc: "La Perla de la Sierra, arquitectura francesa colonial y bosque de niebla." },
    { nombre: "Huejotzingo", estado: "Puebla", cat: "Pueblos Mágicos", desc: "Convento franciscano del siglo XVI patrimonio UNESCO y sidra tradicional." },

    // Hidalgo
    { nombre: "Grutas de Tolantongo", estado: "Hidalgo", cat: "Ecoturismo & Termales", desc: "Pozas termales turquesa en acantilados, túnel de vapor y río tibio." },
    { nombre: "Huasca de Ocampo", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Prismas Basálticos columnares y haciendas de beneficio virreinales." },
    { nombre: "Mineral del Chico", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Parque Nacional boscoso, peñas para escalar y gastronomía minera." },
    { nombre: "Real del Monte", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Pueblo minero de tradición británica, cuna del paste tradicional y panteón inglés." },
    { nombre: "Zimapán", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Presa hidroeléctrica, cañones y aguas termales en la Sierra Gorda." },
    { nombre: "Zempoala", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Acueducto del Padre Tembleque y haciendas pulqueras históricas." },
    { nombre: "Metztitlán", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Reserva de la biosfera de cactáceas gigantes y convento agustino." },
    { nombre: "Acaxochitlán", estado: "Hidalgo", cat: "Pueblos Mágicos", desc: "Bosques de pinos, medicina tradicional otomí y presas naturales." },

    // Querétaro
    { nombre: "Peña de Bernal", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Tercer monolito más alto del mundo, gorditas de maíz y artesanías." },
    { nombre: "Tequisquiapan", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Aguas termales, vuelos en globo aerostático y Ruta del Queso y Vino." },
    { nombre: "Cadereyta de Montes", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Viveros de cactáceas endémicas y campamentos astronómicos." },
    { nombre: "Jalpan de Serra", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Misiones franciscanas barrocas de la Sierra Gorda fundadas por Junípero Serra." },
    { nombre: "San Joaquín", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Catedral del Huapango, grutas Los Herrera y zona arqueológica de Ranas." },
    { nombre: "Amealco de Bonfil", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Cuna de la muñeca artesanal otomí Lele y bosques de encino." },
    { nombre: "Pinal de Amoles", estado: "Querétaro", cat: "Pueblos Mágicos", desc: "Mirador Cuatro Palos sobre las nubes, Puente de Dios y Cañón de la Angostura." },

    // Oaxaca
    { nombre: "Monte Albán & Mitla", estado: "Oaxaca", cat: "Rutas Culturales", desc: "Capital de la civilización zapoteca y grecas de piedra labrada." },
    { nombre: "Hierve el Agua", estado: "Oaxaca", cat: "Ecoturismo & Termales", desc: "Cascadas petrificadas de carbonato de calcio con albercas infinitas." },
    { nombre: "Capulálpam de Méndez", estado: "Oaxaca", cat: "Pueblos Mágicos", desc: "Sierra Juárez, medicina tradicional indígena y bosques de niebla." },
    { nombre: "Mazunte & Zipolite", estado: "Oaxaca", cat: "Playas & Costas", desc: "Santuario de tortugas marinas, Punta Cometa y playas bohemias del Pacífico." },
    { nombre: "Bahías de Huatulco", estado: "Oaxaca", cat: "Playas & Costas", desc: "Nueve bahías vírgenes de arena dorada, arrecifes de coral y fincas cafetaleras." },
    { nombre: "Santa Catarina Juquila", estado: "Oaxaca", cat: "Pueblos Mágicos", desc: "Santuario mariano más visitado del sur de México y bosques serranos." },
    { nombre: "San Pablo Villa de Mitla", estado: "Oaxaca", cat: "Pueblos Mágicos", desc: "Palacios prehispánicos y talleres de mezcal artesanal de agave espadín." },

    // Guerrero & Morelos
    { nombre: "Taxco de Alarcón", estado: "Guerrero", cat: "Pueblos Mágicos", desc: "Platería fina 925, callejones coloniales y Parroquia de Santa Prisca." },
    { nombre: "Ixtapa Zihuatanejo", estado: "Guerrero", cat: "Playas & Costas", desc: "Bahía de pescadores tradicional combinada con complejos hoteleros frente al mar." },
    { nombre: "Tepoztlán", estado: "Morelos", cat: "Pueblos Mágicos", desc: "Pirámide del Cerro del Tepozteco, misticismo y nieves artesanales." },
    { nombre: "Tlayacapan", estado: "Morelos", cat: "Pueblos Mágicos", desc: "Convento de San Juan Bautista y cuna del tradicional baile del chinelo." },
    { nombre: "Xochitepec", estado: "Morelos", cat: "Pueblos Mágicos", desc: "Haciendas azucareras virreinales y gastronomía morelense de pozole verde." },

    // Tlaxcala & Veracruz
    { nombre: "Huamantla", estado: "Tlaxcala", cat: "Pueblos Mágicos", desc: "Tapetes monumentales de aserrín multicolor y haciendas ganaderas históricas." },
    { nombre: "Tlaxco", estado: "Tlaxcala", cat: "Pueblos Mágicos", desc: "Quesos artesanales de rancho, bosques de pinos y haciendas pulqueras." },
    { nombre: "Ixtenco", estado: "Tlaxcala", cat: "Pueblos Mágicos", desc: "Último bastión otomí de Tlaxcala, bordados de pepenado y atole morado de maíz." },
    { nombre: "Orizaba", estado: "Veracruz", cat: "Pueblos Mágicos", desc: "Teleférico al Cerro del Borrego, Palacio de Hierro de Gustave Eiffel y Río Orizaba." },
    { nombre: "Coatepec & Xico", estado: "Veracruz", cat: "Pueblos Mágicos", desc: "Capital del café gourmet en México, cascada de Texolo y casonas coloniales." },
    { nombre: "Papantla", estado: "Veracruz", cat: "Pueblos Mágicos", desc: "Cuna de la vainilla, danza de voladores y zona arqueológica de El Tajín." },
    { nombre: "Coscomatepec", estado: "Veracruz", cat: "Pueblos Mágicos", desc: "Al pie del Pico de Orizaba, talabartería y pan de leña tradicional." },
    { nombre: "Zozocolco de Hidalgo", estado: "Veracruz", cat: "Pueblos Mágicos", desc: "Globos monumentales de papel de china y arquitectura de piedra blanca." },

    // Michoacán & Guanajuato
    { nombre: "Pátzcuaro & Janitzio", estado: "Michoacán", cat: "Pueblos Mágicos", desc: "Lago purépecha, tradición del Día de Muertos y artesanías de cobre." },
    { nombre: "Tlalpujahua", estado: "Michoacán", cat: "Pueblos Mágicos", desc: "El pueblo de la eterna Navidad con talleres de esferas de vidrio soplado." },
    { nombre: "San Miguel de Allende", estado: "Guanajuato", cat: "Rutas Culturales", desc: "Parroquia neogótica de cantera rosa, galerías de arte y hoteles boutique." },
    { nombre: "Dolores Hidalgo", estado: "Guanajuato", cat: "Pueblos Mágicos", desc: "Cuna de la Independencia Nacional y nieves de sabores exóticos." },
    { nombre: "Mineral de Pozos", estado: "Guanajuato", cat: "Pueblos Mágicos", desc: "Pueblo fantasma minero, campos de lavanda y túneles subterráneos." },

    // San Luis Potosí & Sureste
    { nombre: "Xilitla (Jardín Escultórico)", estado: "San Luis Potosí", cat: "Ecoturismo & Termales", desc: "Castillo y laberinto surrealista de Edward James enclavado en la selva huasteca." },
    { nombre: "Real de Catorce", estado: "San Luis Potosí", cat: "Pueblos Mágicos", desc: "Túnel de Ogarrio de 2.3 km, recorridos en Willys por el desierto y misticismo huichol." },
    { nombre: "Cascadas de Tamasopo & Tamul", estado: "San Luis Potosí", cat: "Ecoturismo & Termales", desc: "Cascada de 105 metros de caída sobre el río Tampaón navegable en canoa." },
    { nombre: "Palenque & Cascadas de Agua Azul", estado: "Chiapas", cat: "Rutas Culturales", desc: "Templo de las Inscripciones en la selva maya y pozas naturales azul turquesa." },
    { nombre: "San Cristóbal de las Casas", estado: "Chiapas", cat: "Pueblos Mágicos", desc: "Calles coloniales, comunidades tzotziles de Chamula y cañón del Sumidero." },
    { nombre: "Valladolid & Chichén Itzá", estado: "Yucatán", cat: "Rutas Culturales", desc: "Cenotes sagrados de aguas cristalinas y la Pirámide de Kukulcán." },
    { nombre: "Izamal", estado: "Yucatán", cat: "Pueblos Mágicos", desc: "La Ciudad Amarilla con el Convento de San Antonio de Padua y pirámides mayas." },
    { nombre: "Bacalar", estado: "Quintana Roo", cat: "Playas & Costas", desc: "La Laguna de los Siete Colores con estromatolitos y aguas de ensueño." },
    { nombre: "Tulum", estado: "Quintana Roo", cat: "Playas & Costas", desc: "Zona arqueológica maya frente al mar Caribe y cenotes sagrados subterráneos." }
];
