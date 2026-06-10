import { useMutation } from "@tanstack/react-query";

import { api } from "../api/client";

export function useXpathTest() {
  return useMutation({ mutationFn: (body: Record<string, string>) => api.testXpath(body) });
}
