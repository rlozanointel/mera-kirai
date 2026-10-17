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
