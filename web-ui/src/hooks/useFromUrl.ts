import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";

// #33: store an ad-hoc URL as an article; optionally wrap it straight into
// a single-article book named by its title (caller then opens the download).
export function useFromUrl() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["articles"] });
    qc.invalidateQueries({ queryKey: ["books"] });
  };

  const save = useMutation({
    mutationFn: (url: string) => api.fromUrl(url),
    onSuccess: invalidate,
  });

  const saveAsEpub = useMutation({
    mutationFn: async (url: string) => {
      const article = await api.fromUrl(url);
      const book = await api.createBook([article.id], article.nadpis.slice(0, 200));
      return { article, book };
    },
    onSuccess: invalidate,
  });

  return { save, saveAsEpub };
}
