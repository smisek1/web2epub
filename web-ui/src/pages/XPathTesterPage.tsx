import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import type { Site } from "../api/types";
import { useXpathTest } from "../hooks/useXpathTest";

const XPATH_FIELDS: { key: string; label: string }[] = [
  { key: "xpath_links", label: "XPath odkazy (přehled)" },
  { key: "xpath_nadpis", label: "XPath nadpis" },
  { key: "xpath_clanek", label: "XPath článek" },
  { key: "xpath_datum", label: "XPath datum" },
  { key: "xpath_uvodni_odstavec", label: "XPath úvodní odstavec" },
  { key: "xpath_autor", label: "XPath autor" },
  { key: "xpath_next_prehled", label: "XPath další stránka přehledu" },
  { key: "xpath_next_clanek", label: "XPath další stránka článku" },
];

export default function XPathTesterPage() {
  // When navigated from SitesPage, prefill from the site passed in router state.
  const prefill = useLocation().state as Site | null;

  const [url, setUrl] = useState(prefill?.link ?? "");
  const [xpaths, setXpaths] = useState<Record<string, string>>({
    xpath_links: prefill?.xpath_links ?? "",
    xpath_nadpis: prefill?.xpath_nadpis ?? "",
    xpath_clanek: prefill?.xpath_clanek ?? "",
    xpath_datum: prefill?.xpath_datum ?? "",
    xpath_uvodni_odstavec: prefill?.xpath_uvodni_odstavec ?? "",
    xpath_autor: prefill?.xpath_autor ?? "",
    xpath_next_prehled: prefill?.xpath_next_prehled ?? "",
    xpath_next_clanek: prefill?.xpath_next_clanek ?? "",
  });

  const test = useXpathTest();

  // Be forgiving: prepend https:// if the user omitted the scheme.
  const normalizeUrl = (u: string) => (/^https?:\/\//i.test(u.trim()) ? u.trim() : `https://${u.trim()}`);

  const run = () => {
    const body: Record<string, string> = { url: normalizeUrl(url) };
    for (const { key } of XPATH_FIELDS) {
      if (xpaths[key]?.trim()) body[key] = xpaths[key];
    }
    test.mutate(body);
  };

  const result = test.data;

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth />
          {XPATH_FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              value={xpaths[f.key] ?? ""}
              onChange={(e) => setXpaths((x) => ({ ...x, [f.key]: e.target.value }))}
              size="small"
            />
          ))}
          <Button variant="contained" onClick={run} disabled={!url || test.isPending} sx={{ alignSelf: "flex-start" }}>
            {test.isPending ? "Testuji…" : "Otestovat"}
          </Button>
        </Stack>
      </Paper>

      {test.isError && <Alert severity="error">{(test.error as Error).message}</Alert>}

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Výsledky</Typography>
          {result.links && (
            <Box sx={{ my: 1 }}>
              <Typography variant="subtitle2">Odkazy ({result.links.length})</Typography>
              <Stack spacing={0.5}>
                {result.links.slice(0, 30).map((l) => (
                  <Typography key={l} variant="body2" sx={{ wordBreak: "break-all" }}>
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Field label="Nadpis" value={result.nadpis} />
          <Field label="Datum" value={result.datum} />
          <Field label="Autor" value={result.autor} />
          <Field label="Úvodní odstavec" value={result.uvodni_odstavec} />
          <Field label="Další stránka přehledu" value={result.next_prehled} />
          <Field label="Další stránka článku" value={result.next_clanek} />
          {result.clanek !== undefined && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Článek (náhled)</Typography>
              <Box sx={{ "& img": { maxWidth: "100%" } }} dangerouslySetInnerHTML={{ __html: result.clanek ?? "" }} />
            </Box>
          )}
          {Object.keys(result.errors).length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Chyby: {JSON.stringify(result.errors)}
            </Alert>
          )}
        </Paper>
      )}
    </Stack>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (value === undefined) return null;
  return (
    <Box sx={{ my: 0.5 }}>
      <Chip label={label} size="small" sx={{ mr: 1 }} />
      <Typography component="span" variant="body2">
        {value || "(prázdné)"}
      </Typography>
    </Box>
  );
}
