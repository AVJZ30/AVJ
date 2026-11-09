(function(){
'use strict';
const PAYPAL='luispluajj@gmail.com', WA='593963023351';
const countries={EC:['Ecuador','USD','es'],US:['United States','USD','en'],ES:['España','EUR','es'],MX:['México','MXN','es'],CO:['Colombia','COP','es'],PE:['Perú','PEN','es'],CL:['Chile','CLP','es'],AR:['Argentina','ARS','es'],BR:['Brasil','BRL','pt'],GB:['United Kingdom','GBP','en'],FR:['France','EUR','fr'],DE:['Deutschland','EUR','de'],IT:['Italia','EUR','it'],PT:['Portugal','EUR','pt'],CA:['Canada','CAD','en'],DO:['República Dominicana','DOP','es'],UY:['Uruguay','UYU','es'],PY:['Paraguay','PYG','es'],BO:['Bolivia','BOB','es'],VE:['Venezuela','VES','es'],CR:['Costa Rica','CRC','es'],PA:['Panamá','USD','es'],GT:['Guatemala','GTQ','es'],HN:['Honduras','HNL','es'],SV:['El Salvador','USD','es'],NI:['Nicaragua','NIO','es'],AU:['Australia','AUD','en'],JP:['日本','JPY','en'],CH:['Schweiz','CHF','de'],NL:['Nederland','EUR','en'],BE:['Belgique','EUR','fr'],IN:['India','INR','en'],ZA:['South Africa','ZAR','en'],CN:['China','CNY','en'],KR:['South Korea','KRW','en'],TR:['Türkiye','TRY','en']};
const translations={
es:{country:'País / moneda',choose:'País',pay:'PAGO INTERNACIONAL · PAYPAL',instructions:'Copia el correo, envía el total indicado por PayPal (productos y servicios) y manda el comprobante por WhatsApp.',copy:'Copiar correo',open:'Abrir PayPal',proof:'Enviar comprobante por WhatsApp',fee:'Importe adicional por PayPal',base:'Precio base',total:'Total a enviar por PayPal (USD)',approx:'Equivalente aproximado',note:'Total a enviar en USD. El equivalente en tu moneda es aproximado.',whatsapp:'PEDIR POR WHATSAPP 💬',add:'AGREGAR AL CARRITO',sold:'AGOTADO',cart:'TU PEDIDO',title:'AVJ COMUNITY · Región'},
en:{country:'Country / currency',choose:'Country',pay:'INTERNATIONAL PAYMENT · PAYPAL',instructions:'Copy the email, send the stated total through PayPal (goods and services), then send your receipt via WhatsApp.',copy:'Copy email',open:'Open PayPal',proof:'Send receipt on WhatsApp',fee:'Additional PayPal fee',base:'Base price',total:'Total to send via PayPal (USD)',approx:'Approximate equivalent',note:'Pay the total in USD. Local currency conversion is an estimate.',whatsapp:'ORDER VIA WHATSAPP 💬',add:'ADD TO CART',sold:'SOLD OUT',cart:'YOUR ORDER',title:'AVJ COMUNITY · Region'},
pt:{country:'País / moeda',choose:'País',pay:'PAGAMENTO INTERNACIONAL · PAYPAL',instructions:'Copie o e-mail, envie o valor total pelo PayPal (bens e serviços) e mande o comprovante pelo WhatsApp.',copy:'Copiar e-mail',open:'Abrir PayPal',proof:'Enviar comprovante pelo WhatsApp',fee:'Valor adicional do PayPal',base:'Preço base',total:'Total a enviar pelo PayPal (USD)',approx:'Equivalente aproximado',note:'Pague o total em USD. O valor em moeda local é aproximado.',whatsapp:'PEDIR PELO WHATSAPP 💬',add:'ADICIONAR AO CARRINHO',sold:'ESGOTADO',cart:'SEU PEDIDO',title:'AVJ COMUNITY · Região'},
fr:{country:'Pays / devise',choose:'Pays',pay:'PAIEMENT INTERNATIONAL · PAYPAL',instructions:'Copiez l’e-mail, envoyez le total via PayPal (biens et services), puis le reçu sur WhatsApp.',copy:'Copier e-mail',open:'Ouvrir PayPal',proof:'Envoyer le reçu sur WhatsApp',fee:'Frais PayPal supplémentaires',base:'Prix de base',total:'Total à envoyer via PayPal (USD)',approx:'Conversion approximative',note:'Total à envoyer en USD. La conversion en devise locale est indicative.',whatsapp:'COMMANDER SUR WHATSAPP 💬',add:'AJOUTER AU PANIER',sold:'ÉPUISÉ',cart:'VOTRE COMMANDE',title:'AVJ COMUNITY · Pays'},
de:{country:'Land / Währung',choose:'Land',pay:'INTERNATIONALE ZAHLUNG · PAYPAL',instructions:'E-Mail kopieren, den Gesamtbetrag per PayPal (Waren und Dienstleistungen) senden und den Beleg über WhatsApp schicken.',copy:'E-Mail kopieren',open:'PayPal öffnen',proof:'Beleg über WhatsApp senden',fee:'Zusätzliche PayPal-Gebühr',base:'Grundpreis',total:'Per PayPal zu sendender Betrag (USD)',approx:'Ungefähre Umrechnung',note:'Gesamtbetrag in USD. Die lokale Umrechnung ist nur ungefähr.',whatsapp:'ÜBER WHATSAPP BESTELLEN 💬',add:'IN DEN WARENKORB',sold:'AUSVERKAUFT',cart:'DEINE BESTELLUNG',title:'AVJ COMUNITY · Region'},
it:{country:'Paese / valuta',choose:'Paese',pay:'PAGAMENTO INTERNAZIONALE · PAYPAL',instructions:'Copia l\'email, invia il totale tramite PayPal (beni e servizi), poi manda la ricevuta su WhatsApp.',copy:'Copia email',open:'Apri PayPal',proof:'Invia ricevuta su WhatsApp',fee:'Costo aggiuntivo PayPal',base:'Prezzo base',total:'Totale da inviare tramite PayPal (USD)',approx:'Conversione approssimativa',note:'Totale da inviare in USD. Il cambio locale è indicativo.',whatsapp:'ORDINA SU WHATSAPP 💬',add:'AGGIUNGI AL CARRELLO',sold:'ESAURITO',cart:'IL TUO ORDINE',title:'AVJ COMUNITY · Paese'}};
const state={country:'EC',rate:1,rates:{USD:1},ratesReady:false,language:'es'};
const t=k=>(translations[state.language]||translations.en)[k]||translations.es[k]||k;
function usd(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)}
function amount(n){return Number(n)||0}
function grand(n){return amount(n)>0?Math.ceil(((amount(n)+.30)/(1-.054))*100)/100:0}
function sellerFee(n){return Math.max(0,Math.round((grand(n)-amount(n))*100)/100)}
function local(n){const cfg=countries[state.country]||['','USD','en'];const curr=cfg[1];if(curr!=='USD'&&!state.ratesReady)return usd(n)+' (USD)';try{return new Intl.NumberFormat(state.language+'-'+state.country,{style:'currency',currency:curr,maximumFractionDigits:2}).format(n*(state.rates[curr]||1))}catch{return usd(n)}}
function formatPrice(n){return state.country==='EC'?usd(n):local(amount(n))}
function sumCart(){return (typeof cart!=='undefined'&&Array.isArray(cart))?cart.reduce((s,i)=>s+amount(i.price)*amount(i.quantity),0):0}
const siteWords={
'LO MÁS VENDIDO':{en:'BEST SELLERS',pt:'MAIS VENDIDOS',fr:'MEILLEURES VENTES',de:'BESTSELLER',it:'PIÙ VENDUTI'},
'CATÁLOGO':{en:'CATALOG',pt:'CATÁLOGO',fr:'CATALOGUE',de:'KATALOG',it:'CATALOGO'},
'Todas':{en:'All',pt:'Todas',fr:'Toutes',de:'Alle',it:'Tutte'},
'Filtro rápido por plataforma / marca:':{en:'Filter by platform / brand:',pt:'Filtrar por plataforma / marca:',fr:'Filtrer par plateforme / marque :',de:'Nach Plattform / Marke filtern:',it:'Filtra per piattaforma / marchio:'},
'Servicios digitales en Ecuador 🇪🇨':{en:'Digital services worldwide 🌎',pt:'Serviços digitais internacionais 🌎',fr:'Services numériques internationaux 🌎',de:'Internationale digitale Dienste 🌎',it:'Servizi digitali internazionali 🌎'},
'Mostrar más detalles ▼':{en:'Show more details ▼',pt:'Mostrar mais detalhes ▼',fr:'Afficher les détails ▼',de:'Weitere Details anzeigen ▼',it:'Mostra dettagli ▼'},
'Libros Gratis':{en:'Free Books',pt:'Livros Grátis',fr:'Livres Gratuits',de:'Kostenlose Bücher',it:'Libri Gratuiti'},
'Cursos · Libros PDF · Packs · Rutinas · Recetas — Click aquí 👉':{en:'Courses · PDF books · Packs · Routines · Recipes — Click here 👉',pt:'Cursos · Livros PDF · Pacotes · Rotinas · Receitas — Clique aqui 👉',fr:'Cours · Livres PDF · Packs · Routines · Recettes — Cliquez ici 👉',de:'Kurse · PDF-Bücher · Pakete · Routinen · Rezepte — Hier klicken 👉',it:'Corsi · Libri PDF · Pacchetti · Routine · Ricette — Clicca qui 👉'},
'Reservas 🎟️':{en:'Reservations 🎟️',pt:'Reservas 🎟️',fr:'Réservations 🎟️',de:'Reservierungen 🎟️',it:'Prenotazioni 🎟️'},
'Herramientas Gratis 🛠️':{en:'Free Tools 🛠️',pt:'Ferramentas Grátis 🛠️',fr:'Outils Gratuits 🛠️',de:'Kostenlose Tools 🛠️',it:'Strumenti Gratuiti 🛠️'},
'Grupo WhatsApp 💬🔥':{en:'WhatsApp Group 💬🔥',pt:'Grupo WhatsApp 💬🔥',fr:'Groupe WhatsApp 💬🔥',de:'WhatsApp-Gruppe 💬🔥',it:'Gruppo WhatsApp 💬🔥'},
'APPS GRATIS Y JUEGOS GRATIS SIN VIRUS 📲':{en:'FREE APPS AND VIRUS-FREE GAMES 📲',pt:'APPS E JOGOS GRATUITOS SEM VÍRUS 📲',fr:'APPLICATIONS ET JEUX GRATUITS SANS VIRUS 📲',de:'KOSTENLOSE APPS UND VIRENFREIE SPIELE 📲',it:'APP E GIOCHI GRATIS SENZA VIRUS 📲'},
'AGREGAR AL CARRITO':{en:'ADD TO CART',pt:'ADICIONAR AO CARRINHO',fr:'AJOUTER AU PANIER',de:'IN DEN WARENKORB',it:'AGGIUNGI AL CARRELLO'},
'Agregar al carrito':{en:'Add to cart',pt:'Adicionar ao carrinho',fr:'Ajouter au panier',de:'In den Warenkorb',it:'Aggiungi al carrello'},
'AGOTADO':{en:'SOLD OUT',pt:'ESGOTADO',fr:'ÉPUISÉ',de:'AUSVERKAUFT',it:'ESAURITO'},
'TU PEDIDO':{en:'YOUR ORDER',pt:'SEU PEDIDO',fr:'VOTRE COMMANDE',de:'DEINE BESTELLUNG',it:'IL TUO ORDINE'},
'TOTAL:':{en:'TOTAL:',pt:'TOTAL:',fr:'TOTAL :',de:'GESAMT:',it:'TOTALE:'},
'Disponibles:':{en:'Available:',pt:'Disponíveis:',fr:'Disponibles :',de:'Verfügbar:',it:'Disponibili:'},
'Disponibles':{en:'Available',pt:'Disponíveis',fr:'Disponibles',de:'Verfügbar',it:'Disponibili'},
'No hay productos disponibles en esta selección.':{en:'No products available in this selection.',pt:'Não há produtos nesta seleção.',fr:'Aucun produit disponible pour cette sélection.',de:'Keine Produkte in dieser Auswahl verfügbar.',it:'Nessun prodotto disponibile in questa selezione.'},
'Todavía no hay productos destacados. Pronto encontrarás novedades aquí.':{en:'No featured products yet. Check back soon.',pt:'Ainda não há produtos em destaque. Volte em breve.',fr:'Aucun produit en vedette pour le moment.',de:'Noch keine vorgestellten Produkte.',it:'Non ci sono ancora prodotti in evidenza.'},
'Tu carrito está vacío':{en:'Your cart is empty',pt:'Seu carrinho está vazio',fr:'Votre panier est vide',de:'Dein Warenkorb ist leer',it:'Il tuo carrello è vuoto'},
'NO HAY POR EL MOMENTO INTENTA MÁS TARDE':{en:'OUT OF STOCK — TRY AGAIN LATER',pt:'ESGOTADO — TENTE MAIS TARDE',fr:'INDISPONIBLE — RÉESSAYEZ PLUS TARD',de:'NICHT VERFÜGBAR — SPÄTER ERNEUT VERSUCHEN',it:'NON DISPONIBILE — RIPROVA PIÙ TARDI'}
};
const originalText=new WeakMap();
function translatePage(){
 const roots=['header','main','#cart-drawer','.platforms-toggle','.relative.z-20.max-w-4xl','footer'];
 for(const sel of roots){for(const root of document.querySelectorAll(sel)){if(root.closest('#admin-secret-panel')||root.id==='avj-region')continue;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){const par=node.parentElement;if(!par||par.closest('#admin-secret-panel,#avj-paypal,#avj-region,.avj-stock-count,script,style,textarea,input'))continue;
 const initial=originalText.get(node)??node.nodeValue;const trimmed=initial.trim();const key=siteWords[trimmed]?trimmed:(/^Disponibles:\s*\d+/.test(trimmed)?'Disponibles:':null);if(!key)continue;
 if(!originalText.has(node))originalText.set(node,initial);
 const converted=state.language==='es'?trimmed:(siteWords[key][state.language]||siteWords[key].en||trimmed);
 const finalText=key==='Disponibles:'?trimmed.replace(/^Disponibles:/,converted):converted;
 node.nodeValue=initial.replace(trimmed,finalText);
 }
 }}
}
function welcome(){
 const box=document.getElementById('avj-welcome');if(!box)return;
 if(state.country==='EC'){box.hidden=true;return}box.hidden=false;
 const country=(countries[state.country]||countries.US)[0];
 const greeting={es:'¡Bienvenida, personita de '+country+'! 🌎',en:'Welcome, lovely visitor from '+country+'! 🌎',pt:'Boas-vindas, pessoinha do '+country+'! 🌎',fr:'Bienvenue, cher visiteur de '+country+' ! 🌎',de:'Willkommen, lieber Gast aus '+country+'! 🌎',it:'Benvenuta, persona speciale da '+country+'! 🌎'};
 const warning={es:'Al realizar tu compra, lee atentamente: puedes pagar con PayPal o criptomonedas, pero primero envía tu pedido por WhatsApp. ¡Gracias!',en:'Before purchasing, please read carefully: you can pay with PayPal or crypto, but first send your order on WhatsApp. Thank you!',pt:'Antes de comprar, leia com atenção: nosso único método oficial de pagamento internacional é o PayPal. Obrigado!',fr:'Avant votre achat, lisez attentivement : notre seul moyen de paiement officiel à l’international est PayPal. Merci !',de:'Bitte vor dem Kauf beachten: Unsere einzige offizielle internationale Zahlungsmethode ist PayPal. Vielen Dank!',it:'Prima di acquistare, leggi attentamente: il nostro unico metodo di pagamento ufficiale internazionale è PayPal. Grazie!'};
 box.querySelector('strong').textContent=greeting[state.language]||greeting.en;
 box.querySelector('p').textContent=warning[state.language]||warning.en;
}

