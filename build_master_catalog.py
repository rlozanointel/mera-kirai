import os, shutil, sqlite3, json
from PIL import Image

base_dir = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/presentacion_alma'
img_dir = os.path.join(base_dir, 'img')
backup_dir = os.path.join(img_dir, 'originals_backup')
os.makedirs(backup_dir, exist_ok=True)

# 1. Crop bottom bar (5657777021) from Universe Travel flyers (WA0005..WA0031 except salon photos WA0008, WA0011, WA0012 and WA0004)
skip_files = {'IMG-20260926-WA0004.jpg', 'IMG-20260926-WA0008.jpg', 'IMG-20260926-WA0011.jpg', 'IMG-20260926-WA0012.jpg'}
cropped_count = 0
for fname in sorted(os.listdir(img_dir)):
    if fname.startswith('IMG-20260926-WA00') and fname.endswith('.jpg') and fname not in skip_files:
        fpath = os.path.join(img_dir, fname)
        bpath = os.path.join(backup_dir, fname)
        if not os.path.exists(bpath):
            shutil.copy2(fpath, bpath)
        im = Image.open(bpath)
        w, h = im.size
        # Universe Travel flyers have wholesale phone bar in bottom ~10.8% of height
        crop_h = int(h * 0.892)
        im_cropped = im.crop((0, 0, w, crop_h))
        im_cropped.save(fpath, quality=92)
        cropped_count += 1

print(f'Cropped {cropped_count} flyer images cleanly.')

# 2. Build unified Master Catalog in js/sectur_737_catalog.js
sectur_db = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/SECTUR_Destinos_Mexico/data/sectur_destinos.db'
cdmx_db = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/CDMX_Event_Radar/data/cdmx_events.db'

catalog = []

import re

def sanitize_text(txt):
    if not txt:
        return ''
    t = str(txt)
    if "'>" in t:
        t = t.split("'>")[-1]
    t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('SECTUR', 'Turismo México').replace('Sectur', 'Turismo México').replace('sectur', 'turismo méxico')
    return t.strip()

# Load from sectur_destinos.db (NO "sectur" allowed in output)
conn = sqlite3.connect(sectur_db)
c = conn.cursor()

for row in c.execute('SELECT id, name, state, tipo, vocation, description, key_attractions FROM destinos'):
    did, nom, est, tipo, voc, desc, atrac = row
    macro = 'barrio_magico' if (tipo and 'barrio' in tipo.lower()) else 'pueblo_magico'
    clean_sub = sanitize_text(voc or 'Arquitectura y Tradición')
    clean_desc = sanitize_text(desc or atrac or '')
    catalog.append({
        'id': f'dest-{did}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': macro,
        'sub': clean_sub,
        'desc': clean_desc[:220],
        'price_ref': 'Salida grupal o privada'
    })

for row in c.execute('SELECT id, name, states_covered, category, description, stops, distance_km, estimated_days FROM rutas'):
    rid, nom, est, cat, desc, stops, dist, days = row
    clean_sub = sanitize_text(cat or 'Ruta Turística')
    dur_txt = f'{days} días' if days else 'Fin de semana'
    clean_desc = sanitize_text(f'{desc or stops or ""} ({dur_txt}, {dist or 120} km)')
    catalog.append({
        'id': f'ruta-{rid}',
        'name': sanitize_text(nom),
        'state': est or 'Multidestino',
        'macro': 'ruta_turistica',
        'sub': clean_sub,
        'desc': clean_desc[:220],
        'price_ref': 'Cotizar ruta grupal o privada'
    })

for row in c.execute('SELECT id, name, state, tipo, community, indigenous_group, description, what_includes FROM experiencias_comunitarias'):
    eid, nom, est, tipo, comm, ind, desc, inc = row
    clean_sub = sanitize_text(tipo or 'Ecoturismo y Tradición')
    pueblo_str = f'[{comm or ind or "Comunidad"}]'
    clean_desc = sanitize_text(f'{pueblo_str} {desc or inc or ""}')
    catalog.append({
        'id': f'exp-{eid}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': 'experiencia_comunitaria',
        'sub': clean_sub,
        'desc': clean_desc[:220],
        'price_ref': 'Turismo de naturaleza'
    })

