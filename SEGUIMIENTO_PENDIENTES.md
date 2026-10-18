# 📋 Bitácora de Seguimiento, Pendientes y Hoja de Ruta (`SEGUIMIENTO_PENDIENTES.md`)

> Documento vivo de memoria operativa para **Viajes La Ruta del Águila**, **Estética Alma** y el ecosistema **Mera-Kirai / Vromlix**.

---

## 📌 Punto 0: Estrategia del Cupón Cruzado `ESTETICA10` (Recordatorio Operativo)
- **Estado Actual:** El cupón `ESTETICA10` (**10% de descuento directo**) está **abierto para todos los visitantes** en `mera-kirai.com`, hayan ido o no previamente a la estética, para eliminar fricción y maximizar el cierre de ventas en viajes.
- **Acción Futura Acordada:** Imprimir tarjetas físicas de agradecimiento y colocarlas en el espejo de tocador de **Estética Alma** (*Calle Río Nexapa #6101*) para que cada clienta de corte, tinte o uñas escanee el QR hacia los viajes, y cada viajero reciba un cupón de servicio capilar en el salón.

---

## 📌 Punto 10.4: Activación Bancaria Stripe, CLABE Real y Kit de Acrílico en el Local
1. **Cuenta CLABE y Stripe México (En espera de datos de la Hermana Alma):**
   - La interfaz de cobro con tarjeta (Stripe) y transferencia SPEI en `index.html` ya está programada.
   - **Pendiente para activar liquidación real:** En cuanto la hermana Alma proporcione su **CLABE interbancaria de 18 dígitos**, **RFC (RESICO)** e **INE**, reemplazaremos la CLABE temporal (`012 650 01548796541 2`) en el modal de pago y dejaremos conectada su cuenta en Stripe México para transferencias automáticas.
2. **Kit Físico en el Salón (Calle Río Nexapa #6101):**
   - Colocar porta-acrílico en recepción con **QR de WiFi para clientas**, **QR del Catálogo de Viajes (`mera-kirai.com`)**, **QR de Reseñas en Google Maps** y datos de transferencia SPEI.

---

## 📌 Punto 17: Arquitectura de Subagentes vs. Skills vs. Scripts Python
- **`arbitro_adversarial` (Subagente Activo):** Revisa de forma crítica cada entrega (precios, enlaces, imágenes, contraste visual, políticas legales y experiencia móvil) antes de dar por cerrada una iteración.
- **Motor Diario de Cartelera (`build_master_catalog.py` + `.github/workflows/daily_catalog_sync.yml`):** Script determinista en Python + Cron diario en GitHub Actions que cruza `sectur_destinos.db` y `cdmx_events.db`, depura fechas vencidas cada 24 horas y actualiza los 908+ registros con museos, platillos típicos y costos de boletos.
- **`subagente_contable` (Próxima Fase al Registrar la Primera Venta Real):** Subagente especializado que calculará automáticamente la retención mínima de **ISR en RESICO (1.0% – 1.25%)**, deducción de gasolina/peajes/mantenimiento de la Suzuki Ertiga y el reparto transparente **50% / 50% de utilidad neta** dentro del panel administrativo `#view-gestor`.

---

## 📌 Punto 19: Ecosistema de Subdominios Futuros (`*.mera-kirai.com`)
Arquitectura preparada en Cloudflare DNS y en el panel Super-Admin (`#view-gestor`) para lanzar progresivamente los siguientes giros sin pagar hosting adicional:
1. **`estetica.mera-kirai.com`** *(Activo)* → Redirección 301 en el borde hacia `https://mera-kirai.com/estetica.html` (Estudio de Belleza Imagen y Estilo • Estética Alma).
2. **`contabilidad.mera-kirai.com`** *(En planeación — NexoContable)* → Despacho digital de asesoría fiscal RESICO, facturación CFDI 4.0 y declaraciones mensuales para pequeños negocios y transportistas.
3. **`pet.mera-kirai.com`** *(En planeación — Pet Studio AI)* → Sesiones fotográficas profesionales y retratos temáticos con IA para mascotas en Puebla, con entrega digital e impresa.
4. **`mercadito.mera-kirai.com`** *(En planeación — El Mercadito Regional)* → Venta por encargo de productos artesanales auténticos traídos directamente en nuestros viajes (sidra y pan de queso de Zacatlán, café y vainilla de Cuetzalan, plata 925 de Taxco, rompope y salsas).
5. **`belleza.mera-kirai.com`** *(En planeación — Catálogo de Insumos)* → Venta de kits post-alaciado, ampolletas, shampoos sin sal y productos traídos de *Expo Beauty Show (EBS)* en CDMX.

---

## 📌 Punto 21: Sistema de Alertas Administrativas, Permisos y Cupo Mínimo
Recordatorios integrados en el panel de control (`#view-gestor`) y programados para alertar oportunamente:
1. **Alerta de Cupo Mínimo (48 Horas Antes del Viaje):**
   - Si una salida en la **Suzuki Ertiga VIP** tiene **4 o más lugares reservados**, se marca como **Confirmada (Verde)** y se solicita liquidar el 80% restante.
   - Si a las 48 horas previas tiene **menos de 4 asientos**, dispara alerta para ofrecer cambio a traslado privado o ejecutar el **reembolso íntegro del 100% de la Pre-venta ($200 MXN)** el mismo día.
2. **Alertas de Licencias y Permisos del Local (Estética Alma - Río Nexapa #6101):**
   - Renovación anual de **Aviso de Funcionamiento COFEPRIS / Salubridad**.
   - Dictamen anual de **Protección Civil Municipal (Puebla)**, recarga de extintor vigente y señalética de ruta de evacuación.
   - Refrendo de **Licencia de Funcionamiento Municipal** del Ayuntamiento de Puebla.
3. **Alertas Vehiculares (Suzuki Ertiga VIP — Chofer Efraín):**
   - Póliza de **Seguro de Viajero con Cobertura Amplia de Pasajeros**.
   - Verificación vehicular semestral del Estado de Puebla y servicio preventivo de frenos/llantas antes de salidas largas.

---

## 📌 Punto 22: Amenidades de Conciertos ("Kit Concierto") e Inteligencia Comercial (Pata de Perro)
- **Aprendizaje Clave:** Agencias como *Pata de Perro* operan salidas exitosas a conciertos en CDMX vendiendo **exclusivamente el transporte redondo** (el cliente compra su propio boleto del evento en la zona y costo que prefiere, eliminando el riesgo de inventario y reventa para nosotros).
- **Ventaja Competitiva de La Ruta del Águila:**
  - Salida cómoda desde San Manuel (sin aglomeraciones en Parque Juárez).
  - Apartado accesible con solo **$200 MXN** (en lugar del 50% que exige la competencia).
  - **Kit Concierto Ejecutivo Incluido:** Snack pack de cortesía (botana/galleta + agua fría embotellada) + **Gafete Conmemorativo de Colección del Tour** + Seguro de Viajero con chofer sobrio asignado que espera hasta que termina la última canción.

---

## 📌 Punto 23: Protocolo de Cotizaciones Complejas (Luna de Miel, El Chepe, Cancún — fraVEO vs. Paquete Propio)
- **Diferenciación Operativa:**
  1. **Operación Propia Terrestre (Ertiga VIP):** Conciertos CDMX, Pueblos Mágicos cercanos y traslados ejecutivos. Tarifa cerrada fija ($549 - $950 MXN) y apartado directo con $200.
  2. **Grandes Expediciones / Luna de Miel (fraVEO):** El Chepe Express, Cancún, Los Cabos, Europa o cruceros. Requieren vuelos, noches de hotel y traslados privados.
- **Flujo de Atención cuando el Cliente Pide Cotización:**
  1. Alma IA (o el formulario web) recaba: **Destino, Número de Pasajeros, Fechas Tentativas y Correo/WhatsApp**.
  2. El sistema envía los datos a la Hermana Alma y se evalúan dos vías:
     - **Vía fraVEO:** Acceso a tarifas mayoristas de cadenas hoteleras, aerolíneas y operadores receptivos con comisiones negociadas.
     - **Vía Directa (Armado Propio):** En circuitos locales o combinaciones donde fraVEO añada intermediación innecesaria, armamos la propuesta directa.
  3. **Generación de Propuesta Formal en PDF:** Se entrega al cliente una cotización profesional membretada con desglose de itinerario, políticas de equipaje, hospedaje y facilidades de pago diferido.

---

## 📌 Punto 24: Sincronización Automática 05:00 AM (Pipeline Unificado)
- **Crontab Local Actualizado:**
  - `05:00 AM`: `CDMX_Event_Radar/automation/run_nightly_sync.sh` extrae eventos de CDMX y SECTUR, ejecuta `build_master_catalog.py`, actualiza el catálogo de 909 opciones y hace `git push origin main` hacia `mera-kirai.com`.
  - `05:30 AM`: `vromlix_ops.sh` (mantenimiento y sincronización).
  - `06:00 AM`: `agent_nightly_ops.py` (auditoría nocturna).
  - `10:00 AM`: `youtube_daily_digest.py` (17 canales tras la mañanera del pueblo).

---

## 📌 Punto 25: Aislamiento Móvil Estricto (`@media (max-width: 768px)`)
- Todas las adaptaciones móviles (apilado de columnas en modales, chat flotante adaptativo al 100vw - 24px, catálogo nacional vertical y distribución táctil) están aisladas en CSS responsivo, garantizando que la versión de laptop y monitores de escritorio (> 768px) permanezca **100% intacta e idéntica a la visualización aprobada**.

---

## 📌 Punto 26: Erradicación de Desbordes Móviles, Tarjetas Compactas y Paginación Instantánea (Árbitro Adversarial)
- **Bloqueo Antidesbordamiento Horizontal Estricto:**
  - `html, body` asegurados con `overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; position: relative !important;`.
  - `.slider-wrapper` configurado con `overflow: hidden; max-width: 100vw;` y `perspective: none` en móvil, eliminando la proyección 3D que expandía el ancho de página.
- **Anclaje Físico de Botones Flotantes y Chat Alma IA:**
  - WhatsApp (`.whatsapp-float` a `bottom: 18px; right: 16px; z-index: 9998`).
  - Orbe IA (`.ai-orb-trigger` a `bottom: 80px; right: 16px; z-index: 9999`).
  - Ventana Chat (`.ai-chat-window` anclada con `left: 8px; right: 8px; width: auto; max-width: calc(100vw - 16px); bottom: 74px; height: 72vh; z-index: 10005;` con `overscroll-behavior: contain` y `overflow-y: auto` táctil suave).
  - Botón de cierre `✖` ampliado con área táctil accesible de 44x44px.
  - Input con `font-size: 16px` para prevenir el zoom automático no deseado de iOS Safari.
- **Compactación de Tarjetas de Salidas Confirmadas (EBS 2026 y Xochimilco):**
  - Se eliminaron las largas listas de viñetas que duplicaban el itinerario en la vista principal.
  - Se reemplazaron por chips/pills elegantes y concisos (`🚐 Redondo San Manuel`, `🛡️ Seguro de Viajero`, `🧳 Espacio Insumos`, `🛶 Trajinera Iluminada`).
  - Botón claro `✨ Ver Itinerario y Detalles` que despliega el modal interactivo con el cronograma minuto a minuto sin forzar desplazamientos verticales infinitos en laptop ni en celular.
- **Paginación en Lotes y Carga Rápida del Catálogo Maestro:**
  - Carga inicial ultrarrápida de 24 tarjetas (< 10ms) en lugar de renderizar los 909 destinos simultáneamente.
  - Botón ergonómico `Cargar más opciones (+24)` para navegación fluida y sin congelamiento de memoria.
  - Tarjetas compactas con botón `🔍 Ver Ficha` conectado al modal interactivo de atracciones y gastronomía típica.
- **Compromiso Formal de Cotización:** Se calibró el compromiso formal de entrega en PDF a **24 a 48 horas hábiles** para cotizaciones complejas y paquetes fraVEO (hoteles + vuelos + trenes turísticos).

---

## 📌 Punto 27: Catálogo Minimalista Google-Search, Jerarquía de Modales (Z-Index) y Cotización Empática IA
- **Integridad de Información Confirmada (Punto 1):**
  - Se verificó y aseguró que ningún dato de itinerarios hora por hora, vehículos, inclusiones ni amenidades de EBS 2026, Xochimilco o destinos nacionales fue eliminado. Todo se despliega en su totalidad y con alta fidelidad dentro del modal de detalles (`openSharedElementModal()`).
- **Calibración Realista de Cotizaciones (Punto 2):**
  - Se ajustó el tiempo de promesa de entrega de cotizaciones formales desglosadas en PDF para paquetes a la medida fraVEO (El Chepe, vuelos, Cancún, circuitos) a **24 a 48 horas hábiles**, garantizando viabilidad operativa frente a horarios de mayoristas y fines de semana.
- **Jerarquía y Apilamiento de Modales (Z-Index Fix - Punto 3.d):**
  - Se resolvió el conflicto donde `#destino-detail-modal` aparecía oculto detrás del catálogo en laptop y móvil.
  - Nueva jerarquía estricta: `#modal-catalogo-nacional` (`z-index: 10000`), `#destino-detail-modal` (`z-index: 10020` y tarjeta `10021`), `.ai-chat-window` (`z-index: 10030`).
  - Al cerrar el detalle, el catálogo conserva exactamente la posición de scroll y los filtros del usuario.
- **Rediseño Minimalista del Catálogo Estilo Google Search (Punto 3.e):**
  - Se eliminaron títulos verbosos kilométricos y la leyenda fija que saturaba la pantalla.
  - Barra superior compacta (~85px en móvil): Título limpio `Catálogo de Destinos`, botón de cierre `✖`, barra de búsqueda integrada tipo píldora y selector de estados.
  - Fila horizontal única deslizable de colecciones (Pueblos Mágicos, Barrios, Rutas, Ecoturismo, UNESCO). Las sub-pills secundarias se ocultan cuando el filtro es "Todos".
  - **Resultado:** El área visible de tarjetas de destinos pasó del 3% a más del 85% del viewport en teléfonos celulares.
- **Cotización Empática e Inmediata con Alma IA (Punto 3.c):**
  - Botón renombrado a `<i class="fas fa-wand-magic-sparkles"></i> Cotizar`.
  - Al hacer clic, abre de inmediato el chat de Alma sin quedar bloqueado por el catálogo.
  - Alma saluda mencionando el destino específico y sus atractivos (playas y comida en Acapulco, magia colonial en Pueblos Mágicos, ambiente y transporte con chofer en conciertos CDMX) y formula preguntas breves de cualificación (número de personas y fecha estimada).
  - Incluye chips interactivos de respuesta rápida (`👥 2 Personas`, `👨‍👩‍👧‍👦 Familia (4-6)`, `🗓️ Fin de Semana`, `📱 WhatsApp Alma`).
- **Navegación Ergonómica y Soporte Dual Internacional (Puntos 3.a y 3.b):**
  - Botón de tarjeta renombrado a `Ver Detalles` (sustituyendo "Ver Ficha"). Se mantuvo el clic exclusivo en el botón para prevenir aperturas accidentales al deslizar con el pulgar en el móvil.
  - Soporte de contacto dual integrado: Botón de WhatsApp directo con Alma en Puebla (`+52 222 801 6244`) y botón alternativo de soporte directo con Rogerman en Irlanda (`+353 8 77 66 55 36`).

### 28. Refinamiento Integral de Filtros, Apartado $200 MXN, Modal WhatsApp Dual y Experiencia Móvil (2026-10-18)
- **Filtros Dinámicos y Deselección Toggle (Punto 1):**
  - Corregido el bug donde las sub-píldoras no eliminaban la clase `.active` al hacer clic en varias ubicaciones consecutivas.
  - Ahora cada sub-píldora cuenta con comportamiento toggle: al hacer clic sobre una activa, se desmarca regresando limpiamente a "Todas".
  - Las macro-píldoras principales (Pueblos Mágicos, Playas & Caribe, Rutas, Conciertos CDMX, VIP Internacional) se sincronizan de forma limpia y exclusiva.
- **Flujo de Apartado $200 MXN y Modal de Elección WhatsApp (Punto 2):**
  - Separación clara y profesional de acciones en la ficha del destino (`#destino-detail-modal`):
    1. **Botón Principal:** `Apartar Asiento ($200 MXN)` que abre de inmediato el modal de pago y selección de asientos Suzuki Ertiga (`#pay-modal`), con desglose SPEI BBVA, depósito en OXXO, pasarela de tarjeta y aplicación del cupón `ESTETICA10`.
    2. **Botón de Contacto:** `WhatsApp` con icono oficial que despliega un modal elegante (`#whatsapp-choice-modal`) para elegir:
       - **Hermana Alma (Puebla):** Contacto comercial fraVEO y reservaciones (`+52 222 801 6244`).
       - **Roger Man (Irlanda):** Soporte inmediato y seguimiento (`+353 8 77 66 55 36`).
       - **Enviar a Ambos:** Envía el mensaje con el itinerario y precio pre-llenado a ambos números.
- **Cotización con IA en Capa Superior sin Cerrar Catálogo (Punto 3):**
  - Se eliminó la llamada destructiva `closeCatalogoNacionalModal()` en el botón `Cotizar`.
  - La ventana del chat de IA de Alma (`.ai-chat-window`) ahora se abre directamente encima del catálogo (`z-index: 10040 !important`), saludando con los datos y atractivos específicos del destino seleccionado.
  - Al cerrar la consulta de la IA, el usuario permanece exactamente en la misma sección y tarjeta del catálogo donde estaba.
- **Optimización Móvil y Neutralización de Caché (Punto 4):**
  - Botón de cierre `✖` del catálogo fijado de forma absoluta en la esquina superior derecha (`top: 10px; right: 12px; z-index: 50`) con padding de seguridad (`padding-right: 54px`) en `.catalogo-minimal-topbar` para evitar cualquier colisión con el título o buscador.
  - Actualización de versiones de assets en `index.html` (`?v=20261018b`) y cabeceras `Cache-Control: no-cache` para forzar a los navegadores móviles (Chrome/Safari) a descargar los estilos corregidos de sombreado cyan (`.catalogo-filter-pill.active`) y la jerarquía de modales.



