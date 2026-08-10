<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Règles du projet WebWatcher

- **Commentaires de code** : en français.
- **Messages d'erreur utilisateur** (UI, toasts, texte affiché) : en anglais.
- **Syntaxe simple** : privilégier un code lisible et "humain" plutôt que des abstractions ou du code trop clever. Pas de sur-ingénierie.
- **Dépendances** : n'ajouter aucune dépendance qui n'est pas strictement nécessaire ; vérifier d'abord si l'existant (stdlib, package déjà installé) suffit.
- **Responsive** : toute UI doit fonctionner correctement en mobile, tablette et desktop.
- **UX/Accessibilité** : suivre les bonnes pratiques (contraste, focus visible, labels ARIA, navigation clavier, sémantique HTML) à chaque composant.
- **Documentation** : mettre à jour ce fichier (et tout autre fichier concerné : README, schémas, etc.) à chaque changement pertinent, pas seulement le code.
- **CSS Grid** : ne pas utiliser `display: grid` — flexbox uniquement pour la mise en page, quitte à fixer des largeurs (`w-*`, `shrink-0`) pour garder des colonnes alignées entre plusieurs blocs.
- **Pas de fichiers utilitaires triviaux** : ne pas créer un fichier `.ts` juste pour partager deux ou trois constantes/classes utilisées à 2 endroits — dupliquer directement dans le code plutôt que d'ajouter un fichier. Un fichier `lib/`/`components/` doit contenir de la vraie logique, pas juste des constantes de style.
