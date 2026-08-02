import CloseIcon from "@mui/icons-material/Close";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { Box, Button, Drawer, IconButton, Stack, Typography } from "@mui/material";

import { useArticle, useRemoveLinks } from "../hooks/useArticles";

export default function ArticleDetailDrawer({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useArticle(id);
  const removeLinks = useRemoveLinks();

  return (
    <Drawer anchor="right" open={id !== null} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", md: 720 }, p: 3 }}>
        <IconButton
          onClick={onClose}
          aria-label="Zavřít"
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        {isLoading || !data ? (
          <Typography>Načítám…</Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ pr: 5 }}>
              {data.nadpis}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.web} · {data.autor || "—"} · {data.datum?.slice(0, 10) || "—"}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LinkOffIcon />}
              disabled={removeLinks.isPending}
              onClick={() => removeLinks.mutate(data.id)}
              sx={{ alignSelf: "flex-start" }}
            >
              Odstranit odkazy
            </Button>
            {/* Article HTML is our own scraped content. */}
            <Box
              sx={{ "& img": { maxWidth: "100%" } }}
              dangerouslySetInnerHTML={{ __html: data.clanek }}
            />
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
