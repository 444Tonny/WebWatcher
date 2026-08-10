# Contexte — WebWatcher

Application de surveillance de disponibilité de sites web.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS v4, Prisma 7 (driver adapter `@prisma/adapter-pg`), PostgreSQL (Supabase).

## Modèle de données (`prisma/schema.prisma`)

- `Site` — un site suivi (nom, URL, statut, dernier temps de réponse, dernière vérification).
- `CheckResult` — une vérification (timestamp, statut, temps de réponse, code HTTP), liée à un `Site`.
- `SiteError` — détail d'une erreur (type, message complet), liée 1-1 à un `CheckResult` en échec.
- `Settings` — ligne unique (`id: "global"`) : fréquence de vérification, activation des notifications, liste de Chat IDs Telegram.

## Routes

### Pages

- `/` — landing page (CTA vers `/dashboard`).
- `/dashboard` — liste et gestion des sites (recherche, ajout/modif/suppression via popups, graphique de disponibilité, vérifier un site ou tous).
- `/sites/[id]` — détails et historique d'un site.
- `/settings` — réglages globaux, sauvegarde immédiate (pas de bouton "Enregistrer").

### API

- `GET/POST /api/sites`, `GET/PUT/DELETE /api/sites/[id]`
- `GET /api/sites/[id]/checks?page=N` — historique paginé (30/page)
- `GET/POST /api/cron` (`?force=true`, `?siteId=xxx`) — déclenche les vérifications
- `GET/PUT /api/settings`

## Automatisation (n8n)

Pas de cron interne côté serveur : les vérifications périodiques et les notifications sont pilotées par un workflow **n8n externe**.

```
Schedule Trigger → POST /api/cron?force=true
                 → si un site est "offline" et GET /api/settings.notifyOnError = true
                 → Telegram (un message par Chat ID dans telegramChatIds)
```

n8n possède son propre bot token Telegram (dans ses credentials) — l'application ne contient et n'appelle jamais directement l'API Telegram.

## Détection d'erreurs (`lib/checkSite.ts`)

Types distingués : `timeout`, `dns`, `ssl`, `connection`, `http`, `unknown` (avec message détaillé dans ce dernier cas).

## Décisions notables

- Jamais de cron interne (node-cron, `setInterval` serveur, etc.) : c'est le rôle de n8n.
- Jamais de token/SDK Telegram côté app.
- `DATABASE_URL` doit utiliser le connection **pooler** Supabase (`aws-0-<region>.pooler.supabase.com`), pas l'host direct `db.<ref>.supabase.co` qui est IPv6-only et injoignable sur certains réseaux.
- Design : thème sombre fixe (pas de bascule clair/sombre), police Kumbh Sans, accent indigo ; rouge/vert réservés au statut online/offline (pas réutilisés ailleurs).
