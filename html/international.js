(function(){
'use strict';
const PAYPAL='luispluajj@gmail.com', WA='593963023351';
const countries={EC:['Ecuador','USD','es'],US:['United States','USD','en'],ES:['España','EUR','es'],MX:['México','MXN','es'],CO:['Colombia','COP','es'],PE:['Perú','PEN','es'],CL:['Chile','CLP','es'],AR:['Argentina','ARS','es'],BR:['Brasil','BRL','pt'],GB:['United Kingdom','GBP','en'],FR:['France','EUR','fr'],DE:['Deutschland','EUR','de'],IT:['Italia','EUR','it'],PT:['Portugal','EUR','pt'],CA:['Canada','CAD','en'],DO:['República Dominicana','DOP','es'],UY:['Uruguay','UYU','es'],PY:['Paraguay','PYG','es'],BO:['Bolivia','BOB','es'],VE:['Venezuela','VES','es'],CR:['Costa Rica','CRC','es'],PA:['Panamá','USD','es'],GT:['Guatemala','GTQ','es'],HN:['Honduras','HNL','es'],SV:['El Salvador','USD','es'],NI:['Nicaragua','NIO','es'],AU:['Australia','AUD','en'],JP:['日本','JPY','en'],CH:['Schweiz','CHF','de'],NL:['Nederland','EUR','en'],BE:['Belgique','EUR','fr'],IN:['India','INR','en'],ZA:['South Africa','ZAR','en'],CN:['China','CNY','en'],KR:['South Korea','KRW','en'],TR:['Türkiye','TRY','en']};
const translations={
es:{country:'País / moneda',choose:'País',pay:'PAGO INTERNACIONAL · PAYPAL',instructions:'Copia el correo y envía el importe exacto en USD desde PayPal como pago por productos o servicios. Después envía el comprobante y el ID de transacción por WhatsApp. Verificaremos el pago antes de entregar tu pedido.',copy:'Copiar correo',open:'Abrir PayPal',proof:'Enviar comprobante por WhatsApp',fee:'Incluye comisión estimada de PayPal',base:'Precio base',total:'Total a enviar en USD',approx:'Equivalente aproximado',note:'La conversión es orientativa. PayPal puede aplicar su propio tipo de cambio y cargos. No envíes dinero hasta comprobar el importe.',whatsapp:'PEDIR POR WHATSAPP 💬',add:'AGREGAR AL CARRITO',sold:'AGOTADO',cart:'TU PEDIDO',title:'AVJ COMUNITY · Región'},
en:{country:'Country / currency',choose:'Country',pay:'INTERNATIONAL PAYMENT · PAYPAL',instructions:'Copy the email and send the exact USD amount through PayPal as a payment for goods or services. Then send the receipt and transaction ID via WhatsApp. We verify payment before delivering your order.',copy:'Copy email',open:'Open PayPal',proof:'Send receipt on WhatsApp',fee:'Includes estimated PayPal fee',base:'Base price',total:'Amount to send in USD',approx:'Approximate equivalent',note:'Currency conversion is an estimate. PayPal may use its own exchange rate and charges. Verify the amount before paying.',whatsapp:'ORDER VIA WHATSAPP 💬',add:'ADD TO CART',sold:'SOLD OUT',cart:'YOUR ORDER',title:'AVJ COMUNITY · Region'},
pt:{country:'País / moeda',choose:'País',pay:'PAGAMENTO INTERNACIONAL · PAYPAL',instructions:'Copie o e-mail e envie o valor exato em USD pelo PayPal como pagamento de bens ou serviços. Depois envie o comprovante e ID da transação pelo WhatsApp. Confirmaremos antes da entrega.',copy:'Copiar e-mail',open:'Abrir PayPal',proof:'Enviar comprovante pelo WhatsApp',fee:'Inclui taxa estimada do PayPal',base:'Preço base',total:'Total em USD',approx:'Equivalente aproximado',note:'A conversão é estimada. O PayPal pode usar outra taxa e cobrar encargos. Verifique o valor antes de pagar.',whatsapp:'PEDIR PELO WHATSAPP 💬',add:'ADICIONAR AO CARRINHO',sold:'ESGOTADO',cart:'SEU PEDIDO',title:'AVJ COMUNITY · Região'},
fr:{country:'Pays / devise',choose:'Pays',pay:'PAIEMENT INTERNATIONAL · PAYPAL',instructions:'Copiez l’adresse e-mail et envoyez le montant exact en USD sur PayPal en sélectionnant biens et services. Envoyez ensuite le reçu et le numéro de transaction sur WhatsApp. Nous vérifions avant livraison.',copy:'Copier e-mail',open:'Ouvrir PayPal',proof:'Envoyer le reçu sur WhatsApp',fee:'Frais PayPal estimés inclus',base:'Prix de base',total:'Montant à envoyer en USD',approx:'Conversion approximative',note:'Conversion indicative. PayPal peut appliquer ses propres taux et frais. Vérifiez avant le paiement.',whatsapp:'COMMANDER SUR WHATSAPP 💬',add:'AJOUTER AU PANIER',sold:'ÉPUISÉ',cart:'VOTRE COMMANDE',title:'AVJ COMUNITY · Pays'},
de:{country:'Land / Währung',choose:'Land',pay:'INTERNATIONALE ZAHLUNG · PAYPAL',instructions:'Kopiere die E-Mail-Adresse und sende den genauen USD-Betrag über PayPal als Waren- und Dienstleistungszahlung. Schicke anschließend Beleg und Transaktions-ID über WhatsApp. Wir prüfen die Zahlung vor der Lieferung.',copy:'E-Mail kopieren',open:'PayPal öffnen',proof:'Beleg über WhatsApp senden',fee:'Geschätzte PayPal-Gebühr enthalten',base:'Grundpreis',total:'Zu sendender USD-Betrag',approx:'Ungefähre Umrechnung',note:'Umrechnung nur als Orientierung. PayPal kann andere Wechselkurse und Gebühren anwenden. Betrag vor Zahlung prüfen.',whatsapp:'ÜBER WHATSAPP BESTELLEN 💬',add:'IN DEN WARENKORB',sold:'AUSVERKAUFT',cart:'DEINE BESTELLUNG',title:'AVJ COMUNITY · Region'},
it:{country:'Paese / valuta',choose:'Paese',pay:'PAGAMENTO INTERNAZIONALE · PAYPAL',instructions:'Copia l’indirizzo email e invia l’importo esatto in USD con PayPal come pagamento per beni e servizi. Invia poi ricevuta e ID della transazione su WhatsApp. Verifichiamo prima della consegna.',copy:'Copia email',open:'Apri PayPal',proof:'Invia ricevuta su WhatsApp',fee:'Commissione PayPal stimata inclusa',base:'Prezzo base',total:'Totale da inviare in USD',approx:'Conversione approssimativa',note:'Conversione indicativa. PayPal può applicare un tasso e costi diversi. Verifica prima del pagamento.',whatsapp:'ORDINA SU WHATSAPP 💬',add:'AGGIUNGI AL CARRELLO',sold:'ESAURITO',cart:'IL TUO ORDINE',title:'AVJ COMUNITY · Paese'}};
const state={country:'EC',rate:1,rates:{USD:1},ratesReady:false,language:'es'};
const t=k=>(translations[state.language]||translations.en)[k]||translations.es[k]||k;
function usd(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)}
function amount(n){return Number(n)||0}
function grand(n){return Math.ceil(((amount(n)+.30)/(1-.054))*100)/100}
function local(n){const cfg=countries[state.country]||['','USD','en'];const curr=cfg[1];if(curr!=='USD'&&!state.ratesReady)return usd(n)+' (USD)';try{return new Intl.NumberFormat(state.language+'-'+state.country,{style:'currency',currency:curr,maximumFractionDigits:2}).format(n*(state.rates[curr]||1))}catch{return usd(n)}}
function formatPrice(n){return state.country==='EC'?usd(n):local(grand(n))}
function sumCart(){return (typeof cart!=='undefined'&&Array.isArray(cart))?cart.reduce((s,i)=>s+amount(i.price)*amount(i.quantity),0):0}
function draw(){
 const cfg=countries[state.country]||countries.US,international=state.country!=='EC';
 document.documentElement.lang=state.language;
 const select=document.getElementById('avj-country');if(select)select.value=state.country;
 document.getElementById('avj-local-label').textContent=t('country');
 document.getElementById('avj-region-summary').textContent=cfg[0]+' · '+cfg[1];
 document.getElementById('avj-paypal').hidden=!international;
 document.getElementById('avj-bank').hidden=international;
 document.getElementById('avj-paypal-heading').textContent=t('pay');
 document.getElementById('avj-paypal-instructions').textContent=t('instructions');
 document.getElementById('avj-copy').textContent=t('copy');
 document.getElementById('avj-open').textContent=t('open');
 document.getElementById('avj-proof').textContent=t('proof');
 document.getElementById('avj-fee-label').textContent=t('fee');
 document.getElementById('avj-total-label').textContent=t('total');
 document.getElementById('avj-approx-label').textContent=t('approx');
 document.getElementById('avj-paypal-note').textContent=t('note');
 const base=sumCart(),cost=grand(base);
 document.getElementById('avj-price-breakdown').textContent=usd(base)+' + '+usd(cost-base);
 document.getElementById('avj-total-pay').textContent=usd(cost);
 document.getElementById('avj-total-local').textContent=local(cost);
 const btn=document.getElementById('avj-order-button');btn.textContent=t('whatsapp');
 if(typeof renderProducts==='function')renderProducts();
 if(typeof renderFeaturedProducts==='function')renderFeaturedProducts();
 if(typeof updateCartUI==='function')updateCartUI();
 if(international)document.getElementById('cart-total').textContent=local(cost);
 translateButtons();
}
function translateButtons(){const targets=document.querySelectorAll('#product-grid button,#cart-drawer h3');for(const e of targets){if(e.children.length)continue;const s=e.textContent.trim();if(s==='AGREGAR AL CARRITO'||s==='ADD TO CART'||s==='ADICIONAR AO CARRINHO')e.textContent=t('add');if(s==='AGOTADO'||s==='SOLD OUT')e.textContent=t('sold')}}
async function rates(){try{const r=await fetch('https://open.er-api.com/v6/latest/USD');if(!r.ok)throw Error('fx');const j=await r.json();if(j.result!=='success'||!j.rates)throw Error('fx');state.rates=j.rates;state.ratesReady=true;}catch(e){console.warn('AVJ: currency rates unavailable; USD amounts shown',e)}draw()}
async function location(){let code;try{const r=await fetch('/api/avj-location',{cache:'no-store'});if(r.ok){const j=await r.json();code=j.country}}catch(e){}if(!code){try{const r=await fetch('https://ipwho.is/');if(r.ok){const j=await r.json();code=j.country_code}}catch(e){}}return countries[code]?code:'EC'}
function choose(code){state.country=countries[code]?code:'EC';state.language=countries[state.country][2];try{localStorage.setItem('avj_region',state.country)}catch(e){}draw()}
function receipt(){const base=sumCart(),total=grand(base);const lines=(typeof cart!=='undefined'?cart:[]).map(i=>'- '+i.name+' x'+i.quantity).join('\n');const msg='AVJ COMUNITY - Pago internacional PayPal\nProductos:\n'+(lines||'Consulta de pedido')+'\nImporte total USD: '+usd(total)+'\nPayPal: '+PAYPAL+'\nAdjunto mi comprobante e ID de transacción para que verifiquen el pago.';window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener')}
function init(){
 const checkout=document.querySelector('#cart-drawer .border-t-4');if(!checkout)return;
 const bank=checkout.querySelector('.nes-border');if(bank)bank.id='avj-bank';
 const chooser=document.createElement('div');chooser.id='avj-region';chooser.style.cssText='position:fixed;right:12px;bottom:12px;z-index:45;background:#fff;border:2px solid #7b2cbf;box-shadow:3px 3px #000;padding:6px 8px;max-width:210px;font:11px system-ui;color:#111';
 chooser.innerHTML='<label id="avj-local-label" for="avj-country"></label><div style="display:flex;gap:4px;align-items:center"><select id="avj-country" aria-label="País y moneda" style="max-width:150px;font:11px system-ui;border:1px solid #555;background:#fff;padding:4px"></select></div><small id="avj-region-summary" style="font:9px system-ui"></small>';
 document.body.appendChild(chooser);
 const select=chooser.querySelector('select');for(const [code,c] of Object.entries(countries)){const op=document.createElement('option');op.value=code;op.textContent=c[0]+' ('+c[1]+')';select.appendChild(op)}select.addEventListener('change',e=>choose(e.target.value));
 const paypal=document.createElement('div');paypal.id='avj-paypal';paypal.hidden=true;paypal.className='nes-border bg-[#F3EBF9] p-3 mb-4 text-[10px] leading-relaxed';paypal.innerHTML='<h3 id="avj-paypal-heading" class="font-black text-purple-800 mb-3"></h3><p id="avj-paypal-instructions" class="mb-3"></p><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><strong style="overflow-wrap:anywhere">'+PAYPAL+'</strong><button type="button" id="avj-copy" style="padding:5px;border:2px solid #000;background:#ddd"></button></div><p><span id="avj-fee-label"></span>: <strong id="avj-price-breakdown"></strong></p><p><span id="avj-total-label"></span>: <strong id="avj-total-pay"></strong></p><p><span id="avj-approx-label"></span>: <strong id="avj-total-local"></strong></p><p id="avj-paypal-note" class="mt-2 text-gray-600"></p><a id="avj-open" href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:10px 4px 6px 0;padding:7px;background:#7b2cbf;color:white"></a><button type="button" id="avj-proof" style="padding:7px;background:#16a34a;color:white"></button>';
 if(bank)bank.after(paypal);else checkout.prepend(paypal);
 paypal.querySelector('#avj-copy').addEventListener('click',()=>navigator.clipboard.writeText(PAYPAL).catch(()=>prompt('PayPal',PAYPAL)));
 paypal.querySelector('#avj-proof').addEventListener('click',receipt);
 checkout.querySelector('button[onclick="checkoutWhatsApp()"]').id='avj-order-button';
 const old=window.checkoutWhatsApp;window.checkoutWhatsApp=function(){if(state.country==='EC')return old();receipt()};
 const previous=window.updateCartUI;window.updateCartUI=function(){previous();const base=sumCart();document.getElementById('avj-price-breakdown').textContent=usd(base)+' + '+usd(grand(base)-base);document.getElementById('avj-total-pay').textContent=usd(grand(base));document.getElementById('avj-total-local').textContent=local(grand(base));if(state.country!=='EC')document.getElementById('cart-total').textContent=local(grand(base))};
 const saved=(()=>{try{return localStorage.getItem('avj_region')}catch(e){return null}})();choose(saved&&countries[saved]?saved:'EC');rates();if(!saved)location().then(choose);
}
window.avjInternational={formatPrice,grand,local,state,refresh:draw};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();