import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";
import type { ArticleFilters } from "../api/types";

export function useArticles(filters: ArticleFilters) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () => api.listArticles(filters),
  });
}

export function useArticle(id: number | null) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => api.getArticle(id as number),
    enabled: id !== null,
  });
}

// Mutations invalidate the article list so handled articles disappear immediately.
export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.createBook(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useTrash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.trash(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
}

export function useRemoveLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.removeLinks(id),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: ["article", id] }),
  });
}
