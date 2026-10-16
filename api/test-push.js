// Envoie immédiatement une notification à l'appareil qui la demande (bouton « Envoyer un test »).
const { webpush, vapidReady, validSub, parseBody } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  if (!vapidReady()) return res.status(500).json({ error: 'Clés VAPID manquantes' });
  const { subscription } = parseBody(req);
  if (!validSub(subscription)) return res.status(400).json({ error: 'Abonnement invalide' });
  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: 'KoBo', body: 'Notification de test : le rappel du soir fonctionne.', url: '/?recap=1'
    }), { TTL: 600 });
    res.status(200).json({ ok: true });
  } catch (e) { res.status(502).json({ error: 'Envoi refusé', code: e.statusCode || null }); }
};
