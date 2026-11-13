(() => {
 'use strict';
 const SUPABASE_URL='https://yxurpqmsvqovtbkjxsjx.supabase.co';
 const KEY='sb_publishable_vmZdZPIW2N2vt8VNz5B3Gw__ThzbuD7';
 const grid=document.getElementById('web-project-grid');
 if(!grid)return;
 const text=value=>String(value??'');
 const secure=value=>{try{const u=new URL(text(value));return u.protocol==='https:'?u.href:''}catch{return ''}};
 const slug=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'sitio';
 const categories={
  Restaurante:{glyph:'✦',style:'restaurant',label:'GASTRONOMÍA'},
  Escuela:{glyph:'✧',style:'school',label:'EDUCACIÓN'},
  Tienda:{glyph:'▣',style:'shop',label:'COMERCIO'},
  Negocio:{glyph:'◆',style:'business',label:'SITIO WEB'},
  Otro:{glyph:'◈',style:'other',label:'PROYECTO'}
 };
 function iconCandidates(project,siteUrl){
  const base=new URL(siteUrl),root=base.origin,hostname=base.hostname;
  // Intentamos primero los iconos alojados por la propia web. Un servicio de terceros
  // queda como alternativa para sitios sin favicon convencional.
  const list=[
   secure(project.favicon_url),
   root+'/favicon.svg',
   root+'/favicon-32x32.png',
   root+'/apple-touch-icon.png',
   root+'/favicon.png',
   root+'/favicon.ico',
   root+'/android-chrome-192x192.png',
   'https://www.google.com/s2/favicons?domain='+encodeURIComponent(hostname)+'&sz=128',
   'https://icons.duckduckgo.com/ip3/'+encodeURIComponent(hostname)+'.ico'
  ].filter(Boolean);
  return [...new Set(list)];
 }
 function make(tag,cls,textContent){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(textContent!==undefined)node.textContent=textContent;
  return node;
 }
 function renderIcon(project,siteUrl,holder){
  const candidates=iconCandidates(project,siteUrl);
  const image=make('img','project-icon-image');
  image.alt='Favicon de '+text(project.titulo);
  image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
  let position=0;
  const fallback=()=>{
   image.remove();
   const initials=text(project.titulo).trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'WEB';
   holder.append(make('span','project-icon-fallback',initials));
  };
  image.onerror=()=>{position++;if(position>=candidates.length)fallback();else image.src=candidates[position]};
  holder.append(image);
  if(candidates.length)image.src=candidates[0];else fallback();
 }
 function add(project,index){
  const url=secure(project.url);if(!url)return;
  const category=categories[project.categoria]||categories.Otro;
  const card=make('article','project project-showcase '+category.style);
  if(/^#[0-9a-fA-F]{6}$/.test(project.color_fondo||''))card.style.setProperty('--project-color',project.color_fondo);
  card.style.setProperty('--project-order',String(Math.min(index,8)));
  const preview=make('div','project-preview');
  const browser=make('div','project-browser');
  const dots=make('span','project-browser-dots');
  dots.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)dots.append(make('i'));
  const domain=make('span','project-browser-domain',new URL(url).hostname);
  browser.append(dots,domain);
  const canvas=make('div','project-preview-art');canvas.setAttribute('aria-hidden','true');
  const orbit=make('span','project-orbit');
  const pixels=make('span','project-pixels');
  canvas.append(orbit,pixels);
  const logo=make('div','project-icon-shell');
  renderIcon(project,url,logo);
  canvas.append(logo);
  const mini=make('div','project-mini-label','SITIO WEB EN LÍNEA');
  canvas.append(mini);
  preview.append(browser,canvas);
  const details=make('div','project-details');
  const tag=make('span','project-kicker',category.glyph+' '+category.label);
  const title=make('h3','project-name',text(project.titulo));
  const desc=make('p','project-description',text(project.descripcion).trim()||'Explora este proyecto digital desarrollado por AVJ COMUNITY.');
  details.append(tag,title,desc);
  const socials=make('div','project-social');
  const platforms=[['instagram_url','Instagram','instagram'],['tiktok_url','TikTok','tiktok'],['facebook_url','Facebook','facebook'],['whatsapp_url','WhatsApp','whatsapp']];
  const iconPaths={
   instagram:['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z','M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z','M17.5 6.5h.01'],
   tiktok:['M14 2h3c.2 2.5 1.7 4 4 4.3V9.4c-1.5-.1-2.8-.6-4-1.5v7.2a6 6 0 1 1-6.2-6V12a3 3 0 1 0 3.2 3V2Z'],
   facebook:['M14 22v-8h3l.5-4H14V8c0-1.1.3-2 2-2h2V2.4A25 25 0 0 0 15 2c-3.2 0-5 1.8-5 5.2V10H7v4h3v8'],
   whatsapp:['M20.3 16.7A9 9 0 1 0 7.4 20.5L3 22l1.5-4.3A9 9 0 0 0 20.3 16.7Z','M8.4 7.9c.3-.5.5-.5.8-.5h.7c.3 0 .5.1.7.5l1.1 2.3c.1.3.1.5-.1.8l-.8.9c.7 1.4 1.8 2.5 3.3 3.2l.9-.9c.3-.3.5-.3.8-.2l2.3 1.1c.3.2.4.4.4.7 0 1.2-1 2.1-2.2 2.2-3.7 0-8.6-4.7-8.6-8.5 0-.6.2-1.1.7-1.6Z']
  };
  for(const [field,label,brand] of platforms){
   const link=secure(project[field]);
   if(!link)continue;
   const node=make('a','project-social-link social-'+brand);
   node.href=link;node.target='_blank';node.rel='noopener noreferrer';node.title=label+' · '+text(project.titulo);
   node.setAttribute('aria-label',label+' de '+text(project.titulo));
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   for(const d of iconPaths[brand]){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);svg.append(p)}
   node.append(svg,make('span','social-name',label));
   socials.append(node);
  }
  if(socials.childElementCount)details.append(socials);
  const actions=make('div','project-actions');
  const visit=make('a','project-visit','VISITAR WEB ↗');
  visit.href=url;visit.target='_blank';visit.rel='noopener noreferrer';visit.setAttribute('aria-label','Visitar '+text(project.titulo)+' (se abre en otra pestaña)');
  actions.append(visit);
  details.append(actions);
  card.append(preview,details);
  grid.append(card);
 }
 async function load(){
  try{
   if(typeof supabase==='undefined')throw Error('No se pudo cargar el catálogo.');
   const client=supabase.createClient(SUPABASE_URL,KEY);
   const {data,error}=await client.from('avj_websites').select('id,titulo,url,descripcion,categoria,favicon_url,color_fondo,instagram_url,tiktok_url,facebook_url,whatsapp_url').eq('publicado',true).order('created_at',{ascending:false});
   if(error)throw error;
   grid.replaceChildren();
   if(!data?.length){
    grid.append(make('div','empty','Próximamente: aquí podrás conocer los proyectos desarrollados por AVJ COMUNITY.'));
    return;
   }
   data.forEach(add);
  }catch(error){
   grid.replaceChildren(make('div','empty','No se pudieron mostrar los proyectos. Intenta recargar la página.'));
   console.error('Portafolio AVJ:',error);
  }
 }
 window.addEventListener('avj:websites-updated',load);
 load();
})();