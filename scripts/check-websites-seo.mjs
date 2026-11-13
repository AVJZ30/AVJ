// Check the public website portfolio and trigger rebuild only when it changes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const home=await readFile('html/index.html','utf8');
const url=home.match(/const SUPABASE_URL = "([^"]+)"/)?.[1];
const key=home.match(/const SUPABASE_ANON_KEY = "([^"]+)"/)?.[1];
if(!url||!key)throw Error('Missing public Supabase configuration');
const entries=[];
for(let offset=0;;offset+=500){
 const params=new URLSearchParams({select:'id,titulo,url,descripcion,categoria,favicon_url,publicado',order:'id.asc',limit:'500',offset:String(offset)});
 const response=await fetch(url+'/rest/v1/avj_websites?'+params,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Website portfolio fetch failed: '+response.status);
 const batch=await response.json();
 entries.push(...batch);
 if(batch.length<500)break;
}
const checksum=createHash('sha256').update(JSON.stringify(entries)).digest('hex');
await mkdir('seo',{recursive:true});
await writeFile('seo/websites-catalog.sha256',checksum+'\n');
console.log('Checked '+entries.length+' published websites for SEO updates');
