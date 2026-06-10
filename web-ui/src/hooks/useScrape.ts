import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api } from "../api/client";

// Starts a scrape, then polls the job until it finishes, refreshing the article list.
export function useScrape() {
  const qc = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: () => api.startScrape(),
    onSuccess: (res) => setJobId(res.jobId),
  });

  const job = useQuery({
    queryKey: ["scrapeJob", jobId],
    queryFn: () => api.getScrapeJob(jobId as string),
    enabled: jobId !== null,
    // Poll every 2s while the job is running.
    refetchInterval: (query) => (query.state.data?.status === "running" ? 2000 : false),
  });

  // When the job finishes, refresh the article list once.
  const status = job.data?.status;
  useEffect(() => {
    if (status === "done") {
      qc.invalidateQueries({ queryKey: ["articles"] });
    }
  }, [status, qc]);

  return { start, job: job.data, isRunning: job.data?.status === "running" || start.isPending };
}
