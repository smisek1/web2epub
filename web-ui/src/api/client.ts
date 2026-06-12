import type {
  ArticleDetail,
  ArticleFilters,
  ArticlesResponse,
  Book,
  ScrapeJob,
  Site,
  SiteInput,
  XpathTestResult,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Only advertise a JSON body when there actually is one — otherwise Fastify
  // rejects an empty body with "Body cannot be empty" (e.g. POST /scrape).
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers["content-type"] = "application/json";
  const res = await fetch(BASE + path, { ...options, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? res.statusText);
  }
  // Some endpoints (204) have no body.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function articlesQuery(f: ArticleFilters): string {
  const p = new URLSearchParams();
  f.web?.forEach((w) => p.append("web", String(w)));
  if (f.dateFrom) p.set("dateFrom", f.dateFrom);
  if (f.dateTo) p.set("dateTo", f.dateTo);
  if (f.autor) p.set("autor", f.autor);
  if (f.q) p.set("q", f.q);
  p.set("page", String(f.page));
  p.set("pageSize", String(f.pageSize));
  if (f.sortBy) p.set("sortBy", f.sortBy);
  if (f.sortDir) p.set("sortDir", f.sortDir);
  return p.toString();
}

export const api = {
  listArticles: (f: ArticleFilters) =>
    request<ArticlesResponse>(`/articles?${articlesQuery(f)}`),
  getArticle: (id: number) => request<ArticleDetail>(`/articles/${id}`),
  createBook: (ids: number[]) =>
    request<{ id_kniha: number; jmeno: string }>(`/books`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  trash: (ids: number[]) =>
    request<{ moved: number }>(`/articles/trash`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  removeLinks: (id: number) =>
    request<{ id: number; clanek: string }>(`/articles/${id}/links`, { method: "DELETE" }),
  listBooks: () => request<Book[]>(`/books`),
  listSites: () => request<Site[]>(`/sites`),
  createSite: (s: SiteInput) =>
    request<Site>(`/sites`, { method: "POST", body: JSON.stringify(s) }),
  updateSite: (id: number, s: SiteInput) =>
    request<Site>(`/sites/${id}`, { method: "PUT", body: JSON.stringify(s) }),
  setSiteEnabled: (id: number, enabled: boolean) =>
    request<Site>(`/sites/${id}/enabled`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  deleteSite: (id: number) => request<void>(`/sites/${id}`, { method: "DELETE" }),
  testXpath: (body: Record<string, string>) =>
    request<XpathTestResult>(`/xpath/test`, { method: "POST", body: JSON.stringify(body) }),
  startScrape: () => request<{ jobId: string; status: string }>(`/scrape`, { method: "POST" }),
  purge: () =>
    request<{ deletedArticles: number; deletedBooks: number; keptArticles: number }>(
      `/maintenance/purge`,
      { method: "POST", body: JSON.stringify({ confirm: true }) },
    ),
  getScrapeJob: (jobId: string) => request<ScrapeJob>(`/scrape/${jobId}`),
  // Direct browser download (sets Content-Disposition) — not via fetch.
  downloadBookUrl: (id: number) => `${BASE}/books/${id}/download`,
};