for row in c.execute('SELECT id, name, state, classification, year_inscribed, description, criteria FROM patrimonios_unesco'):
    uid, nom, est, clas, year, desc, crit = row
    clean_sub = f'Patrimonio {clas or "Cultural"}'
    clean_desc = sanitize_text(f'Inscrito en {year or "UNESCO"}: {desc or crit or ""}')
    catalog.append({
        'id': f'unesco-{uid}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': 'patrimonio_unesco',
        'sub': clean_sub,
        'desc': clean_desc[:220],
        'price_ref': 'Patrimonio Mundial UNESCO'
    })
conn.close()

# Load active CDMX events from CDMX_Event_Radar
conn2 = sqlite3.connect(cdmx_db)
c2 = conn2.cursor()
cat_map = {
    'concierto': '🎶 Concierto / Música',
    'musica': '🎶 Concierto / Música',
    'festival': '🎪 Feria / Festival',
    'deportes': '⚽ Deportes / Estadio',
    'teatro': '🎭 Teatro / Musical',
    'danza': '🩰 Danza / Ballet',
    'museo': '🏛️ Museo / Exposición',
    'expo': '🏛️ Museo / Exposición',
    'familiar': '🎠 Familiar / Infantil',
    'comedia': '🎤 Stand-Up / Comedia',
    'cultural': '🎨 Evento Cultural Zócalo / CDMX'
}

for row in c2.execute('''
    SELECT e.id, e.title, e.category, e.start_date, e.end_date,
           e.min_price, e.max_price, e.description, v.name, v.alcaldia
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.id
    WHERE e.end_date >= '2026-10-15' OR e.start_date >= '2026-10-15' OR e.start_date IS NULL
    ORDER BY e.start_date ASC
'''):
    eid, title, cat, dstart, dend, pmin, pmax, desc, vname, alc = row
    raw_cat = (cat or '').lower()
    sub_label = cat_map.get(raw_cat, f'✨ {cat or "Cartelera CDMX"}')
    if (pmin is not None and pmin == 0) or (pmax is not None and pmax == 0):
        boleto_txt = 'Entrada Libre al recinto • Transporte redondo desde $549 MXN'
    elif pmin and pmax and pmin != pmax:
        boleto_txt = f'Boleto recinto: ${int(pmin):,}-${int(pmax):,} MXN • Transporte desde $549 MXN'
    elif pmin:
        boleto_txt = f'Boleto recinto desde ${int(pmin):,} MXN • Transporte desde $549 MXN'
    else:
        boleto_txt = 'Transporte ejecutivo redondo desde $549 MXN'
    fecha_txt = f'{dstart}' if dstart else 'Temporada Activa'
    recinto_txt = f'{vname or "CDMX"} ({fecha_txt})'
    full_desc = f'📍 {recinto_txt}. {desc or title}. {boleto_txt}'
    catalog.append({
        'id': f'cdmx-ev-{eid}',
        'name': sanitize_text(title),
        'state': 'Ciudad de México',
        'macro': 'evento_cdmx',
        'sub': sub_label,
        'desc': sanitize_text(full_desc[:240]),
        'price_ref': boleto_txt
    })
conn2.close()

