/* AVJ COMUNITY - traducción gratuita. No recopila ni transmite textos del catálogo.
   El diccionario funciona en todos los navegadores. El traductor local opcional
   requiere un navegador de escritorio con Translator API y modelos descargados. */
(function(){
'use strict';
const dictionary=window.AVJ_WEB_LANGUAGES||Object.create(null);
const supported=['en','pt','fr','de','it','ja','nl','ko','tr','zh-CN'];
let lang='es',model=null,modelLang='',modelChecked='',modelAvailable=false;
let timer=0,busy=false;
const queue=new Set(),attrs=new Set(),originals=new WeakMap(),applied=new WeakMap(),cache=new Map();
const skip='script,style,noscript,svg,canvas,code,pre,select,option,textarea,[translate="no"],.notranslate,.skiptranslate,[contenteditable="true"],#admin-secret-panel,#avj-paypal,#avj-region,#avj-translator,.gtranslate_wrapper';
const skipParts=/^(?:https?:|www\.|[\d\s+().,/\-$€£¥:]+$)/i;
function translateKnown(value){
 const entry=dictionary[value];
 if(entry&&entry[lang])return entry[lang];
 // Consistent stock label even if cards re-render after Supabase queries.
 const match=/^Disponibles:\s*(\d+)\s*cuentas?$/i.exec(value);
 if(match){
   const formats={en:'Available: {n} accounts',pt:'Disponíveis: {n} contas',fr:'Disponibles : {n} comptes',de:'Verfügbar: {n} Konten',it:'Disponibili: {n} account'};
   return (formats[lang]||'').replace('{n}',match[1])||null;
 }
 return null;
}
function allow(value){
 const s=String(value||'').trim();
 return s.length>=2&&s.length<=2500&&/[a-záéíóúñü]/i.test(s)&&
 !skipParts.test(s)&&!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(s);
}
function isVisibleNode(node){return node?.parentElement&&!node.parentElement.closest(skip)}
function append(node){
 if(node.nodeType===Node.TEXT_NODE){
   if(isVisibleNode(node)&&allow(node.nodeValue))queue.add(node);
   return;
 }
 if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE)return;
 if(node.nodeType===Node.ELEMENT_NODE&&node.matches(skip))return;
 const root=node.nodeType===Node.DOCUMENT_NODE?node.body:node;
 if(!root)return;
 if(root.matches?.('input[placeholder]'))attrs.add(root);
 root.querySelectorAll?.('input[placeholder]').forEach(el=>{if(!el.closest(skip))attrs.add(el)});
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let n;while((n=walk.nextNode()))if(isVisibleNode(n)&&allow(n.nodeValue))queue.add(n);
}
function schedule(){if(lang==='es'||timer||busy)return;timer=setTimeout(()=>{timer=0;flush()},180)}
async function localModel(target){
 if(modelLang===target)return model;
 if(modelChecked===target&&!modelAvailable)return null;
 modelChecked=target;modelAvailable=false;model=null;modelLang=target;
 if(!supported.includes(target)||typeof Translator==='undefined')return null;
 try{
   const options={sourceLanguage:'es',targetLanguage:target};
   const status=await Translator.availability(options);
   // No automatic language-pack downloads: may require a user gesture.
   if(status!=='available')return null;
   model=await Translator.create(options);modelAvailable=true;return model;
 }catch(e){console.info('AVJ local translation not supported',e);return null}
}
function remember(value,target,translation){
 const key=target+'|'+value;cache.set(key,translation);
 // Keep modest browser cache; never modify product descriptions in Supabase.
 try{
   if(value.length<300&&translation.length<400)localStorage.setItem('avj_t_'+key,translation);
 }catch(e){}
}
function getCached(value,target){
 const key=target+'|'+value;
 if(cache.has(key))return cache.get(key);
 try{const saved=localStorage.getItem('avj_t_'+key);if(saved){cache.set(key,saved);return saved}}catch(e){}
 return null;
}
async function renderText(node,target,translator){
 if(!node.isConnected||!isVisibleNode(node))return;
 if(!originals.has(node))originals.set(node,node.nodeValue);
 const original=originals.get(node),value=original.trim();
 if(!allow(value))return;
 const exact=translateKnown(value);
 let translated=exact||getCached(value,target);
 if(!translated&&translator){
   try{translated=await translator.translate(value);if(translated)remember(value,target,translated)}catch(e){}
 }
 if(target!==lang||!translated||!node.isConnected)return;
 if(applied.get(node)===target&&node.nodeValue.includes(translated))return;
 // Respect changes produced by the site's own renderers.
 const current=node.nodeValue;
 if(current!==original&&applied.get(node)!==target)return;
 node.nodeValue=original.replace(value,translated);applied.set(node,target);
}
async function flush(){
 if(busy||lang==='es')return;
 busy=true;
 const target=lang,nodes=[...queue];queue.clear();
 const placeholders=[...attrs];attrs.clear();
 const translator=await localModel(target);
 for(const node of nodes){if(lang!==target)break;await renderText(node,target,translator)}
 for(const input of placeholders){
   if(!input.isConnected||input.closest(skip)||lang!==target)continue;
   if(!input.dataset.avjOriginalPlaceholder)input.dataset.avjOriginalPlaceholder=input.placeholder;
   const original=input.dataset.avjOriginalPlaceholder;
   const known=translateKnown(original);
   let value=known||getCached(original,target);
   if(!value&&translator&&allow(original))try{value=await translator.translate(original);remember(original,target,value)}catch(e){}
   if(value)input.placeholder=value;
 }
 busy=false;
 if(queue.size||attrs.size)schedule();
}
function rescan(){append(document.body);schedule()}
function setLanguage(next){
 lang=next||'es';
 document.documentElement.lang=lang;
 modelChecked='';modelAvailable=false;model=null;modelLang='';
 if(lang==='es'){queue.clear();attrs.clear();return}
 rescan();
}
const observer=new MutationObserver(records=>{
 if(lang==='es')return;
 for(const r of records){
   if(r.type==='childList'){for(const node of r.addedNodes)append(node)}
   else if(r.type==='characterData'){
     const node=r.target;
     if(originals.has(node)&&applied.has(node)&&node.nodeValue!==originals.get(node)){
       // The site replaced translated text: treat that new text as source.
       const last=originals.get(node);
       if(node.nodeValue!==last&&node.nodeValue!==undefined&&
          !node.nodeValue.includes(translateKnown(last.trim())||'\u0000')){
         originals.set(node,node.nodeValue);applied.delete(node);
       }
     }
     append(node);
   }
 }
 schedule();
});
function init(){
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 setLanguage(window.avjSiteLocale?.language||document.documentElement.lang.split('-')[0]||'es');
 window.addEventListener('avj:region',e=>setLanguage(e.detail.language));
}
window.avjTranslate={setLanguage,rescan};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();