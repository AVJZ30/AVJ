(() => {
 const form=document.getElementById('avj-website-form');
 if(!form)return;
 const status=document.getElementById('web-admin-status'),list=document.getElementById('web-admin-list');
 const safe=(s)=>{try{let u=new URL(String(s||''));return u.protocol==='https:'?u.href:''}catch{return ''}};
 const logoFromUrl=(url)=>{const host=new URL(url).hostname;return 'https://www.google.com/s2/favicons?domain='+encodeURIComponent(host)+'&sz=128'};
 const urlField=document.getElementById('web-url'),preview=document.getElementById('web-logo-preview'),logoInfo=document.getElementById('web-logo-info');
 function updateLogo(){const u=safe(urlField.value);if(!u){preview.src='/favicon-32x32.png';logoInfo.textContent='Pega el enlace y detectaremos su icono.';return}preview.src=logoFromUrl(u);logoInfo.textContent='Icono obtenido automáticamente del dominio.';}
 urlField.addEventListener('change',updateLogo);urlField.addEventListener('input',updateLogo);
 const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'sitio';
 let items=[];
 const overlay=document.getElementById('web-admin-overlay'),openButton=document.getElementById('web-admin-open'),closeButton=document.getElementById('web-admin-close');
 const auth=document.getElementById('web-admin-auth'),editor=document.getElementById('web-admin-editor'),authMessage=document.getElementById('web-admin-auth-message'),login=document.getElementById('web-admin-login-form');
 const api=(typeof supabase!=='undefined')?supabase.createClient('https://yxurpqmsvqovtbkjxsjx.supabase.co','sb_publishable_vmZdZPIW2N2vt8VNz5B3Gw__ThzbuD7'):null;
 function client(){if(!api)throw Error('La conexión al catálogo no está disponible.');return api}
 async function showSession(){
  let {data:{session},error}=await client().auth.getSession();
  if(error)throw error;
  // Actualizar el JWT: los permisos del administrador pueden haber cambiado desde el último inicio.
  if(session){
   const refresh=await client().auth.refreshSession();
   if(refresh.error)throw refresh.error;
   session=refresh.data.session;
  }
  const permitted=!!session&&session.user?.app_metadata?.role==='admin';
  auth.hidden=!!permitted;editor.hidden=!permitted;
  if(permitted)await load();
  else if(session){authMessage.textContent='Esta cuenta no está autorizada para administrar el portafolio.'}
  return permitted;
 }
 openButton?.addEventListener('click',async()=>{
  overlay.hidden=false;document.body.style.overflow='hidden';authMessage.textContent='';
  try{await showSession()}catch(e){authMessage.textContent='No se pudo verificar la sesión: '+e.message}
 });
 function close(){overlay.hidden=true;document.body.style.overflow='';openButton?.focus()}
 closeButton?.addEventListener('click',close);
 overlay?.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
 login?.addEventListener('submit',async e=>{
  e.preventDefault();authMessage.textContent='Verificando acceso...';
  const button=login.querySelector('[type="submit"]');button.disabled=true;
  try{
   const {error}=await client().auth.signInWithPassword({email:document.getElementById('web-admin-email').value.trim(),password:document.getElementById('web-admin-password').value});
   if(error)throw error;
   await client().auth.refreshSession();
   if(await showSession()){authMessage.textContent='Sesión administrativa iniciada.';document.getElementById('web-admin-password').value=''}
  }catch(err){authMessage.textContent='No se pudo iniciar sesión: '+err.message}
  finally{button.disabled=false}
 });
 document.getElementById('web-admin-logout')?.addEventListener('click',async()=>{
  await client().auth.signOut();editor.hidden=true;auth.hidden=false;authMessage.textContent='Sesión cerrada.';
 });
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
    edit.onclick=()=>{document.getElementById('web-title').value=p.titulo;document.getElementById('web-url').value=p.url;document.getElementById('web-category').value=p.categoria;updateLogo();document.getElementById('web-description').value=p.descripcion||'';document.getElementById('web-published').checked=p.publicado;form.dataset.editId=p.id;form.querySelector('[type=submit]').textContent='Guardar cambios';form.scrollIntoView({behavior:'smooth',block:'center'})};
    const del=document.createElement('button');del.type='button';del.className='text-red-300 underline';del.textContent='Eliminar';
    del.onclick=async()=>{if(!confirm('¿Eliminar definitivamente '+p.titulo+' del portafolio?'))return;try{const {error}=await client().from('avj_websites').delete().eq('id',p.id);if(error)throw error;status.textContent='Proyecto eliminado. La página SEO se quitará después de la siguiente publicación.';await load()}catch(e){status.textContent=e.message}};
    buttons.append(visit,edit,del);wrap.append(info,buttons);list.append(wrap);
   }
  }catch(err){status.textContent='Error al cargar portafolio: '+err.message}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const url=safe(document.getElementById('web-url').value);
  if(!url){status.textContent='Introduce un enlace HTTPS válido.';return}
  const entry={titulo:document.getElementById('web-title').value.trim(),url,descripcion:document.getElementById('web-description').value.trim(),categoria:document.getElementById('web-category').value,favicon_url:logoFromUrl(url),publicado:document.getElementById('web-published').checked};
  const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Guardando...';
  try{
   const refreshed=await client().auth.refreshSession();
   if(refreshed.error)throw refreshed.error;
   if(refreshed.data.session?.user?.app_metadata?.role!=='admin')throw Error('La cuenta debe iniciar sesión como administradora para guardar.');
   let query=form.dataset.editId?client().from('avj_websites').update(entry).eq('id',form.dataset.editId):client().from('avj_websites').insert(entry);
   const {error}=await query;if(error)throw error;
   form.reset();updateLogo();delete form.dataset.editId;button.textContent='Guardar sitio web';
   status.textContent='Proyecto guardado. El portafolio público ya puede mostrarlo; el HTML de Google se actualiza en el siguiente despliegue.';
   await load();
  }catch(e){status.textContent='No se pudo guardar: '+e.message}
  finally{button.disabled=false}
 });
 window.avjWebAdmin={load};
})();