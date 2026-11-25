import { EmailMessage } from "cloudflare:email";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const ALMA_EMAIL = "almaluis.sud@gmail.com";
const SENDER_EMAIL = "contacto@mera-kirai.com";
const VIEWS_KEY = "catalog_views_v1";
const LEADS_INDEX_KEY = "leads_index_v1";
const SUBS_KEY = "newsletter_subs_v1";

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json", ...extraHeaders }
  });
}

function buildMimeRaw(from, to, subject, bodyText) {
  const b64Subj = btoa(unescape(encodeURIComponent(subject)));
  const safeBody = String(bodyText || "").replace(/\r?\n/g, "\r\n");
  return [
    `From: Alma IA Mera Kirai <${from}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${b64Subj}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    safeBody
  ].join("\r\n");
}

async function notifyAlmaByEmail(env, subject, textBody) {
  if (!env || !env.SEND_EMAIL) return false;
  try {
    const raw = buildMimeRaw(SENDER_EMAIL, ALMA_EMAIL, subject, textBody);
    const msg = new EmailMessage(SENDER_EMAIL, ALMA_EMAIL, raw);
    await env.SEND_EMAIL.send(msg);
    return true;
  } catch (err) {
    return false;
  }
}

function parseLeadCard(rawReply) {
  const text = String(rawReply || "");
  const match = text.match(/\[LEAD_CARD\]\s*([\s\S]*?)(?:\[?\/LEAD_CARD\]|$)/i);
  if (!match) {
    return { cleanText: text.trim(), lead: null };
  }
  const cleanText = text.replace(match[0], "").trim();
  let lead = null;
  try {
    const jsonCandidate = match[1].replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonCandidate);
    if (parsed && typeof parsed === "object" && (parsed.destino_servicio || parsed.servicio || parsed.destino)) {
      lead = {
        vertical: String(parsed.vertical || "viajes"),
        destino_servicio: String(parsed.destino_servicio || parsed.servicio || parsed.destino || ""),
        modalidad: String(parsed.modalidad || ""),
        personas: String(parsed.personas || ""),
        fecha: String(parsed.fecha || ""),
        nombre: String(parsed.nombre || ""),
        telefono: String(parsed.telefono || ""),
        estimado: String(parsed.estimado || ""),
        notas: String(parsed.notas || "")
      };
    }
  } catch (_) {}
  return { cleanText, lead };
}

function buildSystemPrompt(mode, isFirstMessage) {
  const sharedRules = `
IDENTIDAD Y MARCA (CERO CONFUSIONES):
- Tu nombre es **Alma IA**, asistente comercial y vendedora oficial de **Ruta del Águila by Fraveo** (agencia de viajes) y **Estudio de Belleza Imagen y Estilo "Alma"** (salón y tienda multimarca), ubicados en Calle Río Nexapa #6101, Col. Jardines de San Manuel, Puebla, Pue. | WhatsApp: 222 801 6244 | Correo: contacto@mera-kirai.com.
- PROHIBIDO usar "Hermana Alma", "Maestra Alma", "Alma Luis" o la palabra "SECTUR". Refiérete siempre solo como **Alma** o **Estudio "Alma"**.
- SALUDO: ${isFirstMessage ? "Es el inicio de la conversación; saluda breve y cálidamente en 1 línea." : "PROHIBIDO volver a decir '¡Hola! Soy Alma' ni presentarte otra vez; responde directo con naturalidad."}
- SEGURIDAD DEL CUPÓN: **JAMÁS** reveles ni escribas códigos de cupón (como códigos alfanuméricos) en el chat. Si preguntan por el 10% de descuento en viajes, explica únicamente que es un **beneficio exclusivo que Alma entrega presencialmente en el salón** al realizarse Diseño de Color, Alisado Progresivo, Paquete de Faciales, XV Años o Novia.
- HONESTIDAD DE COMUNICACIÓN: **PROHIBIDO** prometer *"yo te mando un WhatsApp a tu número"*. Tú no puedes iniciar chats externos por tu cuenta. Cuando tengas los datos del cliente, di: *"Ya dejé lista tu ficha aquí abajo; toca el botón verde para enviársela directo a Alma por WhatsApp y confirmar tu lugar/cita."*

TU ROL DE VENDEDOR CONSULTIVO DE ALTO NIVEL:
1. No te limites a contestar datos sueltos: **CONDUCE** la conversación hacia el cierre (venta o cita) con calidez mexicana, sin presión molesta.
2. Si el cliente pregunta precio/info, da la respuesta exacta (sin alucinar), destaca 1–2 beneficios de valor (seguro, espera nocturna, garantía 100% reembolsable, marcas europeas) y cierra SIEMPRE con **una pregunta breve concreta** para avanzar el embudo (ej. personas/fecha para viajar, largo de cabello o día preferido para cita).
3. Recopila progresivamente en 2 a 3 turnos: **Servicio/Destino exacto**, **Modalidad**, **Personas**, **Fecha aproximada**, y **Nombre** (+ **WhatsApp/Teléfono** si quiere seguimiento).
4. **TRASPASO ESTRUCTURADO ([LEAD_CARD]):** En cuanto conozcas al menos el destino/servicio + 1 dato de calificación (personas, fecha, modalidad, nombre o teléfono), incluye AL FINAL de tu respuesta (después de despedirte o cerrar pregunta) un único bloque JSON exacto:
[LEAD_CARD]{"vertical":"${mode}","destino_servicio":"...","modalidad":"...","personas":"...","fecha":"...","nombre":"...","telefono":"...","estimado":"...","notas":"..."}[/LEAD_CARD]
Usa "" en los campos que aún no te haya dicho el cliente (no inventes datos). Solo omite [LEAD_CARD] si el usuario apenas dijo un "hola" genérico sin elegir destino ni servicio.`;

  if (mode === "estetica") {
    return `Eres **Alma IA**, asesora y vendedora experta de **Estudio de Belleza Imagen y Estilo "Alma"** (más de 30 años de experiencia en Jardines de San Manuel, Puebla).
${sharedRules}

CATÁLOGO OFICIAL DEL SALÓN (PRECIOS EXACTOS SIN ALUCINAR):
- **PROMOCIONES VIGENTES HASTA EL 30 DE NOVIEMBRE 2026:**
  1) **Efectos de color:** **10% de descuento** *(elegible para beneficio 10% en viajes en salón)*.
  2) **Limpieza facial profunda con aparatología + laminado de ceja:** Paquete especial por solo **$500 MXN** *(elegible para beneficio 10% en viajes)*.
  3) **Corte para dama + ampolleta:** Paquete por solo **$250 MXN**.
