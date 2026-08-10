# WebWatcher

Application de surveillance de sites web développée avec **Next.js, TypeScript, Tailwind CSS, Prisma 7 et PostgreSQL (Supabase)**.

Pour chaque site suivi : statut (Online/Offline), temps de réponse, dernière vérification, historique complet des vérifications, et détail des erreurs rencontrées.

## Fonctionnalités

- **`/`** — Page d'accueil (mini landing page, CTA vers le dashboard).
- **`/dashboard`** — Liste des sites (recherche, ajout, modification, suppression), graphique de disponibilité (50 dernières vérifications), vérification manuelle d'un site ou de tous.
- **`/sites/[id]`** — Détails d'un site : infos générales, graphique de disponibilité (100 dernières vérifications), historique paginé (30/page) avec le détail complet de chaque erreur.
- **`/settings`** — Fréquence de vérification (1/5/15/30 min) et notifications Telegram (activer/désactiver, gestion des Chat IDs) ; sauvegarde immédiate, pas de bouton "Enregistrer".

## Fonctionnement

Chaque site (`Site`) peut être vérifié manuellement, et l'ensemble des sites est vérifié périodiquement (fréquence configurée dans `/settings`, déclenchée par n8n — voir plus bas).

Chaque vérification crée un `CheckResult` et met à jour le site correspondant. En cas d'échec, un `SiteError` est créé avec le type d'erreur détecté (`lib/checkSite.ts`) :

- `timeout`
- `dns`
- `ssl`
- `connection`
- `http`
- `unknown` (avec message d'erreur détaillé)

## Architecture

| Chemin | Rôle |
| --- | --- |
| `/` | Page d'accueil |
| `/dashboard` | Liste et gestion des sites |
| `/sites/[id]` | Détails et historique d'un site |
| `/settings` | Fréquence de vérification et configuration Telegram |
| `/api/sites`, `/api/sites/[id]` | CRUD des sites |
| `/api/sites/[id]/checks` | Historique paginé des vérifications d'un site |
| `/api/cron` | Déclenche les vérifications (voir n8n) |
| `/api/settings` | Lecture/écriture des réglages globaux |
| `lib/checkSite.ts` | Logique de vérification d'un site |
| `lib/site-monitoring.ts` | Sélection des sites à vérifier + persistance des résultats |
| `components/` | Composants réutilisables |

## Automatisation (n8n)

Les vérifications automatiques et les notifications sont gérées par **n8n**, pas par une tâche cron côté serveur :

```
Schedule Trigger → POST /api/cron?force=true
                 → si un site repasse "offline" et que GET /api/settings a notifyOnError = true
                 → Telegram (un message par Chat ID dans telegramChatIds)
```

`/api/cron` accepte aussi `GET`/`POST` sans paramètre (uniquement les sites dont l'intervalle est dépassé) ou `?siteId=xxx` (un seul site, immédiat).

L'application ne communique **jamais** directement avec Telegram et ne contient aucun bot token : celui-ci reste dans les credentials n8n. Les Chat IDs destinataires sont configurables dans `/settings`.

## Getting Started

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Base de données

```bash
npx prisma generate     # génère le client Prisma
npx prisma migrate dev  # applique les migrations
npx prisma db seed      # seed la base (5 sites d'exemple)
```

Variables d'environnement nécessaires (voir `.env`) : `DATABASE_URL` (connexion **pooler** Supabase — le endpoint direct `db.<ref>.supabase.co` est IPv6-only et ne fonctionne pas sur tous les réseaux), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### QA

La commande Claude Code `/qa` (voir `.claude/commands/qa.md`) fait une passe de QA complète : build, typecheck, lint, puis parcours de toutes les pages dans un vrai navigateur (CRUD, responsive, erreurs console).
