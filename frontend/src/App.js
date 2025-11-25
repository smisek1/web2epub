import React, { useState, useEffect } from 'react';
import './App.css';
import ArticleList from './components/ArticleList';
import { getArticles, moveToTrash, createBook, loadArticles } from './services/api';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError('Nepodařilo se načíst články: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(articles.map(article => article[0].toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectArticle = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id.toString()]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id.toString()));
    }
  };

  const handleMoveToTrash = async () => {
    if (selectedIds.length === 0) {
      alert('Vyberte alespoň jeden článek');
      return;
    }

    try {
      await moveToTrash(selectedIds);
      setSelectedIds([]);
      await fetchArticles();
      alert('Články byly přesunuty do koše');
    } catch (err) {
      alert('Chyba při přesunu do koše: ' + err.message);
      console.error(err);
    }
  };

  const handleCreateBook = async () => {
    if (selectedIds.length === 0) {
      alert('Vyberte alespoň jeden článek');
      return;
    }

    try {
      const response = await createBook(selectedIds);
      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'book.epub');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSelectedIds([]);
      await fetchArticles();
      alert('Kniha byla úspěšně vytvořena');
    } catch (err) {
      alert('Chyba při vytváření knihy: ' + err.message);
      console.error(err);
    }
  };

  const handleLoadArticles = async () => {
    try {
      setLoading(true);
      await loadArticles();
      await fetchArticles();
      alert('Články byly načteny');
    } catch (err) {
      alert('Chyba při načítání článků: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="App">
        <div className="loading">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web2Epub</h1>
      </header>
      
      {error && <div className="error">{error}</div>}

      <div className="controls">
        <button 
          onClick={handleMoveToTrash} 
          disabled={selectedIds.length === 0 || loading}
          className="btn btn-trash"
        >
          Move to trash
        </button>
        <button 
          onClick={handleCreateBook} 
          disabled={selectedIds.length === 0 || loading}
          className="btn btn-create"
        >
          Create book
        </button>
        <button 
          onClick={handleLoadArticles} 
          disabled={loading}
          className="btn btn-load"
        >
          Načti
        </button>
      </div>

      <ArticleList
        articles={articles}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectArticle={handleSelectArticle}
      />
    </div>
  );
}

export default App;

