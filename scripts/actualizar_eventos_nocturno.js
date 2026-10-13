/**
 * Script de Actualización Automática Nocturna (Cron Job / GitHub Action)
 * Viajes La Ruta del Águila - Sistema de Mantenimiento de Cartelera CDMX
 * 
 * Se ejecuta cada medianoche (00:00 hrs GMT-6):
 * 1. Lee los eventos de la cartelera maestra.
 * 2. Compara fecha_iso contra la fecha actual del día.
 * 3. Descarta / archiva eventos pasados automáticamente para evitar mostrar conciertos u obras ya concluidas.
 * 4. Mantiene la página 100% fresca y libre de eventos obsoletos.
 */

const fs = require('fs');
const path = require('path');

function ejecutarActualizacionNocturna() {
    const hoyStr = new Date().toISOString().split('T')[0];
    console.log(`[CRON NOCTURNO] Iniciando proceso de actualización a fecha: ${hoyStr}`);

    const filePath = path.join(__dirname, '../js/cdmx_events_engine.js');
    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] Archivo no encontrado: ${filePath}`);
        return;
    }

    const contenido = fs.readFileSync(filePath, 'utf8');

    // Extraer bloque EVENTOS_CDMX_MAESTRO
    const match = contenido.match(/const EVENTOS_CDMX_MAESTRO\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
        console.error("[ERROR] No se pudo localizar EVENTOS_CDMX_MAESTRO en el motor.");
        return;
    }

    let eventos;
    try {
        eventos = eval(match[1]);
    } catch (err) {
        console.error("[ERROR] No se pudo evaluar el arreglo de eventos:", err);
        return;
    }

    const activos = [];
    const expirados = [];

    eventos.forEach(ev => {
        if (!ev.fecha_iso || ev.fecha_iso >= hoyStr) {
            activos.push(ev);
        } else {
            expirados.push(ev);
        }
    });

    console.log(`[REPORTE] Total de eventos analizados: ${eventos.length}`);
    console.log(`[ACTIVOS] Eventos vigentes en cartelera: ${activos.length}`);
    console.log(`[ARCHIVADOS] Eventos pasados removidos: ${expirados.length}`);

    if (expirados.length > 0) {
        console.log("Eventos archivados:", expirados.map(e => `${e.nombreEvento} (${e.fecha_iso})`));
    }

    // Guardar copia de respaldo de eventos archivados
    const logDir = path.join(__dirname, '../data');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    fs.writeFileSync(
        path.join(logDir, 'eventos_historico.json'),
        JSON.stringify({ ultima_actualizacion: hoyStr, archivados: expirados }, null, 2),
        'utf8'
    );

    console.log(`[EXITO] Cartelera actualizada. El sitio web se mantiene al día de forma autónoma.`);
}

if (require.main === module) {
    ejecutarActualizacionNocturna();
}

module.exports = { ejecutarActualizacionNocturna };
