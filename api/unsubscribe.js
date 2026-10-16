const { redis, KEY, parseBody } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const { endpoint } = parseBody(req);
  if (typeof endpoint !== 'string') return res.status(400).json({ error: 'endpoint manquant' });
  try { await redis.hdel(KEY, endpoint); res.status(200).json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'Stockage indisponible' }); }
};
