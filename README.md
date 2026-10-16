# KoBo – mise en ligne sur Vercel

KoBo est une web app installable : les données restent sur le téléphone, le compte
sert à créer des **fichiers de sauvegarde chiffrés**, et un **rappel push** arrive chaque soir.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `manifest.webmanifest` + `icons/` | Nom « KoBo » et logo quand l'app est ajoutée à l'écran d'accueil |
| `sw.js` | Fonctionnement hors ligne + affichage des notifications |
| `api/` | 5 petites fonctions serveur, uniquement pour les notifications |
| `vercel.json` | Rappel programmé chaque soir + en-têtes |
| `package.json` | Les deux bibliothèques utilisées par les fonctions (`web-push`, `@upstash/redis`) |

Aucune donnée d'entraînement ne quitte le téléphone. Le serveur ne garde que les
« adresses » de notification des appareils qui ont activé le rappel.

## 1. Mettre en ligne (15 min)

1. Crée un compte gratuit sur **vercel.com** (le plus simple : avec GitHub).
2. Mets ce dossier dans un dépôt GitHub (github.com → New repository → « uploading an existing file » → glisse tout le contenu du dossier).
3. Sur Vercel : **Add New → Project → Import** ton dépôt → **Deploy**. Aucun réglage à changer.
4. Ton app est en ligne sur une adresse du type `kobo-xxx.vercel.app`.

À ce stade, tout fonctionne sauf le rappel du soir.

## 2. Activer le rappel du soir (10 min)

**a. La base des abonnements**
Vercel → ton projet → **Storage** → **Create** / **Marketplace** → **Upstash Redis** (offre gratuite) → relie-la au projet.
Les variables de connexion sont ajoutées toutes seules.

**b. Les clés de notification (VAPID)**
Sur ton ordinateur, avec Node.js installé (nodejs.org), dans un terminal :
```
npx web-push generate-vapid-keys
```
Tu obtiens une *Public Key* et une *Private Key*.

**c. Les variables d'environnement**
Vercel → ton projet → **Settings → Environment Variables**, ajoute :

| Nom | Valeur |
|---|---|
| `VAPID_PUBLIC_KEY` | la Public Key |
| `VAPID_PRIVATE_KEY` | la Private Key |
| `VAPID_SUBJECT` | `mailto:ton@email.fr` |
| `CRON_SECRET` | une longue phrase au hasard (16 caractères ou plus) |

**d. Redéploie** : onglet **Deployments** → les trois points du dernier déploiement → **Redeploy**.

Le rappel part à **19 h UTC**, soit 21 h à Paris en été et 20 h en hiver. Sur l'offre
gratuite de Vercel, il peut arriver n'importe quand dans l'heure. Pour changer l'heure,
modifie `"0 19 * * *"` dans `vercel.json` (format : minute heure * * *, en UTC).

## 3. Installer sur le téléphone

- **iPhone** : ouvre l'adresse dans **Safari** → bouton Partager → **Sur l'écran d'accueil**.
  Ouvre ensuite KoBo depuis l'icône : les notifications ne marchent sur iPhone que depuis l'app installée (iOS 16.4 ou plus).
- **Android** : ouvre l'adresse dans **Chrome** → menu ⋮ → **Installer l'application**.

Puis dans KoBo : **Profil → Activer le rappel du soir → Envoyer un test**.

## 4. Sauvegardes

- **Profil → Sauvegarder** crée un fichier `kobo-sauvegarde-AAAA-MM-JJ.kobo`, chiffré avec ton mot de passe.
  Range-le dans Fichiers / iCloud Drive / Google Drive ou envoie-le-toi par e-mail.
- Sur un nouveau téléphone : écran de départ → **J'ai une sauvegarde** → fichier + e-mail + mot de passe.
- KoBo rappelle de sauvegarder si la dernière sauvegarde a plus de 7 jours.
- **Clé de secours.** À la création du compte, KoBo affiche une clé du type `KOBO-XXXX-XXXX-XXXX-XXXX-XXXX`.
  Note-la à part (papier, gestionnaire de mots de passe) : elle ne s'affiche qu'une fois.

## 5. Mot de passe oublié

- **Sur un nouveau téléphone** : J'ai une sauvegarde → **Mot de passe oublié ?** → fichier `.kobo` + e-mail + clé de secours
  + nouveau mot de passe. Tout est restauré et une nouvelle clé de secours est affichée.
- **Sur ton téléphone actuel** : Profil → Sécurité du compte → **Changer de mot de passe** → « Je l'ai oublié » → clé de secours.
- Fais une nouvelle sauvegarde après un changement de mot de passe ou de clé.
- Sans mot de passe **ni** clé de secours, une sauvegarde ne peut pas être ouverte : aucun serveur ne garde de copie, c'est ce qui protège tes données.
- Les comptes créés avant cette mise à jour voient un bandeau « Crée ta clé de secours » sur l'accueil.

## Mettre à jour l'app

Remplace les fichiers dans GitHub : Vercel redéploie tout seul. Si tu modifies `index.html`,
change aussi `const CACHE = 'kobo-v7'` dans `sw.js` (par ex. `kobo-v8`) pour que les téléphones prennent la nouvelle version.
