/* AVJ: shared country/language across the public website. */
(function(){
'use strict';
const map={EC:['es','USD'],US:['en','USD'],ES:['es','EUR'],MX:['es','MXN'],CO:['es','COP'],PE:['es','PEN'],CL:['es','CLP'],AR:['es','ARS'],BR:['pt','BRL'],GB:['en','GBP'],FR:['fr','EUR'],DE:['de','EUR'],IT:['it','EUR'],PT:['pt','EUR'],CA:['en','CAD'],DO:['es','DOP'],UY:['es','UYU'],PY:['es','PYG'],BO:['es','BOB'],VE:['es','VES'],CR:['es','CRC'],PA:['es','USD'],GT:['es','GTQ'],HN:['es','HNL'],SV:['es','USD'],NI:['es','NIO'],AU:['en','AUD'],JP:['ja','JPY'],CH:['de','CHF'],NL:['nl','EUR'],BE:['fr','EUR'],IN:['en','INR'],ZA:['en','ZAR'],CN:['zh-CN','CNY'],KR:['ko','KRW'],TR:['tr','TRY']};
const langList=[...new Set(['es',...Object.values(map).map(v=>v[0])])];
let current='EC',ready=false;
function read(key){try{return localStorage.getItem(key)}catch{return null}}
function save(key,val){try{if(val===null)localStorage.removeItem(key);else localStorage.setItem(key,val)}catch{}}
function cookie(lang){const val=lang==='es'?'/es/es':'/es/'+lang;document.cookie='googtrans='+encodeURIComponent(val)+';path=/;SameSite=Lax';}
const fixedTranslations={
  es:{books:'📚 Libros Gratis',bookTitle:'📚 LIBROS GRATIS',bookDesc:'Cursos · Libros PDF · Packs · Rutinas · Recetas — Click aquí 👉'},
  en:{books:'📚 Free Books',bookTitle:'📚 FREE BOOKS',bookDesc:'Courses · PDF books · Packs · Routines · Recipes — Click here 👉'},
  pt:{books:'📚 Livros Grátis',bookTitle:'📚 LIVROS GRÁTIS',bookDesc:'Cursos · Livros PDF · Pacotes · Rotinas · Receitas — Clique aqui 👉'},
  fr:{books:'📚 Livres Gratuits',bookTitle:'📚 LIVRES GRATUITS',bookDesc:'Cours · Livres PDF · Packs · Programmes · Recettes — Cliquez ici 👉'},
  de:{books:'📚 Kostenlose Bücher',bookTitle:'📚 KOSTENLOSE BÜCHER',bookDesc:'Kurse · PDF-Bücher · Pakete · Routinen · Rezepte — Hier klicken 👉'},
  it:{books:'📚 Libri Gratuiti',bookTitle:'📚 LIBRI GRATUITI',bookDesc:'Corsi · Libri PDF · Pacchetti · Routine · Ricette — Clicca qui 👉'}
};
function applyEssentialLabels(lang){
 const copy=fixedTranslations[lang]||fixedTranslations.en;
 const homeBooks=document.querySelector('a[href="/digital"]');
 if(homeBooks){
   const nodes=homeBooks.querySelectorAll('p');
   if(nodes[0]){nodes[0].textContent=copy.books;nodes[0].classList.add('notranslate');nodes[0].setAttribute('translate','no')}
   if(nodes[1]){nodes[1].textContent=copy.bookDesc;nodes[1].classList.add('notranslate');nodes[1].setAttribute('translate','no')}
 }
 const booksHeading=document.querySelector('h1');
 if(booksHeading&&/LIBROS GRATIS|FREE BOOKS|LIVROS GRÁTIS|LIVRES GRATUITS|KOSTENLOSE BÜCHER|LIBRI GRATUITI/i.test(booksHeading.textContent)){
   booksHeading.textContent=copy.bookTitle;
   booksHeading.classList.add('notranslate');booksHeading.setAttribute('translate','no');
 }
}
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
 // Prefer the IP actually observed by the hosting edge, not a browser-side
 // third-party request that may travel over a different proxy/VPN route.
 try{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
   try{
     const r=await fetch('/api/avj-location',{cache:'no-store',headers:{'Accept':'application/json'},signal:controller.signal});
     if(r.ok){const j=await r.json();if(j.country&&map[j.country])return j.country;}
   }finally{clearTimeout(timeout)}
 }catch(e){console.warn('AVJ: edge location unavailable',e)}
 // A fallback is used only if the hosting platform cannot identify the country.
 try{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4500);
   try{
     const r=await fetch('https://ipwho.is/',{cache:'no-store',signal:controller.signal});
     if(r.ok){const j=await r.json();if(j.success!==false&&map[j.country_code])return j.country_code;}
   }finally{clearTimeout(timeout)}
 }catch(e){}
 // No verified country: prefer last known country instead of inventing Ecuador.
 const previous=read('avj_region');
 return previous&&map[previous]?previous:'EC';
}
function apply(code,manual){
 const next=map[code]?code:'EC';const before=current;current=next;const lang=map[next][0];
 save('avj_region',next);
 if(manual)save('avj_region_manual',next);
 document.documentElement.lang=lang;
 applyEssentialLabels(lang);
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