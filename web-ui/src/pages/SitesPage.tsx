import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScienceIcon from "@mui/icons-material/Science";
import { Alert, Button, IconButton, Stack, Switch, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteFormDialog from "../components/SiteFormDialog";
import type { Site, SiteInput } from "../api/types";
import { useSites } from "../hooks/useSites";
import { useSiteMutations } from "../hooks/useSiteMutations";

export default function SitesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSites();
  const { create, update, setEnabled, remove } = useSiteMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (site: Site) => {
    setEditing(site);
    setDialogOpen(true);
  };
  const handleSave = (input: SiteInput) => {
    if (editing) update.mutate({ id: editing.idStranka, s: input });
    else create.mutate(input);
    setDialogOpen(false);
  };

  const columns: GridColDef<Site>[] = [
    { field: "idStranka", headerName: "ID", width: 70 },
    { field: "jmeno", headerName: "Jméno", width: 160 },
    { field: "link", headerName: "Link", flex: 1, minWidth: 240 },
    {
      field: "enabled",
      headerName: "Aktivní",
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <Switch
          checked={p.row.enabled}
          onChange={(e) => setEnabled.mutate({ id: p.row.idStranka, enabled: e.target.checked })}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Akce",
      width: 150,
      sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="Otestovat XPath">
            <IconButton size="small" onClick={() => navigate("/xpath", { state: p.row })}>
              <ScienceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upravit">
            <IconButton size="small" onClick={() => openEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Smazat">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                if (confirm(`Smazat web "${p.row.jmeno}"?`)) remove.mutate(p.row.idStranka);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  if (error) return <Alert severity="error">{(error as Error).message}</Alert>;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Přidat web
        </Button>
      </Stack>
      {remove.isError && <Alert severity="error">Smazání selhalo: {(remove.error as Error).message}</Alert>}
      <div style={{ width: "100%" }}>
        <DataGrid
          autoHeight
          rows={data ?? []}
          columns={columns}
          getRowId={(r) => r.idStranka}
          loading={isLoading}
          pageSizeOptions={[25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
        />
      </div>
      <SiteFormDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Stack>
  );
}
