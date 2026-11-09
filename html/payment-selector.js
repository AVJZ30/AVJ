(function(){
'use strict';
const paypalEmail='luispluajj@gmail.com', phone='593963023351';
const addresses={usdt:'0xABd5794ea48A9b267573F708eb314F892ECF0068',btc:'bc1qq7y0ul8yfpsxzv3s6dnk9wnffh6kszvcwfx5gu',ltc:'ltc1qg6auul6f2mwtjq58ywurt8mdfqnggmlzhxgw3d'};
let choice='',coin='',panel;
function sum(){return typeof cart!=='undefined'&&Array.isArray(cart)?cart.reduce((t,x)=>t+Number(x.price)*Number(x.quantity),0):0}
function money(v){return '$'+Number(v).toFixed(2)}
function paypalTotal(){return window.avjInternational?.grand?window.avjInternational.grand(sum()):sum()}
function international(){return (window.avjSiteLocale?.country||window.avjInternational?.state?.country||'EC')!=='EC'}
function copy(v){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(v).then(()=>notice('Copiado ✓')).catch(()=>window.prompt('Copiar',v))}else window.prompt('Copiar',v)}
function notice(v){panel.querySelector('#avj-ui-notice').textContent=v}
function draw(){
 if(!panel)return;
 panel.hidden=!international();
 const cc=window.avjSiteLocale?.country||window.avjInternational?.state?.country||'EC';
 
 panel.querySelector('#avj-ui-paypal').hidden=choice!=='paypal';
 panel.querySelector('#avj-ui-crypto').hidden=choice!=='crypto';
 panel.querySelector('#avj-ui-empty').hidden=!!choice;
 panel.querySelector('#avj-ui-wallet').hidden=!(choice==='crypto'&&coin);
 panel.querySelectorAll('[data-avj-method]').forEach(b=>{const yes=b.dataset.avjMethod===choice;b.classList.toggle('chosen',yes);b.setAttribute('aria-pressed',String(yes))});
 panel.querySelectorAll('[data-avj-coin]').forEach(b=>{const yes=b.dataset.avjCoin===coin;b.classList.toggle('chosen',yes);b.setAttribute('aria-pressed',String(yes))});
 panel.querySelector('#avj-ui-base').textContent=money(sum())+' USD';
 panel.querySelector('#avj-ui-fee').textContent=money(Math.max(0,paypalTotal()-sum()))+' USD';
 panel.querySelector('#avj-ui-total').textContent=money(paypalTotal())+' USD';
 panel.querySelector('#avj-ui-crypto-total').textContent=money(sum())+' USD';const cartTotal=document.getElementById('cart-total');if(cartTotal&&international())cartTotal.textContent=money(choice==='paypal'?paypalTotal():sum());
 if(coin){panel.querySelector('#avj-ui-address').textContent=addresses[coin];panel.querySelector('#avj-ui-coin-title').textContent=coin.toUpperCase();panel.querySelector('#avj-ui-network').textContent=coin==='usdt'?'Confirma la red EVM exacta con AVJ antes de pagar.':coin==='btc'?'Red Bitcoin únicamente.':'Red Litecoin únicamente.'}
}
function sendOrder(){
 const items=typeof cart!=='undefined'&&Array.isArray(cart)?cart:[];
 if(!items.length){alert('Tu carrito está vacío');return}
 const payment=choice==='paypal'?'PayPal':choice==='crypto'?(coin?coin.toUpperCase():'Criptomoneda por elegir'):'Por elegir';
 const region=window.avjSiteLocale?.country||window.avjInternational?.state?.country||'Internacional';
 const message='Hola, envío primero mi pedido para confirmar el pago.\nPaís: '+region+'\n\n'+items.map(x=>'• '+x.name+' × '+x.quantity).join('\n')+'\n\nSubtotal: '+money(sum())+' USD\nMétodo preferido: '+payment+'\nPor favor, confirmen disponibilidad, precio final y red de pago antes de transferir.';
 window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message),'_blank','noopener');
}
function init(){
 const checkout=document.querySelector('#cart-drawer .border-t-4');if(!checkout)return;
 const styles=document.createElement('style');
 styles.textContent='#avj-paypal,#avj-crypto{display:none!important}#avj-ui[hidden],#avj-ui [hidden]{display:none!important}#avj-ui{background:#faf5ff;border:3px solid #7b2cbf;border-radius:12px;padding:15px;box-shadow:4px 4px #281338;margin:12px 0;font:12px/1.7 Poppins,system-ui;color:#2f1d3e}#avj-ui .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}#avj-ui .option{border:2px solid #bd9edc;border-radius:10px;padding:12px 5px;background:#fff;color:#38204c;cursor:pointer;font-weight:800;min-height:78px}#avj-ui .option.chosen{background:#ede1ff;border-color:#7b2cbf;box-shadow:inset 0 0 0 1px #7b2cbf}#avj-ui button:focus-visible{outline:3px solid #facc15}#avj-ui .details{background:white;border:2px solid #d5b7e9;border-radius:10px;padding:13px;margin:10px 0}#avj-ui .line{display:flex;justify-content:space-between;flex-wrap:wrap;gap:5px;margin:7px 0}#avj-ui .total{font-size:15px;color:#621ca4;font-weight:900;border-top:1px solid #ddd;padding-top:8px}#avj-ui .wallets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#avj-ui .wallets .option{min-height:57px;font-size:11px}#avj-ui .copy{background:#7b2cbf;color:#fff;border:2px solid #281338;padding:9px 12px;border-radius:7px;cursor:pointer;font-weight:800}#avj-ui .address{word-break:break-all;font:12px ui-monospace,monospace;background:#f4ebfa;padding:11px;border-radius:8px}#avj-ui .hint{font-size:11px;color:#62506f}#avj-ui select{padding:8px;border:2px solid #7b2cbf;border-radius:8px;max-width:100%}';
 styles.textContent += `#avj-ui,#avj-ui button,#avj-ui label,#avj-ui strong,#avj-ui p,#avj-ui span,#avj-ui a{font-family:'Press Start 2P',monospace!important;line-height:2.05;letter-spacing:0}#cart-drawer{max-width:100vw;min-width:0}#avj-ui{min-width:0;max-width:100%;overflow:hidden;overflow-wrap:anywhere;word-break:normal}#avj-ui *,#avj-ui *::before,#avj-ui *::after{box-sizing:border-box;min-width:0;max-width:100%;overflow-wrap:anywhere}#avj-ui .two,#avj-ui .wallets{width:100%;min-width:0}#avj-ui .option{white-space:normal;overflow-wrap:anywhere;word-break:normal;font-size:clamp(7px,1.7vw,9px);line-height:1.9;padding:10px 5px}#avj-ui .line{align-items:flex-start}#avj-ui .line>span,#avj-ui .line>b{max-width:100%;overflow-wrap:anywhere}#avj-ui .total{font-size:clamp(9px,1.9vw,11px)}#avj-ui .copy{white-space:normal;overflow-wrap:anywhere}#avj-ui .address{overflow-wrap:anywhere;word-break:break-all;font-family:ui-monospace,Consolas,monospace!important}#avj-ui a{display:inline-block;overflow-wrap:anywhere}@media(max-width:380px){#avj-ui{padding:9px}#avj-ui .details{padding:8px}#avj-ui .wallets{gap:4px}#avj-ui .wallets .option{padding:8px 2px;font-size:7px}}#avj-ui .hint{font-size:8px}#avj-ui .option{font-size:9px}#avj-ui .total{font-size:11px}#avj-ui .address{font-family:ui-monospace,Consolas,monospace!important;font-size:12px;line-height:1.6}`;document.head.append(styles);
 panel=document.createElement('section');panel.id='avj-ui';panel.hidden=true;panel.setAttribute('aria-label','Pago internacional');
 panel.innerHTML='<div style="font-size:15px;color:#6827ad;font-weight:900">🌎 Pago internacional</div><p class="hint">1. Envía el pedido por WhatsApp. 2. Confirma el total. 3. Continúa con el pago.</p><div class="two"><button class="option" type="button" data-avj-method="paypal" aria-pressed="false"><img width="24" height="24" alt="" style="vertical-align:middle;object-fit:contain" src="https://www.paypalobjects.com/webstatic/icon/pp258.png"> PayPal</button><button class="option" type="button" data-avj-method="crypto" aria-pressed="false"><span style="font-size:21px">₿</span> Criptomoneda</button></div><p id="avj-ui-empty" class="hint">Selecciona PayPal o Criptomoneda para ver las instrucciones.</p><div class="details" id="avj-ui-paypal" hidden><strong style="color:#003087;font-size:15px">PayPal · International PayPal Payment</strong><p class="hint">Primero confirma el pedido. Para el pago usa productos y servicios cuando corresponda.</p><div class="line"><span>Base price</span><b id="avj-ui-base"></b></div><div class="line"><span>PayPal fee</span><b id="avj-ui-fee"></b></div><div class="line total"><span>Total to send via PayPal</span><b id="avj-ui-total"></b></div><p style="font-weight:800;word-break:break-all">luispluajj@gmail.com</p><button class="copy" type="button" id="avj-ui-copy-paypal">Copiar correo</button> <a href="https://www.paypal.com/" target="_blank" rel="noopener">Abrir PayPal</a></div><div class="details" id="avj-ui-crypto" hidden><strong style="font-size:15px">Criptomonedas · Sin recargo AVJ</strong><div class="line total"><span>Precio base</span><b id="avj-ui-crypto-total"></b></div><p class="hint">El importe exacto en criptomoneda se confirma por WhatsApp. La red o plataforma de cambio puede cobrar una tarifa propia.</p><div class="wallets"><button class="option" type="button" data-avj-coin="usdt">USDT · Tether</button><button class="option" type="button" data-avj-coin="btc">BTC · Bitcoin</button><button class="option" type="button" data-avj-coin="ltc">LTC · Litecoin</button></div><div id="avj-ui-wallet" hidden><p><b id="avj-ui-coin-title"></b></p><p id="avj-ui-address" class="address"></p><p id="avj-ui-network" class="hint"></p><button class="copy" type="button" id="avj-ui-copy-wallet">Copiar dirección</button></div></div><p id="avj-ui-notice" class="hint" aria-live="polite"></p><button type="button" class="copy" style="width:100%;background:#16a34a" id="avj-ui-order">1. Enviar pedido por WhatsApp 💬</button>';
 checkout.prepend(panel);
 
 panel.querySelectorAll('[data-avj-method]').forEach(b=>b.addEventListener('click',()=>{choice=b.dataset.avjMethod;coin='';notice('');draw()}));
 panel.querySelectorAll('[data-avj-coin]').forEach(b=>b.addEventListener('click',()=>{coin=b.dataset.avjCoin;notice('');draw()}));
 panel.querySelector('#avj-ui-copy-paypal').addEventListener('click',()=>copy(paypalEmail));
 panel.querySelector('#avj-ui-copy-wallet').addEventListener('click',()=>coin&&copy(addresses[coin]));
 panel.querySelector('#avj-ui-order').addEventListener('click',sendOrder);
 const prevUpdate=window.updateCartUI;if(prevUpdate)window.updateCartUI=function(){const result=prevUpdate.apply(this,arguments);draw();return result};
 const prevCheckout=window.checkoutWhatsApp;if(prevCheckout)window.checkoutWhatsApp=function(){if(international())return sendOrder();return prevCheckout.apply(this,arguments)};
 window.addEventListener('avj:region',draw);
 draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();