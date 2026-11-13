import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
// SEO snapshots: generated at deploy time, no reservation phone numbers ever exposed.
const host='https://avjcomunity.com';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>String(x??'item').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'item';
const safeUrl=x=>{try{const u=new URL(String(x||''));return u.protocol==='https:'||u.protocol==='http:'?u.href:''}catch{return ''}};
const plain=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const cut=(x,n=180)=>plain(x).slice(0,n);
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const css="*{box-sizing:border-box}body{margin:0;background:#faf8ff;color:#2a1739;font-family:'Press Start 2P',monospace;font-size:9px;line-height:2.25;overflow-wrap:anywhere}header,footer{background:#21112f;color:white;padding:24px max(18px,calc((100% - 1050px)/2));line-height:2.1}header a,footer a{color:#d8b4fe}main{max-width:1050px;padding:27px 18px 50px;margin:auto}.card{border:3px solid #2a163b;background:white;padding:22px;box-shadow:5px 5px #7b2cbf;margin:25px 0}h1{font-size:clamp(15px,3vw,24px);line-height:1.7}h2{font-size:14px;line-height:1.8}p{margin:14px 0}img{width:min(100%,350px);height:auto;max-height:260px;object-fit:contain;background:#f5edff}.btn{display:inline-block;background:#7b2cbf;color:white;text-decoration:none;border:3px solid #21112f;box-shadow:3px 3px #21112f;padding:13px;font-size:9px;line-height:2;margin:8px 8px 8px 0}.btn.disabled{background:#ddd;color:#444;border-color:#888;pointer-events:none;box-shadow:none}small,.muted{color:#675270;font-size:8px}a{overflow-wrap:anywhere}@media(max-width:520px){.card{padding:14px}main{padding:18px 12px}header,footer{padding:18px 12px}}";
function page({title,description,canonical,body,image,schema}){
 const pic=safeUrl(image);
 return '<!doctype html><html lang="es-EC"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' | AVJ STORE</title><meta name="robots" content="index,follow,max-image-preview:large"><meta name="description" content="'+esc(cut(description))+'"><link rel="canonical" href="'+esc(canonical)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+esc(title)+' | AVJ STORE"><meta property="og:description" content="'+esc(cut(description))+'"><meta property="og:url" content="'+esc(canonical)+'">'+(pic?'<meta property="og:image" content="'+esc(pic)+'">':'')+'<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet"><style>'+css+'</style><script type="application/ld+json">'+json(schema)+'</script></head><body><header>👾 AVJ STORE · <a href="/">Inicio</a> · <a href="/planes">Reservas</a></header><main>'+body+'</main><footer>© AVJ COMUNITY · Compra cuando haya disponibilidad o reserva tu espacio de forma opcional. <a href="/terminos">Términos</a> · <a href="/privacidad">Privacidad</a></footer></body></html>';
}
const btn=(href,text)=>href?'<a class="btn" href="'+esc(href)+'">'+esc(text)+'</a>':'<span class="btn disabled" aria-disabled="true">'+esc(text)+'</span>';
function card(title,image,description,extra,buttons){
 return '<article class="card">'+(safeUrl(image)?'<img loading="eager" fetchpriority="high" decoding="async" src="'+esc(safeUrl(image))+'" alt="Imagen de '+esc(title)+'">':'')+'<h1>'+esc(title)+'</h1><p>'+esc(description)+'</p>'+extra+'<div>'+buttons+'</div><p class="muted">Precios y disponibilidad sujetos a confirmación antes del pago. Reservar es opcional.</p></article>';
}
export async function generateSeoPages({outDir,products,digital,apps,plataformas,academicOffers=[],websites=[]}){
 const groups=new Map(),urls=[];
 async function add(group,id,title,render){
  const relative='/'+group+'/'+slug(title)+'-'+slug(id)+'/';
  const canonical=host+relative;
  const folder=path.join(outDir,relative);
  await mkdir(folder,{recursive:true});
  await writeFile(path.join(folder,'index.html'),render(canonical));
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push({title,relative});
  urls.push(canonical);
 }
 for(const p of products){
  if(!p.id||!p.name)continue;
  await add('productos',p.id,p.name,canonical=>{
   const available=Number(p.stock)>0,price=(Number(p.price)||0).toFixed(2),description=cut(p.spec||p.name,260);
   const schema={'@context':'https://schema.org','@type':'Product',name:p.name,description,image:safeUrl(p.img)||undefined,sku:String(p.id),offers:{'@type':'Offer',url:canonical,price,priceCurrency:'USD',availability:available?'https://schema.org/InStock':'https://schema.org/OutOfStock',seller:{'@type':'Organization',name:'AVJ COMUNITY'}}};
   return page({title:p.name+' precio en Ecuador',description:'Producto digital '+p.name+': '+description,canonical,image:p.img,schema,body:card(p.name,p.img,description,'<h2>Precio referencial: $'+price+' USD</h2>',btn(available?'/?producto='+encodeURIComponent(p.id)+'#tienda':null,available?'Ver y comprar':'Sin stock disponible')+btn('/planes','Consultar reservas'))});
  });
 }
 for(const d of digital){
  if(!d.id||!d.titulo)continue;
  const group=String(d.categoria||'').toLowerCase().includes('libro')?'libros':'recursos',destination='/digital?producto='+encodeURIComponent(d.id);
  await add(group,d.id,d.titulo,canonical=>{
   const description=cut(d.contenido||d.titulo,250);
   const schema={'@context':'https://schema.org','@type':group==='libros'?'Book':'CreativeWork',name:d.titulo,description,image:safeUrl(d.img)||undefined,url:canonical,inLanguage:'es',provider:{'@type':'Organization',name:'AVJ COMUNITY'}};
   return page({title:d.titulo+' - '+(group==='libros'?'Libro gratis en PDF Ecuador':'Recurso digital'),description:(group==='libros'?'Descubre el libro '+d.titulo+' gratis en AVJ COMUNITY. ':'Recurso '+d.titulo+'. ')+description,canonical,image:d.img,schema,body:card(d.titulo,d.img,description,'<p>Categoría: '+esc(d.categoria||'recurso')+' · '+esc(d.valor||'Gratis')+'</p>',btn(destination,group==='libros'?'Ver y descargar libro gratis':'Ver recurso'))});
  });
 }
 for(const a of apps){
  if(!a.id||!a.titulo)continue;
  const group=a.tipo==='juegos'?'juegos':'apps';
  await add(group,a.id,a.titulo,canonical=>{
   const description=cut(a.descripcion||a.titulo,250);
   const schema={'@context':'https://schema.org','@type':'SoftwareApplication',name:a.titulo,description,image:safeUrl(a.imagen_url)||undefined,url:canonical,applicationCategory:group==='juegos'?'GameApplication':'UtilitiesApplication'};
   return page({title:a.titulo+' - '+(group==='juegos'?'juego':'aplicación'),description,canonical,image:a.imagen_url,schema,body:card(a.titulo,a.imagen_url,description,'<p>'+esc(a.recomendacion||'Revisa los permisos y requisitos del desarrollador.')+'</p>',btn('/links','Ver apps y juegos')+(safeUrl(a.link)?btn(safeUrl(a.link),'Abrir enlace del recurso'):''))});
  });
 }
 const offers=[];
 for(const p of plataformas){
  if(!p.id||!p.nombre)continue;
  const free=(p.cuentas||[]).reduce((n,c)=>n+Math.max(0,Number(c.restantes)||0),0);
  if(free>0)offers.push({id:String(p.id),name:String(p.nombre),price:String(p.precio||'Precio por confirmar'),free});
  await add('reservas',p.id,p.nombre,canonical=>{
   const description='Reserva de '+p.nombre+'. '+(free>0?'Espacios en la última actualización: '+free:'Sin espacios publicados disponibles')+'. No pagas por adelantado.';
   const schema={'@context':'https://schema.org','@type':'Service',name:'Reserva de '+p.nombre,description,url:canonical,provider:{'@type':'Organization',name:'AVJ COMUNITY'}};
   return page({title:'Reserva de '+p.nombre,description,canonical,image:p.imagen_url,schema,body:card('Reserva de '+p.nombre,p.imagen_url,description,'<h2>Precio anunciado: '+esc(p.precio||'Por confirmar')+'</h2>',btn(free>0?'/planes?plataforma='+encodeURIComponent(p.id):null,free>0?'Reservar este perfil':'Sin espacios disponibles')+btn('/#tienda','Comprar directamente'))});
  });
 }
 for(const offer of academicOffers){
  const name=String(offer.name||'').trim(),price=(Number(offer.price)||0).toFixed(2);
  if(!name)continue;
  const id=slug(name),description='Apoyo académico y servicio digital de '+name+'. El alcance y el precio final se confirman antes del pago.';
  await add('trabajos-academicos',id,name,canonical=>{
   const schema={'@context':'https://schema.org','@type':'Service',name:'Apoyo con '+name,description,url:canonical,provider:{'@type':'Organization',name:'AVJ COMUNITY'},offers:{'@type':'Offer',price,priceCurrency:'USD'}};
   return page({title:'Trabajos académicos de '+name,description,canonical,schema,body:card(name,'',description,'<h2>Desde $'+price+' USD</h2><p>Precio final según la solicitud.</p>',btn('/trabajos-academicos','Solicitar por WhatsApp'))});
  });
 }
 // Public portfolio pages are generated from authenticated admin-managed project entries.
 for(const site of websites){
  if(!site.publicado||!site.id||!site.titulo||!safeUrl(site.url))continue;
  await add('sitios-web/proyectos',site.id,site.titulo,canonical=>{
   const description=cut(site.descripcion||('Sitio web de '+site.categoria+' desarrollado por AVJ COMUNITY.'),280);
   const websiteUrl=safeUrl(site.url);
   const siteIcon=safeUrl(site.favicon_url)||('https://www.google.com/s2/favicons?domain='+encodeURIComponent(new URL(websiteUrl).hostname)+'&sz=128');
   const schema={'@context':'https://schema.org','@type':'CreativeWork',name:site.titulo,description,url:canonical,creator:{'@type':'Organization',name:'AVJ COMUNITY',url:host},isBasedOn:websiteUrl};
   const detail='<h2>Sitio web creado por AVJ COMUNITY</h2><p>Tipo de proyecto: '+esc(site.categoria||'Negocio')+'</p><p>Diseñado para adaptarse a las necesidades del proyecto.</p>';
   return page({title:site.titulo+' - Sitio web creado por AVJ COMUNITY',description,canonical,image:siteIcon,schema,body:card(site.titulo,siteIcon,description,detail,btn(websiteUrl,'Visitar sitio web')+btn('/sitios-web','Ver planes de creación web'))});
  });
 }
 for(const [group,list] of groups){
  const folder=path.join(outDir,group);
  await mkdir(folder,{recursive:true});
  const listing=list.sort((a,b)=>a.title.localeCompare(b.title,'es')).map(x=>'<li><a href="'+esc(x.relative)+'">'+esc(x.title)+'</a></li>').join('');
  await writeFile(path.join(folder,'index.html'),page({title:'Catálogo de '+group,description:'Todos los recursos de '+group+' publicados por AVJ COMUNITY.',canonical:host+'/'+group+'/',schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Catálogo de '+group},body:'<h1>Catálogo de '+esc(group)+'</h1><ul>'+listing+'</ul>'}));
  urls.push(host+'/'+group+'/');
 }
 await writeFile(path.join(outDir,'reservation-offers.json'),JSON.stringify({generatedAt:new Date().toISOString(),offers}));
 const sitemapPath=path.join(outDir,'sitemap.xml'),xml=await readFile(sitemapPath,'utf8');
 if(!xml.includes('</urlset>'))throw new Error('Invalid SEO sitemap');
 await writeFile(sitemapPath,xml.replace('</urlset>',urls.map(u=>'  <url><loc>'+esc(u)+'</loc></url>').join('\n')+'\n</urlset>'));
 console.log('Generated '+urls.length+' detail pages and '+offers.length+' reservation offers.');
}
