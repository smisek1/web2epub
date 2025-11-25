import React from 'react';
import './ArticleList.css';

function ArticleList({ articles, selectedIds, onSelectAll, onSelectArticle }) {
  const allSelected = articles.length > 0 && selectedIds.length === articles.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < articles.length;

  return (
    <div className="article-list">
      <div className="select-all-container">
        <label className="select-all-label">
          <input
            type="checkbox"
            checked={allSelected}
            ref={input => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
          <span>Select All</span>
        </label>
      </div>

      <table className="articles-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Nadpis</th>
            <th>Zdroj</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-articles">
                Žádné články k zobrazení
              </td>
            </tr>
          ) : (
            articles.map((article, index) => {
              const [id, nadpis, jmeno, clanek, datum, posledni] = article;
              const isSelected = selectedIds.includes(id.toString());
              
              return (
                <tr key={id} className={isSelected ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectArticle(id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <a 
                      href={posledni} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="article-link"
                    >
                      {nadpis}
                    </a>
                  </td>
                  <td>{jmeno || 'N/A'}</td>
                  <td>
                    {datum 
                      ? (() => {
                          try {
                            const date = typeof datum === 'string' ? new Date(datum) : datum;
                            return date instanceof Date && !isNaN(date) 
                              ? date.toLocaleDateString('cs-CZ') 
                              : datum;
                          } catch {
                            return datum || 'N/A';
                          }
                        })()
                      : 'N/A'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ArticleList;

