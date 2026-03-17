const SUPABASE_URL = 'https://ihcnwuaxcylbivuvzubz.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,prefer,x-client-info,accept,accept-profile,content-profile,x-upsert,range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const pathArr = Array.isArray(req.query.path) ? req.query.path : [req.query.path || ''];
  const path = pathArr.join('/');

  const q = new URLSearchParams();
  Object.entries(req.query).forEach(([k, v]) => {
    if (k === 'path') return;
    Array.isArray(v) ? v.forEach(x => q.append(k, x)) : q.set(k, v);
  });

  const qs = q.toString();
  const target = `${SUPABASE_URL}/${path}${qs ? '?' + qs : ''}`;

  const fwdHeaders = {};
  ['authorization','apikey','content-type','prefer','x-client-info','accept','accept-profile','content-profile','x-upsert','range'].forEach(h => {
    const v = req.headers[h];
    if (v) fwdHeaders[h] = Array.isArray(v) ? v[0] : v;
  });

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined;

  try {
    const resp = await fetch(target, { method: req.method, headers: fwdHeaders, body });
    const text = await resp.text();
    const ct = resp.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    const cr = resp.headers.get('content-range');
    if (cr) res.setHeader('Content-Range', cr);
    return res.status(resp.status).send(text);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: String(err) });
  }
}