"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Clock, Copy, Info, Loader2, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/button-styles";
import { Switch } from "@/components/ui/Switch";
import { CHAT_ID_PATTERN, CHECK_INTERVAL_OPTIONS } from "@/lib/settings-input";
import type { SettingsRecord } from "@/lib/types";

// URL de test (getUpdates) du bot Telegram du projet — permet à l'utilisateur de retrouver son Chat ID.
const TELEGRAM_GETUPDATES_URL =
  "https://api.telegram.org/bot8818643496:AAEj25RGztv_LvgN8v43n2JPL8YS_qc_PQ4/getUpdates";

type SavableFields = Partial<Pick<SettingsRecord, "checkInterval" | "notifyOnError" | "telegramChatIds">>;

export function SettingsClient() {
  const [settings, setSettings] = useState<SettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [chatIdInput, setChatIdInput] = useState("");
  const [chatIdError, setChatIdError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to load settings. Please try again.");

      setSettings(await response.json());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(fetchSettings, 0);
    return () => clearTimeout(handle);
  }, [fetchSettings]);

  // Sauvegarde immédiate (pas de bouton "Enregistrer") : mise à jour optimiste de l'affichage,
  // annulée si la requête échoue.
  async function saveSettings(partial: SavableFields) {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...partial });
    setSaving(true);
    setBanner(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save settings. Please try again.");
      }

      setSettings(await response.json());
    } catch (err) {
      setSettings(previous);
      setBanner(err instanceof Error ? err.message : "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleAddChatId(event: FormEvent) {
    event.preventDefault();
    const trimmed = chatIdInput.trim();

    if (!CHAT_ID_PATTERN.test(trimmed)) {
      setChatIdError("Le Chat ID ne doit contenir que des chiffres (ex : 1234567890).");
      return;
    }
    if (settings?.telegramChatIds.includes(trimmed)) {
      setChatIdError("Ce Chat ID est déjà dans la liste.");
      return;
    }

    setChatIdError(null);
    setChatIdInput("");
    saveSettings({ telegramChatIds: [...(settings?.telegramChatIds ?? []), trimmed] });
  }

  function handleRemoveChatId(chatId: string) {
    if (!settings) return;
    saveSettings({ telegramChatIds: settings.telegramChatIds.filter((id) => id !== chatId) });
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(TELEGRAM_GETUPDATES_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Paramètres</h1>
          <p className="text-sm text-zinc-500">Fréquence de vérification et notifications Telegram</p>
        </div>

        {saving && (
          <span className="flex items-center gap-1.5 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enregistrement...
          </span>
        )}
      </div>

      {banner && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {banner}
        </div>
      )}

      {loading && !settings ? (
        <div className="flex flex-col gap-4">
          <div className="h-28 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
          <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
        </div>
      ) : loadError && !settings ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
          <p className="text-sm text-zinc-400">{loadError}</p>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchSettings}>
            Réessayer
          </Button>
        </div>
      ) : settings ? (
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Clock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              Fréquence de vérification
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              À quel intervalle les sites suivis sont vérifiés automatiquement.
            </p>

            <div className="flex flex-wrap gap-2">
              {CHECK_INTERVAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={settings.checkInterval === option.value}
                  onClick={() => saveSettings({ checkInterval: option.value })}
                  className={buttonClasses(settings.checkInterval === option.value ? "primary" : "outline")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Send className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              Notifications Telegram
            </h2>
            <p className="mb-4 text-sm text-zinc-500">Alerte envoyée quand un site suivi passe hors ligne.</p>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3">
              <span className="text-sm text-zinc-200">Activer les notifications</span>
              <Switch
                checked={settings.notifyOnError}
                onChange={(checked) => saveSettings({ notifyOnError: checked })}
                label="Activer les notifications Telegram"
              />
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-zinc-300">Chat IDs destinataires</span>

              <ul className="mt-2 flex flex-col gap-2">
                {settings.telegramChatIds.length === 0 ? (
                  <li className="text-sm text-zinc-500">Aucun Chat ID configuré.</li>
                ) : (
                  settings.telegramChatIds.map((chatId) => (
                    <li
                      key={chatId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    >
                      <span className="font-mono text-sm text-zinc-200">{chatId}</span>
                      <Button
                        variant="danger"
                        icon={Trash2}
                        aria-label={`Supprimer le Chat ID ${chatId}`}
                        className="px-2.5"
                        onClick={() => handleRemoveChatId(chatId)}
                      />
                    </li>
                  ))
                )}
              </ul>

              <form onSubmit={handleAddChatId} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  inputMode="numeric"
                  value={chatIdInput}
                  onChange={(event) => {
                    setChatIdInput(event.target.value);
                    setChatIdError(null);
                  }}
                  placeholder="ex : 1234567890"
                  aria-label="Nouveau Chat ID"
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
                <Button type="submit" variant="secondary" icon={Plus}>
                  Ajouter
                </Button>
              </form>
              {chatIdError && (
                <p role="alert" className="mt-2 text-sm text-red-300">
                  {chatIdError}
                </p>
              )}
            </div>

            <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
              <p className="mb-2 flex items-center gap-2 font-medium text-zinc-300">
                <Info className="h-4 w-4" aria-hidden="true" />
                Comment récupérer votre Chat ID
              </p>
              <ol className="flex list-decimal flex-col gap-2 pl-5">
                <li>
                  Envoyez le message « /start » à <span className="text-zinc-200">@TonnyWebWatcher_bot</span> sur
                  Telegram.
                </li>
                <li>
                  Ouvrez ensuite l’URL suivante dans un navigateur (à copier-coller) :
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5">
                    <code className="flex-1 overflow-x-auto text-xs whitespace-nowrap text-zinc-300">
                      {TELEGRAM_GETUPDATES_URL}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      aria-label="Copier l’URL"
                      className="shrink-0 text-zinc-400 hover:text-zinc-100"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </li>
                <li>
                  Récupérez la valeur de <span className="text-zinc-200">« id »</span> à côté de votre nom
                  d’utilisateur.
                </li>
              </ol>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
