// Erreur porteuse d'un code de statut HTTP, utilisée par les routes API pour
// renvoyer une réponse d'erreur précise (400, 404, 409, ...) plutôt qu'un 500 générique.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}
