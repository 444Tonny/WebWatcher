// Largeurs partagées (flexbox, pas de CSS grid) entre l'en-tête de "tableau" et chaque SiteCard,
// pour que les colonnes (statut, temps de réponse, dernière vérification) restent alignées
// d'une carte à l'autre : mêmes largeurs fixes des deux côtés ⇒ mêmes colonnes.
export const SITE_ROW_STATUS_WIDTH = "lg:w-26 lg:shrink-0";
export const SITE_ROW_RESPONSE_WIDTH = "lg:w-22 lg:shrink-0";
export const SITE_ROW_LAST_CHECK_WIDTH = "lg:w-50 lg:shrink-0";
