/**
 * Cloudflare Worker: Multi-Subdomain Transparent Gateway para mera-kirai.com
 * 
 * Funcionalidad:
 * 1. Mantiene el subdominio en la barra de direcciones (NUNCA cambia a .html ni hace 301).
 * 2. Soporta:
 *    - estetica.mera-kirai.com    -> Sirve /estetica.html
 *    - tienda.mera-kirai.com      -> Sirve /tienda.html
 *    - productos.mera-kirai.com   -> Sirve /tienda.html
 *    - mera-kirai.com             -> Sirve GitHub Pages origen por defecto
 * 
 * Configuración en Cloudflare Dashboard:
 * 1. En DNS: Agregar registros CNAME (Proxy: Naranja) para:
 *    - tienda     -> mera-kirai.com
 *    - productos  -> mera-kirai.com
 *    - estetica   -> mera-kirai.com
 * 2. En Workers & Pages -> Rutas (Routes):
 *    - *.mera-kirai.com/*
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // 1. Subdominio Estética Alma
    if (host === 'estetica.mera-kirai.com') {
      if (url.pathname === '/' || url.pathname === '') {
        const targetUrl = new URL('https://mera-kirai.com/estetica.html');
        return fetch(new Request(targetUrl, request));
      }
    }

    // 2. Subdominio Tienda Lendan / Productos
    if (host === 'tienda.mera-kirai.com' || host === 'productos.mera-kirai.com') {
      if (url.pathname === '/' || url.pathname === '') {
        const targetUrl = new URL('https://mera-kirai.com/tienda.html');
        return fetch(new Request(targetUrl, request));
      }
    }

    // Para cualquier otro archivo estático (CSS, JS, imágenes), pasar la petición normal
    return fetch(request);
  }
};
