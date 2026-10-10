# 🧭 PROJECT BLUEPRINT: Viajes Alma & Vromlix Multi-Hub
> **Única Fuente de Verdad (Single Source of Truth - SSOT)**  
> **Dominio Oficial:** [https://mera-kirai.com](https://mera-kirai.com) | **Ubicación:** Río Nexapa 6101, Jardines de San Manuel, Puebla, Pue.  
> **Última Actualización:** Octubre 2026

---

## 🚫 1. Reglas de Oro y Términos Prohibidos
1. **NUNCA usar la palabra "SECTUR"** en ninguna sección pública, pestaña, badge o texto de la página. Los destinos y rutas se presentan por su valor cultural, natural y comunitario propio (*Pueblos Mágicos*, *Ecoturismo*, *Rutas Gastronómicas*).
2. **NUNCA usar la frase "Modo Dios"** en la web. Por respeto a la comunidad de la iglesia de la hermana Alma y el público familiar, toda visualización 3D satelital se denomina:
   * **`Simulador de Ruta Satelital 3D`** o **`Vista Aérea Panorámica 3D`**.
3. **Contextualización del Mapa 3D:** El visor 3D no debe estar aislado como un enlace genérico en el menú; debe invocarse **dentro de cada paquete o evento**, permitiendo al usuario ver la ruta exacta del viaje seleccionado.
4. **Aislamiento Estricto de Privacidad:**
   * La cara pública del cliente **SOLO** muestra Viajes, Expos/Conciertos, Simulador 3D y Estética Alma.
   * NexoContable, Mascotas (Pet Art), Mercadito Local y el Reparto 50/50 del vehículo están **ocultos** y protegidos tras autenticación por PIN:
     - **PIN 1234:** Hermana Alma (Lista de reservas, estados de pago OXXO/SPEI, tablero de demanda).
     - **PIN 9999:** Super-Admin Rogerman (Módulos privados, control 50/50, configuración de seguridad).

---

## 🚗 2. Operación de Flota, Precios y Estructura Financiera
### A. Suzuki Ertiga 2022 (Servicio VIP Express - 6 Pasajeros)
* **Distribución de Asientos:**
  - Asiento #1: Copiloto Ejecutivo
  - Asientos #2, #3, #4: Fila Media (Confort)
  - Asientos #5, #6: Fila Trasera (Panorámicos)
* **Precios Psicológicos:**
  - CDMX Express Diario (Centro / Polanco / Coyoacán / Hospitales): **$449 MXN** redondo.
  - Expos & Congresos (Centro Citibanamex / Expo Santa Fe): **$499 MXN** redondo.
  - Conciertos CDMX (Foro Sol / Estadio GNP / Palacio de los Deportes / Auditorio): **$549 MXN** redondo con espera nocturna.
* **Modelo Financiero 50/50 (Por viaje lleno de 6 pasajeros a $449):**
  - Ingreso Bruto: **$2,694 MXN**
  - Costos Operativos Estimados (Gasolina $500 + Casetas $500): **$1,000 MXN**
  - Fondo de Reserva Mensual del Vehículo: **$500 MXN**
  - Utilidad Neta a Repartir 50/50: **$1,194 MXN** ($597 MXN Alma / $597 MXN Rogerman).

### B. Camionetas Urban (14 Pasajeros)
* Circuitos Turísticos de Fin de Semana (Oaxaca, Tabasco, Cuetzalan, Zacatlán).
* Salida garantizada con mínimo 10 pasajeros reservados.

---

## 📅 3. Expos y Eventos CDMX: Actualización Diaria
La plataforma mantiene una cartelera actualizada con eventos reales:
* **Centro Citibanamex:** Expos industriales, médicas y convenciones empresariales.
* **Expo Santa Fe:** Ferias de diseño, tecnología y eventos corporativos.
* **Recintos de Conciertos:** Foro Sol / Estadio GNP Seguros, Auditorio Nacional, Arena CDMX, Palacio de los Deportes.
* Cada evento cuenta con su tarjeta dedicada con fecha, hora de salida desde Puebla, punto de regreso seguro y cupos disponibles en la Ertiga.

---

## 🎴 4. Galería de Magnificación (Coverflow) & Inteligencia de Demanda
* **Diseño UI/UX (@santaia.lab):**
  - Los 290 destinos de México y experiencias comunitarias se muestran en un **carrusel de magnificación**.
  - **Foco Central:** La tarjeta activa se agranda (`scale: 1.05`), mostrando fotografía inmersiva, precio sugerido y duración.
  - **Tarjetas Laterales:** Se visualizan parcialmente en los bordes con menor escala (`scale: 0.88`) y ligero desenfoque (`blur(4px)`).
* **Mecanismo de Votación / Lista de Deseos Semanal:**
  - En cada tarjeta el usuario puede pulsar: *"❤️ Me interesa este destino"*.
  - Registra Nombre + WhatsApp del cliente.
  - El sistema contabiliza los destinos más votados cada semana para abrir la salida oficial una vez alcanzado el cupo.

---

## 🌐 5. Infraestructura Cloud, Dominio y Subdominios
* **Dominio Principal:** `https://mera-kirai.com`
* **CDN y DNS:** Cloudflare (Modo Proxied con SSL Universal automático).
* **Servidor Origen:** GitHub Pages (`rlozanointel/mera-kirai`).
* **Subdominios Futuros:**
  - `estetica.mera-kirai.com` -> Módulo de belleza y citas de Alma.
  - `nexocontable.mera-kirai.com` -> Plataforma contable.
  - `admin.mera-kirai.com` -> Panel de control privado.
