import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";
import type { SiteInput } from "../api/types";

export function useSiteMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["sites"] });

  const create = useMutation({ mutationFn: (s: SiteInput) => api.createSite(s), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, s }: { id: number; s: SiteInput }) => api.updateSite(id, s),
    onSuccess: invalidate,
  });
  const setEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => api.setSiteEnabled(id, enabled),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteSite(id), onSuccess: invalidate });

  return { create, update, setEnabled, remove };
}
