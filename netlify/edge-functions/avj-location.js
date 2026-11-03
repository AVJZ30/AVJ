export default async function handler(request, context) {
  const country = context.geo?.country?.code || null;
  return new Response(JSON.stringify({country}), {
    status: 200,
    headers: {'content-type':'application/json; charset=utf-8','cache-control':'private, no-store'}
  });
}
export const config = { path: '/api/avj-location' };
