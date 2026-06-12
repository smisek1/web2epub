import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import DownloadIcon from "@mui/icons-material/CloudDownload";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Link,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

import ArticleDetailDrawer from "../components/ArticleDetailDrawer";
import { api } from "../api/client";
import type { Article, Site } from "../api/types";
import { useArticles, useAuthors, useCreateBook, useTrash } from "../hooks/useArticles";
import { useFromUrl } from "../hooks/useFromUrl";
import { useScrape } from "../hooks/useScrape";
import { useSites } from "../hooks/useSites";

const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "");

// Shared checkbox icons for the multi-select filter dropdowns.
const checkIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function ArticlesPage() {
  const { data: sites } = useSites();
  const [selectedSites, setSelectedSites] = useState<Site[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  // Authors are scoped to the selected sites so the two filters chain together.
  const selectedSiteIds = useMemo(() => selectedSites.map((s) => s.idStranka), [selectedSites]);
  const { data: authors } = useAuthors(selectedSiteIds);

  // When narrowing the sites drops some authors, clear any now-invalid selection.
  useEffect(() => {
    if (!authors) return;
    setSelectedAuthors((prev) => {
      const next = prev.filter((a) => authors.includes(a));
      return next.length === prev.length ? prev : next;
    });
  }, [authors]);
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
      autor: selectedAuthors.length ? selectedAuthors : undefined,
      q: q || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      sortBy: "datum" as const,
      sortDir: "desc" as const,
    }),
    [selectedSites, selectedAuthors, q, dateFrom, dateTo, paginationModel],
  );

  const { data, isLoading, error } = useArticles(filters);
  const createBook = useCreateBook();
  const trash = useTrash();
  const scrape = useScrape();
  const [adhocUrl, setAdhocUrl] = useState("");
  const fromUrl = useFromUrl();
  const adhocBusy = fromUrl.save.isPending || fromUrl.saveAsEpub.isPending;

  const saveAdhoc = () =>
    fromUrl.save.mutate(adhocUrl.trim(), { onSuccess: () => setAdhocUrl("") });
  const epubAdhoc = () =>
    fromUrl.saveAsEpub.mutate(adhocUrl.trim(), {
      onSuccess: ({ book }) => {
        setAdhocUrl("");
        window.location.href = api.downloadBookUrl(book.id_kniha);
      },
    });

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
            disableCloseOnSelect
            sx={{ minWidth: 240, flex: 1 }}
            options={sites ?? []}
            getOptionLabel={(s) => s.jmeno}
            isOptionEqualToValue={(o, v) => o.idStranka === v.idStranka}
            value={selectedSites}
            onChange={(_e, v) => {
              setSelectedSites(v);
              resetPage();
            }}
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Checkbox icon={checkIcon} checkedIcon={checkedIcon} sx={{ mr: 1 }} checked={selected} />
                  {option.jmeno}
                </li>
              );
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
          <Autocomplete
            multiple
            disableCloseOnSelect
            sx={{ minWidth: 240, flex: 1 }}
            options={authors ?? []}
            value={selectedAuthors}
            onChange={(_e, v) => {
              setSelectedAuthors(v);
              resetPage();
            }}
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Checkbox icon={checkIcon} checkedIcon={checkedIcon} sx={{ mr: 1 }} checked={selected} />
                  {option}
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Autoři" size="small" />}
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

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Stáhnout článek z URL (bez konfigurace webu)"
            size="small"
            sx={{ flex: 1 }}
            value={adhocUrl}
            onChange={(e) => setAdhocUrl(e.target.value)}
            placeholder="https://www.root.cz/clanky/…"
          />
          <Button variant="outlined" disabled={!adhocUrl.trim() || adhocBusy} onClick={saveAdhoc}>
            {fromUrl.save.isPending ? "Stahuji…" : "Uložit jako článek"}
          </Button>
          <Button variant="contained" disabled={!adhocUrl.trim() || adhocBusy} onClick={epubAdhoc}>
            {fromUrl.saveAsEpub.isPending ? "Stahuji…" : "Rovnou EPUB"}
          </Button>
        </Stack>
        {fromUrl.save.isSuccess && (
          <Alert severity="success" sx={{ mt: 1 }} onClose={() => fromUrl.save.reset()}>
            Uloženo: {fromUrl.save.data.nadpis}
          </Alert>
        )}
        {fromUrl.save.isError && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => fromUrl.save.reset()}>
            {(fromUrl.save.error as Error).message}
          </Alert>
        )}
        {fromUrl.saveAsEpub.isError && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => fromUrl.saveAsEpub.reset()}>
            {(fromUrl.saveAsEpub.error as Error).message}
          </Alert>
        )}
      </Paper>

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
