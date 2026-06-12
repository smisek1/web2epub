import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";

export function usePurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.purge(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
