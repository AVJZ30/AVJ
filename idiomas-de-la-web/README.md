# Idiomas de la web · AVJ COMUNITY

Sistema sin Google Cloud Translation ni servicios de traducción de pago.

## Estructura
- `traductor.js`: traduce el contenido visible usando diccionarios locales; observa elementos añadidos después de cargar Supabase.
- `en.json`: inglés.
- `pt.json`: portugués.
- `fr.json`: francés.
- `de.json`: alemán.
- `it.json`: italiano.

Las claves del JSON son los textos originales en español. Sus valores son las traducciones correspondientes.
`site-locale.js` (en la carpeta html) determina el país por IP y activa el idioma.
El build de Netlify publica esta carpeta tal cual para que sea accesible desde cada página.

## ¿Qué se traduce de forma automática?
Cuando Supabase agrega nuevas tarjetas a la página, el motor busca los textos en los archivos JSON y aplica las traducciones existentes. Esto no cambia datos en Supabase.

**Limitación fundamental:** un archivo JSON no puede generar por sí mismo traducciones de textos que nunca ha visto. Si se añade un nombre o descripción de producto que no tiene entrada en el diccionario, aparece en español, hasta que se añada una traducción. Para traducción automática de texto nuevo hay que utilizar un motor de traducción (local, propio o externo). Este proyecto no realiza llamadas a una API de traducción.

## Agregar traducciones
En cada JSON, incorporar el texto original como clave y su traducción como valor. Mantener el mismo texto en español que aparece en el sitio.
Evitar traducir marcas, precios, enlaces, direcciones de correo, teléfonos, datos sensibles y términos de administración.

## Cobro por traducción
**Ninguno:** el navegador descarga los JSON estáticos. Solo cuenta el tráfico ordinario de Netlify, sujeto a los límites de tu plan. No hay facturación por caracteres traducidos.
