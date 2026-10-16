const { redis, KEY, validSub, parseBody } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const { subscription } = parseBody(req);
  if (!validSub(subscription)) return res.status(400).json({ error: 'Abonnement invalide' });
  try {
    await redis.hset(KEY, { [subscription.endpoint]: JSON.stringify(subscription) });
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Stockage indisponible' }); }
};
