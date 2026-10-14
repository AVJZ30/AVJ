// Build with the same public access as the website; never use a service-role key.
import { readFile, readdir, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import vm from 'node:vm';

const home = await readFile('index.html', 'utf8');
const plans = await readFile('planes.html', 'utf8');
const url = home.match(/const SUPABASE_URL = "([^"]+)"/)[1];
const key = home.match(/const SUPABASE_ANON_KEY = "([^"]+)"/)[1];

async function rows(table, select, order) {
  const result = [];
  for (let offset = 0; ; offset += 500) {
    const query = new URLSearchParams({ select, order, limit: '500', offset: String(offset) });
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error(`Catalog fetch failed: ${table} (${response.status})`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error(`Invalid catalog: ${table}`);
    result.push(...batch);
    if (batch.length < 500) return result;
  }
}

const [products, platforms, accounts, profiles] = await Promise.all([
  rows('products', 'id,name,category,spec,price,stock,img,offer', 'created_at.desc,id.asc'),
  rows('planes_plataformas', 'id,nombre,precio,imagen_url', 'created_at.desc,id.asc'),
  rows('planes_cuentas', 'id,plataforma_id,numero_cuenta,slots_totales', 'created_at.asc,id.asc'),
  rows('planes_perfiles', 'id,cuenta_id,posicion,telefono', 'posicion.asc,id.asc')
]);

// Persist only masked phone numbers, never the original reservation data.
for (const profile of profiles) {
  profile.telefono = profile.telefono
    ? (String(profile.telefono).length >= 7
      ? `${String(profile.telefono).slice(0, 4)}***${String(profile.telefono).slice(-3)}`
      : '***')
    : null;
}
const plataformas = platforms.map(p => ({ ...p, cuentas: accounts
  .filter(c => c.plataforma_id === p.id)
  .map(c => {
    const children = profiles.filter(pf => pf.cuenta_id === c.id);
    const ocupados = children.filter(pf => pf.telefono).length;
    return { ...c, perfiles: children, ocupados, restantes: c.slots_totales - ocupados };
  })
}));

// Reuse the existing card renderers so static and live layouts stay identical.
function functionSource(source, name) {
  const start = source.indexOf(`        function ${name}(`);
  if (start < 0) throw new Error(`Missing renderer: ${name}`);
  const end = source.indexOf('\n        }', start);
  if (end < 0) throw new Error(`Incomplete renderer: ${name}`);
  return source.slice(start, end + '\n        }'.length);
}
function render(source, data, kind) {
  // Escape database text for the existing HTML templates. IDs are interpolated
  // into inline handlers and must contain only safe identifier characters.
  function safe(value, field = '') {
    if (Array.isArray(value)) return value.map(v => safe(v));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, safe(v,k)]));
    if (typeof value !== 'string') return value;
    if ((field === 'id' || field.endsWith('_id')) && !/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('Invalid catalog identifier');
    if ((field === 'img' || field === 'imagen_url') && !/^https?:\/\//i.test(value)) return '';
    return value.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  }
  data = safe(data);
  const elements = new Map();
  const context = {
    products: data, plataformas: data,
    currentCategoryFilter: 'all', currentBrandFilter: 'all',
    URLSearchParams, window: { location: { search: '' } },
    document: { getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: '', classList: { add() {}, remove() {} }
      });
      return elements.get(id);
    }}
  };
  const names = kind === 'products' ? ['formatSpec', 'renderProducts'] : ['maskPhone', 'renderPlataformas'];
  vm.runInNewContext(names.map(n => functionSource(source, n)).join('\n') + `\n${names.at(-1)}();`, context, { timeout: 10000 });
  return elements.get(kind === 'products' ? 'product-grid' : 'plataformas-container').innerHTML;
}

function page(source, data, kind) {
  const id = kind === 'products' ? 'product-grid' : 'plataformas-container';
  const markup = render(source, data, kind);
  const safeJSON = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  let output = source.replace('<!-- AVJ_BUILD_DATA -->', `<script>window.__AVJ_CATALOG__ = ${safeJSON};</script>`);
  const pattern = new RegExp(`(<div id="${id}"[^>]*>)(</div>)`);
  if (!pattern.test(output)) throw new Error(`Missing static container: ${id}`);
  output = output.replace(pattern, (_, open, close) => open + markup + close);
  output = output.replace('id="loading-status" class="', 'id="loading-status" class="hidden ');
  if (!data.length) output = output.replace('id="empty-status" class="hidden ', 'id="empty-status" class="');
  return output;
}

// Fetch and render successfully before replacing output. A failed build leaves
// Netlify's previous successful deploy intact.
const outputHome = page(home, products, 'products');
const outputPlans = page(plans, plataformas, 'plans');
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const entry of await readdir('.', { withFileTypes: true })) {
  if (entry.isFile() && !entry.name.startsWith('.') && entry.name !== 'netlify.toml') {
    await copyFile(entry.name, `dist/${entry.name}`);
  }
}
await writeFile('dist/index.html', outputHome);
await writeFile('dist/planes.html', outputPlans);
console.log(`Built catalog: ${products.length} products, ${plataformas.length} platforms.`);
