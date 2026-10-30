#!/usr/bin/env python3
"""
build_ar_sign.py - Generador de Modelo 3D GLB para Realidad Aumentada (WebAR)
Crea un letrero 3D interactivo con iluminación PBR, escala métrica 1:1 y materiales emisivos
para la Estética Alma y Merakirai.
"""

import os
import struct
import json
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/media/rogerman/14befb81-4210-4134-a9a0-0ee76166e483/presentacion_alma/models"
os.makedirs(OUTPUT_DIR, exist_ok=True)
GLB_PATH = os.path.join(OUTPUT_DIR, "letrero_alma_ar.glb")

def create_front_texture():
    """Genera una textura de altísima resolución (1024x1024) para la cara frontal del letrero."""
    w, h = 1024, 680
    img = Image.new("RGBA", (w, h), (10, 10, 14, 255))
    draw = ImageDraw.Draw(img)

    # 1. Gradiente sutil y marco exterior
    for i in range(16):
        alpha = int(180 - i * 10)
        color = (244, 63, 94, max(alpha, 10))
        draw.rounded_rectangle([i, i, w - 1 - i, h - 1 - i], radius=32, outline=color, width=1)

    # Marco dorado interior
    draw.rounded_rectangle([24, 24, w - 25, h - 25], radius=24, outline=(212, 175, 55, 220), width=4)
    draw.rounded_rectangle([32, 32, w - 33, h - 33], radius=18, outline=(244, 63, 94, 180), width=2)

    # 2. Fondo sutil con brillo radial
    for r in range(250, 0, -10):
        alpha = int(45 * (1 - r / 250))
        draw.ellipse([w//2 - r, h//2 - 60 - r//2, w//2 + r, h//2 - 60 + r//2], fill=(244, 63, 94, alpha))

    # Cargar fuentes disponibles o usar default
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        font_contact = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_badge = font_title
        font_contact = font_title

    # 3. Emblema Floral / Diamante Superior
    draw.ellipse([w//2 - 45, 60, w//2 + 45, 150], fill=(244, 63, 94, 230), outline=(212, 175, 55, 255), width=3)
    # Forma estilizada de flor / tijeras doradas
    draw.line([w//2 - 25, 90, w//2 + 25, 120], fill=(255, 255, 255, 255), width=4)
    draw.line([w//2 + 25, 90, w//2 - 25, 120], fill=(255, 255, 255, 255), width=4)
    draw.ellipse([w//2 - 12, 93, w//2 + 12, 117], fill=(212, 175, 55, 255))

    # 4. Título Principal
    title_text = "ESTÉTICA ALMA"
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    # Sombra de neón
    draw.text((w//2 - t_w//2 + 2, 172), title_text, font=font_title, fill=(244, 63, 94, 180))
    # Texto frontal blanco brillante
    draw.text((w//2 - t_w//2, 170), title_text, font=font_title, fill=(255, 255, 255, 255))

    # 5. Subtítulo
    sub_text = "SALÓN DE BELLEZA & SPA CAPILAR"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text((w//2 - s_w//2, 255), sub_text, font=font_sub, fill=(253, 164, 175, 240))

    # Línea decorativa dorada
    draw.line([w//2 - 160, 310, w//2 + 160, 310], fill=(212, 175, 55, 220), width=3)
    draw.ellipse([w//2 - 6, 307, w//2 + 6, 313], fill=(255, 255, 255, 255))

    # 6. Puntos Clave / Servicios
    servicios = "CORTES  •  COLORIMETRÍA  •  ALACIADOS  •  BOTOX  •  GELISH"
    srv_bbox = draw.textbbox((0, 0), servicios, font=font_badge)
    srv_w = srv_bbox[2] - srv_bbox[0]
    draw.text((w//2 - srv_w//2, 335), servicios, font=font_badge, fill=(228, 228, 231, 230))

    # 7. Insignia Inferior (Dirección & Teléfono)
    draw.rounded_rectangle([70, 400, w - 71, 510], radius=16, fill=(20, 20, 28, 220), outline=(244, 63, 94, 120), width=2)

    dir_text = "📍 Río Nexapa #6101, Jardines de San Manuel, Puebla"
    d_bbox = draw.textbbox((0, 0), dir_text, font=font_badge)
    d_w = d_bbox[2] - d_bbox[0]
    draw.text((w//2 - d_w//2, 420), dir_text, font=font_badge, fill=(200, 200, 210, 240))

    wa_text = "💬 WhatsApp / Citas:  222 801 6244"
    wa_bbox = draw.textbbox((0, 0), wa_text, font=font_contact)
    wa_w = wa_bbox[2] - wa_bbox[0]
    draw.text((w//2 - wa_w//2, 460), wa_text, font=font_contact, fill=(52, 211, 153, 255))

    # Pie de alianza
    promo_text = "✨ 10% DE DESCUENTO EN VIAJES LA RUTA DEL ÁGUILA (CUPÓN ESTETICA10)"
    p_bbox = draw.textbbox((0, 0), promo_text, font=font_badge)
    p_w = p_bbox[2] - p_bbox[0]
    draw.text((w//2 - p_w//2, 570), promo_text, font=font_badge, fill=(253, 224, 71, 255))

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

def create_merakirai_texture():
    """Genera textura para Tótem de Abordaje Merakirai."""
    w, h = 1024, 680
    img = Image.new("RGBA", (w, h), (7, 14, 28, 255))
    draw = ImageDraw.Draw(img)

    # Marco exterior cyan y dorado
    for i in range(16):
        alpha = int(180 - i * 10)
        draw.rounded_rectangle([i, i, w - 1 - i, h - 1 - i], radius=32, outline=(56, 189, 248, max(alpha, 10)), width=1)

    draw.rounded_rectangle([24, 24, w - 25, h - 25], radius=24, outline=(251, 191, 36, 220), width=4)
    draw.rounded_rectangle([32, 32, w - 33, h - 33], radius=18, outline=(14, 165, 233, 180), width=2)

    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        font_contact = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_badge = font_title
        font_contact = font_title

    # Emblema Águila / Viaje
    draw.ellipse([w//2 - 45, 60, w//2 + 45, 150], fill=(2, 132, 199, 230), outline=(251, 191, 36, 255), width=3)
    draw.polygon([(w//2, 80), (w//2 - 30, 130), (w//2, 115), (w//2 + 30, 130)], fill=(255, 255, 255, 255))

    # Título
    title = "MERAKIRAI TOURS"
    t_bbox = draw.textbbox((0, 0), title, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text((w//2 - t_w//2 + 2, 172), title, font=font_title, fill=(2, 132, 199, 180))
    draw.text((w//2 - t_w//2, 170), title, font=font_title, fill=(255, 255, 255, 255))

    # Subtítulo
    sub = "LA RUTA DEL ÁGUILA • PUNTO DE ABORDAJE"
    s_bbox = draw.textbbox((0, 0), sub, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text((w//2 - s_w//2, 255), sub, font=font_sub, fill=(125, 211, 252, 240))

    draw.line([w//2 - 180, 310, w//2 + 180, 310], fill=(251, 191, 36, 220), width=3)

    # Destinos
    dest = "XOCHIMILCO  •  CHIAPAS  •  OAXACA  •  CONCIERTOS CDMX"
    d_bbox = draw.textbbox((0, 0), dest, font=font_badge)
    d_w = d_bbox[2] - d_bbox[0]
    draw.text((w//2 - d_w//2, 335), dest, font=font_badge, fill=(224, 242, 254, 230))

    # Info box
    draw.rounded_rectangle([70, 400, w - 71, 510], radius=16, fill=(15, 23, 42, 220), outline=(56, 189, 248, 120), width=2)
    dir_text = "🚐 Salidas Seguras desde Puebla (San Manuel / BUAP)"
    db_bbox = draw.textbbox((0, 0), dir_text, font=font_badge)
    db_w = db_bbox[2] - db_bbox[0]
    draw.text((w//2 - db_w//2, 420), dir_text, font=font_badge, fill=(186, 230, 253, 240))

    wa_text = "📲 Reserva y Salidas:  222 801 6244"
    wa_bbox = draw.textbbox((0, 0), wa_text, font=font_contact)
    wa_w = wa_bbox[2] - wa_bbox[0]
    draw.text((w//2 - wa_w//2, 460), wa_text, font=font_contact, fill=(52, 211, 153, 255))

    promo_text = "🌐 mera-kirai.com • Pre-venta desde $200 MXN"
    p_bbox = draw.textbbox((0, 0), promo_text, font=font_badge)
    p_w = p_bbox[2] - p_bbox[0]
    draw.text((w//2 - p_w//2, 570), promo_text, font=font_badge, fill=(253, 224, 71, 255))

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

def create_merakirai_emissive():
    """Genera textura emisiva para Merakirai."""
    w, h = 1024, 680
    img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([24, 24, w - 25, h - 25], radius=24, outline=(56, 189, 248, 255), width=6)
    draw.rounded_rectangle([32, 32, w - 33, h - 33], radius=18, outline=(251, 191, 36, 255), width=3)

    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_contact = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_contact = font_title

    draw.ellipse([w//2 - 45, 60, w//2 + 45, 150], fill=(56, 189, 248, 255))
    title = "MERAKIRAI TOURS"
    t_bbox = draw.textbbox((0, 0), title, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text((w//2 - t_w//2, 170), title, font=font_title, fill=(255, 255, 255, 255))

    sub = "LA RUTA DEL ÁGUILA • PUNTO DE ABORDAJE"
    s_bbox = draw.textbbox((0, 0), sub, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text((w//2 - s_w//2, 255), sub, font=font_sub, fill=(56, 189, 248, 255))

    wa_text = "📲 Reserva y Salidas:  222 801 6244"
    wa_bbox = draw.textbbox((0, 0), wa_text, font=font_contact)
    wa_w = wa_bbox[2] - wa_bbox[0]
    draw.text((w//2 - wa_w//2, 460), wa_text, font=font_contact, fill=(52, 211, 153, 255))

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

def create_emissive_texture():
    """Genera textura emisiva (mapa de resplandor neón en la oscuridad)."""
    w, h = 1024, 680
    img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Marco neón rosa brillante
    draw.rounded_rectangle([24, 24, w - 25, h - 25], radius=24, outline=(244, 63, 94, 255), width=6)
    draw.rounded_rectangle([32, 32, w - 33, h - 33], radius=18, outline=(212, 175, 55, 255), width=3)

    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_contact = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_contact = font_title

    # Emblema
    draw.ellipse([w//2 - 45, 60, w//2 + 45, 150], fill=(244, 63, 94, 255))

    # Título neón blanco-rosa intenso
    title_text = "ESTÉTICA ALMA"
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text((w//2 - t_w//2, 170), title_text, font=font_title, fill=(255, 200, 220, 255))

    # Subtítulo neón
    sub_text = "SALÓN DE BELLEZA & SPA CAPILAR"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text((w//2 - s_w//2, 255), sub_text, font=font_sub, fill=(244, 63, 94, 255))

    # Contacto verde neón
    wa_text = "💬 WhatsApp / Citas:  222 801 6244"
    wa_bbox = draw.textbbox((0, 0), wa_text, font=font_contact)
    wa_w = wa_bbox[2] - wa_bbox[0]
    draw.text((w//2 - wa_w//2, 460), wa_text, font=font_contact, fill=(52, 211, 153, 255))

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()

def generate_single_glb(out_filename, title_node, front_bytes, emissive_bytes, base_color_tint, emissive_tint):
    out_path = os.path.join(OUTPUT_DIR, out_filename)
    print(f"🎨 Generando {out_filename}...")

    # Dimensiones reales en metros (Escala 1:1 para Realidad Aumentada)
    width = 1.05
    height = 0.70
    depth = 0.08

    hw = width / 2.0
    hh = height / 2.0
    hd = depth / 2.0

    v_front = [
        -hw, -hh,  hd,   0, 0, 1,   0.0, 1.0,
         hw, -hh,  hd,   0, 0, 1,   1.0, 1.0,
         hw,  hh,  hd,   0, 0, 1,   1.0, 0.0,
        -hw,  hh,  hd,   0, 0, 1,   0.0, 0.0,
    ]
    i_front = [0, 1, 2,  0, 2, 3]

    v_back = [
         hw, -hh, -hd,   0, 0, -1,  0.0, 1.0,
        -hw, -hh, -hd,   0, 0, -1,  1.0, 1.0,
        -hw,  hh, -hd,   0, 0, -1,  1.0, 0.0,
         hw,  hh, -hd,   0, 0, -1,  0.0, 0.0,
    ]
    i_back = [4, 5, 6,  4, 6, 7]

    panel_vertices = v_front + v_back
    panel_indices = i_front + i_back

    frame_vertices = [
        # Top
        -hw,  hh,  hd,   0, 1, 0,   0, 0,
         hw,  hh,  hd,   0, 1, 0,   1, 0,
         hw,  hh, -hd,   0, 1, 0,   1, 1,
        -hw,  hh, -hd,   0, 1, 0,   0, 1,
        # Bottom
        -hw, -hh, -hd,   0, -1, 0,  0, 0,
         hw, -hh, -hd,   0, -1, 0,  1, 0,
         hw, -hh,  hd,   0, -1, 0,  1, 1,
        -hw, -hh,  hd,   0, -1, 0,  0, 1,
        # Left
        -hw, -hh, -hd,  -1, 0, 0,   0, 0,
        -hw, -hh,  hd,  -1, 0, 0,   1, 0,
        -hw,  hh,  hd,  -1, 0, 0,   1, 1,
        -hw,  hh, -hd,  -1, 0, 0,   0, 1,
        # Right
         hw, -hh,  hd,   1, 0, 0,   0, 0,
         hw, -hh, -hd,   1, 0, 0,   1, 0,
         hw,  hh, -hd,   1, 0, 0,   1, 1,
         hw,  hh,  hd,   1, 0, 0,   0, 1,
        # Mástil
        -0.04,  hh, -0.04,   0, 0, 1,  0, 0,
         0.04,  hh, -0.04,   0, 0, 1,  1, 0,
         0.04,  hh + 0.35, -0.04, 0, 0, 1, 1, 1,
        -0.04,  hh + 0.35, -0.04, 0, 0, 1, 0, 1,
        # Placa anclaje
        -0.12,  hh + 0.30, -0.06,  0, 0, -1, 0, 0,
         0.12,  hh + 0.30, -0.06,  0, 0, -1, 1, 0,
         0.12,  hh + 0.38, -0.06,  0, 0, -1, 1, 1,
        -0.12,  hh + 0.38, -0.06,  0, 0, -1, 0, 1
    ]

    frame_indices = [
        0, 1, 2,  0, 2, 3,
        4, 5, 6,  4, 6, 7,
        8, 9, 10,  8, 10, 11,
        12, 13, 14,  12, 14, 15,
        16, 17, 18,  16, 18, 19,
        20, 21, 22,  20, 22, 23
    ]

    bin_data = bytearray()

    def add_buffer(data_bytes, pad_to=4):
        offset = len(bin_data)
        bin_data.extend(data_bytes)
        padding = (pad_to - (len(bin_data) % pad_to)) % pad_to
        bin_data.extend(b'\x00' * padding)
        return offset, len(data_bytes)

    p_idx_bytes = struct.pack(f'<{len(panel_indices)}H', *panel_indices)
    bv_p_idx_offset, bv_p_idx_len = add_buffer(p_idx_bytes)

    p_pos, p_norm, p_uv = [], [], []
    for i in range(0, len(panel_vertices), 8):
        p_pos.extend(panel_vertices[i:i+3])
        p_norm.extend(panel_vertices[i+3:i+6])
        p_uv.extend(panel_vertices[i+6:i+8])

    bv_p_pos_offset, bv_p_pos_len = add_buffer(struct.pack(f'<{len(p_pos)}f', *p_pos))
    bv_p_norm_offset, bv_p_norm_len = add_buffer(struct.pack(f'<{len(p_norm)}f', *p_norm))
    bv_p_uv_offset, bv_p_uv_len = add_buffer(struct.pack(f'<{len(p_uv)}f', *p_uv))

    f_idx_bytes = struct.pack(f'<{len(frame_indices)}H', *frame_indices)
    bv_f_idx_offset, bv_f_idx_len = add_buffer(f_idx_bytes)

    f_pos, f_norm, f_uv = [], [], []
    for i in range(0, len(frame_vertices), 8):
        f_pos.extend(frame_vertices[i:i+3])
        f_norm.extend(frame_vertices[i+3:i+6])
        f_uv.extend(frame_vertices[i+6:i+8])

    bv_f_pos_offset, bv_f_pos_len = add_buffer(struct.pack(f'<{len(f_pos)}f', *f_pos))
    bv_f_norm_offset, bv_f_norm_len = add_buffer(struct.pack(f'<{len(f_norm)}f', *f_norm))
    bv_f_uv_offset, bv_f_uv_len = add_buffer(struct.pack(f'<{len(f_uv)}f', *f_uv))

    bv_img_front_offset, bv_img_front_len = add_buffer(front_bytes)
    bv_img_emis_offset, bv_img_emis_len = add_buffer(emissive_bytes)

    def get_min_max(coords):
        xs = [coords[i] for i in range(0, len(coords), 3)]
        ys = [coords[i+1] for i in range(0, len(coords), 3)]
        zs = [coords[i+2] for i in range(0, len(coords), 3)]
        return [min(xs), min(ys), min(zs)], [max(xs), max(ys), max(zs)]

    p_min, p_max = get_min_max(p_pos)
    f_min, f_max = get_min_max(f_pos)

    gltf_json = {
        "asset": {
            "version": "2.0",
            "generator": "Antigravity Spatial AR Engine"
        },
        "scene": 0,
        "scenes": [
            {
                "name": "Scene",
                "nodes": [0]
            }
        ],
        "nodes": [
            {
                "name": title_node,
                "mesh": 0,
                "translation": [0.0, 1.2, 0.0]
            }
        ],
        "meshes": [
            {
                "name": "Signboard",
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 1,
                            "NORMAL": 2,
                            "TEXCOORD_0": 3
                        },
                        "indices": 0,
                        "material": 0
                    },
                    {
                        "attributes": {
                            "POSITION": 5,
                            "NORMAL": 6,
                            "TEXCOORD_0": 7
                        },
                        "indices": 4,
                        "material": 1
                    }
                ]
            }
        ],
        "materials": [
            {
                "name": "IlluminatedSignFace",
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": 0},
                    "metallicFactor": 0.1,
                    "roughnessFactor": 0.35
                },
                "emissiveTexture": {"index": 1},
                "emissiveFactor": emissive_tint,
                "doubleSided": True
            },
            {
                "name": "DarkTitaniumFrame",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.15, 0.15, 0.18, 1.0],
                    "metallicFactor": 0.85,
                    "roughnessFactor": 0.25
                },
                "doubleSided": True
            }
        ],
        "textures": [
            {"sampler": 0, "source": 0},
            {"sampler": 0, "source": 1}
        ],
        "images": [
            {"bufferView": 8, "mimeType": "image/png"},
            {"bufferView": 9, "mimeType": "image/png"}
        ],
        "samplers": [
            {
                "magFilter": 9729,
                "minFilter": 9987,
                "wrapS": 10497,
                "wrapT": 10497
            }
        ],
        "accessors": [
            {"bufferView": 0, "byteOffset": 0, "componentType": 5123, "count": len(panel_indices), "type": "SCALAR"},
            {"bufferView": 1, "byteOffset": 0, "componentType": 5126, "count": len(panel_vertices) // 8, "type": "VEC3", "min": p_min, "max": p_max},
            {"bufferView": 2, "byteOffset": 0, "componentType": 5126, "count": len(panel_vertices) // 8, "type": "VEC3"},
            {"bufferView": 3, "byteOffset": 0, "componentType": 5126, "count": len(panel_vertices) // 8, "type": "VEC2"},
            {"bufferView": 4, "byteOffset": 0, "componentType": 5123, "count": len(frame_indices), "type": "SCALAR"},
            {"bufferView": 5, "byteOffset": 0, "componentType": 5126, "count": len(frame_vertices) // 8, "type": "VEC3", "min": f_min, "max": f_max},
            {"bufferView": 6, "byteOffset": 0, "componentType": 5126, "count": len(frame_vertices) // 8, "type": "VEC3"},
            {"bufferView": 7, "byteOffset": 0, "componentType": 5126, "count": len(frame_vertices) // 8, "type": "VEC2"}
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": bv_p_idx_offset, "byteLength": bv_p_idx_len, "target": 34963},
            {"buffer": 0, "byteOffset": bv_p_pos_offset, "byteLength": bv_p_pos_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_p_norm_offset, "byteLength": bv_p_norm_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_p_uv_offset, "byteLength": bv_p_uv_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_f_idx_offset, "byteLength": bv_f_idx_len, "target": 34963},
            {"buffer": 0, "byteOffset": bv_f_pos_offset, "byteLength": bv_f_pos_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_f_norm_offset, "byteLength": bv_f_norm_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_f_uv_offset, "byteLength": bv_f_uv_len, "target": 34962},
            {"buffer": 0, "byteOffset": bv_img_front_offset, "byteLength": bv_img_front_len},
            {"buffer": 0, "byteOffset": bv_img_emis_offset, "byteLength": bv_img_emis_len}
        ],
        "buffers": [
            {"byteLength": len(bin_data)}
        ]
    }

    json_str = json.dumps(gltf_json, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')
    json_padding = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_padding

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    header = struct.pack('<4sII', b'glTF', 2, total_length)
    chunk0_header = struct.pack('<II', len(json_bytes), 0x4E4F534A)
    chunk1_header = struct.pack('<II', len(bin_data), 0x004E4942)

    with open(out_path, 'wb') as f:
        f.write(header)
        f.write(chunk0_header)
        f.write(json_bytes)
        f.write(chunk1_header)
        f.write(bin_data)

    print(f"✨ ¡{out_filename} generado! ({os.path.getsize(out_path) / 1024:.1f} KB)")

def build_all():
    # 1. Letrero Estética Alma
    front_alma = create_front_texture()
    emis_alma = create_emissive_texture()
    generate_single_glb("letrero_alma_ar.glb", "Letrero_Alma_Luis", front_alma, emis_alma, [0.95, 0.25, 0.4, 1.0], [1.0, 0.85, 0.9])

    # 2. Tótem Merakirai Tours
    front_mera = create_merakirai_texture()
    emis_mera = create_merakirai_emissive()
    generate_single_glb("totem_merakirai_ar.glb", "Totem_Merakirai_Tours", front_mera, emis_mera, [0.1, 0.6, 0.9, 1.0], [0.8, 0.95, 1.0])

if __name__ == "__main__":
    build_all()
