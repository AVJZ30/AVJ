/* AVJ Store: catálogo por plataforma y moneda automática, sin selector visible de país. */
(function(){
'use strict';
const base='https://yxurpqmsvqovtbkjxsjx.supabase.co',key='sb_publishable_vmZdZPIW2N2vt8VNz5B3Gw__ThzbuD7';
const currencies={EC:'USD',US:'USD',ES:'EUR',MX:'MXN',CO:'COP',PE:'PEN',CL:'CLP',AR:'ARS',BR:'BRL',GB:'GBP',FR:'EUR',DE:'EUR',IT:'EUR',PT:'EUR',CA:'CAD',DO:'DOP',UY:'UYU',PY:'PYG',BO:'BOB',VE:'VES',CR:'CRC',PA:'USD',GT:'GTQ',HN:'HNL',SV:'USD',NI:'NIO',AU:'AUD',JP:'JPY',CH:'CHF',NL:'EUR',BE:'EUR',IN:'INR',ZA:'ZAR',CN:'CNY',KR:'KRW',TR:'TRY'};
const container=document.getElementById('platform-list'),note=document.getElementById('region-note');
if(!container)return;
let items=null,rates=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function selectedCountry(){
 const detected=window.avjSiteLocale?.country;
 if(detected&&currencies[detected])return detected;
 try{const saved=localStorage.getItem('avj_region');if(saved&&currencies[saved])return saved}catch(e){}
 return 'EC';
}
function price(n){
 const v=Number(n)||0,usd='$'+v.toFixed(2)+' USD',cur=currencies[selectedCountry()]||'USD';
 if(cur==='USD'||!rates?.[cur])return usd;
 try{return usd+' ≈ '+new Intl.NumberFormat(window.avjSiteLocale?.language||'es',{style:'currency',currency:cur}).format(v*rates[cur])}catch(e){return usd}
}
function card(p){
 const stock=Number(p.stock)||0;
 const wa='https://wa.me/593963023351?text='+encodeURIComponent('Hola, quisiera consultar '+p.name+', las condiciones y disponibilidad antes de pagar.');
 return '<article class="card"><h3>'+esc(p.name)+'</h3><p class="price">'+price(p.price)+'</p><p>'+esc(p.spec||'Consultar características')+'</p><p class="muted">'+(stock>0?'Disponibilidad publicada: '+stock:'Sin stock confirmado; consulta disponibilidad')+'</p><a class="btn" href="'+wa+'" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></article>';
}
function draw(){
 const cur=currencies[selectedCountry()]||'USD';
 if(note)note.textContent=cur==='USD'
   ?'Precios AVJ en USD. El país se detecta automáticamente. Confirma el precio final antes de pagar.'
   :rates?.[cur]
   ?'Conversión aproximada automática a '+cur+'. No es la tarifa oficial de la plataforma en este país. Confirma el importe final por WhatsApp.'
   :'Precios AVJ en USD. El cambio a '+cur+' se muestra cuando está disponible; confirma el importe final por WhatsApp.';
 if(items===null){
  container.querySelectorAll('[data-usd]').forEach(el=>{el.textContent=price(el.dataset.usd)});
  return;
 }
 container.innerHTML=items.length?items.map(card).join(''):'<p>En este momento no hay una modalidad publicada de esta plataforma. Puedes consultar próximas disponibilidades por WhatsApp.</p>';
 window.avjTranslate?.refresh?.();
}
window.addEventListener('avj:region',draw);
async function start(){
 draw();
 try{
  const result=await fetch(base+'/rest/v1/products?select=name,price,spec,stock&order=name.asc',{headers:{apikey:key,Authorization:'Bearer '+key},cache:'no-store'});
  if(!result.ok)throw new Error('catalog '+result.status);
  const all=await result.json(),brand=(document.body.dataset.brand||'').toUpperCase();
  items=all.filter(p=>String(p.name||'').toUpperCase().includes(brand));draw();
 }catch(e){console.warn('AVJ catalog fallback',e)}
 try{
  const result=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'default'});
  if(result.ok){rates=(await result.json()).rates||null;draw()}
 }catch(e){console.warn('Moneda aproximada no disponible',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();