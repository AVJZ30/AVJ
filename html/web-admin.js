(() => {
 const form=document.getElementById('avj-website-form');
 if(!form)return;
 const status=document.getElementById('web-admin-status'),list=document.getElementById('web-admin-list');
 const safe=(s)=>{try{let u=new URL(String(s||''));return u.protocol==='https:'?u.href:''}catch{return ''}};
 const urlField=document.getElementById('web-url'),preview=document.getElementById('web-logo-preview'),logoInfo=document.getElementById('web-logo-info');
 let detectedIcon=null,probeToken=0,probeTimeout;
 const iconCandidates=(url)=>{
  const origin=new URL(url).origin,domain=new URL(url).hostname;
  return [origin+'/favicon.svg',origin+'/favicon-32x32.png',origin+'/apple-touch-icon.png',origin+'/favicon.png',origin+'/favicon.ico',origin+'/android-chrome-192x192.png','https://www.google.com/s2/favicons?domain='+encodeURIComponent(domain)+'&sz=128','https://icons.duckduckgo.com/ip3/'+encodeURIComponent(domain)+'.ico'];
 };
 function probeImage(src){
  return new Promise(resolve=>{
   const image=new Image();
   const done=(ok)=>{clearTimeout(timeout);image.onload=null;image.onerror=null;resolve(ok)};
   const timeout=setTimeout(()=>done(false),2500);
   image.onload=()=>done(image.naturalWidth>0&&image.naturalHeight>0);
   image.onerror=()=>done(false);
   image.src=src;
  });
 }
 async function updateLogo(){
  if(logoFile.files?.length||safe(logoURL.value))return safe(logoURL.value)||null;
  const token=++probeToken,u=safe(urlField.value);detectedIcon=null;
  if(!u){preview.src='/favicon-32x32.png';logoInfo.textContent='Pega el enlace y detectaremos su icono.';return null}
  logoInfo.textContent='Buscando favicon del sitio...';preview.src='/favicon-32x32.png';
  for(const candidate of iconCandidates(u)){
   if(await probeImage(candidate)){
    if(token!==probeToken)return null;
    detectedIcon=candidate;preview.src=candidate;logoInfo.textContent=candidate.includes('google.com')||candidate.includes('duckduckgo.com')?'Icono detectado mediante servicio de favicons.':'Favicon encontrado en la página original.';
    return candidate;
   }
   if(token!==probeToken)return null;
  }
  logoInfo.textContent='No se detectó favicon; se usará un icono con las iniciales del proyecto.';
  return null;
 }
 urlField.addEventListener('change',()=>{clearTimeout(probeTimeout);updateLogo()});
 urlField.addEventListener('input',()=>{clearTimeout(probeTimeout);probeTimeout=setTimeout(updateLogo,450)});
 const logoFile=document.getElementById('web-logo-file'),logoURL=document.getElementById('web-logo-url'),bgColor=document.getElementById('web-bg-color'),bgHex=document.getElementById('web-bg-hex'),bgPreview=document.getElementById('web-bg-preview');
 let localPreview=null;
 function clearPreview(){if(localPreview){URL.revokeObjectURL(localPreview);localPreview=null}}
 function setColor(value){if(!/^#[0-9a-fA-F]{6}$/.test(value))return;const hex=value.toUpperCase();bgColor.value=hex;bgHex.value=hex;bgPreview.style.setProperty('--preview-color',hex)}
 bgColor.addEventListener('input',()=>setColor(bgColor.value));
 bgHex.addEventListener('input',()=>setColor(bgHex.value));
 logoFile.addEventListener('change',()=>{
  clearPreview();
  const file=logoFile.files?.[0];
  if(file){logoURL.value='';localPreview=URL.createObjectURL(file);preview.src=localPreview;logoInfo.textContent='Logo elegido: '+file.name}
  else updateLogo();
 });
 logoURL.addEventListener('input',()=>{
  clearPreview();logoFile.value='';
  const chosen=safe(logoURL.value);
  if(chosen){preview.src=chosen;logoInfo.textContent='Se usará tu logo personalizado.'}
  else updateLogo();
 });
 document.getElementById('web-logo-clear').addEventListener('click',()=>{
  logoFile.value='';logoURL.value='';clearPreview();updateLogo();
 });
 async function uploadLogo(file){
  if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw Error('Usa una imagen PNG, JPG, WEBP o GIF.');
  if(file.size>3145728)throw Error('El logo debe pesar 3 MB o menos.');
  const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'}[file.type];
  const destination='logos/'+crypto.randomUUID()+'.'+ext;
  const {error}=await client().storage.from('avj-portfolio-logos').upload(destination,file,{contentType:file.type,cacheControl:'3600',upsert:false});
  if(error)throw Error('No se pudo subir el logo: '+error.message);
  return client().storage.from('avj-portfolio-logos').getPublicUrl(destination).data.publicUrl;
 }
 const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,55)||'sitio';
 const socialFields={instagram_url:'web-instagram',tiktok_url:'web-tiktok',facebook_url:'web-facebook',whatsapp_url:'web-whatsapp'};
 function socialValue(field){
  const raw=document.getElementById(socialFields[field]).value.trim();
  if(!raw)return null;
  if(field==='whatsapp_url'){
   if(/^\+?[0-9\s()-]{9,22}$/.test(raw)){const phone=raw.replace(/[^0-9]/g,'');return 'https://wa.me/'+phone}
   const link=safe(raw);
   if(link&&['wa.me','api.whatsapp.com','www.whatsapp.com','whatsapp.com'].includes(new URL(link).hostname))return link;
   throw Error('WhatsApp debe ser un número con código de país (ej. 593...) o un enlace de WhatsApp.');
  }
  const link=safe(raw);
  const domains={instagram_url:['instagram.com','www.instagram.com'],tiktok_url:['tiktok.com','www.tiktok.com','vm.tiktok.com'],facebook_url:['facebook.com','www.facebook.com','m.facebook.com','fb.com','www.fb.com']};
  if(!link||!domains[field].includes(new URL(link).hostname))throw Error('Revisa el enlace de '+field.replace('_url','')+'; debe ser de la red social indicada y usar HTTPS.');
  return link;
 }
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
    edit.onclick=()=>{document.getElementById('web-title').value=p.titulo;document.getElementById('web-url').value=p.url;document.getElementById('web-category').value=p.categoria;clearPreview();logoFile.value='';logoURL.value=p.favicon_url||'';if(safe(logoURL.value)){preview.src=logoURL.value;logoInfo.textContent='Logo actual del proyecto.'}else updateLogo();setColor(p.color_fondo||'#7B2CBF');document.getElementById('web-description').value=p.descripcion||'';for(const [key,id] of Object.entries(socialFields))document.getElementById(id).value=p[key]||'';document.getElementById('web-published').checked=p.publicado;form.dataset.editId=p.id;form.querySelector('[type=submit]').textContent='Guardar cambios';form.scrollIntoView({behavior:'smooth',block:'center'})};
    const del=document.createElement('button');del.type='button';del.className='text-red-300 underline';del.textContent='Eliminar';
    del.onclick=async()=>{if(!confirm('¿Eliminar definitivamente '+p.titulo+' del portafolio?'))return;try{const {error}=await client().from('avj_websites').delete().eq('id',p.id);if(error)throw error;status.textContent='Proyecto eliminado. La página SEO se quitará después de la siguiente publicación.';await load();window.dispatchEvent(new Event('avj:websites-updated'))}catch(e){status.textContent=e.message}};
    buttons.append(visit,edit,del);wrap.append(info,buttons);list.append(wrap);
   }
  }catch(err){status.textContent='Error al cargar portafolio: '+err.message}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const url=safe(urlField.value);
  if(!url){status.textContent='Introduce un enlace HTTPS válido.';return}
  if(bgHex.value&&!/^#[0-9a-fA-F]{6}$/.test(bgHex.value)){status.textContent='Elige un color hexadecimal válido.';return}
  const file=logoFile.files?.[0],manualUrl=logoURL.value.trim();
  if(manualUrl&&!safe(manualUrl)){status.textContent='El enlace del logo debe empezar por HTTPS.';return}
  let socials;
  try{socials=Object.fromEntries(Object.keys(socialFields).map(key=>[key,socialValue(key)]))}
  catch(e){status.textContent=e.message;return}
  const entry={titulo:document.getElementById('web-title').value.trim(),url,descripcion:document.getElementById('web-description').value.trim(),categoria:document.getElementById('web-category').value,publicado:document.getElementById('web-published').checked,color_fondo:bgColor.value.toUpperCase(),...socials};
  const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Guardando proyecto y logo...';
  try{
   const refreshed=await client().auth.refreshSession();
   if(refreshed.error)throw refreshed.error;
   if(refreshed.data.session?.user?.app_metadata?.role!=='admin')throw Error('Inicia sesión como administrador para guardar.');
   entry.favicon_url=file?await uploadLogo(file):safe(manualUrl)||await updateLogo();
   const query=form.dataset.editId?client().from('avj_websites').update(entry).eq('id',form.dataset.editId):client().from('avj_websites').insert(entry);
   const {error}=await query;
   if(error)throw error;
   clearPreview();form.reset();setColor('#7B2CBF');delete form.dataset.editId;button.textContent='Guardar sitio web';updateLogo();
   status.textContent='¡Proyecto guardado! Su logo y color aparecerán en el portafolio público.';
   await load();window.dispatchEvent(new Event('avj:websites-updated'));
  }catch(error){status.textContent='No se pudo guardar: '+error.message}
  finally{button.disabled=false}
 });
 window.avjWebAdmin={load};
})();