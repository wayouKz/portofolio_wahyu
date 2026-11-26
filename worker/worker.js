/**
 * Cloudflare Worker — menyimpan pesan guestbook ke messages.json di repo GitHub.
 *
 * Environment (Settings → Variables):
 *   GITHUB_TOKEN   (Secret)  fine-grained PAT, akses HANYA repo ini, permission Contents: Read & Write
 *   GH_REPO        wayouKz/portofolio_wahyu
 *   GH_BRANCH      main
 *   ALLOWED_ORIGIN https://wayoukz.github.io        (tanpa slash di akhir)
 *   MODERATE       "true" = pesan baru approved:false sampai kamu setujui manual
 *
 * Opsional: KV namespace "RATE" untuk batas 5 pesan / jam / IP.
 */
const FILE = 'messages.json';
const MAX_KEEP = 300;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) return json({ error: 'Origin tidak diizinkan' }, 403);

    let body;
    try { body = await req.json(); } catch { return json({ error: 'Body tidak valid' }, 400); }
    if (body.website) return json({ ok: true });                       // honeypot

    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    const text = String(body.text || '').replace(/[ \t]+/g, ' ').trim().slice(0, 280);
    if (!name || !text) return json({ error: 'Nama dan pesan wajib diisi' }, 400);
    if (/https?:\/\/|www\./i.test(text)) return json({ error: 'Link tidak diperbolehkan' }, 400);

    // rate limit per IP (opsional)
    if (env.RATE) {
      const ip = req.headers.get('CF-Connecting-IP') || 'x';
      const key = 'rl:' + ip;
      const n = parseInt((await env.RATE.get(key)) || '0', 10);
      if (n >= 5) return json({ error: 'Terlalu banyak pesan, coba lagi nanti.' }, 429);
      await env.RATE.put(key, String(n + 1), { expirationTtl: 3600 });
    }

    const api = `https://api.github.com/repos/${env.GH_REPO}/contents/${FILE}`;
    const gh = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-guestbook-worker',
    };
    const pending = env.MODERATE === 'true';
    const entry = {
      id: crypto.randomUUID(),
      name,
      text,
      time: new Date().toISOString(),
      approved: !pending,
    };

    // retry kalau bentrok (409) karena ada pesan lain di saat yang sama
    for (let attempt = 0; attempt < 3; attempt++) {
      const cur = await fetch(`${api}?ref=${env.GH_BRANCH || 'main'}`, { headers: gh });
      let list = [], sha;
      if (cur.ok) {
        const j = await cur.json();
        sha = j.sha;
        try { list = JSON.parse(atobUtf8(j.content)); } catch { list = []; }
        if (!Array.isArray(list)) list = [];
      } else if (cur.status !== 404) {
        return json({ error: 'Gagal membaca data' }, 502);
      }

      list.push(entry);
      list = list.slice(-MAX_KEEP);

      const put = await fetch(api, {
        method: 'PUT',
        headers: { ...gh, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `guestbook: pesan baru dari ${name}`,
          content: btoaUtf8(JSON.stringify(list, null, 2) + '\n'),
          branch: env.GH_BRANCH || 'main',
          ...(sha ? { sha } : {}),
        }),
      });
      if (put.ok) return json({ ok: true, pending });
      if (put.status !== 409 && put.status !== 422) return json({ error: 'Gagal menyimpan pesan' }, 502);
    }
    return json({ error: 'Server sibuk, coba lagi.' }, 503);
  },
};

function atobUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
function btoaUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
