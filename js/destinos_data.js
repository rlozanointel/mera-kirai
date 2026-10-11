/**
 * Base de Datos Maestra de Destinos y Experiencias Turísticas
 * Agencia: Viajes La Ruta del Águila (Alma Luis) & Alianza Fraveo
 * Salidas directas desde: Río Nexapa 6101, Jardines de San Manuel, Puebla, Pue.
 * Teléfono / WhatsApp oficial: 222 801 6244
 */

const DESTINOS_DB = [
    {
        id: "expo-beauty-show-citibanamex",
        nombre: "Expo Beauty Show (EBS 2026) en Centro Citibanamex",
        categoria: "destacado_confirmado",
        subcategoria: "express",
        estado: "Ciudad de México",
        precio: 790,
        precio_texto: "$790 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga VIP (6 Pax) / Sprinter",
        duracion: "Día Completo (07:30 a 19:45)",
        distancia: "145 km desde Puebla",
        tiempo_traslado: "2.3 hrs directo a puerta",
        badge: "Salida Confirmada 24-26 Octubre",
        imagen: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        descripcion: "El evento de belleza y estilismo más grande de América Latina en Centro Citibanamex. Acceso a salas B, C y D con lanzamientos de marcas profesionales, insumos a precio de mayoreo y shows de corte/peinado en vivo.",
        coordenadas: { lat: 19.4389, lng: -99.2227 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Caseta San Martín Texmelucan", lat: 19.2842, lng: -98.4347, altitud: "2,260 m" },
            { nombre: "Paso de Río Frío (Autopista)", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Centro Citibanamex (Puerta Expos)", lat: 19.4389, lng: -99.2227, altitud: "2,270 m" }
        ],
        itinerario: [
            { hora: "07:30 AM", actividad: "Cita y abordaje puntual en Río Nexapa 6101, San Manuel, Puebla." },
            { hora: "10:00 AM", actividad: "Llegada directa al Centro Citibanamex (sin estrés de estacionamiento)." },
            { hora: "10:15 AM - 15:30 PM", actividad: "Recorrido libre y compras en Expo Beauty Show (EBS 2026), salas B, C y D." },
            { hora: "15:30 PM - 16:45 PM", actividad: "Comida en el área gastronómica del recinto o zona comercial." },
            { hora: "17:00 PM", actividad: "Abordaje en la camioneta e inicio de regreso seguro a Puebla." },
            { hora: "19:45 PM", actividad: "Arribo a Jardines de San Manuel, Puebla." }
        ],
        incluye: [
            "Transporte redondo ejecutivo garantizado",
            "Boleto oficial de acceso a Expo Beauty Show 2026",
            "Combustible, peajes de autopista y chofer calificado",
            "Seguro de cobertura amplia de viajero"
        ],
        no_incluye: ["Alimentos y compras personales"]
    },
    {
        id: "llorona-xochimilco-nocturna",
        nombre: "La Llorona en Xochimilco: Obra Nocturna en Trajinera",
        categoria: "destacado_confirmado",
        subcategoria: "express",
        estado: "Ciudad de México",
        precio: 1350,
        precio_texto: "$1,350 MXN",
        anticipo_apartado: "$300 MXN",
        tipo_transporte: "Suzuki Ertiga VIP (6 Pax) / Sprinter",
        duracion: "Tarde - Noche (14:30 a 00:00)",
        distancia: "130 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Temporada Día de Muertos",
        imagen: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        video_preview: "video/llorona_xochimilco.mp4",
        descripcion: "Mística experiencia en los canales ancestrales de Xochimilco. Paseo en trajinera tradicional al atardecer por el Embarcadero Cuemanco y acceso al espectáculo multidisciplinario 'La Llorona' en el islote de la Laguna con danza prehispánica y música en vivo.",
        coordenadas: { lat: 19.2882, lng: -99.1037 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista México-Puebla 150D", lat: 19.3512, lng: -98.6738, altitud: "3,180 m" },
            { nombre: "Periférico Sur / Canal de Chalco", lat: 19.3050, lng: -99.0950, altitud: "2,240 m" },
            { nombre: "Embarcadero Cuemanco (Xochimilco)", lat: 19.2882, lng: -99.1037, altitud: "2,240 m" }
        ],
        itinerario: [
            { hora: "14:30 PM", actividad: "Salida puntual desde San Manuel, Puebla." },
            { hora: "16:45 PM", actividad: "Llegada al Embarcadero Cuemanco. Tiempo libre para antojitos típicos." },
            { hora: "17:45 PM - 18:45 PM", actividad: "Paseo nocturno en trajinera por los canales de Xochimilco." },
            { hora: "19:00 PM - 21:00 PM", actividad: "Espectáculo en vivo 'La Llorona' en el islote de la laguna." },
            { hora: "21:30 PM", actividad: "Abordaje en camioneta y retorno tranquilo a Puebla." },
            { hora: "00:00 AM", actividad: "Llegada segura a San Manuel." }
        ],
        incluye: [
            "Transporte redondo ejecutivo con chofer asignado",
            "Paseo en trajinera tradicional",
            "Boleto oficial de acceso VIP al espectáculo de La Llorona",
            "Casetas, combustible y seguro de viajero"
        ],
        no_incluye: ["Consumos de alimentos y bebidas"]
    },
    {
        id: "grutas-tolantongo",
        nombre: "Grutas de Tolantongo: Pozas Termales de Hidalgo",
        categoria: "pueblo_magico",
        subcategoria: "turismo_comunitario",
        estado: "Hidalgo",
        precio: 890,
        precio_texto: "$890 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax) / Urban (14 Pax)",
        duracion: "Día Completo (05:30 a 20:00)",
        distancia: "210 km desde Puebla",
        tiempo_traslado: "3.5 hrs",
        badge: "Ecoturismo & Salud",
        imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Maravilla natural de aguas termales a 36°C enclavadas en un cañón imponente. Incluye acceso completo a las pozas escalonadas de la montaña, la cueva de vapor termal y el río turquesa.",
        coordenadas: { lat: 20.6481, lng: -98.9958 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista Arco Norte", lat: 19.5500, lng: -98.5000, altitud: "2,500 m" },
            { nombre: "Ixmiquilpan / Cardonal", lat: 20.4800, lng: -99.2100, altitud: "1,750 m" },
            { nombre: "Grutas de Tolantongo (Pozas)", lat: 20.6481, lng: -98.9958, altitud: "1,350 m" }
        ],
        itinerario: [
            { hora: "05:30 AM", actividad: "Salida de Puebla por la Autopista Arco Norte." },
            { hora: "09:00 AM", actividad: "Llegada al Parque Ecológico Tolantongo." },
            { hora: "09:15 AM - 12:30 PM", actividad: "Disfrute de las Pozas Termales de la montaña en el acantilado." },
            { hora: "12:30 PM - 14:30 PM", actividad: "Recorrido por la Cueva, Túnel de Vapor y baño en el Río Turquesa." },
            { hora: "14:30 PM - 16:00 PM", actividad: "Comida campestre de barbacoa tradicional hidalguense." },
            { hora: "16:15 PM", actividad: "Salida de Tolantongo con destino a Puebla." },
            { hora: "20:00 PM", actividad: "Arribo a San Manuel." }
        ],
        incluye: [
            "Transporte redondo con combustible y peajes Arco Norte",
            "Entrada oficial al Parque Natural Tolantongo (pozas, cueva, río y túnel)",
            "Seguro de cobertura amplia de viajero"
        ],
        no_incluye: ["Alimentos y tirolesa"]
    },
    {
        id: "chignahuapan-zacatlan",
        nombre: "Zacatlán de las Manzanas & Chignahuapan: Esferas y Termales",
        categoria: "pueblo_magico",
        subcategoria: "escapada_express",
        estado: "Puebla",
        precio: 790,
        precio_texto: "$790 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax)",
        duracion: "Día Completo (06:30 a 20:30)",
        distancia: "128 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Más Vendido Familiar",
        imagen: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Recorrido doble por dos de los pueblos más icónicos de Puebla. Mirador de cristal en la Barranca de los Jilgueros, fábrica de sidras y Reloj Floral en Zacatlán, junto con los talleres artesanales de esferas y aguas termales en Chignahuapan.",
        coordenadas: { lat: 19.9328, lng: -97.9602 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Zacatlán (Barranca y Reloj)", lat: 19.9328, lng: -97.9602, altitud: "2,040 m" },
            { nombre: "Chignahuapan (Talleres y Termales)", lat: 19.8378, lng: -98.0317, altitud: "2,260 m" }
        ],
        itinerario: [
            { hora: "06:30 AM", actividad: "Salida de Puebla por la Autopista Tlaxco-Chignahuapan." },
            { hora: "08:45 AM", actividad: "Llegada a Zacatlán. Desayuno tradicional con pan de queso artesanal." },
            { hora: "09:30 AM - 11:30 AM", actividad: "Paseo por el Mirador de Cristal y fábrica de sidras artesanales." },
            { hora: "12:15 PM - 14:00 PM", actividad: "Chignahuapan: Visita a la Virgen Monumental y taller de esferas navideñas." },
            { hora: "14:00 PM - 15:15 PM", actividad: "Comida de barbacoa tradicional de borrego." },
            { hora: "15:30 PM - 18:00 PM", actividad: "Relajación en los Baños Termales de Chignahuapan (38°C)." },
            { hora: "18:15 PM", actividad: "Retorno hacia Puebla. Llegada 20:30 PM." }
        ],
        incluye: [
            "Transporte redondo ejecutivo con chofer",
            "Entrada a los Baños Termales de Chignahuapan",
            "Visita guiada a taller de esferas y fábrica de sidras",
            "Seguro de cobertura amplia"
        ],
        no_incluye: ["Alimentos y compras personales"]
    },
    {
        id: "queretaro-bernal-freixenet",
        nombre: "Querétaro Mágico, Peña de Bernal & Cavas Freixenet",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Querétaro",
        precio: 950,
        precio_texto: "$950 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga VIP (6 Pax)",
        duracion: "Día Completo (06:00 a 21:00)",
        distancia: "260 km desde Puebla",
        tiempo_traslado: "3.5 hrs",
        badge: "Ruta del Queso y Vino",
        imagen: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Tour exclusivo de vino espumoso en Finca Sala Vivé (Freixenet) con recorrido subterráneo a 25 metros de profundidad. Comida típica en Bernal frente al tercer monolito más grande del mundo y paseo por el Centro Histórico de Querétaro.",
        coordenadas: { lat: 20.7397, lng: -99.9404 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Arco Norte - Autopista 57", lat: 19.8500, lng: -99.2000, altitud: "2,350 m" },
            { nombre: "Cavas Freixenet (Ezequiel Montes)", lat: 20.6500, lng: -99.8900, altitud: "1,980 m" },
            { nombre: "Peña de Bernal", lat: 20.7397, lng: -99.9404, altitud: "2,080 m" }
        ],
        itinerario: [
            { hora: "06:00 AM", actividad: "Salida de Puebla por la Autopista Arco Norte." },
            { hora: "09:30 AM", actividad: "Llegada a Cavas Freixenet en Ezequiel Montes, Querétaro." },
            { hora: "09:45 AM - 11:30 AM", actividad: "Tour guiado por cavas subterráneas y cata de vino espumoso." },
            { hora: "11:45 AM - 15:00 PM", actividad: "Visita a Bernal. Comida de gorditas de maíz quebrado y caminata fotográfica." },
            { hora: "15:30 PM - 17:30 PM", actividad: "Paseo por el Centro Histórico de Querétaro y Acueducto monumental." },
            { hora: "17:30 PM", actividad: "Retorno a Puebla. Arribo estimado 21:00 PM." }
        ],
        incluye: [
            "Transporte redondo con peajes Arco Norte incluidos",
            "Tour guiado oficial por cavas subterráneas Freixenet con degustación",
            "Visita a Bernal y Centro Histórico de Querétaro",
            "Seguro de viajero"
        ],
        no_incluye: ["Comida y compras de vino/queso"]
    },
    {
        id: "taxco-cacahuamilpa",
        nombre: "Taxco de Alarcón & Grutas de Cacahuamilpa",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Guerrero",
        precio: 920,
        precio_texto: "$920 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax) / Urban (14 Pax)",
        duracion: "Día Completo (05:30 a 21:00)",
        distancia: "195 km desde Puebla",
        tiempo_traslado: "3 hrs",
        badge: "Plata 925 & Cuevas",
        imagen: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Exploración de los inmensos salones subterráneos de estalactitas en el Parque Nacional Grutas de Cacahuamilpa, seguido del pueblo platero de Taxco con su majestuosa Parroquia de Santa Prisca y tianguis tradicional de plata 925.",
        coordenadas: { lat: 18.5564, lng: -99.6050 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista Siglo XXI / Cuautla", lat: 18.8100, lng: -98.9500, altitud: "1,450 m" },
            { nombre: "Grutas de Cacahuamilpa", lat: 18.6690, lng: -99.5080, altitud: "1,150 m" },
            { nombre: "Taxco de Alarcón Centro", lat: 18.5564, lng: -99.6050, altitud: "1,770 m" }
        ],
        itinerario: [
            { hora: "05:30 AM", actividad: "Salida de Puebla por Autopista Siglo XXI." },
            { hora: "08:45 AM", actividad: "Llegada al Parque Nacional Grutas de Cacahuamilpa." },
            { hora: "09:15 AM - 11:45 AM", actividad: "Recorrido subterráneo guiado por 2 km de salones naturales." },
            { hora: "12:15 PM - 13:00 PM", actividad: "Traslado al Pueblo Mágico de Taxco de Alarcón." },
            { hora: "13:00 PM - 15:00 PM", actividad: "Comida en restaurante panorámico frente a Santa Prisca." },
            { hora: "15:00 PM - 17:15 PM", actividad: "Recorrido por platerías, Santa Prisca y Cristo Monumental." },
            { hora: "17:30 PM", actividad: "Retorno a Puebla. Llegada a San Manuel 21:00 PM." }
        ],
        incluye: [
            "Transporte redondo con casetas Siglo XXI",
            "Boleto oficial de acceso a Grutas de Cacahuamilpa con guía",
            "Visita a Taxco y tiempo libre para compras",
            "Seguro de viajero"
        ],
        no_incluye: ["Alimentos y compras de platería"]
    },
    {
        id: "cuetzalan-magico",
        nombre: "Cuetzalan del Progreso: Niebla, Cascadas y Café",
        categoria: "pueblo_magico",
        subcategoria: "turismo_comunitario",
        estado: "Puebla",
        precio: 830,
        precio_texto: "$830 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax) / Urban (14 Pax)",
        duracion: "Día Completo (06:00 a 20:15)",
        distancia: "172 km desde Puebla",
        tiempo_traslado: "2.5 hrs",
        badge: "Pueblo Mágico #1",
        imagen: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Sierra Norte de Puebla: callejones empedrados, niebla y la impresionante Cascada Las Brisas. Danza de los Voladores en el atrio parroquial y taller de café de sombra en cooperativa totonaca.",
        coordenadas: { lat: 20.0182, lng: -97.5218 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Zacapoaxtla", lat: 19.8711, lng: -97.5898, altitud: "1,820 m" },
            { nombre: "Cuetzalan Centro", lat: 20.0182, lng: -97.5218, altitud: "1,000 m" }
        ],
        itinerario: [
            { hora: "06:00 AM", actividad: "Salida puntual desde San Manuel, Puebla." },
            { hora: "09:15 AM", actividad: "Llegada a Cuetzalan. Desayuno con café de altura y tlayoyos." },
            { hora: "09:45 AM - 12:00 PM", actividad: "Parroquia de San Francisco y espectáculo de Voladores de Cuetzalan." },
            { hora: "12:30 PM - 15:00 PM", actividad: "Visita a la Cascada Las Brisas y taller artesanal de telares." },
            { hora: "15:00 PM - 16:30 PM", actividad: "Comida tradicional serrana (cecina ahumada y yolixpa)." },
            { hora: "16:45 PM", actividad: "Regreso hacia Puebla. Llegada 20:15 PM." }
        ],
        incluye: [
            "Transporte redondo con combustible y casetas",
            "Entrada a la Cascada Las Brisas",
            "Degustación de café artesanal",
            "Seguro de cobertura amplia"
        ],
        no_incluye: ["Alimentos"]
    },
    {
        id: "orizaba-cordoba-teleferico",
        nombre: "Orizaba Pueblo Mágico (Teleférico) & Córdoba",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Veracruz",
        precio: 780,
        precio_texto: "$780 MXN",
        anticipo_apartado: "$200 MXN",
        tipo_transporte: "Suzuki Ertiga (6 Pax)",
        duracion: "Día Completo (06:30 a 20:00)",
        distancia: "135 km desde Puebla",
        tiempo_traslado: "2 hrs",
        badge: "Teleférico & Café",
        imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Ascenso en el Teleférico de Orizaba hacia el Cerro del Borrego con vista panorámica al Pico de Orizaba. Visita al Palacio de Hierro diseñado por Gustave Eiffel y cata de café en los portales coloniales de Córdoba.",
        coordenadas: { lat: 18.8497, lng: -97.1036 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Autopista Puebla-Orizaba", lat: 18.8500, lng: -97.3000, altitud: "1,500 m" },
            { nombre: "Orizaba (Teleférico y Palacio de Hierro)", lat: 18.8497, lng: -97.1036, altitud: "1,230 m" }
        ],
        itinerario: [
            { hora: "06:30 AM", actividad: "Salida de Puebla por la Autopista 150D." },
            { hora: "08:45 AM", actividad: "Llegada a Orizaba. Desayuno de picadas jarochas y pambazos." },
            { hora: "09:45 AM - 12:00 PM", actividad: "Ascenso en el Teleférico de Orizaba al Cerro del Borrego." },
            { hora: "12:00 PM - 13:45 PM", actividad: "Paseo del Río y Palacio de Hierro de Eiffel." },
            { hora: "14:00 PM - 15:30 PM", actividad: "Comida en Portales de Córdoba y Museo del Café." },
            { hora: "17:15 PM", actividad: "Retorno a Puebla. Arribo a San Manuel 20:00 PM." }
        ],
        incluye: [
            "Transporte redondo con peajes incluidos",
            "Boleto oficial de ascenso en Teleférico de Orizaba",
            "Visita a Orizaba y Córdoba",
            "Seguro de viajero"
        ],
        no_incluye: ["Alimentos y consumos"]
    },
    {
        id: "oaxaca-magico-2dias",
        nombre: "Oaxaca Mágico (2 Días / 1 Noche): Monte Albán & Mitla",
        categoria: "pueblo_magico",
        subcategoria: "express",
        estado: "Oaxaca",
        precio: 1950,
        precio_texto: "$1,950 MXN",
        anticipo_apartado: "$500 MXN",
        tipo_transporte: "Suzuki Ertiga / Sprinter",
        duracion: "Fin de Semana (2 Días / 1 Noche)",
        distancia: "340 km desde Puebla",
        tiempo_traslado: "4 hrs",
        badge: "Cultura & Gastronomía",
        imagen: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80",
        descripcion: "Viaje inolvidable a la capital gastronómica de México. Pasillo del Humo, Zona Arqueológica de Monte Albán, taller de alebrijes en San Martín Tilcajete, Árbol del Tule, Mitla y degustación de mezcal artesanal.",
        coordenadas: { lat: 17.0654, lng: -96.7236 },
        ruta_puntos: [
            { nombre: "Salida: San Manuel, Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Tehuacán - Cuacnopalan", lat: 18.4600, lng: -97.4000, altitud: "1,670 m" },
            { nombre: "Oaxaca de Juárez Centro", lat: 17.0654, lng: -96.7236, altitud: "1,550 m" }
        ],
        itinerario: [
            { hora: "Día 1 - 05:30 AM", actividad: "Salida desde Puebla hacia Oaxaca." },
            { hora: "Día 1 - 09:30 AM", actividad: "Llegada al Pasillo del Humo en Mercado 20 de Noviembre." },
            { hora: "Día 1 - 11:00 AM", actividad: "Zona Arqueológica de Monte Albán con guía." },
            { hora: "Día 1 - 15:00 PM", actividad: "Taller artesanal de alebrijes en Tilcajete." },
            { hora: "Día 1 - 17:00 PM", actividad: "Templo de Santo Domingo y noche libre en el Centro." },
            { hora: "Día 2 - 08:30 AM", actividad: "Visita al milenario Árbol del Tule." },
            { hora: "Día 2 - 10:30 AM", actividad: "Zona Arqueológica de Mitla y mezcalera tradicional." },
            { hora: "Día 2 - 16:00 PM", actividad: "Retorno hacia Puebla. Llegada estimada 21:00 PM." }
        ],
        incluye: [
            "Transporte redondo ejecutivo con todas las casetas",
            "Entradas a zonas arqueológicas Monte Albán y Mitla",
            "Visita guiada a taller de alebrijes y fábrica mezcalera",
            "Seguro de cobertura amplia de viajero"
        ],
        no_incluye: ["Hospedaje (opcional base doble +$900 MXN) y alimentos"]
    },
    // PAQUETES FRAVEO (ALTA GAMA & PLAYA CON IMÁGENES OFICIALES)
    {
        id: "fraveo-cancun-riviera",
        nombre: "Cancún & Riviera Maya All-Inclusive (Fraveo VIP)",
        categoria: "fraveo_lujo",
        subcategoria: "playa_internacional",
        estado: "Quintana Roo",
        precio: 8990,
        precio_texto: "$8,990 MXN",
        anticipo_apartado: "$1,500 MXN",
        tipo_transporte: "Vuelo Redondo + Traslado Aeropuerto",
        duracion: "4 Días / 3 Noches",
        distancia: "Caribe Mexicano",
        tiempo_traslado: "Vuelo directo",
        badge: "Franquicia Fraveo VIP",
        imagen: "img/IMG-20260926-WA0004.jpg",
        descripcion: "Hospedaje de lujo frente al mar en plan Todo Incluido con alimentos, bebidas ilimitadas, deportes acuáticos no motorizados y traslados privados aeropuerto-hotel.",
        coordenadas: { lat: 21.1619, lng: -86.8515 },
        ruta_puntos: [
            { nombre: "Puebla a AICM / AIFA", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Cancún Aeropuerto", lat: 21.0365, lng: -86.8771, altitud: "10 m" }
        ],
        itinerario: [
            { hora: "Día 1", actividad: "Vuelo a Cancún y traslado ejecutivo al resort. Check-in y cóctel de bienvenida." },
            { hora: "Día 2", actividad: "Día completo de playa, albercas infinitas y gastronomía internacional." },
            { hora: "Día 3", actividad: "Excursión opcional a Isla Mujeres o cenotes sagrados." },
            { hora: "Día 4", actividad: "Check-out, compras de souvenirs y traslado al aeropuerto de regreso." }
        ],
        incluye: ["Vuelos redondos", "Resort 4 o 5 estrellas All-Inclusive", "Traslado privado", "Impuestos hoteleros"],
        no_incluye: ["Tours opcionales", "Propinas"]
    },
    {
        id: "fraveo-los-cabos",
        nombre: "Los Cabos & El Arco de San Lucas (Fraveo VIP)",
        categoria: "fraveo_lujo",
        subcategoria: "playa_internacional",
        estado: "Baja California Sur",
        precio: 10490,
        precio_texto: "$10,490 MXN",
        anticipo_apartado: "$1,500 MXN",
        tipo_transporte: "Vuelo Redondo + Traslados",
        duracion: "4 Días / 3 Noches",
        distancia: "Pacífico & Mar de Cortés",
        tiempo_traslado: "Vuelo",
        badge: "Playas de Lujo",
        imagen: "img/IMG-20260926-WA0005.jpg",
        descripcion: "Descubre el punto donde se une el Mar de Cortés con el Océano Pacífico. Paseo en barco con fondo de cristal hacia el Arco de Cabo San Lucas y Playa del Amor.",
        coordenadas: { lat: 22.8905, lng: -109.9167 },
        ruta_puntos: [
            { nombre: "San Manuel a Aeropuerto", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Los Cabos Centro", lat: 22.8905, lng: -109.9167, altitud: "15 m" }
        ],
        itinerario: [
            { hora: "Día 1", actividad: "Llegada a San José del Cabo y traslado al hotel." },
            { hora: "Día 2", actividad: "Tour en catamarán al Arco de Cabo San Lucas y avistamiento marino." },
            { hora: "Día 3", actividad: "Recorrido por el corredor turístico y atardecer en Todos Santos." },
            { hora: "Día 4", actividad: "Mañana de compras y vuelo de retorno a Puebla/CDMX." }
        ],
        incluye: ["Vuelo redondo", "Hospedaje de lujo", "Paseo en barco al Arco", "Desayunos"],
        no_incluye: ["Gastos personales"]
    },
    {
        id: "fraveo-huatulco-playas",
        nombre: "Bahías de Huatulco & Puerto Escondido (Fraveo VIP)",
        categoria: "fraveo_lujo",
        subcategoria: "playa_internacional",
        estado: "Oaxaca",
        precio: 7850,
        precio_texto: "$7,850 MXN",
        anticipo_apartado: "$1,000 MXN",
        tipo_transporte: "Transporte Terrestre Ejecutivo / Vuelo",
        duracion: "4 Días / 3 Noches",
        distancia: "Costa de Oaxaca",
        tiempo_traslado: "Vuelo / Terrestre",
        badge: "Playas del Pacífico",
        imagen: "img/IMG-20260926-WA0006.jpg",
        descripcion: "Navegación por las 9 bahías vírgenes de Huatulco, esnórquel en arrecifes coralinos, visita a fincas cafetaleras de la sierra y atardecer en Puerto Escondido.",
        coordenadas: { lat: 15.7667, lng: -96.1333 },
        ruta_puntos: [
            { nombre: "Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "Bahías de Huatulco", lat: 15.7667, lng: -96.1333, altitud: "20 m" }
        ],
        itinerario: [
            { hora: "Día 1", actividad: "Llegada a Bahías de Huatulco. Tarde libre en Playa Chahué." },
            { hora: "Día 2", actividad: "Paseo en yate por las 9 bahías con esnórquel en Bahía La Entrega." },
            { hora: "Día 3", actividad: "Visita a telares y cata de café de la sierra oaxaqueña." },
            { hora: "Día 4", actividad: "Desayuno frente al mar y regreso." }
        ],
        incluye: ["Hospedaje 4 estrellas", "Paseo en yate por las bahías", "Desayunos incluidos"],
        no_incluye: ["Alimentos no especificados"]
    },
    {
        id: "fraveo-chiapas-canon",
        nombre: "Chiapas Mágico & Cañón del Sumidero (Fraveo VIP)",
        categoria: "fraveo_lujo",
        subcategoria: "playa_internacional",
        estado: "Chiapas",
        precio: 8490,
        precio_texto: "$8,490 MXN",
        anticipo_apartado: "$1,200 MXN",
        tipo_transporte: "Vuelo / Terrestre Ejecutivo",
        duracion: "4 Días / 3 Noches",
        distancia: "Sureste Mexicano",
        tiempo_traslado: "Circuito",
        badge: "Naturaleza Viva",
        imagen: "img/IMG-20260926-WA0007.jpg",
        descripcion: "Navegación por el imponente Cañón del Sumidero en lancha rápida, pueblos coloniales de San Cristóbal de las Casas y Chiapa de Corzo, y cascadas El Chiflón.",
        coordenadas: { lat: 16.7370, lng: -92.6376 },
        ruta_puntos: [
            { nombre: "Puebla", lat: 19.0186, lng: -98.1963, altitud: "2,160 m" },
            { nombre: "San Cristóbal de las Casas", lat: 16.7370, lng: -92.6376, altitud: "2,200 m" }
        ],
        itinerario: [
            { hora: "Día 1", actividad: "Llegada a Tuxtla y recorrido en lancha por el Cañón del Sumidero." },
            { hora: "Día 2", actividad: "Pueblos indígenas de San Juan Chamula y Zinacantán." },
            { hora: "Día 3", actividad: "Cascadas El Chiflón y Lagunas de Montebello." },
            { hora: "Día 4", actividad: "San Cristóbal Centro y vuelo de regreso." }
        ],
        incluye: ["Hospedaje con encanto", "Lancha en el Cañón", "Entradas a parques naturales", "Guía certificado"],
        no_incluye: ["Alimentos"]
    }
];

// Integrar automáticamente los eventos maestros de CDMX (Conciertos y Festivales)
if (typeof EVENTOS_CDMX_MAESTRO !== 'undefined') {
    EVENTOS_CDMX_MAESTRO.forEach(ev => {
        if (!DESTINOS_DB.some(d => d.id === ev.id)) {
            DESTINOS_DB.push(ev);
        }
    });
}
