# AVJ COMUNITY — Activación de traducción completa

El sitio detecta el país por IP y ya ejecuta el traductor en las páginas públicas:
index.html, links.html, herramientas.html, digital.html, planes.html, sorteo.html,
module.html, privacidad.html y terminos.html.

Los textos cargados dinámicamente desde Supabase se traducen en pantalla.
Los registros originales, los importes, los correos, teléfonos y los datos
del administrador NO se traducen ni se modifican en Supabase.

## Configuración obligatoria (solo una vez)
1. En Google Cloud, habilitar **Cloud Translation API** y configurar facturación.
2. Crear una API key autorizada para Cloud Translation Basic (v2). Restringirla
   a esa API. No colocarla en HTML, scripts públicos ni GitHub.
3. En Netlify, abrir Site configuration > Environment variables y crear:
   `GOOGLE_TRANSLATE_API_KEY` = (la clave privada).
   Incluir el ámbito **Functions**.
4. Hacer un nuevo deploy en Netlify para aplicar la variable.
5. Probar desde el sitio publicado en inglés, francés y portugués, incluyendo
   productos/libros que se cargan desde Supabase.

Al faltar la clave, la función `/.netlify/functions/translate` responde
HTTP 503 y el contenido sigue mostrándose en español. Esto es intencional:
no se utiliza un traductor comercial sin permiso ni se expone una clave.

Google Cloud Translation tiene cuotas y cobros por caracteres, con un crédito
gratuito limitado. Revisar tarifas antes de habilitarlo:
https://cloud.google.com/products/translate/pricing

Ruta del backend: netlify/functions/translate.mjs
Ruta del navegador: html/translate-site.js
Configuración regional: html/site-locale.js
