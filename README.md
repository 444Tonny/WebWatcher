# WebWatcher

Application de surveillance de sites web développée avec **Next.js, TypeScript, Tailwind CSS, Prisma 7 et PostgreSQL (Supabase)**.

Pour chaque site surveillé, l'utilisateur peut connaître :

- son statut (Online / Offline) ;
- son temps de réponse ;
- la date de sa dernière vérification ;
- son historique de vérifications ;
- le détail des erreurs rencontrées.

## Fonctionnement

Chaque site (`Site`) peut être vérifié manuellement, et l'ensemble des sites est vérifié périodiquement (fréquence ajustable dans `/settings`).

Chaque vérification crée un `CheckResult` et met à jour le site correspondant. En cas d'échec, un `SiteError` est créé avec le type d'erreur détecté :

- `timeout` ;
- `dns` ;
- `ssl` ;
- `connexion` ;
- `http` ;
- `inconnue` (avec message d'erreur détaillé).

## Architecture

| Chemin | Rôle |
| --- | --- |
| `/dashboard` | Liste et gestion des sites |
| `/sites/[id]` | Détails et historique d'un site |
| `/settings` | Fréquence de vérification et configuration Telegram |
| `/api/*` | API backend |
| `lib/checkSite.ts` | Logique de vérification d'un site |
| `components/` | Composants réutilisables |

## Automatisation (n8n)

Les vérifications automatiques et les notifications sont gérées par **n8n**, pas par une tâche cron côté serveur.

```
Schedule Trigger → /api/cron → IF offline → /api/settings/telegram → Telegram
```

L'application ne communique **jamais** directement avec Telegram et ne contient aucun bot token : celui-ci reste dans les credentials n8n. Le chat ID Telegram destinataire est configurable dans `/settings`.

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

Variables d'environnement nécessaires (voir `.env`) : `DATABASE_URL` (connexion pooler Supabase), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