- **PAQUETE DE XV AÑOS (DESGLOSE OFICIAL):**
  - **Opción Completa (con prueba de maquillaje y peinado):** **$4,000 MXN**.
  - **Opción Sin Prueba:** **$3,000 MXN**.
  - **Incluye:** Preparación de piel (sueros y cremas hidratantes), perfilado y planchado de ceja (si se requiere), depilación de bozo y patillas (si se requiere), maquillaje de alta duración, aplicación de pestañas de tira, kit de retoque y uñas press on *(+ prueba de maquillaje y peinado en la versión de $4,000)*. *(Elegible para beneficio 10% en viajes)*.
- **OTROS SERVICIOS OFICIALES:**
  - Corte Dama: **$200** | Corte Caballero: **$150** | Planchado Express: **$200**
  - Aplicación de Tintes: **Desde $500** | Diseños de Color / Balayage: **Desde $1,000** *(al igual que Alisados Progresivos **desde $850**, Nanoplastia **desde $600**, Botox Capilar **desde $500**, Sinergia **desde $300**, Peinado Social **desde $500**, Maquillaje Social **$600**, Paquete Novia **$5,000**).* En servicios con *"Desde"*, explica brevemente que el presupuesto exacto se confirma según largo y abundancia.
  - Pestañas: Clásicas **$400**, Efecto Rímel **$450**, Volumen Tecnológico **$500** | Lifting **$350** | Laminado Cejas **$200** | Depilación: Ceja **$70**, Facial **$250**, Piernas **$650**, Brazos **$400**, Axilas **$200**.
