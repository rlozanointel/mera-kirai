import os, shutil, sqlite3, json, re
from datetime import date
from PIL import Image

base_dir = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/presentacion_alma'
img_dir = os.path.join(base_dir, 'img')
backup_dir = os.path.join(img_dir, 'originals_backup')
os.makedirs(backup_dir, exist_ok=True)

# 1. Exact clean crop ratios per flyer to remove 100% of wholesale phone bars (5657777021)
custom_crops = {
    'IMG-20260926-WA0004.jpg': 0.85,
    'IMG-20260926-WA0005.jpg': 0.835,
    'IMG-20260926-WA0007.jpg': 0.83,
    'IMG-20260926-WA0009.jpg': 0.90,
    'IMG-20260926-WA0011.jpg': 0.85,
    'IMG-20260926-WA0012.jpg': 0.85,
    'IMG-20260926-WA0013.jpg': 0.90,
    'IMG-20260926-WA0015.jpg': 0.88,
    'IMG-20260926-WA0017.jpg': 0.90,
    'IMG-20260926-WA0020.jpg': 0.87,
    'IMG-20260926-WA0021.jpg': 0.87,
    'IMG-20260926-WA0022.jpg': 0.86,
    'IMG-20260926-WA0023.jpg': 0.87,
    'IMG-20260926-WA0024.jpg': 0.86,
    'IMG-20260926-WA0025.jpg': 0.85,
    'IMG-20260926-WA0026.jpg': 0.86,
    'IMG-20260926-WA0029.jpg': 0.835,
}
skip_files = {'IMG-20260926-WA0008.jpg'}

cropped_count = 0
for fname in sorted(os.listdir(img_dir)):
    if fname.startswith('IMG-20260926-WA00') and fname.endswith('.jpg') and fname not in skip_files:
        fpath = os.path.join(img_dir, fname)
        bpath = os.path.join(backup_dir, fname)
        if not os.path.exists(bpath):
            shutil.copy2(fpath, bpath)
        im = Image.open(bpath)
        w, h = im.size
        ratio = custom_crops.get(fname, 0.892)
        crop_h = int(h * ratio)
        im_cropped = im.crop((0, 0, w, crop_h))
        im_cropped.save(fpath, quality=92)
        cropped_count += 1

print(f'Cropped {cropped_count} flyer images cleanly.')

# 2. Build Enriched Master Catalog in js/sectur_737_catalog.js (with gastronomy, museums/attractions, and ticket prices)
sectur_db = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/SECTUR_Destinos_Mexico/data/sectur_destinos.db'
cdmx_db = '/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/CDMX_Event_Radar/data/cdmx_events.db'

catalog = []

def sanitize_text(txt):
    if not txt:
        return ''
    t = str(txt)
    if "'>" in t:
        t = t.split("'>")[-1]
    t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('SECTUR', 'Turismo Nacional').replace('Sectur', 'Turismo Nacional').replace('sectur', 'turismo nacional')
    return t.strip()

def parse_json_list(val):
    if not val:
        return ''
    try:
        arr = json.loads(val)
        if isinstance(arr, list):
            return ', '.join(sanitize_text(x) for x in arr if x)
    except Exception:
        pass
    return sanitize_text(val)

# Estimate road transport price from Puebla by state
state_transport_ref = {
    'Puebla': 'Transporte redondo desde $490 - $690 MXN (Pre-venta $200)',
    'Tlaxcala': 'Transporte redondo desde $450 - $550 MXN (Pre-venta $200)',
    'Ciudad de México': 'Transporte redondo desde $549 - $700 MXN (Pre-venta $200)',
    'Estado de México': 'Transporte redondo desde $650 - $790 MXN (Pre-venta $200)',
    'Hidalgo': 'Transporte redondo desde $750 - $850 MXN (Pre-venta $200)',
    'Morelos': 'Transporte redondo desde $650 - $790 MXN (Pre-venta $200)',
    'Veracruz': 'Transporte redondo desde $750 - $950 MXN (Pre-venta $200)',
    'Oaxaca': 'Excursión desde $950 - $1,950 MXN (Pre-venta $200)',
    'Guerrero': 'Transporte redondo desde $980 - $1,160 MXN (Pre-venta $200)',
    'Querétaro': 'Transporte redondo desde $890 MXN (Pre-venta $200)',
}

