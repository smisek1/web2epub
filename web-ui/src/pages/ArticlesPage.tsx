import DownloadIcon from "@mui/icons-material/CloudDownload";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import ArticleDetailDrawer from "../components/ArticleDetailDrawer";
import type { Article, Site } from "../api/types";
import { useArticles, useCreateBook, useTrash } from "../hooks/useArticles";
import { useScrape } from "../hooks/useScrape";
import { useSites } from "../hooks/useSites";

const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "");

export default function ArticlesPage() {
  const { data: sites } = useSites();
  const [selectedSites, setSelectedSites] = useState<Site[]>([]);
  const [autor, setAutor] = useState("");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  // Any filter change resets to the first page.
  const resetPage = () => setPaginationModel((p) => ({ ...p, page: 0 }));

  const filters = useMemo(
    () => ({
      web: selectedSites.length ? selectedSites.map((s) => s.idStranka) : undefined,
      autor: autor || undefined,
      q: q || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      sortBy: "datum" as const,
      sortDir: "desc" as const,
    }),
    [selectedSites, autor, q, dateFrom, dateTo, paginationModel],
  );

  const { data, isLoading, error } = useArticles(filters);
  const createBook = useCreateBook();
  const trash = useTrash();
  const scrape = useScrape();

  const selectedIds = selection.map(Number);
  const clearSelection = () => setSelection([]);

  const columns: GridColDef<Article>[] = [
    {
      field: "nadpis",
      headerName: "Nadpis",
      flex: 1,
      minWidth: 300,
      renderCell: (p) => (
        <Link component="button" type="button" onClick={() => setDetailId(p.row.id)} sx={{ textAlign: "left" }}>
          {p.row.nadpis}
        </Link>
      ),
    },
    { field: "web", headerName: "Web", width: 140 },
    { field: "autor", headerName: "Autor", width: 180 },
    { field: "datum", headerName: "Datum", width: 120, valueFormatter: (v) => fmtDate(v) },
    {
      field: "datumImportu",
      headerName: "Importováno",
      width: 120,
      valueFormatter: (v) => fmtDate(v),
    },
    {
      field: "url",
      headerName: "Zdroj",
      width: 90,
      sortable: false,
      renderCell: (p) =>
        p.row.url ? (
          <Link href={p.row.url} target="_blank" rel="noreferrer">
            odkaz
          </Link>
        ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" flexWrap="wrap">
          <Autocomplete
            multiple
            sx={{ minWidth: 240, flex: 1 }}
            options={sites ?? []}
            getOptionLabel={(s) => s.jmeno}
            isOptionEqualToValue={(o, v) => o.idStranka === v.idStranka}
            value={selectedSites}
            onChange={(_e, v) => {
              setSelectedSites(v);
              resetPage();
            }}
            renderInput={(params) => <TextField {...params} label="Weby" size="small" />}
          />
          <TextField
            label="Fulltext"
            size="small"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
          />
          <TextField
            label="Autor"
            size="small"
            value={autor}
            onChange={(e) => {
              setAutor(e.target.value);
              resetPage();
            }}
          />
          <TextField
            label="Od"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              resetPage();
            }}
          />
          <TextField
            label="Do"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              resetPage();
            }}
          />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          disabled={selectedIds.length === 0 || createBook.isPending}
          onClick={() => createBook.mutate(selectedIds, { onSuccess: clearSelection })}
        >
          Vytvořit knihu ({selectedIds.length})
        </Button>
        <Button
          variant="outlined"
          color="warning"
          disabled={selectedIds.length === 0 || trash.isPending}
          onClick={() => trash.mutate(selectedIds, { onSuccess: clearSelection })}
        >
          Do koše
        </Button>
        <Box flex={1} />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          disabled={scrape.isRunning}
          onClick={() => scrape.start.mutate()}
        >
          {scrape.isRunning ? "Stahuji…" : "Stáhni všechny"}
        </Button>
      </Stack>

      {scrape.job?.status === "done" && (
        <Alert severity="success">Staženo nových článků: {scrape.job.articlesAdded}</Alert>
      )}
      {scrape.job?.status === "failed" && <Alert severity="error">Scrape selhal: {scrape.job.error}</Alert>}
      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      <div style={{ width: "100%" }}>
        <DataGrid
          autoHeight
          rows={data?.items ?? []}
          columns={columns}
          getRowId={(r) => r.id}
          loading={isLoading}
          rowCount={data?.total ?? 0}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selection}
          onRowSelectionModelChange={setSelection}
        />
      </div>

      <ArticleDetailDrawer id={detailId} onClose={() => setDetailId(null)} />
    </Stack>
  );
}
