# HouseZone

Plateforme immobilière Web & PWA pour le Burkina Faso — *Trouvez votre prochain bien.*

Construite selon le cahier des charges (`cdc.md`) avec **Next.js 16 (App Router) +
TypeScript + Tailwind CSS v4 + Supabase**.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### Connecter Supabase

L'application est écrite pour fonctionner avec Supabase (Postgres + Auth + Storage +
RLS) mais n'est pas connectée à un projet par défaut. Pour l'activer :

1. Suivez `supabase/README.md` pour créer le projet et exécuter les migrations.
2. Copiez `.env.example` vers `.env.local` et renseignez les clés.
3. Redémarrez `npm run dev`.

Sans ces variables, les pages qui lisent la base retournent des listes vides plutôt
que de planter — vous pouvez naviguer dans l'interface avant même d'avoir connecté
Supabase.

## Structure

```
app/
  (site)/          Espace public + Client (accueil, recherche, biens, favoris,
                    visites, avis de recherche, messages, notifications, profil)
  (auth)/          Inscription, connexion, mot de passe oublié
  espace-hote/      Dashboard Hôte (annonces, visites, messages, abonnement...)
  admin/            Administration HouseZone (connexion 2FA + dashboard)
components/         Composants réutilisables (ui/, listings/, host/, admin/, ...)
lib/
  actions/          Server Actions (mutations) par domaine métier
  data/             Fonctions de lecture Supabase par domaine
  supabase/         Clients Supabase (browser, server, admin, proxy)
  types/database.ts Types TypeScript reflétant le schéma SQL
  messaging/        Filtre anti-contournement de la messagerie
  moderation/        Filtre anti-publicité des avis de recherche
  ocr/              Analyse OCR des photos d'annonce (Tesseract.js)
  payments/         Abstraction fournisseur de paiement (Mobile Money manuel en V1)
supabase/
  migrations/       Schéma SQL complet (tables, RLS, triggers, buckets)
proxy.ts            Middleware Next 16 : rafraîchit la session, protège
                    /espace-hote et /admin par rôle
```

## Choix techniques V1

- **Paiement** : confirmation manuelle (l'utilisateur transfère par Mobile Money puis
  saisit une référence, un admin confirme depuis `/admin/paiements`). Architecture
  pluggable dans `lib/payments/provider.ts` pour brancher CinetPay/PayDunya plus tard.
- **Carte** : OpenStreetMap + Leaflet (gratuit, aucune clé API). `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  reste disponible dans `.env.example` si vous préférez migrer vers Google Maps.
- **OCR** : Tesseract.js côté serveur, remplaçable dans `lib/ocr/analyze.ts`.
- **2FA Admin** : TOTP via Supabase Auth MFA, enrôlement à la première connexion admin.

## Déploiement

Conçu pour Vercel. Pensez à définir les variables d'environnement de `.env.example`
dans les paramètres du projet Vercel avant de déployer.
