import React, { useState, useEffect } from 'react';

function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    fetch(`${apiUrl}/api/contractors`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setTeamMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching team members:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading team members...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1>Team Members</h1>

      {teamMembers.length === 0 ? (
        <div className="empty-state">
          <h2>No team members found</h2>
          <p>Add team members to manage your subcontractor network.</p>
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
              {teamMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{member.name}</td>
                  <td style={{ padding: '1rem' }}>{member.trade}</td>
                  <td style={{ padding: '1rem' }}>{member.company || '-'}</td>
                  <td style={{ padding: '1rem' }}>{member.phone || '-'}</td>
                  <td style={{ padding: '1rem' }}>{member.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;
