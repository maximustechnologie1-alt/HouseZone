# Base de données HouseZone (Supabase)

## Mise en route

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécute dans l'ordre :
   - `migrations/0001_init.sql` — tables, enums, triggers, RLS
   - `migrations/0002_storage.sql` — buckets de stockage + policies
3. Copie `.env.example` vers `.env.local` à la racine du projet et renseigne :
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (idem, **jamais** exposée au navigateur)
4. Crée un premier compte admin : inscris-toi normalement sur `/inscription`,
   puis dans SQL Editor : `update profiles set role = 'admin' where email = 'toi@exemple.com';`

## Vue d'ensemble du schéma

- **profiles** — un enregistrement par utilisateur (créé automatiquement à
  l'inscription via le trigger `handle_new_user`), porte le rôle
  (`client` / `host` / `admin`) et le statut du compte.
- **host_profiles** + **verification_documents** — dossier professionnel d'un
  Hôte (type, société, documents privés) et son statut de vérification.
- **cities / neighborhoods / property_categories / languages** — taxonomies
  éditables depuis l'administration.
- **listings** + **listing_images** — les annonces et leurs photos, avec un
  statut de cycle de vie complet (brouillon → en_attente → active → …).
- **favorites**, **visit_requests**, **search_alerts** — interactions client.
- **conversations** + **messages** — messagerie interne Client ↔ Hôte, avec
  filtrage anti-contournement appliqué côté serveur avant insertion.
- **subscription_plans / subscriptions / payments / receipts** — modèle
  économique (abonnements Hôtes, paiements, reçus).
- **bookings** — réservations de logements meublés autorisés.
- **notifications** / **push_subscriptions** — notifications internes + Web Push.
- **reports / sanctions / audit_logs** — modération, anti-fraude, traçabilité.

Toutes les tables ont des policies RLS strictes : un utilisateur ne voit que
ses propres données (ou les données publiques), un Hôte ne voit pas les
documents ou conversations d'un autre Hôte, un Admin voit tout. Voir les
commentaires dans `0001_init.sql` pour le détail par table.

## Régénérer les types TypeScript

Une fois le projet Supabase connecté :

```bash
npx supabase gen types typescript --project-id <id> > lib/types/database.ts
```

En attendant, `lib/types/database.ts` contient des types écrits à la main qui
reflètent ce schéma.
