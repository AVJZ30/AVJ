# AVJ COMUNITY · Traducción local sin API
El sistema utiliza archivos JSON en `idiomas-de-la-web/`, sin Google Translation, sin clave API y sin pago por caracteres.

Los HTML públicos cargan `/idiomas-de-la-web/traductor.js`. El módulo lee el JSON del idioma que el sitio detectó según la IP.

Las tarjetas nuevas cargadas desde Supabase se revisan automáticamente y los textos que ya existan en el diccionario se muestran traducidos. Los nuevos textos sin traducción quedan en español porque un JSON no genera traducciones por sí mismo.

Para ampliar cobertura, añadir las traducciones a los archivos `en.json`, `pt.json`, `fr.json`, `de.json` e `it.json`. No hay que tocar Supabase ni configurar Google Cloud.

Consulta `idiomas-de-la-web/README.md` para detalles.
