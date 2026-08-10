// Types côté client : les dates arrivent sous forme de chaînes (sérialisation JSON), pas d'objets Date.

export type RecentCheck = {
  status: string;
  responseTime: number | null;
  timestamp: string;
};

export type SiteRecord = {
  id: string;
  name: string;
  url: string;
  status: string;
  responseTime: number | null;
  lastCheck: string | null;
  createdAt: string;
  updatedAt: string;
  checks: RecentCheck[];
};
