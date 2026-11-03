/* AVJ: shared country/language across the public website. */
(function(){
'use strict';
const map={EC:['es','USD'],US:['en','USD'],ES:['es','EUR'],MX:['es','MXN'],CO:['es','COP'],PE:['es','PEN'],CL:['es','CLP'],AR:['es','ARS'],BR:['pt','BRL'],GB:['en','GBP'],FR:['fr','EUR'],DE:['de','EUR'],IT:['it','EUR'],PT:['pt','EUR'],CA:['en','CAD'],DO:['es','DOP'],UY:['es','UYU'],PY:['es','PYG'],BO:['es','BOB'],VE:['es','VES'],CR:['es','CRC'],PA:['es','USD'],GT:['es','GTQ'],HN:['es','HNL'],SV:['es','USD'],NI:['es','NIO'],AU:['en','AUD'],JP:['ja','JPY'],CH:['de','CHF'],NL:['nl','EUR'],BE:['fr','EUR'],IN:['en','INR'],ZA:['en','ZAR'],CN:['zh-CN','CNY'],KR:['ko','KRW'],TR:['tr','TRY']};
const langList=[...new Set(['es',...Object.values(map).map(v=>v[0])])];
let current='EC',ready=false;
function read(key){try{return localStorage.getItem(key)}catch{return null}}
function save(key,val){try{if(val===null)localStorage.removeItem(key);else localStorage.setItem(key,val)}catch{}}
function cookie(lang){const val=lang==='es'?'/es/es':'/es/'+lang;document.cookie='googtrans='+encodeURIComponent(val)+';path=/;SameSite=Lax';}
function invokeTranslation(lang){
  if(lang==='es'){cookie(lang);return;}
  cookie(lang);
  // The vendor widget is optional and can be blocked by browser privacy protections.
  if(window.__avjGtranslateLoaded)return;
  window.__avjGtranslateLoaded=true;
  window.gtranslateSettings={default_language:'es',languages:langList,wrapper_selector:'#avj-translator',native_language_names:true,detect_browser_language:false,flag_size:16};
  const widget=document.createElement('div');widget.id='avj-translator';widget.style.cssText='font:10px system-ui;margin:8px 0;max-width:220px;';
  const footer=document.querySelector('footer');(footer||document.body).appendChild(widget);
  const src=document.createElement('script');src.src='https://cdn.gtranslate.net/widgets/latest/dropdown.js';src.async=true;src.referrerPolicy='no-referrer';
  src.onerror=()=>console.warn('AVJ: online translation is unavailable; original page will remain visible');
  document.body.appendChild(src);
}
async function geolocate(){
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),4500);try{const r=await fetch('/api/avj-location',{cache:'no-store',signal:controller.signal});if(r.ok){const j=await r.json();if(map[j.country])return j.country;}}finally{clearTimeout(timeout)}}catch{}
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),4500);try{const r=await fetch('https://ipwho.is/',{signal:controller.signal});if(r.ok){const j=await r.json();if(map[j.country_code])return j.country_code;}}finally{clearTimeout(timeout)}}catch{}
 return 'EC';
}
function apply(code,manual){
 const next=map[code]?code:'EC';const before=current;current=next;const lang=map[next][0];
 save('avj_region',next);
 if(manual)save('avj_region_manual',next);
 document.documentElement.lang=lang;
 window.dispatchEvent(new CustomEvent('avj:region',{detail:{country:next,language:lang,currency:map[next][1],manual:!!manual}}));
 if(!ready){ready=true;invokeTranslation(lang);return;}
 if(before!==next){cookie(lang);if(lang!=='es'&&!window.__avjGtranslateLoaded)invokeTranslation(lang);
   // Reopen the page to translate all static and dynamically generated sections consistently.
   window.location.reload();
 }
}
async function initialize(){
 const manual=read('avj_region_manual');
 if(manual&&map[manual]){apply(manual,false);return;}
 const detected=await geolocate();apply(detected,false);
}
window.avjSiteLocale={get country(){return current},get language(){return map[current][0]},setCountry(code){apply(code,true)},clearOverride(){save('avj_region_manual',null);return initialize()},ready:()=>ready,refresh:initialize};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();