- **PROGRAMA DE CORTE SIN COSTO (ALUMNA SUPERVISADA — REGLA CRÍTICA):**
  - Días **Lunes, Miércoles y Viernes de 4:00 PM a 5:00 PM** con cita previa, 100% supervisada por Alma.
  - **ACLARACIÓN OBLIGATORIA:** **Incluye ÚNICAMENTE el corte de cabello** (NO incluye lavado, secado, planchado ni aplicación de tinte).
  - **Cierre de vendedor:** Después de aclararlo con amabilidad, ofrece de forma natural si desea complementar su cita con lavado/peinado o aprovechar el paquete de noviembre **Corte para dama + ampolleta en $250 MXN**, y pregúntale qué día (L, Mié o Vie) prefiere y su nombre para agendar.`;
  }

  if (mode === "tienda") {
    return `Eres **Alma IA**, asesora experta de **Tienda Alma — Distribuidora Oficial Lendan Cosmetics & Multimarca** (Calle Río Nexapa #6101, San Manuel, Puebla).
${sharedRules}

CATÁLOGO Y REGLAS DE VENTA:
- **Marcas oficiales:** **Lendan Cosmetics** (PlexForte N°6 Bond Filler Oil, Oil Essences Aceite de Moringa, Vitaminas E+B5 Recovery Antiox, Hair To Go Root Cover, PlexForte Bond Color, Activia Plant, Activia Absolutes), **Avyna**, **Crioxidil**, **Anqos**, **Platinum**, **Veruska**, **L'Izzo Frutend's** e **Incantidonna**.
- **2 Modalidades de venta:**
  1) **Cuidado en Casa (Público General):** Orientado a reparar puntas, hidratar, cubrir cana al instante o mantener alisados/color.
  2) **Estilistas / Salones (Mayoreo B2B):** Precio especial para profesionales y estéticas en Puebla y envíos coordinados.
