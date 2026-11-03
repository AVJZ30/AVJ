/* AVJ website translator: translates visible HTML and late Supabase content. */
(function(){
'use strict';
let language='es', active=false, scheduled=0, running=false, warned=false;
const originals=new WeakMap(), cache=new Map(), textQueue=new Set(), attrQueue=new Set();
const skip='script,style,noscript,svg,code,pre,textarea,[translate="no"],.notranslate,.skiptranslate,#avj-translator,.gtranslate_wrapper,[contenteditable="true"],[aria-hidden="true"]';
function safeText(s){
 const v=s.trim();
 return v.length>=2&&v.length<=4000&&/[A-Za-zÀ-ÿ]/.test(v)&&
 !/https?:\/\/|\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b\d{7,}\b/.test(v)&&
 !/^[$€£¥0-9 .,\-+():/#]+$/.test(v);
}
function eligible(node){
 if(!node||!node.parentElement||node.parentElement.closest(skip))return false;
 if(node.parentElement.closest('#admin-secret-panel input, #admin-secret-panel textarea'))return false;
 return safeText(node.nodeValue||'');
}
function htmlDecode(value){
 const e=document.createElement('textarea');e.innerHTML=value;return e.value;
}
function schedule(){
 if(language==='es'||running||scheduled)return;
 scheduled=window.setTimeout(()=>{scheduled=0;flush();},240);
}
function scan(root){
 if(!root||language==='es')return;
 if(root.nodeType===Node.TEXT_NODE){
   if(eligible(root))textQueue.add(root);
   return;
 }
 if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
 if(root.nodeType===Node.ELEMENT_NODE&&root.matches(skip))return;
 if(root.nodeType===Node.ELEMENT_NODE&&root.matches('input[placeholder],textarea[placeholder]'))attrQueue.add(root);
 if(root.querySelectorAll)root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(!el.closest(skip))attrQueue.add(el)});
 const tree=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;while((node=tree.nextNode()))if(eligible(node))textQueue.add(node);
 schedule();
}
async function translateBatch(texts,lang){
 const response=await fetch('/.netlify/functions/translate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({target:lang,texts}),signal:AbortSignal.timeout(22000)});
 if(!response.ok)throw new Error('Translation not configured or unavailable ('+response.status+')');
 const data=await response.json();
 if(!Array.isArray(data.translations)||data.translations.length!==texts.length)throw new Error('Invalid translation batch');
 return data.translations.map(htmlDecode);
}
async function flush(){
 if(running||language==='es')return;
 running=true;
 const lang=language;
 const nodes=[...textQueue].filter(eligible);textQueue.clear();
 const attrs=[...attrQueue].filter(e=>e.isConnected&&!e.closest(skip));attrQueue.clear();
 const targets=[];
 for(const node of nodes){
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const original=originals.get(node),value=original.trim();
   if(!safeText(value))continue;
   targets.push({node,original,value,type:'text'});
 }
 for(const el of attrs){
   const value=el.dataset.avjOriginalPlaceholder||el.getAttribute('placeholder')||'';
   if(!safeText(value))continue;
   if(!el.dataset.avjOriginalPlaceholder)el.dataset.avjOriginalPlaceholder=value;
   targets.push({node:el,original:value,value,type:'placeholder'});
 }
 const unique=[...new Set(targets.map(x=>x.value))].filter(v=>!cache.has(lang+'|'+v));
 try{
   for(let i=0;i<unique.length;i+=30){
     if(language!==lang)break;
     const group=unique.slice(i,i+30);
     const results=await translateBatch(group,lang);
     results.forEach((value,j)=>cache.set(lang+'|'+group[j],value));
   }
   if(language===lang)for(const item of targets){
     if(!item.node.isConnected)continue;
     const translated=cache.get(lang+'|'+item.value);
     if(!translated)continue;
     if(item.type==='text'){
       const before=item.original,trimmed=before.trim();
       if(item.node.nodeValue!==before&&item.node.nodeValue!==before.replace(trimmed,translated))continue;
       item.node.nodeValue=before.replace(trimmed,translated);
     } else item.node.placeholder=translated;
   }
 }catch(err){
   if(!warned){console.warn('AVJ: complete translation requires a configured provider; original content remains available.',err.message);warned=true;}
 }finally{running=false;if(textQueue.size||attrQueue.size)schedule();}
}
const observer=new MutationObserver(records=>{
 if(language==='es')return;
 for(const record of records){
   for(const added of record.addedNodes)scan(added);
   if(record.type==='characterData'){
     const node=record.target;
     const original=originals.get(node);
     if(original===undefined)scan(node);
     else if(node.nodeValue===original)scan(node);
   }
 }
});
function setLanguage(next){
 language=next||'es';
 if(language==='es'){textQueue.clear();attrQueue.clear();return;}
 scan(document.body);
}
function init(){
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 const loc=window.avjSiteLocale;
 setLanguage(loc?.language||document.documentElement.lang.split('-')[0]||'es');
 window.addEventListener('avj:region',e=>setLanguage(e.detail.language));
}
window.avjTranslate={setLanguage,rescan:()=>scan(document.body)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();