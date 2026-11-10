# AVJ COMUNITY

## Organización

- `html/`: páginas del sitio y verificaciones de Google, Pinterest y Yandex.
- `imagenes/`: imágenes e iconos del sitio.
- `seo/`: robots.txt y sitemap.xml.
- `config/`: redirecciones y manifiesto web.
- `scripts/`: compilación del catálogo.
- `netlify.toml`: configuración de Netlify (debe permanecer en la raíz).

## Compilación

Ejecutar `node scripts/build.mjs` desde la raíz del repositorio con Node.js 22.
El proceso consulta el catálogo público y genera `dist/`, la carpeta publicada
por Netlify. Los archivos de las cuatro carpetas de contenido se copian a la
raíz de `dist/`, conservando las URL existentes y las verificaciones de dominio.
No repetir nombres de archivo entre carpetas. No editar ni subir `dist/`.

Para previsualizar la web, servir `dist/` con un servidor estático después de
compilar. Abrir directamente `html/` no reproduce las rutas de producción.

## Generación automática de páginas SEO

- En cada despliegue de Netlify, el script `scripts/build.mjs` genera HTML individuales en `dist/productos/`, `dist/libros/`, `dist/recursos/`, `dist/apps/`, `dist/juegos/`, `dist/reservas/` y `dist/trabajos-academicos/`.
- Se genera el nuevo `dist/sitemap.xml` con las URLs. No se debe editar ni subir `dist/` al repositorio.
- Las secciones de productos, libros, apps y reservas siguen cargándose de Supabase en cada visita. El HTML SEO es una instantánea semanal, no el stock en tiempo real.
- Los servicios académicos para las páginas SEO se extraen del listado de `html/academic-ui.js`; si se añade uno, también debe agregarse su tarjeta en `html/trabajos-academicos.html`.
- La tarea `.github/workflows/weekly-seo.yml` fuerza un despliegue desde GitHub los lunes a las 07:00 UTC (02:00 Ecuador). Se necesita GitHub Actions habilitado y despliegue automático de Netlify desde la rama `main`.
- La selección de ofertas aleatorias usa `reservation-offers.json` generado sin datos personales, solo reservas con cupos en la instantánea; confirma disponibilidad actual antes del pago.
- La indexación de páginas nuevas depende de Google; el sitemap solo facilita su descubrimiento.
