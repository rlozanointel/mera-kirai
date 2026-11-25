/**
 * Alma IA Vendedora — Widget & Lead-Handoff Engine (Compartido: Viajes, Estética, Tienda)
 * Conecta con Cloudflare Worker (/api/chat) y renderiza tarjetas de traspaso 1-toque a WhatsApp.
 */
(function (global) {
    const WORKER_CHAT_ENDPOINTS = [
        'https://mera-kirai.com/api/chat',
        'https://alma-ai-assistant.mera-kirai-cloud.workers.dev'
    ];
    const TELEMETRY_URL = 'https://mera-kirai.com/api/telemetry';
    const ALMA_WA_PHONE = '522228016244';

    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sanitizeUrl(url) {
        const u = String(url || '').trim();
        if (/^(https?:\/\/|\/|[a-z0-9_-]+\.html)/i.test(u)) return u;
        return '#';
    }

    function formatAlmaMarkdown(text) {
        // Defensa adicional: eliminar cualquier residuo de [LEAD_CARD] antes de mostrar
        let cleaned = String(text || '').replace(/\[LEAD_CARD\][\s\S]*?(?:\[?\/LEAD_CARD\]|$)/gi, '').trim();
        let html = esc(cleaned);

        // Enlaces Markdown [texto](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
            const safeHref = sanitizeUrl(url);
            return `<a href="${esc(safeHref)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline; font-weight:700;">${label}</a>`;
        });

        html = html
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        return html;
    }

    function buildWhatsAppPrefillUrl(lead) {
        const lines = ['Hola Alma, te envío mi cotización / solicitud desde Alma IA:'];
        if (lead.vertical) lines.push(`• Área: ${lead.vertical.toUpperCase()}`);
        if (lead.destino_servicio) lines.push(`• Destino / Servicio: ${lead.destino_servicio}`);
        if (lead.modalidad) lines.push(`• Modalidad: ${lead.modalidad}`);
        if (lead.personas) lines.push(`• Personas / Cantidad: ${lead.personas}`);
        if (lead.fecha) lines.push(`• Fecha deseada: ${lead.fecha}`);
        if (lead.estimado) lines.push(`• Referencia / Tarifa: ${lead.estimado}`);
        if (lead.nombre) lines.push(`• Mi nombre: ${lead.nombre}`);
        if (lead.telefono) lines.push(`• Mi WhatsApp: ${lead.telefono}`);
        if (lead.notas) lines.push(`• Detalles: ${lead.notas}`);
        lines.push('¿Me ayudas a confirmar disponibilidad y Pre-venta?');
        return `https://wa.me/${ALMA_WA_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
    }

    function renderAlmaLeadCardHtml(lead, meta = {}) {
        if (!lead || !lead.destino_servicio) return '';
        const waUrl = buildWhatsAppPrefillUrl(lead);
        const rows = [];
        if (lead.modalidad) rows.push(`<span><strong>Modalidad:</strong> ${esc(lead.modalidad)}</span>`);
        if (lead.personas) rows.push(`<span><strong>Personas:</strong> ${esc(lead.personas)}</span>`);
        if (lead.fecha) rows.push(`<span><strong>Fecha:</strong> ${esc(lead.fecha)}</span>`);
        if (lead.estimado) rows.push(`<span><strong>Referencia:</strong> ${esc(lead.estimado)}</span>`);
        if (lead.nombre) rows.push(`<span><strong>Cliente:</strong> ${esc(lead.nombre)}</span>`);

        const backupNote = meta.emailed
            ? `<div style="font-size:0.73rem; color:#86efac; margin-top:6px;"><i class="fas fa-check-circle"></i> Tu solicitud también quedó respaldada en el correo y sistema de Alma.</div>`
            : `<div style="font-size:0.73rem; color:#cbd5e1; margin-top:6px;">Toca el botón verde para enviársela directo al WhatsApp de Alma con un solo toque.</div>`;

        return `
            <div style="margin-top:10px; padding:12px; border-radius:12px; background:rgba(15,23,42,0.88); border:1px solid rgba(52,211,153,0.45); color:#f8fafc;">
                <div style="font-size:0.76rem; font-weight:800; color:#34d399; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:4px;">
                    📋 Ficha Lista para Alma
                </div>
                <div style="font-weight:800; font-size:0.94rem; color:#fff; margin-bottom:6px;">
                    ${esc(lead.destino_servicio)}
                </div>
                ${rows.length ? `<div style="display:flex; flex-direction:column; gap:3px; font-size:0.8rem; color:#e2e8f0; margin-bottom:10px;">${rows.join('')}</div>` : ''}
                <a href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer"
                   onclick="if(window.__trackAlmaLeadClick) window.__trackAlmaLeadClick('${esc(lead.destino_servicio).replace(/'/g, "\\'")}')"
                   style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:10px 12px; border-radius:10px; background:linear-gradient(135deg,#25d366,#16a34a); color:#052e16; font-weight:900; font-size:0.86rem; text-decoration:none; box-shadow:0 4px 14px rgba(37,211,102,0.35);">
                    <i class="fab fa-whatsapp" style="font-size:1.1rem;"></i> Enviar mi cotización a Alma por WhatsApp
                </a>
                ${backupNote}
            </div>
        `;
    }

    global.__trackAlmaLeadClick = function (itemLabel) {
        try {
            fetch(TELEMETRY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'quote_click', payload: { itemId: itemLabel } }),
                keepalive: true
            }).catch(() => {});
        } catch (_) {}
    };

    async function callAlmaChatWorker({ mode = 'viajes', message, history = [], context_items = [] }) {
        const endpoints = (window.location.hostname === 'mera-kirai.com' || window.location.hostname === 'www.mera-kirai.com')
            ? ['/api/chat', ...WORKER_CHAT_ENDPOINTS]
            : WORKER_CHAT_ENDPOINTS;

        for (const url of endpoints) {
            try {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode, message, history, context_items })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.reply) return data;
                }
            } catch (_) {}
        }
        return null;
    }

    function mountFloatingWidget({ mode = 'estetica', windowId, messagesId, inputId, accentBg = '#be123c' }) {
        const history = [];

        function appendMsg(role, text, extraHtml = '') {
            const box = document.getElementById(messagesId);
            if (!box) return;
            const bubble = document.createElement('div');
            if (role === 'user') {
                bubble.style.cssText = `align-self:flex-end; background:${accentBg}; color:#fff; padding:9px 13px; border-radius:14px; max-width:85%; font-size:0.9rem; line-height:1.5;`;
                bubble.innerHTML = esc(text).replace(/\n/g, '<br>');
            } else {
                bubble.style.cssText = 'align-self:flex-start; background:rgba(255,255,255,0.08); padding:11px 14px; border-radius:14px; color:#fff; max-width:92%; font-size:0.9rem; line-height:1.6;';
                bubble.innerHTML = formatAlmaMarkdown(text) + extraHtml;
            }
            box.appendChild(bubble);
            box.scrollTop = box.scrollHeight;
        }

        function showTyping() {
            const box = document.getElementById(messagesId);
            if (!box) return null;
            const id = 'alma-typing-' + Date.now();
            const el = document.createElement('div');
            el.id = id;
            el.style.cssText = 'align-self:flex-start; background:rgba(255,255,255,0.06); padding:9px 13px; border-radius:14px; color:#cbd5e1; font-size:0.84rem;';
            el.innerHTML = '<i class="fas fa-sparkles fa-spin"></i> Consultando con Alma IA...';
            box.appendChild(el);
            box.scrollTop = box.scrollHeight;
            return id;
        }

        async function submit(e, overrideText = null) {
            if (e && e.preventDefault) e.preventDefault();
            const input = document.getElementById(inputId);
            const q = String(overrideText !== null ? overrideText : (input ? input.value : '')).trim();
            if (!q) return;
            if (input && overrideText === null) input.value = '';

            appendMsg('user', q);
            const tid = showTyping();
            const data = await callAlmaChatWorker({
                mode,
                message: q,
                history: history.slice(-8)
            });
            if (tid) {
                const tEl = document.getElementById(tid);
                if (tEl) tEl.remove();
            }

            const replyText = (data && data.reply)
                ? data.reply
                : 'Con gusto te atendemos directamente. Cuéntame qué servicio o producto buscas y qué día prefieres para armar tu ficha con Alma.';
            const leadHtml = (data && data.leadCard) ? renderAlmaLeadCardHtml(data.leadCard, data) : '';

            history.push({ role: 'user', content: q });
            history.push({ role: 'assistant', content: replyText });
            appendMsg('assistant', replyText, leadHtml);
        }

        function ask(text) {
            const win = document.getElementById(windowId);
            if (win && !win.classList.contains('active')) win.classList.add('active');
            submit(null, text);
        }

        return { submit, ask };
    }

    global.AlmaAiWidget = {
        formatAlmaMarkdown,
        renderAlmaLeadCardHtml,
        callAlmaChatWorker,
        mountFloatingWidget
    };
})(window);
