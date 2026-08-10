---
description: QA complet de WebWatcher (pages, CRUD, API, responsive, console) dans un vrai navigateur
---

# QA de WebWatcher

Rôle : faire une passe de QA complète sur l'application, dans un vrai navigateur, et **rapporter** les
problèmes trouvés — ne pas corriger le code pendant cette commande (sauf si l'utilisateur le demande
ensuite explicitement une fois le rapport lu).

## 0. Vérifications statiques (rapide, avant de lancer quoi que ce soit)

```
npx tsc --noEmit
npx eslint src
```

Si l'une des deux échoue, note-le en tête du rapport mais continue quand même la QA fonctionnelle.

## 1. Lancer l'app

- Vérifie d'abord si un serveur `next dev` de **ce** projet tourne déjà (`curl` sur les ports 3000-3005,
  ou `Get-CimInstance Win32_Process` en filtrant sur `WebWatcher` dans la ligne de commande). Réutilise-le
  si trouvé.
- Sinon lance `npm run dev` en arrière-plan et attends qu'il réponde (poll, pas de sleep fixe).
- ⚠️ Ce poste a d'autres projets Next.js qui tournent parfois en parallèle (ex: sur le port 3000) — ne
  jamais utiliser `pkill -f "next dev"` ou équivalent large : ça peut tuer le serveur d'un autre projet.
  Pour arrêter le serveur à la fin, cible uniquement les PID dont la ligne de commande contient
  `WebWatcher` (`Get-CimInstance Win32_Process -Filter "name='node.exe'"` puis `Stop-Process -Id`).
- Pour piloter un navigateur : essaie `chromium-cli` (skill dédié) en premier ; s'il n'est pas installé,
  utilise Playwright depuis un dossier scratch temporaire (`npm init -y && npm install playwright` dans le
  scratchpad, puis un script `.mjs` qui importe `{ chromium } from "playwright"`) — ne pas ajouter
  Playwright comme dépendance du projet.

## 2. Scénarios à couvrir

Pour chaque page testée : capture d'écran, vérifie `console --errors` / les événements `console` de type
`error`, et vérifie qu'il n'y a pas de scroll horizontal
(`document.documentElement.scrollWidth > document.documentElement.clientWidth`).

### Dashboard (`/dashboard`)
- Chargement initial : liste des sites, statuts, temps de réponse, dernière vérification, graphique de
  disponibilité.
- Recherche (filtre par nom/URL, debounce).
- Ajout d'un site (« Tracker un site ») avec une URL réelle (ex: `https://example.com`) : vérifie que la
  vérification initiale se déclenche bien (le site n'affiche pas "Inconnu" après création).
- Modification d'un site (nom + URL) depuis le dashboard.
- Suppression d'un site : confirmation → suppression → liste rafraîchie.
- « Vérifier » sur une carte, et « Vérifier tous les sites ».
- Lien « Détails » → navigue bien vers `/sites/[id]`.

### Détails d'un site (`/sites/[id]`)
- Informations générales, graphique (100 dernières vérifications), historique paginé (30/page) avec
  détail complet de l'erreur si le site est hors ligne.
- Bouton Modifier (même popup que le dashboard).
- Pagination de l'historique si plus de 30 entrées existent.

### Paramètres (`/settings`)
- Changement de fréquence de vérification (1/5/15/30 min) — pas de bouton Enregistrer, ça doit
  persister tout de suite (recharge la page pour vérifier).
- Activation/désactivation des notifications Telegram.
- Ajout d'un Chat ID valide, rejet d'un Chat ID invalide (message d'erreur clair), suppression d'un
  Chat ID.

### API (sanity check via `curl`, en plus du parcours navigateur)
- `GET /api/sites`, `GET /api/sites?search=...`, `POST /api/sites`, `GET/PUT/DELETE /api/sites/[id]`.
- `GET /api/sites/[id]/checks?page=1`.
- `GET|POST /api/cron`, `?force=true`, `?siteId=...` (et un `siteId` inexistant → 404).
- `GET /api/settings`, `PUT /api/settings`.
- Vérifie les codes de statut (200/201/204/400/404/409) et que les messages d'erreur sont en anglais.

## 3. Responsive

Pour `/dashboard`, `/sites/[id]` et `/settings`, teste au moins 375px (mobile), 768px (tablette) et
1280px (desktop) : pas de débordement horizontal, pas d'élément coupé/illisible, les popups restent
utilisables.

## 4. Nettoyage

- Supprime tout site ou Chat ID de test créé pendant la QA ; remets `/api/settings` dans l'état où tu
  l'as trouvé au début (relis-le avant de commencer si besoin).
- N'arrête le serveur dev que si c'est toi qui l'as lancé à l'étape 1 (voir l'avertissement plus haut sur
  le ciblage par PID).

## 5. Rapport

Termine par un rapport structuré en français :
- Un court résumé (tout est vert / X problèmes trouvés).
- Pour chaque problème : page/route concernée, ce qui a été fait, ce qui était attendu vs observé, et le
  fichier source probable si évident.
- Erreurs console ou de build à signaler séparément.
- Ne modifie pas le code sans que l'utilisateur ait validé le rapport, sauf s'il l'a demandé explicitement
  au moment d'invoquer la commande.
