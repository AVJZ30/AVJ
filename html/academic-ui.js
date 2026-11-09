(function(){
'use strict';
const offer=[
 {name:'Word',price:3},{name:'Excel',price:3.5},{name:'PowerPoint',price:2},{name:'Imágenes y videos con IA',price:1.75}
];
const currencies={EC:'USD',US:'USD',ES:'EUR',MX:'MXN',CO:'COP',PE:'PEN',CL:'CLP',AR:'ARS',BR:'BRL',GB:'GBP',FR:'EUR',DE:'EUR',IT:'EUR',PT:'EUR',CA:'CAD',DO:'DOP',UY:'UYU',PY:'PYG',BO:'BOB',VE:'VES',CR:'CRC',PA:'USD',GT:'GTQ',HN:'HNL',SV:'USD',NI:'NIO',AU:'AUD',JP:'JPY',CH:'CHF',NL:'EUR',BE:'EUR',IN:'INR',ZA:'ZAR',CN:'CNY',KR:'KRW',TR:'TRY'};
let country='EC',rates=null;
const translations={
 es:{msg:'Hola, quiero solicitar',details:'Detalles de mi solicitud:',country:'País detectado:',confirm:'Primero quiero confirmar las condiciones y el precio antes de pagar.',notice:'Precios base en USD. País detectado automáticamente:',equivalent:'Equivalencia aproximada:'},
 en:{msg:'Hello, I would like to request',details:'My request details:',country:'Detected country:',confirm:'Please confirm the scope and final price before payment.',notice:'Base prices in USD. Country detected automatically:',equivalent:'Approximate conversion:'},
 pt:{msg:'Olá, gostaria de solicitar',details:'Detalhes do pedido:',country:'País detectado:',confirm:'Confirme as condições e o preço final antes do pagamento.',notice:'Preços base em USD. País detectado automaticamente:',equivalent:'Conversão aproximada:'},
 fr:{msg:'Bonjour, je souhaite commander',details:'Détails de ma demande :',country:'Pays détecté :',confirm:'Veuillez confirmer les conditions et le prix final avant le paiement.',notice:'Prix de base en USD. Pays détecté automatiquement :',equivalent:'Conversion approximative :'},
 de:{msg:'Hallo, ich möchte bestellen:',details:'Details meiner Anfrage:',country:'Erkanntes Land:',confirm:'Bitte Umfang und Endpreis vor der Zahlung bestätigen.',notice:'Grundpreise in USD. Land automatisch erkannt:',equivalent:'Ungefähre Umrechnung:'},
 it:{msg:'Ciao, vorrei richiedere',details:'Dettagli della richiesta:',country:'Paese rilevato:',confirm:'Confermate condizioni e prezzo finale prima del pagamento.',notice:'Prezzi base in USD. Paese rilevato automaticamente:',equivalent:'Conversione approssimativa:'},
 ja:{msg:'こんにちは。依頼したいサービス:',details:'依頼内容:',country:'検出された国:',confirm:'お支払い前に内容と最終料金をご確認ください。',notice:'米ドル基本価格。自動検出された国:',equivalent:'おおよその換算額:'},
 ko:{msg:'안녕하세요. 다음 서비스를 신청합니다:',details:'요청 세부 사항:',country:'감지된 국가:',confirm:'결제 전에 최종 조건과 가격을 확인해 주세요.',notice:'USD 기본 가격. 자동 감지된 국가:',equivalent:'대략적인 환산 금액:'},
 'zh-CN':{msg:'您好，我想申请',details:'我的需求详情:',country:'检测到的国家:',confirm:'请在付款前确认服务内容和最终价格。',notice:'美元基本价格。自动检测到的国家:',equivalent:'大致换算金额:'},
 tr:{msg:'Merhaba, talep ettiğim hizmet:',details:'Talep ayrıntıları:',country:'Algılanan ülke:',confirm:'Lütfen ödeme öncesinde koşulları ve son fiyatı doğrulayın.',notice:'USD temel fiyat. Otomatik algılanan ülke:',equivalent:'Yaklaşık karşılığı:'},
 nl:{msg:'Hallo, ik wil aanvragen:',details:'Details van mijn verzoek:',country:'Gedetecteerd land:',confirm:'Bevestig de voorwaarden en de uiteindelijke prijs vóór betaling.',notice:'Basisprijzen in USD. Automatisch gedetecteerd land:',equivalent:'Geschatte omrekening:'}
};
function lang(){const l=window.avjSiteLocale?.language||'es';return translations[l]?l:'en'}
function format(n,code){return new Intl.NumberFormat(lang(),{style:'currency',currency:code}).format(n)}
async function update(){
 const label=document.getElementById('moneda');if(!label)return;
 country=window.avjSiteLocale?.country||country;
 const cur=currencies[country]||'USD',t=translations[lang()];
 let result=t.notice+' '+country+'.';
 if(cur!=='USD'&&rates?.[cur])result+=' '+t.equivalent+' '+offer.map(x=>x.name+': '+format(x.price*rates[cur],cur)).join(' · ')+'.';
 label.textContent=result;
 document.documentElement.lang=window.avjSiteLocale?.language||lang();
}
window.pedido=function(i){
 const data=offer[i],el=document.getElementById('detalle-'+i);
 if(!data||!el)return;
 const message=el.value.trim();
 if(!message){el.focus();const errors={es:'Escribe los detalles de tu solicitud.',en:'Please describe your request.',pt:'Descreva sua solicitação.',fr:'Décrivez votre demande.',de:'Beschreibe deinen Auftrag.',it:'Descrivi la richiesta.'};el.setCustomValidity(errors[lang()]||errors.en);el.reportValidity();el.addEventListener('input',()=>el.setCustomValidity(''),{once:true});return}
 const t=translations[lang()];
 const whats=t.msg+' '+data.name+' ($'+data.price.toFixed(2)+' USD).\n'+t.country+' '+country+'\n'+t.details+'\n'+message+'\n\n'+t.confirm;
 window.open('https://wa.me/593963023351?text='+encodeURIComponent(whats),'_blank','noopener');
};
window.addEventListener('avj:region',update);
async function init(){
 update();
 try{const r=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'default'});if(r.ok){const x=await r.json();rates=x.rates||null;update()}}catch(e){console.warn('Moneda local no disponible',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();