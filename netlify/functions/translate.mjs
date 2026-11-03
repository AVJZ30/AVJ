// Netlify function: translates user-facing website text without exposing credentials.
export default async function handler(request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const key = Netlify.env.get('GOOGLE_TRANSLATE_API_KEY');
  if (!key) return Response.json({ error: 'translation_not_configured' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return Response.json({error:'origin_not_allowed'}, {status:403});
  let payload;
  try { payload=await request.json(); } catch { return Response.json({error:'invalid_json'}, {status:400}); }
  const target=String(payload?.target||'');
  const texts=payload?.texts;
  const allowed=new Set(['en','es','pt','fr','de','it','ja','nl','zh-CN','ko','tr']);
  if (!allowed.has(target) || !Array.isArray(texts) || !texts.length || texts.length>40 ||
      texts.some(v=>typeof v!=='string'||v.length>4000) ||
      texts.reduce((n,v)=>n+v.length,0)>12000) return Response.json({error:'invalid_payload'}, {status:400});
  try {
    const params=new URLSearchParams({key,source:'es',target,format:'text'});
    texts.forEach(v=>params.append('q',v));
    const r=await fetch('https://translation.googleapis.com/language/translate/v2', {
      method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},
      body:params.toString(),signal:AbortSignal.timeout(18000)
    });
    if(!r.ok){console.error('AVJ translation provider status',r.status);return Response.json({error:'provider_unavailable'},{status:502});}
    const data=await r.json();
    const translations=data?.data?.translations?.map(t=>String(t.translatedText||''))||[];
    if(translations.length!==texts.length)return Response.json({error:'invalid_provider_response'},{status:502});
    return Response.json({translations},{headers:{'cache-control':'private, max-age=1800'}});
  } catch (e) { console.error('Translation request failed',e?.message);return Response.json({error:'translation_unavailable'}, {status:502}); }
}
