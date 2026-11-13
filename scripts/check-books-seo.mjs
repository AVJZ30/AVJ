// Detect new or edited public books and rebuild Netlify only when the catalog changes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const home=await readFile('html/index.html','utf8');
const url=home.match(/const SUPABASE_URL = "([^"]+)"/)?.[1];
const key=home.match(/const SUPABASE_ANON_KEY = "([^"]+)"/)?.[1];
if(!url||!key)throw new Error('Missing public Supabase catalog configuration');
const books=[];
for(let offset=0;;offset+=500){
 const q=new URLSearchParams({select:'id,titulo,categoria,img,contenido,valor',order:'id.asc',limit:'500',offset:String(offset)});
 const response=await fetch(url+'/rest/v1/digital_productos?'+q,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Public book catalog fetch failed: '+response.status);
 const batch=await response.json();
 books.push(...batch.filter(b=>String(b.categoria||'').toLowerCase().includes('libro')));
 if(batch.length<500)break;
}
const checksum=createHash('sha256').update(JSON.stringify(books.sort((a,b)=>String(a.id).localeCompare(String(b.id))))).digest('hex');
await mkdir('seo',{recursive:true});
await writeFile('seo/books-catalog.sha256',checksum+'\n');
console.log('Checked '+books.length+' public books for SEO updates.');
