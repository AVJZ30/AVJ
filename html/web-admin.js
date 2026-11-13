(() => {
 const form=document.getElementById('avj-website-form');
 if(!form)return;
 const status=document.getElementById('web-admin-status'),list=document.getElementById('web-admin-list');
 const safe=(s)=>{try{let u=new URL(String(s||''));return u.protocol==='https:'?u.href:''}catch{return ''}};
 const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'sitio';
 let items=[];
 function client(){if(typeof supabaseClient==='undefined'||!supabaseClient)throw Error('Primero inicia sesión como administrador.');return supabaseClient}
 async function load(){
  try{
   const {data,error}=await client().from('avj_websites').select('*').order('created_at',{ascending:false});
   if(error)throw error;items=data||[];
   list.replaceChildren();
   if(!items.length){list.textContent='Todavía no hay sitios web registrados.';return}
   for(const p of items){
    const wrap=document.createElement('div');wrap.className='border border-purple-400 p-3 bg-black flex flex-wrap gap-2 justify-between items-center';
    const info=document.createElement('span');info.textContent=p.titulo+' · '+p.categoria+(p.publicado?' · Público':' · Oculto');info.style.overflowWrap='anywhere';
    const buttons=document.createElement('div');buttons.className='flex flex-wrap gap-2';
    const visit=document.createElement('a');visit.href=p.url;visit.target='_blank';visit.rel='noopener noreferrer';visit.textContent='Visitar';visit.className='text-purple-200 underline';
    const edit=document.createElement('button');edit.type='button';edit.className='text-purple-200 underline';edit.textContent='Editar';
    edit.onclick=()=>{document.getElementById('web-title').value=p.titulo;document.getElementById('web-url').value=p.url;document.getElementById('web-category').value=p.categoria;document.getElementById('web-favicon').value=p.favicon_url||'';document.getElementById('web-description').value=p.descripcion||'';document.getElementById('web-published').checked=p.publicado;form.dataset.editId=p.id;form.querySelector('[type=submit]').textContent='Guardar cambios';form.scrollIntoView({behavior:'smooth',block:'center'})};
    const del=document.createElement('button');del.type='button';del.className='text-red-300 underline';del.textContent='Eliminar';
    del.onclick=async()=>{if(!confirm('¿Eliminar definitivamente '+p.titulo+' del portafolio?'))return;try{const {error}=await client().from('avj_websites').delete().eq('id',p.id);if(error)throw error;status.textContent='Proyecto eliminado. La página SEO se quitará después de la siguiente publicación.';await load()}catch(e){status.textContent=e.message}};
    buttons.append(visit,edit,del);wrap.append(info,buttons);list.append(wrap);
   }
  }catch(err){status.textContent='Error al cargar portafolio: '+err.message}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const url=safe(document.getElementById('web-url').value),icon=document.getElementById('web-favicon').value.trim();
  if(!url||(icon&&!safe(icon))){status.textContent='Introduce enlaces HTTPS válidos.';return}
  const entry={titulo:document.getElementById('web-title').value.trim(),url,descripcion:document.getElementById('web-description').value.trim(),categoria:document.getElementById('web-category').value,favicon_url:icon?safe(icon):null,publicado:document.getElementById('web-published').checked};
  const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Guardando...';
  try{
   let query=form.dataset.editId?client().from('avj_websites').update(entry).eq('id',form.dataset.editId):client().from('avj_websites').insert(entry);
   const {error}=await query;if(error)throw error;
   form.reset();delete form.dataset.editId;button.textContent='Guardar sitio web';
   status.textContent='Proyecto guardado. El portafolio público ya puede mostrarlo; el HTML de Google se actualiza en el siguiente despliegue.';
   await load();
  }catch(e){status.textContent='No se pudo guardar: '+e.message}
  finally{button.disabled=false}
 });
 window.avjWebAdmin={load};
})();