# Add Budgeted Packages (~20) & All VIP International/Sports Flyers
paquetes_y_vip = [
    {'id': 'pkg-tolantongo', 'name': 'Paquete Grutas de Tolantongo (Todo el Día)', 'state': 'Hidalgo', 'macro': 'paquete_armado', 'sub': 'Aguas Termales & Cañón', 'desc': 'Transporte redondo con peajes + Entrada general a pozas termales, cueva de vapor y río turquesa. Pre-venta con $200 MXN.', 'price_ref': '$790 MXN Redondo'},
    {'id': 'pkg-cacahuamilpa-taxco', 'name': 'Paquete Grutas de Cacahuamilpa & Taxco', 'state': 'Guerrero', 'macro': 'paquete_armado', 'sub': 'Grutas & Pueblo Mágico', 'desc': 'Transporte redondo + Boleto de entrada a Grutas de Cacahuamilpa con guía + Tarde libre en Taxco de Alarcón.', 'price_ref': '$1,160 MXN Redondo'},
    {'id': 'pkg-zacatlan-chignahuapan', 'name': 'Paquete Zacatlán de las Manzanas & Chignahuapan', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Sierra Norte & Esferas', 'desc': 'Mirador de cristal, reloj floral, fábrica de sidra, talleres de esferas y Virgen Monumental.', 'price_ref': '$650 MXN Redondo'},
    {'id': 'pkg-cuetzalan', 'name': 'Paquete Cuetzalan del Progreso & Cascada Las Brisas', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Bosque de Niebla & Café', 'desc': 'Transporte redondo + Entrada a Cascada Las Brisas + Centro Histórico y danza de voladores.', 'price_ref': '$820 MXN Redondo'},
    {'id': 'pkg-queretaro-vino', 'name': 'Paquete Ruta del Queso, Vino & Peña de Bernal', 'state': 'Querétaro', 'macro': 'paquete_armado', 'sub': 'Viñedos & Monolito', 'desc': 'Transporte redondo + Tour guiado en cavas Freixenet con copa + Visita a Peña de Bernal.', 'price_ref': '$890 MXN Redondo'},
    {'id': 'pkg-bahia-acapulco', 'name': 'Paquete Bahía de Acapulco (Fin de Semana)', 'state': 'Guerrero', 'macro': 'paquete_armado', 'sub': 'Sol y Playa Pacífico', 'desc': 'Transporte redondo directo a Zona Dorada por Autopista del Sol. Salida viernes por la noche.', 'price_ref': '$980 MXN Redondo'},
    {'id': 'pkg-valquirico-cacaxtla', 'name': 'Paquete Val\'Quirico & Zona Arqueológica Cacaxtla', 'state': 'Tlaxcala', 'macro': 'paquete_armado', 'sub': 'Arquitectura Toscana & Murales', 'desc': 'Recorrido matutino por los murales prehispánicos de Cacaxtla y tarde gastronómica en Val\'Quirico.', 'price_ref': '$490 MXN Redondo'},
    {'id': 'pkg-huasca-prismas', 'name': 'Paquete Huasca de Ocampo & Prismas Basálticos', 'state': 'Hidalgo', 'macro': 'paquete_armado', 'sub': 'Primer Pueblo Mágico', 'desc': 'Transporte redondo + Entrada a los Prismas Basálticos, Ex-Hacienda de Santa María Regla y Bosque de los Duendes.', 'price_ref': '$790 MXN Redondo'},
    {'id': 'pkg-orizaba-teleferico', 'name': 'Paquete Orizaba Pueblo Mágico & Teleférico', 'state': 'Veracruz', 'macro': 'paquete_armado', 'sub': 'Montaña & Teleférico', 'desc': 'Paseo por el Río Orizaba con reserva animal, Palacio de Hierro de Eiffel, Poliforum Mier y Pesado y Teleférico.', 'price_ref': '$780 MXN Redondo'},
    {'id': 'pkg-teotihuacan-basilica', 'name': 'Paquete Pirámides de Teotihuacán & Basílica de Guadalupe', 'state': 'Estado de México', 'macro': 'paquete_armado', 'sub': 'Arqueología & Fe', 'desc': 'Recorrido por Calzada de los Muertos, Pirámide del Sol y la Luna, degustación de obsidiana/pulque y Basílica.', 'price_ref': '$690 MXN Redondo'},
    {'id': 'pkg-six-flags-cdmx', 'name': 'Paquete Six Flags México / Parque Aztlán', 'state': 'Ciudad de México', 'macro': 'paquete_armado', 'sub': 'Parques de Diversiones', 'desc': 'Transporte ejecutivo redondo directo desde San Manuel hasta la puerta del parque con espera completa.', 'price_ref': '$650 MXN Transporte'},
    {'id': 'pkg-africam-safari', 'name': 'Paquete Africam Safari & Tecali de Herrera', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Familiar & Naturaleza', 'desc': 'Recorrido en nuestra unidad dentro de las zonas de animales en libertad en Africam Safari y artesanías de ónix.', 'price_ref': '$550 MXN Transporte'},
    {'id': 'pkg-oaxaca-hierve', 'name': 'Paquete Oaxaca, Monte Albán, Mitla & Hierve el Agua (2 Días)', 'state': 'Oaxaca', 'macro': 'paquete_armado', 'sub': 'Cultura, Mezcal y Cascadas', 'desc': 'Fin de semana completo con transporte, 1 noche de hotel céntrico, Monte Albán, árbol del Tule y Hierve el Agua.', 'price_ref': '$1,950 MXN Paquete'},
    {'id': 'pkg-tabasco-cacao', 'name': 'Ruta del Cacao al Chocolate en Tabasco (4 Días)', 'state': 'Tabasco', 'macro': 'paquete_armado', 'sub': 'Haciendas Cacaoteras & Pantanos', 'desc': 'Comalcalco (pirámides de ladrillo), Haciendas de Cacao Jesús María y La Luz, Parque Museo La Venta y Pantanos de Centla.', 'price_ref': '$3,499 MXN Paquete'},
    {'id': 'pkg-los-cabos-nacional', 'name': 'Paquete Nacional Los Cabos & Arco del Fin del Mundo (4 Días)', 'state': 'Baja California Sur', 'macro': 'paquete_armado', 'sub': 'Playa & Mar de Cortés', 'desc': 'Vuelo redondo + Hotel Todo Incluido en Cabo San Lucas / San José del Cabo + Paseo en barco al Arco.', 'price_ref': '$10,490 MXN Todo Incluido'},
    {'id': 'pkg-cancun-nacional', 'name': 'Paquete Nacional Cancún & Riviera Maya All-Inclusive (4 Días)', 'state': 'Quintana Roo', 'macro': 'paquete_armado', 'sub': 'Playa Caribe Mexicano', 'desc': 'Vuelo redondo + Resort Todo Incluido frente al mar turquesa con alimentos y bebidas ilimitadas.', 'price_ref': '$8,990 MXN Todo Incluido'},
    {'id': 'pkg-huatulco-nacional', 'name': 'Paquete Nacional Bahías de Huatulco (4 Días)', 'state': 'Oaxaca', 'macro': 'paquete_armado', 'sub': 'Playas Certificadas', 'desc': 'Transporte / Vuelo + Hotel en Santa Cruz o Tangolunda + Paseo en yate por las 7 bahías y snorkel.', 'price_ref': '$7,850 MXN Paquete'},
    {'id': 'pkg-chiapas-magico', 'name': 'Gran Circuito Chiapas: Cañón del Sumidero, San Cristóbal y Palenque (5 Días)', 'state': 'Chiapas', 'macro': 'paquete_armado', 'sub': 'Selva, Cascadas y Cultura Maya', 'desc': 'Lancha en Cañón del Sumidero, Chiapa de Corzo, San Cristóbal, Lagos de Montebello, Agua Azul y Palenque.', 'price_ref': '$8,490 MXN Paquete'},
    {'id': 'vip-superbowl-lxi', 'name': 'Super Bowl LXI en Los Ángeles 2027 (Paquete Oficial)', 'state': 'Estados Unidos', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': '4 noches de hospedaje en Los Ángeles (11 al 15 Feb 2027), entrada oficial garantizada al Super Bowl LXI y traslados.', 'price_ref': 'Cotizar Paquete VIP'},
    {'id': 'vip-olympiacos-grecia', 'name': 'Experiencia Europea: Olympiacos en Atenas (Champions League)', 'state': 'Grecia', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': 'Vuelos + Hotel en Atenas + Entrada oficial al partido del Olympiacos en el Estadio Georgios Karaiskakis + Acrópolis.', 'price_ref': 'Cotizar Paquete VIP'},
    {'id': 'vip-clasico-espana', 'name': 'El Clásico Real Madrid vs Barcelona + Tour 4 Países Europa (18 Días)', 'state': 'España / Europa', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': 'Entrada oficial a El Clásico en el Bernabéu + Circuito de 18 días por España, Francia, Italia y Alemania.', 'price_ref': '$5,790 USD'},
    {'id': 'vip-namibia-aventura', 'name': 'Aventura en Namibia: Dunas de Sossusvlei y Costa Esqueleto (10 Días)', 'state': 'Namibia (África)', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Windhoek, Desierto del Kalahari, cañón del Río Fish, dunas rojas de Sossusvlei, Swakopmund y safari en Etosha.', 'price_ref': '€3,825 EUR'},
    {'id': 'vip-finlandia-artica', 'name': 'Expedición Ártica en Laponia y Auroras Boreales (8 Días)', 'state': 'Finlandia', 'macro': 'vip_internacional', 'sub': 'Europa & Ártico', 'desc': 'Rovaniemi, aldea de Santa Claus, trineo de perros huskies y renos, motonieve, rompehielos Sampo e iglú térmico.', 'price_ref': '€4,195 EUR'},
    {'id': 'vip-arabia-saudi', 'name': 'Descubre Arabia Saudí: Riad, AlUla y Hegra (8 Días)', 'state': 'Arabia Saudita', 'macro': 'vip_internacional', 'sub': 'Medio Oriente', 'desc': 'Riad moderno, oasis milenario de AlUla, tumbas nabateas de Hegra (Patrimonio UNESCO) y Jeddah en el Mar Rojo.', 'price_ref': '$2,315 USD'},
    {'id': 'vip-sudafrica', 'name': 'Maravillas de Sudáfrica: Johannesburgo, Kruger y Ciudad del Cabo (7 Días)', 'state': 'Sudáfrica', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Ruta Panorama, safari fotográfico en Parque Nacional Kruger y Ciudad del Cabo con Península del Buena Esperanza.', 'price_ref': 'Desde €885 EUR'},
    {'id': 'vip-malasia', 'name': 'Malasia al Completo: Kuala Lumpur, Malaca y Penang (10 Días)', 'state': 'Malasia (Asia)', 'macro': 'vip_internacional', 'sub': 'Asia Exótica', 'desc': 'Torres Petronas, Cuevas de Batu, tierras altas de Cameron Highlands, isla de Penang y selva de Borneo.', 'price_ref': '$1,575 USD'},
    {'id': 'vip-uganda-primates', 'name': 'Uganda y Grandes Primates: Gorilas de Montaña en Bwindi (8 Días)', 'state': 'Uganda (África)', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Entebbe, santuario de rinocerontes Ziwa, cataratas Murchison, chimpancés en Kibale y trekking de gorilas en Bwindi.', 'price_ref': '$3,970 USD'}
]

catalog.extend(paquetes_y_vip)

catalog_json = json.dumps(catalog, ensure_ascii=False)
assert 'sectur' not in catalog_json.lower(), 'Error: Found forbidden word in catalog JSON!'

js_out = '// Catálogo Maestro Unificado: Destinos Nacionales + Cartelera CDMX + Paquetes y VIP\n'
js_out += 'window.MASTER_CATALOG_1000 = ' + catalog_json + ';\n'
js_out += 'window.SECTUR_737_CATALOG = window.MASTER_CATALOG_1000;\n'

out_path = os.path.join(base_dir, 'js', 'sectur_737_catalog.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(js_out)

print(f'SUCCESS: Wrote {len(catalog)} items to {out_path} with ZERO occurrences of forbidden word.')
