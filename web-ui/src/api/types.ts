export interface Article {
  id: number;
  nadpis: string;
  web: string;
  webId: number;
  datum: string | null;
  autor: string | null;
  uvodniOdstavec: string | null;
  url: string | null;
  datumImportu: string | null;
}

export interface ArticleDetail extends Article {
  clanek: string;
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArticleFilters {
  web?: number[];
  dateFrom?: string;
  dateTo?: string;
  autor?: string;
  q?: string;
  page: number;
  pageSize: number;
  sortBy?: "datum" | "nadpis";
  sortDir?: "asc" | "desc";
}

export interface Book {
  idKniha: number;
  jmeno: string;
  pocetClanku: number;
  nejnovejsiDatum: string | null;
}

export interface Site {
  idStranka: number;
  jmeno: string;
  link: string;
  enabled: boolean;
  xpath_links: string | null;
  xpath_nadpis: string | null;
  xpath_clanek: string | null;
  xpath_datum: string | null;
  xpath_uvodni_odstavec: string | null;
  xpath_autor: string | null;
  xpath_next_prehled: string | null;
  xpath_next_clanek: string | null;
  max_stranek: number;
}

// Site payload for create/update (no id).
export interface SiteInput {
  jmeno: string;
  link: string;
  xpath_links: string | null;
  xpath_nadpis: string | null;
  xpath_clanek: string | null;
  xpath_datum: string | null;
  xpath_uvodni_odstavec: string | null;
  xpath_autor: string | null;
  xpath_next_prehled: string | null;
  xpath_next_clanek: string | null;
  max_stranek: number;
  enabled: boolean;
}

export interface XpathTestResult {
  links?: string[];
  nadpis?: string;
  clanek?: string;
  datum?: string;
  uvodni_odstavec?: string;
  autor?: string;
  next_prehled?: string;
  next_clanek?: string;
  errors: Record<string, string>;
}

export interface ScrapeJob {
  id: string;
  status: "running" | "done" | "failed";
  articlesBefore: number;
  articlesAdded?: number;
  error?: string;
}
