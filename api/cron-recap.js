// Appelé chaque soir par Vercel Cron (voir vercel.json). Envoie le rappel « récap du jour ».
const { redis, webpush, KEY, vapidReady } = require('./_lib');

const MESSAGES = [
  'Comment s\u2019est passée ta journée sportive ? Note ta séance ou débriefe ton combat en 30 secondes.',
  'Récap du jour : salle, tapis ou repos ? Dis-le à KoBo pour adapter ta prochaine séance.',
  'Ton entraînement d\u2019aujourd\u2019hui compte pour demain. Fais ton récap.',
  'Petit débrief avant de dormir ? Intensité, ressentis, douleurs : KoBo s\u2019adapte.'
];

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Non autorisé' });
  if (!vapidReady()) return res.status(500).json({ error: 'Clés VAPID manquantes' });
  const all = (await redis.hgetall(KEY)) || {};
  const body = MESSAGES[new Date().getUTCDate() % MESSAGES.length];
  const payload = JSON.stringify({ title: 'KoBo', body, url: '/?recap=1' });
  let sent = 0, removed = 0;
  await Promise.allSettled(Object.entries(all).map(async ([endpoint, raw]) => {
    const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
    try { await webpush.sendNotification(sub, payload, { TTL: 4 * 3600 }); sent++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { await redis.hdel(KEY, endpoint); removed++; } }
  }));
  res.status(200).json({ sent, removed });
};
