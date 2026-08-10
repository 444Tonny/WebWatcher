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

export type CheckHistoryEntry = {
  id: string;
  timestamp: string;
  status: string;
  responseTime: number | null;
  httpCode: number | null;
  error: { type: string; message: string } | null;
};

export type CheckHistoryPage = {
  checks: CheckHistoryEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
