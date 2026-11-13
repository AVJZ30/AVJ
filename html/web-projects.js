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
   const {data,error}=await client.from('avj_websites').select('id,titulo,url,descripcion,categoria,favicon_url,color_fondo').eq('publicado',true).order('created_at',{ascending:false});
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