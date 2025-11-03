import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('id, address, confidence_score, score_reasons');

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data);
      }
    }

    fetchProperties();
  }, []);

  function handleSort(order) {
    const sorted = [...properties].sort((a, b) =>
      order === 'asc'
        ? a.confidence_score - b.confidence_score
        : b.confidence_score - a.confidence_score
    );
    setProperties(sorted);
  }

  function downloadCSV() {
    const formatted = properties.map((p) => ({
      Address: p.address,
      Score: p.confidence_score,
      Reasons: p.score_reasons?.join('; ') || '',
    }));

    const csv = Papa.unparse(formatted);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scored_properties.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const averageScore =
    properties.length > 0
      ? Math.round(
          properties.reduce((sum, p) => sum + p.confidence_score, 0) /
            properties.length
        )
      : 0;

  const filteredProperties = properties
    .filter((p) => p.confidence_score >= minScore)
    .filter(
      (p) =>
        searchTerm === '' ||
        p.score_reasons?.some((r) =>
          r.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

  return (
    <div className="App">
      <h1>Scored Properties</h1>

      <div className="dashboard-controls">
        <button onClick={downloadCSV}>Download CSV</button>

        <select onChange={(e) => handleSort(e.target.value)}>
          <option value="desc">Sort by Score (High to Low)</option>
          <option value="asc">Sort by Score (Low to High)</option>
        </select>

        <input
          type="number"
          placeholder="Min Score"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
        />

        <input
          type="text"
          placeholder="Search reasons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="summary-stats">
        <p>Total Properties: {filteredProperties.length}</p>
        <p>Average Score: {averageScore}</p>
      </div>

      <div className="property-grid">
        {filteredProperties.map((property) => (
          <div key={property.id} className="property-card">
            <h3>{property.address || 'No address'}</h3>
            <span className="score-badge">
              Score: {property.confidence_score ?? 'N/A'}
            </span>
            <details>
              <summary>Why this score?</summary>
              <ul>
                {property.score_reasons?.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
