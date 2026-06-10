import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ArticlesPage from "./pages/ArticlesPage";
import BooksPage from "./pages/BooksPage";
import SitesPage from "./pages/SitesPage";
import XPathTesterPage from "./pages/XPathTesterPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ArticlesPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/xpath" element={<XPathTesterPage />} />
      </Routes>
    </Layout>
  );
}
