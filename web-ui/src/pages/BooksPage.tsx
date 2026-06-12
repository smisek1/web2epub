import { useState } from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { api } from "../api/client";
import type { Book } from "../api/types";
import { useBooks } from "../hooks/useBooks";
import { usePurge } from "../hooks/useMaintenance";

const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "");

export default function BooksPage() {
  const { data, isLoading, error } = useBooks();
  const purge = usePurge();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handlePurge = () => {
    setConfirmOpen(false);
    purge.mutate();
  };

  const columns: GridColDef<Book>[] = [
    { field: "jmeno", headerName: "Název knihy", flex: 1, minWidth: 280 },
    { field: "pocetClanku", headerName: "Článků", width: 110 },
    {
      field: "nejnovejsiDatum",
      headerName: "Nejnovější článek",
      width: 160,
      valueFormatter: (v) => fmtDate(v),
    },
    {
      field: "download",
      headerName: "",
      width: 160,
      sortable: false,
      renderCell: (p) => (
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          href={api.downloadBookUrl(p.row.idKniha)}
        >
          Stáhnout EPUB
        </Button>
      ),
    },
  ];

  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;

  return (
    <div style={{ width: "100%" }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={purge.isPending}
        >
          {purge.isPending ? "Mažu…" : "Smazat vše (purge)"}
        </Button>
      </Stack>
      {purge.isSuccess && (
        <Alert severity="success" sx={{ mb: 1 }} onClose={() => purge.reset()}>
          Smazáno {purge.data.deletedBooks} knih a {purge.data.deletedArticles} článků;
          ponecháno {purge.data.keptArticles} posledních článků (přesunuty do koše).
        </Alert>
      )}
      {purge.isError && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => purge.reset()}>
          {(purge.error as Error).message}
        </Alert>
      )}
      <DataGrid
        autoHeight
        rows={data ?? []}
        columns={columns}
        getRowId={(r) => r.idKniha}
        loading={isLoading}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
      />
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Opravdu smazat všechny knihy a články?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nevratně se smažou všechny knihy a všechny články. Z každého webu zůstane jen
            poslední stažený článek (kvůli návaznosti scrapování) a přesune se do koše
            „nechci číst“. Před spuštěním zvaž zálohu (backup/backup.sh).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Zrušit</Button>
          <Button color="error" variant="contained" onClick={handlePurge}>
            Smazat vše
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
