(() => {
 const URL='https://yxurpqmsvqovtbkjxsjx.supabase.co',KEY='sb_publishable_vmZdZPIW2N2vt8VNz5B3Gw__ThzbuD7';
 const grid=document.getElementById('web-project-grid');
 if(!grid)return;
 const txt=(value)=>String(value??'');
 const safe=(value)=>{try{const u=new URL(txt(value));return u.protocol==='https:'?u.href:''}catch{return ''}};
 const favicon=(p)=>safe(p.favicon_url)||('https://www.google.com/s2/favicons?domain='+encodeURIComponent(new URL(p.url).hostname)+'&sz=128');
 const slug=s=>txt(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'sitio';
 function add(p){
  const url=safe(p.url);if(!url)return;
  const card=document.createElement('article');card.className='project';
  const top=document.createElement('div');top.className='project-top';
  const img=document.createElement('img');img.loading='lazy';img.width=51;img.height=51;img.alt='Icono de '+txt(p.titulo);img.referrerPolicy='no-referrer';img.src=favicon(p);img.onerror=()=>img.style.visibility='hidden';
  const heading=document.createElement('h3');heading.textContent=txt(p.titulo);
  top.append(img,heading);
  const type=document.createElement('span');type.className='category';type.textContent=txt(p.categoria||'Proyecto');
  const desc=document.createElement('p');desc.textContent=txt(p.descripcion||'Sitio web desarrollado por AVJ COMUNITY.');
  const detail=document.createElement('a');detail.href='/sitios-web/proyectos/'+slug(p.titulo)+'-'+slug(p.id)+'/';detail.textContent='Conocer el proyecto';
  const external=document.createElement('a');external.href=url;external.target='_blank';external.rel='noopener noreferrer';external.textContent='Visitar página web ↗';external.style.marginTop='9px';
  card.append(top,type,desc,detail,external);grid.append(card);
 }
 async function load(){
  try{
   if(typeof supabase==='undefined')throw Error('No se pudo cargar el servicio');
   const client=supabase.createClient(URL,KEY);
   const {data,error}=await client.from('avj_websites').select('id,titulo,url,descripcion,categoria,favicon_url').eq('publicado',true).order('created_at',{ascending:false});
   if(error)throw error;grid.replaceChildren();
   if(!data?.length){const e=document.createElement('div');e.className='empty';e.textContent='Próximamente publicaremos nuestros proyectos aquí.';grid.append(e);}
   else data.forEach(add);
  }catch(err){grid.textContent='No se pudieron cargar los proyectos en este momento.';console.error(err)}
 }
 load();
})();