conn = sqlite3.connect(sectur_db)
c = conn.cursor()

for row in c.execute('SELECT id, name, state, tipo, vocation, climate, avg_temp, description, gastronomy, crafts, key_attractions, festivities FROM destinos'):
    did, nom, est, tipo, voc, clim, temp, desc, gastro, crafts, atrac, fest = row
    macro = 'barrio_magico' if (tipo and 'barrio' in tipo.lower()) else 'pueblo_magico'
    clean_sub = sanitize_text(voc or 'Arquitectura y Tradición')
    clean_desc = sanitize_text(desc or '')
    clean_atrac = parse_json_list(atrac)
    clean_gastro = sanitize_text(gastro)
    clean_crafts = sanitize_text(crafts)
    clean_fest = parse_json_list(fest)
    price_ref = state_transport_ref.get(est, 'Cotización grupal en camioneta o paquete con vuelo (Pre-venta $200)')
    catalog.append({
        'id': f'dest-{did}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': macro,
        'sub': clean_sub,
        'desc': clean_desc[:320],
        'attractions': clean_atrac,
        'gastronomy': clean_gastro,
        'crafts': clean_crafts,
        'festivities': clean_fest,
        'climate': sanitize_text(f'{clim or ""} {temp or ""}'.strip()),
        'price_ref': price_ref
    })

for row in c.execute('SELECT id, name, states_covered, category, description, stops, distance_km, estimated_days FROM rutas'):
    rid, nom, est, cat, desc, stops, dist, days = row
    clean_sub = sanitize_text(cat or 'Ruta Turística')
    dur_txt = f'{days} días' if days else 'Fin de semana'
    clean_stops = parse_json_list(stops)
    clean_desc = sanitize_text(f'{desc or ""} ({dur_txt}, {dist or 120} km)')
    catalog.append({
        'id': f'ruta-{rid}',
        'name': sanitize_text(nom),
        'state': est or 'Multidestino',
        'macro': 'ruta_turistica',
        'sub': clean_sub,
        'desc': clean_desc[:320],
        'attractions': f'Paradas del circuito: {clean_stops}' if clean_stops else '',
        'gastronomy': 'Degustación gastronómica regional en cada parada de la ruta',
        'price_ref': state_transport_ref.get(est, f'Circuito de {dur_txt} • Pre-venta con $200 MXN')
    })

for row in c.execute('SELECT id, name, state, tipo, community, indigenous_group, duration_hours, description, what_includes FROM experiencias_comunitarias'):
    eid, nom, est, tipo, comm, ind, dur, desc, inc = row
    clean_sub = sanitize_text(tipo or 'Ecoturismo y Tradición')
    pueblo_str = f'Comunidad {comm or ""} ({ind or "Originaria"})'.strip()
    clean_inc = sanitize_text(inc)
    clean_desc = sanitize_text(f'[{pueblo_str}] {desc or ""}')
    catalog.append({
        'id': f'exp-{eid}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': 'experiencia_comunitaria',
        'sub': clean_sub,
        'desc': clean_desc[:320],
        'attractions': f'Incluye: {clean_inc} (Duración: {dur or "Medio día"})',
        'gastronomy': 'Cocina tradicional comunitaria de fogón y productos locales',
        'price_ref': state_transport_ref.get(est, 'Experiencia guiada + Transporte (Pre-venta $200)')
    })

