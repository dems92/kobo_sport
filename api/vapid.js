// Donne la clé publique VAPID au navigateur pour l'abonnement aux notifications.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
};
