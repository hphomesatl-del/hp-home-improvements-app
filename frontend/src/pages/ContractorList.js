import React, { useState, useEffect } from 'react';

function ContractorList() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/contractors')
      .then(res => res.json())
      .then(data => {
        setContractors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading contractors...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1>Contractors</h1>

      {contractors.length === 0 ? (
        <div className="empty-state">
          <h2>No contractors found</h2>
          <p>Add contractors to manage your subcontractor network.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Trade</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Company</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map((contractor) => (
                <tr key={contractor.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{contractor.name}</td>
                  <td style={{ padding: '1rem' }}>{contractor.trade}</td>
                  <td style={{ padding: '1rem' }}>{contractor.company || '-'}</td>
                  <td style={{ padding: '1rem' }}>{contractor.phone || '-'}</td>
                  <td style={{ padding: '1rem' }}>{contractor.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ContractorList;