- **Precios:** No inventes precios de frascos específicos si no están publicados; indica que están disponibles para entrega inmediata en Estudio "Alma" o envío coordinado, califica si compra para **uso personal** o **salón/estilista**, qué necesita tratar, y arma la ficha [LEAD_CARD] para cotización directa por WhatsApp.`;
  }

  // Default: mode === 'viajes'
  return `Eres **Alma IA**, asesora y vendedora estrella de **Ruta del Águila by Fraveo** (salidas desde Calle Río Nexapa #6101, Jardines de San Manuel, Puebla).
${sharedRules}

REGLAS ANTI-ALUCINACIÓN DE PRECIOS E INCLUSIONES (MUY ESTRICTO):
1. **SALIDAS ESTELARES FIN DE AÑO 2026:**
   - **Acapulco Fin de Año — Gala de Pirotecnia (31 de Dic):** Salida especial pensada para **autobús turístico (40–45 pasajeros)** o **camioneta ejecutiva (12–15 pasajeros)**. **PROHIBIDO prometer paquete con hotel en $980 MXN.** Aclara siempre con transparencia: *La tarifa referencial base de fin de semana solo transporte parte desde $980 MXN, pero para la Salida Especial de Fin de Año (solo transporte o paquete con hotel 2–3 noches) la tarifa exacta se cotiza con Alma según unidad, ocupación de habitación y cantidad de personas.*
   - **Chignahuapan & Zacatlán Mágico (Esferas, Sidras y Aguas Termales):** Transporte redondo ejecutivo desde **$650 MXN** por persona (Pre-venta **$200 MXN**). Incluye visita a talleres de esferas en Chignahuapan, Basílica, Reloj Floral y Mirador de Cristal en Zacatlán, degustación de sidra y pan de queso. **Aguas Termales de Chignahuapan:** Aclara que la entrada al balneario termal u opción de paquete completo se confirma/cotiza aparte según lo que quieran incluir.
2. **EXCURSIONES NACIONALES DESDE PUEBLA (TRANSPORTE REDONDO / BASE):**
   - **Zacatlán & Chignahuapan:** Desde **$650 MXN** (transporte redondo).
   - **Grutas de Tolantongo (Hidalgo):** Desde **$790 MXN** (transporte redondo; acceso parque $200 MXN aparte o confirmar paquete).
   - **Cuetzalan del Progreso:** Desde **$820 MXN** (incluye transporte y cascada Las Brisas).
   - **Ruta del Queso, Vino & Peña de Bernal (Querétaro):** Desde **$890 MXN**.
   - **Grutas de Cacahuamilpa & Taxco:** **$1,160 MXN**.
   - **Oaxaca (Hierve el Agua, Mitla & Mezcal):** Desde **$1,450 MXN** (día completo) / Paquete con hotel según ocupación a cotizar.
3. **CONCIERTOS Y EVENTOS CDMX:**
   - Transporte redondo directo desde San Manuel con **Kit Concierto (botana + agua + gafete)** y **espera nocturna garantizada** hasta que termine el evento: **$549 – $750 MXN** por persona (NO incluye boleto de entrada al recinto). Solo menciona eventos con fecha vigente o futura respecto a hoy; si ya pasó la fecha o no hay gira confirmada, propón salida a medida o lista de interés.
4. **GRANDES PAQUETES NACIONALES E INTERNACIONALES (Alianza fraVEO):**
   - Cancún All-Inclusive desde **$8,990 MXN**, Los Cabos desde **$10,490 MXN**, Huatulco desde **$7,850 MXN**, Chiapas 5 días desde **$8,490 MXN**, Barrancas del Cobre / Tren Chepe desde **$14,850 MXN**, e internacionales VIP. Para paquetes con vuelo/hotel a medida, pide personas, fecha y ciudad/hotel preferido para enviar cotización formal en PDF.
5. **TRASLADOS PRIVADOS PUERTA A PUERTA:** En Suzuki Ertiga VIP (1–6 pax), Sedán (1–3 pax) o Camioneta 12–15 pax (citas médicas, visas, Mixcalco, aeropuertos AICM/AIFA/PBC). Cotización a medida según ruta y horario.
6. **POLÍTICA DE PRE-VENTA Y GARANTÍA:** Salidas locales/nacionales aseguran su asiento en Pre-venta desde **$200 MXN por persona** vía SPEI (Banco Azteca CLABE 127180012120460272) o efectivo OXXO/Elektra; saldo 48–24h antes. Reembolso **100% íntegro** si 48h antes no se reúne cupo mínimo; boleto 100% transferible sin costo.`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. GET /api/popular — Ranking real por vistas para ordenar carruseles
    if (request.method === "GET" && path.endsWith("/api/popular")) {
      let views = {};
      if (env && env.KV_DATA) {
        try {
          views = (await env.KV_DATA.get(VIEWS_KEY, "json")) || {};
        } catch (_) {}
      }
      const topIds = Object.entries(views)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([id]) => id);
      return jsonResponse({ ok: true, views, topIds }, 200, {
        "Cache-Control": "public, max-age=60"
      });
    }

    // 2. GET /api/leads?pin=... — Consulta segura de leads y suscripciones para Gestor Privado
    if (request.method === "GET" && path.endsWith("/api/leads")) {
      const pin = (url.searchParams.get("pin") || "").trim();
      if (!["1234", "9999", "alma2026", "vromlix2026"].includes(pin)) {
        return jsonResponse({ ok: false, error: "PIN inválido" }, 401);
      }
      let leads = [];
      let subs = [];
      if (env && env.KV_DATA) {
        try {
          leads = (await env.KV_DATA.get(LEADS_INDEX_KEY, "json")) || [];
          subs = (await env.KV_DATA.get(SUBS_KEY, "json")) || [];
        } catch (_) {}
      }
      return jsonResponse({ ok: true, leads, subs });
    }

    // 3. POST /api/telemetry — Persistir vistas reales y eventos clave en KV
    if (request.method === "POST" && path.endsWith("/api/telemetry")) {
      try {
        const body = await request.json();
        const evName = String(body.event || "");
        const itemId = String(body?.payload?.itemId || body?.itemId || "").trim();
        if (env && env.KV_DATA && itemId && (evName === "view_item" || evName === "quote_click" || evName === "booking_open")) {
          const views = (await env.KV_DATA.get(VIEWS_KEY, "json")) || {};
          const inc = evName === "booking_open" ? 3 : evName === "quote_click" ? 2 : 1;
          views[itemId] = (Number(views[itemId]) || 0) + inc;
          await env.KV_DATA.put(VIEWS_KEY, JSON.stringify(views));
          return jsonResponse({ ok: true, itemId, count: views[itemId] });
        }
        return jsonResponse({ ok: true, status: "recorded" });
      } catch (err) {
        return jsonResponse({ ok: false, error: String(err) }, 400);
      }
    }

    // 4. POST /api/subscribe — Guardar suscriptor de catálogo mensual en KV + avisar
    if (request.method === "POST" && path.endsWith("/api/subscribe")) {
      try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return jsonResponse({ ok: false, error: "Correo inválido" }, 400);
        }
        if (env && env.KV_DATA) {
          const subs = (await env.KV_DATA.get(SUBS_KEY, "json")) || [];
          if (!subs.some(s => s.email === email)) {
            subs.unshift({ email, ts: new Date().toISOString() });
            await env.KV_DATA.put(SUBS_KEY, JSON.stringify(subs.slice(0, 500)));
          }
        }
        await notifyAlmaByEmail(
          env,
          `📄 Nuevo suscriptor al Catálogo PDF: ${email}`,
          `Un visitante dejó su correo para recibir el catálogo mensual de salidas:\n\nCorreo: ${email}\nFecha: ${new Date().toISOString()}\n`
        );
        return jsonResponse({ ok: true, email });
      } catch (err) {
        return jsonResponse({ ok: false, error: String(err) }, 400);
      }
    }

    // Health check para GET simple en raíz
    if (request.method !== "POST") {
      return jsonResponse({ status: "ok", engine: "Alma AI Vendedora (Llama-3.3-70B + KV + Email)" });
    }

    // 5. POST /api/chat — Alma IA Vendedora (Viajes / Estética / Tienda)
    try {
      const body = await request.json();
      const userMsg = String(body.message || "").trim();
      const mode = ["viajes", "estetica", "tienda"].includes(body.mode) ? body.mode : "viajes";
      const history = Array.isArray(body.history) ? body.history : [];

      if (!userMsg) {
        return jsonResponse({ reply: "¿En qué viaje, servicio del salón o producto te puedo asesorar hoy?" });
      }

      const isFirstMessage = history.length <= 1;
      const systemPrompt = buildSystemPrompt(mode, isFirstMessage);
      const messages = [{ role: "system", content: systemPrompt }];

      for (const h of history.slice(-8)) {
        if (h && h.role && h.content) {
          messages.push({
            role: h.role === "assistant" ? "assistant" : "user",
            content: String(h.content)
          });
        }
      }
      if (!messages.length || messages[messages.length - 1].content !== userMsg) {
        messages.push({ role: "user", content: userMsg });
      }

      let rawReply = "";
      if (env && env.AI) {
        const aiResp = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages,
          max_tokens: 560,
          temperature: 0.55
        });
        rawReply = aiResp && aiResp.response ? aiResp.response.trim() : "";
      }

      if (!rawReply) {
        return jsonResponse({
          reply: "Con gusto te asesoro personalmente. Cuéntame cuántas personas son o qué fecha buscas para armar tu ficha con Alma.",
          mode
        });
      }

      const { cleanText, lead } = parseLeadCard(rawReply);
      let persisted = false;
      let emailed = false;

      // Respaldo automático cero-pérdida si el cliente dejó nombre/teléfono o cierre avanzado
      if (lead && env && env.KV_DATA && (lead.telefono || lead.nombre || (lead.personas && lead.fecha))) {
        try {
          const leadRecord = {
            id: `lead-${Date.now()}`,
            ts: new Date().toISOString(),
            ...lead,
            lastUserMsg: userMsg.slice(0, 220)
          };
          const index = (await env.KV_DATA.get(LEADS_INDEX_KEY, "json")) || [];
          index.unshift(leadRecord);
          await env.KV_DATA.put(LEADS_INDEX_KEY, JSON.stringify(index.slice(0, 200)));
          persisted = true;

          // Enviar correo instantáneo a Alma si el cliente ya dio teléfono o nombre + fecha/personas
          if (lead.telefono || (lead.nombre && (lead.personas || lead.fecha))) {
            const digits = (lead.telefono || "").replace(/\D/g, "");
            const waClientLink = digits.length >= 10
              ? `https://wa.me/52${digits.slice(-10)}?text=${encodeURIComponent(`Hola ${lead.nombre || ''}, soy Alma de Ruta del Águila / Estudio Alma. Recibí tu solicitud sobre ${lead.destino_servicio}, con gusto te atiendo.`)}`
              : "No dejó teléfono aún (el cliente puede escribir por el botón de WhatsApp).";

            emailed = await notifyAlmaByEmail(
              env,
              `🔥 Nuevo prospecto (${lead.vertical.toUpperCase()}): ${lead.destino_servicio} — ${lead.nombre || "Sin nombre"}`,
              [
                `¡Hola Alma! Tu Asistente IA atendió a un nuevo prospecto en la web:`,
                ``,
                `• Área: ${lead.vertical}`,
                `• Destino / Servicio: ${lead.destino_servicio}`,
                `• Modalidad: ${lead.modalidad || "Por definir"}`,
                `• Personas: ${lead.personas || "Por confirmar"}`,
                `• Fecha estimada: ${lead.fecha || "Por confirmar"}`,
                `• Nombre del cliente: ${lead.nombre || "No proporcionado"}`,
                `• Teléfono / WhatsApp: ${lead.telefono || "No proporcionado"}`,
                `• Estimado mostrado: ${lead.estimado || "Por cotizar"}`,
                `• Notas: ${lead.notas || "-"}`,
                ``,
                `📲 Responder al cliente en 1 toque:`,
                waClientLink,
                ``,
                `Mensaje reciente del cliente: "${userMsg}"`
              ].join("\n")
            );
          }
        } catch (_) {}
      }

      return jsonResponse({
        reply: cleanText,
        leadCard: lead,
        persisted,
        emailed,
        mode,
        model: "llama-3.3-70b-edge-v2"
      });
    } catch (err) {
      return jsonResponse({ error: String(err) }, 500);
    }
  }
};
