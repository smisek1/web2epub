import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { api } from "../api/client";
import type { Book } from "../api/types";
import { useBooks } from "../hooks/useBooks";

const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "");

export default function BooksPage() {
  const { data, isLoading, error } = useBooks();

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
      <DataGrid
        autoHeight
        rows={data ?? []}
        columns={columns}
        getRowId={(r) => r.idKniha}
        loading={isLoading}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
      />
    </div>
  );
}
