import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import type { Site, SiteInput } from "../api/types";

const EMPTY: SiteInput = {
  jmeno: "",
  link: "",
  xpath_links: "",
  xpath_nadpis: "",
  xpath_clanek: "",
  xpath_datum: "",
  xpath_uvodni_odstavec: "",
  xpath_autor: "",
  xpath_next_prehled: "",
  xpath_next_clanek: "",
  max_stranek: 0,
  enabled: true,
};

const XPATH_FIELDS: { key: keyof SiteInput; label: string }[] = [
  { key: "xpath_links", label: "XPath odkazy (přehled)" },
  { key: "xpath_nadpis", label: "XPath nadpis" },
  { key: "xpath_clanek", label: "XPath článek" },
  { key: "xpath_datum", label: "XPath datum" },
  { key: "xpath_uvodni_odstavec", label: "XPath úvodní odstavec" },
  { key: "xpath_autor", label: "XPath autor" },
  { key: "xpath_next_prehled", label: "XPath další stránka přehledu" },
  { key: "xpath_next_clanek", label: "XPath další stránka článku" },
];

function fromSite(site: Site): SiteInput {
  return {
    jmeno: site.jmeno,
    link: site.link,
    xpath_links: site.xpath_links ?? "",
    xpath_nadpis: site.xpath_nadpis ?? "",
    xpath_clanek: site.xpath_clanek ?? "",
    xpath_datum: site.xpath_datum ?? "",
    xpath_uvodni_odstavec: site.xpath_uvodni_odstavec ?? "",
    xpath_autor: site.xpath_autor ?? "",
    xpath_next_prehled: site.xpath_next_prehled ?? "",
    xpath_next_clanek: site.xpath_next_clanek ?? "",
    max_stranek: site.max_stranek ?? 0,
    enabled: site.enabled,
  };
}

export default function SiteFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Site | null;
  onClose: () => void;
  onSave: (input: SiteInput) => void;
}) {
  const [form, setForm] = useState<SiteInput>(EMPTY);

  useEffect(() => {
    setForm(initial ? fromSite(initial) : EMPTY);
  }, [initial, open]);

  const set = (key: keyof SiteInput, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Empty xpath strings are stored as NULL.
  const handleSave = () => {
    const cleaned: SiteInput = { ...form };
    for (const { key } of XPATH_FIELDS) {
      const v = cleaned[key] as string;
      (cleaned[key] as string | null) = v.trim() === "" ? null : v;
    }
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial ? `Upravit web: ${initial.jmeno}` : "Nový web"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Jméno" value={form.jmeno} onChange={(e) => set("jmeno", e.target.value)} required />
          <TextField label="Link (přehledová stránka)" value={form.link} onChange={(e) => set("link", e.target.value)} required />
          {XPATH_FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              value={(form[f.key] as string) ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              size="small"
            />
          ))}
          <TextField
            label="Max stránek přehledu (0 = bez limitu)"
            type="number"
            inputProps={{ min: 0 }}
            value={form.max_stranek}
            onChange={(e) => setForm((f) => ({ ...f, max_stranek: Math.max(0, Number(e.target.value) || 0) }))}
            size="small"
            helperText="Kolik stránek přehledu scraper celkem projde, než se zastaví; vždy končí u prvního už staženého článku."
          />
          <FormControlLabel
            control={<Switch checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />}
            label="Aktivní (zahrnout do scrapování)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušit</Button>
        <Button variant="contained" onClick={handleSave} disabled={!form.jmeno || !form.link}>
          Uložit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
