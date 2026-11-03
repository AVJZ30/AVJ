/* AVJ COMUNITY: free, local JSON translations (no translation APIs). */
(function(){
'use strict';
const languages=new Set(['en','pt','fr','de','it']);
const folders='/idiomas-de-la-web/';
const dictionaries=new Map(), originalNodes=new WeakMap(), originalAttributes=new WeakMap();
let language='es', observer, scheduleId=0, generation=0;
const skip='script,style,noscript,svg,code,pre,textarea,[translate="no"],.notranslate,.skiptranslate,[contenteditable="true"],#admin-secret-panel';
function contentToTranslate(s){return typeof s==='string'&&s.trim().length>0&&s.trim().length<5000;}
async function load(lang){
 if(!languages.has(lang))return null;
 if(dictionaries.has(lang))return dictionaries.get(lang);
 const response=await fetch(folders+encodeURIComponent(lang)+'.json',{cache:'force-cache'});
 if(!response.ok)throw new Error('Translation file unavailable: '+lang);
 const data=await response.json();
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid translation dictionary');
 dictionaries.set(lang,data);
 return data;
}
function lookup(input,dictionary){
 if(!dictionary||!contentToTranslate(input))return null;
 const trimmed=input.trim(),direct=dictionary[trimmed];
 if(typeof direct==='string')return input.replace(trimmed,direct);
 // Common dynamically populated stock counts and product quantities.
 const stock=trimmed.match(/^Disponibles:\\s*(\\d+)\\s*cuentas?$/i);
 if(stock){
   const word={en:'Available:',pt:'Disponíveis:',fr:'Disponibles :',de:'Verfügbar:',it:'Disponibili:'}[language];
   const unit={en:'accounts',pt:'contas',fr:'comptes',de:'Konten',it:'account'}[language];
   return input.replace(trimmed,(word||'Disponibles:')+' '+stock[1]+' '+(unit||'cuentas'));
 }
 return null;
}
function translateElement(el,dictionary){
 if(el.nodeType!==Node.ELEMENT_NODE||el.closest(skip))return;
 if(el.matches('input[placeholder],textarea[placeholder]')){
   if(!originalAttributes.has(el))originalAttributes.set(el,el.getAttribute('placeholder')||'');
   const original=originalAttributes.get(el),translated=lookup(original,dictionary);
   if(language==='es')el.setAttribute('placeholder',original);
   else if(translated)el.setAttribute('placeholder',translated);
 }
}
function translateTree(root){
 if(!root||!document.body)return;
 const dictionary=dictionaries.get(language);
 if(!dictionary&&language!=='es')return;
 const element=root.nodeType===Node.ELEMENT_NODE?root:root.parentElement;
 if(element&&element.closest(skip))return;
 if(element&&element.nodeType===Node.ELEMENT_NODE)translateElement(element,dictionary);
 if(element?.querySelectorAll)element.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>translateElement(el,dictionary));
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 function translateNode(node){
   if(!node.parentElement||node.parentElement.closest(skip))return;
   if(!originalNodes.has(node))originalNodes.set(node,node.nodeValue);
   const source=originalNodes.get(node);
   const translated=language==='es'?source:lookup(source,dictionary);
   if(translated!==null&&translated!==undefined&&node.nodeValue!==translated)node.nodeValue=translated;
 }
 if(root.nodeType===Node.TEXT_NODE)translateNode(root);
 let node;while((node=walker.nextNode()))translateNode(node);
}
function queueScan(){
 if(scheduleId)return;
 scheduleId=setTimeout(()=>{scheduleId=0;translateTree(document.body)},120);
}
async function setLanguage(next){
 const lang=languages.has(next)?next:'es',token=++generation;
 language=lang;
 if(lang!=='es'){
   try{await load(lang)}catch(e){console.warn('AVJ: local language file unavailable',e.message);return}
 }
 if(token!==generation)return;
 translateTree(document.body);
}
function init(){
 observer=new MutationObserver(changes=>{
   for(const change of changes){
     if(change.type==='childList'&&change.addedNodes.length){queueScan();break}
     if(change.type==='characterData'){
       const node=change.target,old=originalNodes.get(node);
       // A product rerender replaces text nodes; this handles updates to existing nodes.
       if(old!==undefined&&node.nodeValue!==old&&node.nodeValue!==lookup(old,dictionaries.get(language))){
         originalNodes.set(node,node.nodeValue);
         queueScan();break;
       }
     }
   }
 });
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 setLanguage(window.avjSiteLocale?.language||document.documentElement.lang.split('-')[0]||'es');
 window.addEventListener('avj:region',event=>setLanguage(event.detail.language));
}
window.avjTranslate={setLanguage,refresh:queueScan};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();