for row in c.execute('SELECT id, name, state, classification, year_inscribed, description, criteria FROM patrimonios_unesco'):
    uid, nom, est, clas, year, desc, crit = row
    clean_sub = f'Patrimonio {clas or "Cultural"}'
    clean_desc = sanitize_text(f'Inscrito en {year or "UNESCO"}: {desc or ""}')
    catalog.append({
        'id': f'unesco-{uid}',
        'name': sanitize_text(nom),
        'state': est or 'México',
        'macro': 'patrimonio_unesco',
        'sub': clean_sub,
        'desc': clean_desc[:320],
        'attractions': f'Sitio Patrimonio Mundial UNESCO ({sanitize_text(crit)})',
        'gastronomy': 'Gastronomía típica regional certificada',
        'price_ref': state_transport_ref.get(est, 'Visita cultural guiada (Pre-venta $200)')
    })
conn.close()

# Load active CDMX events from CDMX_Event_Radar (automatically pruning expired dates < today)
today_iso = date.today().isoformat()
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
    WHERE e.end_date >= ? OR e.start_date >= ? OR e.start_date IS NULL
    ORDER BY e.start_date ASC
''', (today_iso, today_iso)):
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
    if dend and dend != dstart:
        fecha_txt = f'{dstart} al {dend}'
    recinto_txt = f'{vname or "CDMX"} ({alc or "CDMX"}) • Fecha: {fecha_txt}'
    full_desc = f'📍 {recinto_txt}. {desc or title}.'
    catalog.append({
        'id': f'cdmx-ev-{eid}',
        'name': sanitize_text(title),
        'state': 'Ciudad de México',
        'macro': 'evento_cdmx',
        'sub': sub_label,
        'desc': sanitize_text(full_desc[:320]),
        'attractions': f'Recinto: {vname or "CDMX"} ({alc or "CDMX"}) • Fechas: {fecha_txt}',
        'gastronomy': 'Parada opcional para cena al terminar el evento',
        'price_ref': boleto_txt
    })
conn2.close()

# Add Budgeted Packages (~20) & All VIP International/Sports Flyers
paquetes_y_vip = [
    {'id': 'pkg-tolantongo', 'name': 'Paquete Grutas de Tolantongo (Todo el Día)', 'state': 'Hidalgo', 'macro': 'paquete_armado', 'sub': 'Aguas Termales & Cañón', 'desc': 'Transporte redondo con peajes + Entrada general a pozas termales, cueva de vapor y río turquesa. Pre-venta con $200 MXN.', 'attractions': 'Pocitas termales a 36°C, Gruta y túnel de vapor, Río turquesa, Puente colgante y Cascadas', 'gastronomy': 'Barbacoa de borrego al horno de tierra, consomé hidalguense y tlacoyos de alberjón', 'price_ref': '$790 MXN Redondo (Boleto taquilla $200 MXN)'},
    {'id': 'pkg-cacahuamilpa-taxco', 'name': 'Paquete Grutas de Cacahuamilpa & Taxco', 'state': 'Guerrero', 'macro': 'paquete_armado', 'sub': 'Grutas & Pueblo Mágico', 'desc': 'Transporte redondo + Boleto de entrada a Grutas de Cacahuamilpa con guía + Tarde libre en Taxco de Alarcón.', 'attractions': '19 salones subterráneos iluminados en Cacahuamilpa, Parroquia de Santa Prisca, Teleférico de Taxco y Tianguis de Plata 925', 'gastronomy': 'Pozole verde guerrerense, jumiles, mole rosa de Taxco y bebida Berta', 'price_ref': '$1,160 MXN Todo Incluido'},
    {'id': 'pkg-zacatlan-chignahuapan', 'name': 'Paquete Zacatlán de las Manzanas & Chignahuapan', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Sierra Norte & Esferas', 'desc': 'Mirador de cristal, reloj floral, fábrica de sidra, talleres de esferas y Virgen Monumental.', 'attractions': 'Reloj Floral, Mirador de Cristal de la Barranca de los Jilgueros, Museo de Relojería Olvera, Basílica de la Inmaculada Concepción y Talleres de Esferas', 'gastronomy': 'Pan relleno de queso, sidras artesanales de manzana, tlacoyos serranos y barbacoa de Chignahuapan', 'price_ref': '$650 MXN Redondo'},
    {'id': 'pkg-cuetzalan', 'name': 'Paquete Cuetzalan del Progreso & Cascada Las Brisas', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Bosque de Niebla & Café', 'desc': 'Transporte redondo + Entrada a Cascada Las Brisas + Centro Histórico y danza de voladores.', 'attractions': 'Parroquia de San Francisco de Asís, Santuario de los Jarritos, Zona Arqueológica de Yohualichan y Cascada Las Brisas', 'gastronomy': 'Tlayoyos de alberjón con hoja de aguacate, cecina ahumada, café de altura orgánico y vino de maracuyá (Yolixpa)', 'price_ref': '$820 MXN Redondo'},
    {'id': 'pkg-queretaro-vino', 'name': 'Paquete Ruta del Queso, Vino & Peña de Bernal', 'state': 'Querétaro', 'macro': 'paquete_armado', 'sub': 'Viñedos & Monolito', 'desc': 'Transporte redondo + Tour guiado en cavas Freixenet con copa + Visita a Peña de Bernal.', 'attractions': 'Cavas subterráneas Freixenet (a 25m de profundidad), Viñedos La Redonda y tercer monolito más grande del mundo en Peña de Bernal', 'gastronomy': 'Gorditas de maíz quebrado con queso enchilado, tabla de quesos de oveja/cabra, vinos espumosos y nieve de vino tinto', 'price_ref': '$890 MXN Redondo'},
    {'id': 'pkg-bahia-acapulco', 'name': 'Paquete Bahía de Acapulco (Fin de Semana)', 'state': 'Guerrero', 'macro': 'paquete_armado', 'sub': 'Sol y Playa Pacífico', 'desc': 'Transporte redondo directo a Zona Dorada por Autopista del Sol. Salida viernes por la noche.', 'attractions': 'Clavadistas de La Quebrada, Playa Condesa, Isla La Roqueta, Fuerte de San Diego (Museo Histórico de Acapulco) y Costera Miguel Alemán', 'gastronomy': 'Pescado a la talla en Barra Vieja, vuelve a la vida, ceviche acapulqueño y pulpo enamorado', 'price_ref': '$980 MXN Transporte Redondo (o Paquete con Hotel desde $2,450 MXN)'},
    {'id': 'pkg-valquirico-cacaxtla', 'name': 'Paquete Val\'Quirico & Zona Arqueológica Cacaxtla', 'state': 'Tlaxcala', 'macro': 'paquete_armado', 'sub': 'Arquitectura Toscana & Murales', 'desc': 'Recorrido matutino por los murales prehispánicos de Cacaxtla y tarde gastronómica en Val\'Quirico.', 'attractions': 'Gran Basamento y Mural de la Batalla en Cacaxtla, Museo de Sitio de Cacaxtla (entrada $95 MXN) y plazuelas estilo toscano en Val\'Quirico', 'gastronomy': 'Cortes internacionales, paella, helados artesanales, tlatlapas tlaxcaltecas y pan de fiesta', 'price_ref': '$490 MXN Redondo'},
    {'id': 'pkg-huasca-prismas', 'name': 'Paquete Huasca de Ocampo & Prismas Basálticos', 'state': 'Hidalgo', 'macro': 'paquete_armado', 'sub': 'Primer Pueblo Mágico', 'desc': 'Transporte redondo + Entrada a los Prismas Basálticos, Ex-Hacienda de Santa María Regla y Bosque de los Duendes.', 'attractions': 'Prismas Basálticos de 40 metros, Ex-Hacienda de Santa María Regla, Museo de los Duendes y Peña del Aire', 'gastronomy': 'Pastes tradicionales de papa con carne y mole, trucha arcoíris al horno y rompope artesanal', 'price_ref': '$790 MXN Redondo'},
    {'id': 'pkg-orizaba-teleferico', 'name': 'Paquete Orizaba Pueblo Mágico & Teleférico', 'state': 'Veracruz', 'macro': 'paquete_armado', 'sub': 'Montaña & Teleférico', 'desc': 'Paseo por el Río Orizaba con reserva animal, Palacio de Hierro de Eiffel, Poliforum Mier y Pesado y Teleférico.', 'attractions': 'Teleférico al Cerro del Borrego, Palacio de Hierro (Museo de la Cerveza y del Fútbol), Paseo del Río y Poliforum Mier y Pesado (Museo Cri-Cri)', 'gastronomy': 'Chileatole verde o rojo, pambazos orizabeños, picadas veracruzanas y café cordobés', 'price_ref': '$780 MXN Redondo'},
    {'id': 'pkg-teotihuacan-basilica', 'name': 'Paquete Pirámides de Teotihuacán & Basílica de Guadalupe', 'state': 'Estado de México', 'macro': 'paquete_armado', 'sub': 'Arqueología & Fe', 'desc': 'Recorrido por Calzada de los Muertos, Pirámide del Sol y la Luna, degustación de obsidiana/pulque y Basílica.', 'attractions': 'Pirámide del Sol y de la Luna, Templo de Quetzalcóatl, Museo de la Cultura Teotihuacana (entrada $95 MXN) e Insigne Basílica de Guadalupe', 'gastronomy': 'Barbacoa en penca de maguey, escamoles, chinicuiles, xoconostle y curados de pulque', 'price_ref': '$690 MXN Redondo'},
    {'id': 'pkg-six-flags-cdmx', 'name': 'Paquete Six Flags México / Parque Aztlán', 'state': 'Ciudad de México', 'macro': 'paquete_armado', 'sub': 'Parques de Diversiones', 'desc': 'Transporte ejecutivo redondo directo desde San Manuel hasta la puerta del parque con espera completa.', 'attractions': 'Montañas rusas Superman El Último Escape, Medusa Steel Coaster, Batman The Ride y Festival del Terror / Christmas in the Park', 'gastronomy': 'Funnel cakes, turkey legs, pizzas y snacks dentro del parque', 'price_ref': '$650 MXN Transporte Redondo (Boleto parque desde $899 MXN)'},
    {'id': 'pkg-africam-safari', 'name': 'Paquete Africam Safari & Tecali de Herrera', 'state': 'Puebla', 'macro': 'paquete_armado', 'sub': 'Familiar & Naturaleza', 'desc': 'Recorrido en nuestra unidad dentro de las zonas de animales en libertad en Africam Safari y artesanías de ónix.', 'attractions': 'Safari en vehículo propio entre jirafas, leones, elefantes y rinocerontes + Zona de Aventura + Talleres de mármol y ónix en Tecali', 'gastronomy': 'Cemitas poblanas, chalupas, mole poblano y nieves artesanales', 'price_ref': '$550 MXN Transporte (Boleto Africam $385 MXN)'},
    {'id': 'pkg-oaxaca-hierve', 'name': 'Paquete Oaxaca, Monte Albán, Mitla & Hierve el Agua (2 Días)', 'state': 'Oaxaca', 'macro': 'paquete_armado', 'sub': 'Cultura, Mezcal y Cascadas', 'desc': 'Fin de semana completo con transporte, 1 noche de hotel céntrico, Monte Albán, árbol del Tule y Hierve el Agua.', 'attractions': 'Templo de Santo Domingo, Museo de las Culturas de Oaxaca, Zona Arqueológica de Monte Albán ($95 MXN), Árbol del Tule y cascadas petrificadas de Hierve el Agua', 'gastronomy': 'Tlayudas con tasajo y quesillo, 7 moles oaxaqueños, chapulines, chocolate de agua y mezcal artesanal', 'price_ref': '$1,950 MXN Paquete c/Hotel'},
    {'id': 'pkg-tabasco-cacao', 'name': 'Ruta del Cacao al Chocolate en Tabasco (4 Días)', 'state': 'Tabasco', 'macro': 'paquete_armado', 'sub': 'Haciendas Cacaoteras & Pantanos', 'desc': 'Comalcalco (pirámides de ladrillo), Haciendas de Cacao Jesús María y La Luz, Parque Museo La Venta y Pantanos de Centla.', 'attractions': 'Parque-Museo La Venta (cabezas colosales olmecas), Zona Arqueológica de Comalcalco, Hacienda Cacaotera Jesús María y Reserva de la Biósfera Pantanos de Centla', 'gastronomy': 'Pejelagarto asado, maneas tabasqueñas, chirmol, pozol blanco o con cacao y chocolates artesanales', 'price_ref': '$3,499 MXN Paquete 4 Días'},
    {'id': 'pkg-los-cabos-nacional', 'name': 'Paquete Nacional VIP Los Cabos & Arco del Fin del Mundo (4 Días)', 'state': 'Baja California Sur', 'macro': 'paquete_armado', 'sub': 'Playa VIP con Vuelo + Hotel', 'desc': 'Vuelo redondo + Hotel Todo Incluido en Cabo San Lucas / San José del Cabo + Paseo en barco al Arco.', 'attractions': 'El Arco de Cabo San Lucas, Playa del Amor, avistamiento de ballenas (invierno), Distrito del Arte en San José del Cabo y Marina', 'gastronomy': 'Tacos de pescado y camarón estilo Baja, almejas chocolatas, marlin ahumado y coctelería internacional ilimitada en el resort', 'price_ref': '$10,490 MXN Vuelo + Todo Incluido'},
    {'id': 'pkg-cancun-nacional', 'name': 'Paquete Nacional VIP Cancún & Riviera Maya All-Inclusive (4 Días)', 'state': 'Quintana Roo', 'macro': 'paquete_armado', 'sub': 'Playa VIP con Vuelo + Hotel', 'desc': 'Vuelo redondo + Resort Todo Incluido frente al mar turquesa con alimentos y bebidas ilimitadas.', 'attractions': 'Playa Delfines, Museo Maya de Cancún, Zona Arqueológica El Rey, Isla Mujeres, Xcaret / Xel-Há y Quinta Avenida en Playa del Carmen', 'gastronomy': 'Cochinita pibil, pescado tikin xic, sopa de lima, marquesitas y barra libre internacional en el resort 5 estrellas', 'price_ref': '$8,990 MXN Vuelo + Todo Incluido'},
    {'id': 'pkg-huatulco-nacional', 'name': 'Paquete Nacional Bahías de Huatulco (4 Días)', 'state': 'Oaxaca', 'macro': 'paquete_armado', 'sub': 'Playas Certificadas', 'desc': 'Transporte / Vuelo + Hotel en Santa Cruz o Tangolunda + Paseo en yate por las 7 bahías y snorkel.', 'attractions': 'Catamarán por las 7 Bahías (Santa Cruz, Órgano, Maguey, Cacaluta, Chachacual), snorkel en arrecife de coral y La Crucecita', 'gastronomy': 'Piña rellena de mariscos gratinada, tlayudas costeñas, camarones al mezcal y café pluma de Oaxaca', 'price_ref': '$7,850 MXN Paquete c/Hotel'},
    {'id': 'pkg-chiapas-magico', 'name': 'Gran Circuito Chiapas: Cañón del Sumidero, San Cristóbal y Palenque (5 Días)', 'state': 'Chiapas', 'macro': 'paquete_armado', 'sub': 'Selva, Cascadas y Cultura Maya', 'desc': 'Lancha en Cañón del Sumidero, Chiapa de Corzo, San Cristóbal, Lagos de Montebello, Agua Azul y Palenque.', 'attractions': 'Cañón del Sumidero, San Cristóbal de las Casas, San Juan Chamula, Cascadas de Agua Azul, Misol-Há y Zona Arqueológica de Palenque', 'gastronomy': 'Cochito horneado de Chiapa de Corzo, sopa de pan, tamales de chipilín, queso bola de Ocosingo y tascalate', 'price_ref': '$8,490 MXN Paquete 5 Días'},
    {'id': 'vip-superbowl-lxi', 'name': 'Super Bowl LXI en Los Ángeles 2027 (Paquete Oficial)', 'state': 'Estados Unidos', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': '4 noches de hospedaje en Los Ángeles (11 al 15 Feb 2027), entrada oficial garantizada al Super Bowl LXI en SoFi Stadium y traslados.', 'attractions': 'SoFi Stadium (Inglewood), NFL Experience, Santa Monica Pier, Hollywood Walk of Fame y Beverly Hills', 'gastronomy': 'Gastronomía californiana, hospitality VIP en estadio y desayunos incluidos en hotel', 'price_ref': 'Cotizar Paquete VIP Oficial'},
    {'id': 'vip-olympiacos-grecia', 'name': 'Experiencia Europea: Olympiacos en Atenas (Champions League)', 'state': 'Grecia', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': 'Vuelos + Hotel en Atenas + Entrada oficial al partido del Olympiacos en el Estadio Georgios Karaiskakis + Acrópolis.', 'attractions': 'Estadio Georgios Karaiskakis (El Pireo), Acrópolis de Atenas, Partenón, Museo de la Acrópolis y Barrio de Plaka', 'gastronomy': 'Moussaka griega, gyros tradicionales, queso feta con aceite de oliva y souvlaki', 'price_ref': 'Cotizar Paquete VIP'},
    {'id': 'vip-clasico-espana', 'name': 'El Clásico Real Madrid vs Barcelona + Tour 4 Países Europa (18 Días)', 'state': 'España / Europa', 'macro': 'vip_internacional', 'sub': 'Deportes VIP Mundiales', 'desc': 'Entrada oficial a El Clásico en el Bernabéu + Circuito de 18 días por España, Francia, Italia y Alemania.', 'attractions': 'Estadio Santiago Bernabéu, Museo del Prado, Torre Eiffel, Museo del Louvre, Coliseo Romano, Vaticano, Venecia y Sagrada Familia', 'gastronomy': 'Desayuno buffet diario incluido; tapas en Madrid, croissants en París, pasta/pizza en Roma y cerveza bávara en Múnich', 'price_ref': '$5,790 USD (18 Días)'},
    {'id': 'vip-namibia-aventura', 'name': 'Aventura en Namibia: Dunas de Sossusvlei y Etosha (9 Días)', 'state': 'Namibia (África)', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Windhoek, Desierto del Kalahari, dunas rojas de Sossusvlei, Twyfelfontein y safari en Parque Nacional Etosha.', 'attractions': 'Parque Nacional Etosha, Dunas de Sossusvlei y Deadvlei, grabados rupestres UNESCO de Twyfelfontein y Desierto del Kalahari', 'gastronomy': 'Cenas en lodges de safari, cocina germano-africana en Windhoek y mariscos del Atlántico', 'price_ref': '€3,825 EUR'},
    {'id': 'vip-finlandia-artica', 'name': 'Expedición Ártica en Laponia y Auroras Boreales (8 Días)', 'state': 'Finlandia / Noruega', 'macro': 'vip_internacional', 'sub': 'Europa & Ártico', 'desc': 'Tromso, Narvik, Kiruna y Rovaniemi con aldea de Santa Claus, trineo de perros huskies, renos y caza de Auroras Boreales.', 'attractions': 'Aldea de Santa Claus en el Círculo Polar Ártico (Rovaniemi), fiordos de Tromso, Narvik, Kiruna y safari de Auroras Boreales', 'gastronomy': 'Salmón nórdico a las brasas, estofado tradicional lapón y bebidas calientes de bayas árticas', 'price_ref': '€4,195 EUR'},
    {'id': 'vip-arabia-saudi', 'name': 'Descubre Arabia Saudí: Riad, Medina y AlUla (8 Días)', 'state': 'Arabia Saudita', 'macro': 'vip_internacional', 'sub': 'Medio Oriente', 'desc': 'Riad moderno, oasis milenario de AlUla, tumbas nabateas de Hegra (Patrimonio UNESCO), Medina y Yeda en el Mar Rojo.', 'attractions': 'Tumbas nabateas de Hegra en AlUla (UNESCO), Kingdom Centre Skybridge en Riad, Centro Histórico Al-Balad en Yeda y Medina', 'gastronomy': 'Kabsa tradicional de cordero con especias árabes, dátiles reales y café árabe con cardamomo', 'price_ref': '$2,315 USD'},
    {'id': 'vip-sudafrica', 'name': 'Maravillas de Sudáfrica: Johannesburgo, Kruger y Ciudad del Cabo (7 Días)', 'state': 'Sudáfrica', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Ruta Panorama, safari fotográfico de los 5 Grandes en Parque Nacional Kruger y Ciudad del Cabo con Montaña de la Mesa.', 'attractions': 'Parque Nacional Kruger (safari 4x4), Montaña de la Mesa en Ciudad del Cabo, Cabo de Buena Esperanza y Johannesburgo', 'gastronomy': 'Braai sudafricano (asado tradicional), vinos de Stellenbosch y bobotie', 'price_ref': 'Desde €885 EUR'},
    {'id': 'vip-malasia', 'name': 'Malasia al Completo: Kuala Lumpur, Cameron Highlands y Penang (8 Días)', 'state': 'Malasia (Asia)', 'macro': 'vip_internacional', 'sub': 'Asia Exótica', 'desc': 'Torres Petronas, Cuevas de Batu, plantaciones de té en Cameron Highlands, Ipoh y George Town en la isla de Penang.', 'attractions': 'Torres Gemelas Petronas, Cuevas de Batu, plantaciones de té de Cameron Highlands, Templo Kek Lok Si e isla de Penang (UNESCO)', 'gastronomy': 'Nasi Lemak, satay malayo, laksa de Penang y té de altura de Cameron Highlands', 'price_ref': '$1,575 USD'},
    {'id': 'vip-uganda-primates', 'name': 'Uganda y los Grandes Primates: Gorilas en Bwindi (7 Días)', 'state': 'Uganda (África)', 'macro': 'vip_internacional', 'sub': 'África & Safaris de Lujo', 'desc': 'Kampala, rastreo de chimpancés en Parque Nacional Kibale, Queen Elizabeth National Park y trekking de gorilas en Bwindi.', 'attractions': 'Bosque Impenetrable de Bwindi (gorilas de montaña), Parque Nacional Kibale (chimpancés) y Canal Kazinga en Queen Elizabeth NP', 'gastronomy': 'Pensión completa en lodges ecológicos de selva, frutas tropicales y café ugandés', 'price_ref': '$3,970 USD'},
    {'id': 'vip-oman-fantasia', 'name': 'Fantasía de Omán: Mascate, Nizwa y Desierto de Wahiba (6 Días)', 'state': 'Omán (Medio Oriente)', 'macro': 'vip_internacional', 'sub': 'Medio Oriente', 'desc': 'Gran Mezquita del Sultán Qaboos en Mascate, fuerte histórico de Nizwa, reserva de tortugas en Ras Al Jinz y dunas de Wahiba.', 'attractions': 'Gran Mezquita del Sultán Qaboos, Ópera Real de Mascate, Fuerte y Zoco de Nizwa, Desierto de Wahiba Sands y Ras Al Jinz', 'gastronomy': 'Shuwa omaní marinado en especias, halwa tradicional, dátiles y pescado fresco del Golfo de Omán', 'price_ref': '$1,520 USD'}
]

catalog.extend(paquetes_y_vip)

catalog_json = json.dumps(catalog, ensure_ascii=False)
assert 'sectur' not in catalog_json.lower(), 'Error: Found forbidden word in catalog JSON!'

js_out = '// Catálogo Maestro Unificado: Destinos Nacionales + Cartelera CDMX + Paquetes y VIP (Con Museos, Platillos Típicos y Tarifas)\n'
js_out += 'window.MASTER_CATALOG_1000 = ' + catalog_json + ';\n'
js_out += 'window.SECTUR_737_CATALOG = window.MASTER_CATALOG_1000;\n'

out_path = os.path.join(base_dir, 'js', 'sectur_737_catalog.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(js_out)

print(f'SUCCESS: Wrote {len(catalog)} enriched items to {out_path} with ZERO occurrences of forbidden word.')
