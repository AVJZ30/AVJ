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