function draw(){
 const cfg=countries[state.country]||countries.US,international=state.country!=='EC';
 document.documentElement.lang=state.language;
 const hero=document.getElementById('avj-country-headline');
 if(hero){
   const countryNames={EC:'Ecuador',ES:'España',BR:'Brasil',US:'Estados Unidos',GB:'Reino Unido',FR:'Francia',DE:'Alemania',IT:'Italia',PT:'Portugal',MX:'México',CO:'Colombia',PE:'Perú',CL:'Chile',AR:'Argentina',CA:'Canadá',JP:'Japón',NL:'Países Bajos',BE:'Bélgica',CH:'Suiza',AU:'Australia',IN:'India',CN:'China',KR:'Corea del Sur',TR:'Turquía'};
   const country=countryNames[state.country]||cfg[0];
   const patterns={es:'Servicios digitales en {country}',en:'Digital services in {country}',pt:'Serviços digitais no país: {country}',fr:'Services numériques en {country}',de:'Digitale Dienstleistungen in {country}',it:'Servizi digitali in {country}'};
   hero.textContent=(patterns[state.language]||patterns.en).replace('{country}',country);
 }
 const select=document.getElementById('avj-country');if(select)select.value=state.country;
 document.getElementById('avj-paypal').hidden=!international;document.getElementById('avj-crypto').hidden=!international;
 document.getElementById('avj-bank').hidden=international;
 document.getElementById('avj-paypal-heading').textContent=t('pay');
 document.getElementById('avj-paypal-instructions').textContent=t('instructions');
 document.getElementById('avj-copy').textContent=t('copy');
 document.getElementById('avj-open').textContent=t('open');
 document.getElementById('avj-proof').textContent=t('proof');
 document.getElementById('avj-fee-label').textContent=t('fee');
 document.getElementById('avj-total-label').textContent=t('total');
 const cartTotalLabel=document.getElementById('cart-total')?.previousElementSibling;
 if(cartTotalLabel&&cartTotalLabel.tagName==='SPAN')cartTotalLabel.textContent=international?t('total'):'TOTAL:';
 document.getElementById('avj-base-label').textContent=t('base');

 const base=sumCart(),cost=grand(base);
 document.getElementById('avj-price-breakdown').textContent=usd(sellerFee(base));
 document.getElementById('avj-total-pay').textContent=usd(cost);
 document.getElementById('avj-base-pay').textContent=usd(base);if(window.avjDrawCrypto)window.avjDrawCrypto();
 const btn=document.getElementById('avj-order-button');btn.textContent=t('whatsapp');
 if(typeof renderProducts==='function')renderProducts();
 if(typeof renderFeaturedProducts==='function')renderFeaturedProducts();
 if(typeof updateCartUI==='function')updateCartUI();
 if(international)document.getElementById('cart-total').textContent=usd(cost);if(window.avjDrawCrypto)window.avjDrawCrypto();
 translateButtons();
 translatePage();
 updateStockLabels();
 welcome();
}
function updateStockLabels(){
 const variants={es:n=>'Disponibles: '+n+' cuentas',en:n=>'Available: '+n+' accounts',pt:n=>'Disponíveis: '+n+' contas',fr:n=>'Disponibles : '+n+' comptes',de:n=>'Verfügbar: '+n+' Konten',it:n=>'Disponibili: '+n+' account'};
 const format=variants[state.language]||variants.en;
 document.querySelectorAll('.avj-stock-count').forEach(el=>{
   const n=Number(el.dataset.stock);
   if(Number.isFinite(n)&&n>=0)el.textContent=format(n);
 });
}
function translateButtons(){const targets=document.querySelectorAll('#product-grid button,#cart-drawer h3');for(const e of targets){if(e.children.length)continue;const s=e.textContent.trim();if(s==='AGREGAR AL CARRITO'||s==='ADD TO CART'||s==='ADICIONAR AO CARRINHO')e.textContent=t('add');if(s==='AGOTADO'||s==='SOLD OUT')e.textContent=t('sold')}}
async function rates(){try{const r=await fetch('https://open.er-api.com/v6/latest/USD');if(!r.ok)throw Error('fx');const j=await r.json();if(j.result!=='success'||!j.rates)throw Error('fx');state.rates=j.rates;state.ratesReady=true;}catch(e){console.warn('AVJ: currency rates unavailable; USD amounts shown',e)}draw()}
async function location(){let code;try{const r=await fetch('/api/avj-location',{cache:'no-store'});if(r.ok){const j=await r.json();code=j.country}}catch(e){}if(!code){try{const r=await fetch('https://ipwho.is/');if(r.ok){const j=await r.json();code=j.country_code}}catch(e){}}return countries[code]?code:'EC'}
function choose(code,persist=true){state.country=countries[code]?code:'EC';state.language=(window.avjSiteLocale&&window.avjSiteLocale.language)||countries[state.country][2];if(persist&&window.avjSiteLocale)window.avjSiteLocale.setCountry(state.country);else if(persist){try{localStorage.setItem('avj_region_manual',state.country)}catch(e){}}draw()}
function receipt(){
 const items=(typeof cart!=='undefined'&&Array.isArray(cart))?cart:[];
 if(!items.length){alert(state.language==='es'?'Tu carrito está vacío.':'Your cart is empty.');return}
 const method=document.querySelector('input[name="avj-method"]:checked')?.value||'paypal';const base=sumCart(),fee=method==='paypal'?sellerFee(base):0,total=base+fee,country=countries[state.country][0];
 const templates={
  es:{hello:'Hola, vengo de',order:'Mi pedido',qty:'Cantidad',base:'Subtotal',fee:'Importe por PayPal',total:'Total a pagar',proof:'Quedo pendiente de la confirmación para realizar el pago y enviar el comprobante.'},
  en:{hello:'Hello, I am from',order:'My order',qty:'Quantity',base:'Subtotal',fee:'PayPal fee',total:'Total to pay',proof:'Please confirm my order before I pay and send a receipt.'},
  pt:{hello:'Olá, venho do país',order:'Meu pedido',qty:'Quantidade',base:'Subtotal',fee:'Tarifa do PayPal',total:'Total a pagar',proof:'Envio o comprovante e o ID da transação.'},
  fr:{hello:'Bonjour, je viens de',order:'Ma commande',qty:'Quantité',base:'Sous-total',fee:'Frais PayPal',total:'Total à payer',proof:'Je joins mon reçu et l’identifiant de transaction.'},
  de:{hello:'Hallo, ich komme aus',order:'Meine Bestellung',qty:'Menge',base:'Zwischensumme',fee:'PayPal-Gebühr',total:'Gesamtbetrag',proof:'Ich sende den Zahlungsbeleg und die Transaktions-ID.'},
  it:{hello:'Ciao, vengo da',order:'Il mio ordine',qty:'Quantità',base:'Subtotale',fee:'Costo PayPal',total:'Totale da pagare',proof:'Allego la ricevuta e l’ID della transazione.'}
 };
 const x=templates[state.language]||templates.en;
 const lines=items.map(i=>'• '+i.name+' × '+i.quantity).join('\n');
 const msg=x.hello+' '+country+'.\n\n'+x.order+':\n'+lines+'\n\n'+x.base+': '+usd(base)+'\n'+x.fee+': '+usd(fee)+'\n'+x.total+': '+usd(total)+' USD\nMétodo elegido: '+(document.querySelector('input[name="avj-method"]:checked')?.value||'paypal')+'\nSolicito confirmación del pedido antes de pagar.\n\n'+x.proof;
 window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener');
}
function init(){
 const checkout=document.querySelector('#cart-drawer .border-t-4');if(!checkout)return;
 const bank=checkout.querySelector('.nes-border');if(bank)bank.id='avj-bank';
 const welcomeBox=document.createElement('div');welcomeBox.id='avj-welcome';welcomeBox.hidden=true;welcomeBox.style.cssText='border:2px solid #7b2cbf;background:#faf5ff;color:#3b0764;padding:10px;margin-bottom:12px;font:12px/1.65 system-ui';welcomeBox.innerHTML='<strong style="display:block;margin-bottom:4px"></strong><p></p>';checkout.prepend(welcomeBox);
 const paypal=document.createElement('div');paypal.id='avj-paypal';paypal.hidden=true;paypal.className='nes-border bg-[#F3EBF9] p-3 mb-4 text-[10px] leading-relaxed';paypal.innerHTML='<h3 id="avj-paypal-heading" class="font-black text-purple-800 mb-3"></h3><p id="avj-paypal-instructions" class="mb-3"></p><div style="background:#fff;border:2px solid #7b2cbf;padding:10px;margin:8px 0"><p><span id="avj-base-label"></span>: <strong id="avj-base-pay"></strong></p><p><span id="avj-fee-label"></span>: <strong id="avj-price-breakdown"></strong></p><p style="border-top:1px solid #d8b4fe;padding-top:7px;margin-top:7px;font-weight:900;font-size:12px"><span id="avj-total-label"></span>: <strong id="avj-total-pay"></strong></p></div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><strong style="overflow-wrap:anywhere;color:#581c87;font-size:14px;background:#fff;border:2px solid #7b2cbf;padding:7px 9px;display:inline-block">'+PAYPAL+'</strong><button type="button" id="avj-copy" style="padding:7px 10px;border:2px solid #000;background:#fde047;font-weight:800;cursor:pointer"></button></div><a id="avj-open" href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:10px 4px 6px 0;padding:7px;background:#7b2cbf;color:white"></a><button type="button" id="avj-proof" style="padding:7px;background:#16a34a;color:white"></button>';
 if(bank)bank.after(paypal);else checkout.prepend(paypal);
 const cr=document.createElement('div');cr.id='avj-crypto';cr.hidden=true;cr.style.cssText='background:#faf5ff;border:2px solid #7b2cbf;border-radius:10px;padding:12px;margin:8px 0;font:12px/1.7 system-ui';cr.innerHTML='<b>💳 Selecciona tu método de pago</b><p>Primero envía tu pedido por WhatsApp y confirma el importe. Después continúa con el pago.</p><label><input type="radio" name="avj-method" value="paypal" checked> <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="" width="18" height="18" style="vertical-align:middle;object-fit:contain"> <b style="color:#003087">PayPal</b></label><br><label><input type="radio" name="avj-method" value="usdt"> USDT (Tether)</label><br><label><input type="radio" name="avj-method" value="btc"> BTC (Bitcoin)</label><br><label><input type="radio" name="avj-method" value="ltc"> LTC (Litecoin)</label><p id="avj-crypto-address" style="word-break:break-all"></p><p>Las criptomonedas no tienen recargo AVJ. Las tarifas de red o del exchange son externas. El monto exacto en cripto se confirma por WhatsApp.</p><button type="button" id="avj-copy-crypto" style="background:#7b2cbf;color:white;border:0;padding:7px">Copiar dirección</button>';paypal.after(cr);const addresses={usdt:'0xABd5794ea48A9b267573F708eb314F892ECF0068',btc:'bc1qq7y0ul8yfpsxzv3s6dnk9wnffh6kszvcwfx5gu',ltc:'ltc1qg6auul6f2mwtjq58ywurt8mdfqnggmlzhxgw3d'};function drawCrypto(){const v=document.querySelector('input[name="avj-method"]:checked')?.value||'paypal';cr.querySelector('#avj-crypto-address').textContent=v==='paypal'?'PayPal: '+PAYPAL+' · Total en USD: '+usd(grand(sumCart())):v.toUpperCase()+' · Precio base USD '+usd(sumCart())+' · Dirección: '+addresses[v]+(v==='usdt'?' · Confirma la red EVM exacta antes de pagar.':'');cr.querySelector('#avj-copy-crypto').hidden=v==='paypal';paypal.querySelector('#avj-open').hidden=v!=='paypal';paypal.querySelector('#avj-copy').hidden=v!=='paypal';const fee=v==='paypal'?sellerFee(sumCart()):0;document.getElementById('avj-fee-label').textContent=v==='paypal'?t('fee'):'Comisión adicional AVJ';document.getElementById('avj-price-breakdown').textContent=usd(fee);document.getElementById('avj-total-pay').textContent=usd(sumCart()+fee);const ct=document.getElementById('cart-total');if(ct&&state.country!=='EC')ct.textContent=usd(sumCart()+fee);}cr.addEventListener('change',drawCrypto);cr.querySelector('#avj-copy-crypto').addEventListener('click',()=>{const v=document.querySelector('input[name="avj-method"]:checked')?.value;navigator.clipboard.writeText(addresses[v]||'').catch(()=>prompt('Dirección',addresses[v]||''))});window.avjDrawCrypto=drawCrypto;drawCrypto();
 paypal.querySelector('#avj-copy').addEventListener('click',()=>navigator.clipboard.writeText(PAYPAL).catch(()=>prompt('PayPal',PAYPAL)));
 paypal.querySelector('#avj-proof').addEventListener('click',receipt);
 checkout.querySelector('button[onclick="checkoutWhatsApp()"]').id='avj-order-button';
 const old=window.checkoutWhatsApp;window.checkoutWhatsApp=function(){if(state.country==='EC')return old();receipt()};
 const previous=window.updateCartUI;window.updateCartUI=function(){previous();const base=sumCart();document.getElementById('avj-price-breakdown').textContent=usd(sellerFee(base));document.getElementById('avj-total-pay').textContent=usd(grand(base));document.getElementById('avj-base-pay').textContent=usd(base);if(state.country!=='EC')document.getElementById('cart-total').textContent=usd((document.querySelector('input[name="avj-method"]:checked')?.value||'paypal')==='paypal'?grand(base):base);if(window.avjDrawCrypto)window.avjDrawCrypto()};
 const saved=(()=>{try{return localStorage.getItem('avj_region')}catch(e){return null}})();choose(saved&&countries[saved]?saved:'EC',false);window.addEventListener('avj:region',event=>choose(event.detail.country,false));rates();
}
window.avjInternational={formatPrice,grand,local,state,refresh:draw,translatePage(){translatePage();updateStockLabels();}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();