// Outils communs : base Redis (Upstash) et Web Push.
// Seuls les abonnements aux notifications sont stockés ici, aucune donnée d'entraînement.
const { Redis } = require('@upstash/redis');
const webpush = require('web-push');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
const KEY = 'kobo:subs';

function vapidReady() {
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@kobo.app', pub, priv);
  return true;
}
function validSub(s) {
  return s && typeof s.endpoint === 'string' && s.endpoint.startsWith('https://') && s.keys && s.keys.p256dh && s.keys.auth;
}
function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (_) { return {}; }
}
module.exports = { redis, webpush, KEY, vapidReady, validSub, parseBody };
