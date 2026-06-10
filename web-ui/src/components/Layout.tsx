import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Články" },
  { to: "/books", label: "Knihy" },
  { to: "/sites", label: "Weby" },
  { to: "/xpath", label: "XPath tester" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 4 }}>
            web2epub
          </Typography>
          {NAV.map((n) => (
            <Button
              key={n.to}
              component={RouterLink}
              to={n.to}
              color="inherit"
              variant={pathname === n.to ? "outlined" : "text"}
            >
              {n.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
