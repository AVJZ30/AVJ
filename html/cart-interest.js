/* Métrica pública de interés: cuenta adiciones al carrito, NO ventas confirmadas. */
(function(){
'use strict';
const year=new Date().getFullYear();
const db='https://yxurpqmsvqovtbkjxsjx.supabase.co';
const key='sb_publishable_vmZdZPIW2N2vt8VNz5B3Gw__ThzbuD7';
const headers={'apikey':key,'Authorization':'Bearer '+key};
let counts={};

// Reordena solo los nodos visibles: respeta el filtro y evita recargar el catálogo.
// Se ordena por adiciones registradas en el año, NO por compras confirmadas.
function rankVisible(id){
 const root=document.getElementById(id);
 if(!root||root.children.length<2)return;
 const cards=[...root.children].map((node,index)=>({
   node,index,productId:node.querySelector('.avj-cart-interest[data-product-id]')?.dataset.productId
 }));
 if(cards.some(card=>!card.productId))return;
 cards.sort((a,b)=>(counts[b.productId]||0)-(counts[a.productId]||0)||a.index-b.index);
 for(let i=0;i<cards.length;i++){
   if(root.children[i]!==cards[i].node)root.insertBefore(cards[i].node,root.children[i]);
 }
}
function draw(){
 document.querySelectorAll('.avj-cart-interest').forEach(el=>{
  const id=el.dataset.productId;
  const count=counts[id]??0;
  const lang=window.avjSiteLocale?.language||'es';
  const labels={es:'Agregado al carrito este año:',en:'Added to cart this year:',pt:'Adicionado ao carrinho este ano:',fr:'Ajouté au panier cette année :',de:'Dieses Jahr zum Warenkorb hinzugefügt:',it:"Aggiunto al carrello quest'anno:",ja:'今年カートに追加された回数:',ko:'올해 장바구니 추가 횟수:','zh-CN':'今年加入购物车次数:',nl:'Dit jaar toegevoegd aan winkelwagen:',tr:'Bu yıl sepete eklenme:'};
  const content=(labels[lang]||labels.en)+' '+new Intl.NumberFormat(lang==='es'?'es-EC':'en-US').format(count);
  if(el.textContent!==content)el.textContent=content;
 });
 rankVisible('product-grid');
 rankVisible('featured-products');
}
async function load(){
 try{
  const r=await fetch(db+'/rest/v1/product_cart_counts?select=product_id,adds&year=eq.'+year,{headers,cache:'no-store'});
  if(!r.ok)throw new Error('counts '+r.status);
  counts=Object.fromEntries((await r.json()).map(x=>[x.product_id,Number(x.adds)||0]));draw();
 }catch(e){console.warn('No se pudo recuperar la métrica pública.',e)}
}
async function record(id){
 try{
  const r=await fetch(db+'/rest/v1/rpc/record_product_cart_add',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({p_product_id:id})});
  if(!r.ok)throw new Error('record '+r.status);
  const n=await r.json();if(Number.isFinite(Number(n)))counts[id]=Number(n);draw();
 }catch(e){console.warn('El contador no está disponible.',e)}
}
function patch(){
 if(typeof window.addToCart!=='function'||window.addToCart.__interestPatched)return;
 const orig=window.addToCart;
 function wrapped(id){
  const before=typeof cart!=='undefined'&&Array.isArray(cart)?cart.find(x=>x.id===id)?.quantity||0:0;
  const result=orig(id);
  const after=typeof cart!=='undefined'&&Array.isArray(cart)?cart.find(x=>x.id===id)?.quantity||0:before;
  if(after>before)record(id);
  return result;
 }
 wrapped.__interestPatched=true;
 window.addToCart=wrapped;
}
function init(){
 patch();load();window.addEventListener('avj:region',draw);
 for(const id of ['product-grid','featured-products']){
  const node=document.getElementById(id);
  if(node)new MutationObserver(draw).observe(node,{childList:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();