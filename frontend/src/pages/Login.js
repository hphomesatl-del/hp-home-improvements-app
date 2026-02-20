import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

function Login() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '2421') {
      localStorage.setItem('hp-pin-auth', 'true');
      const from = location.state?.from?.pathname || '/projects';
      navigate(from, { replace: true });
    } else {
      setError('Invalid PIN. Try again.');
    }
  };

  const isAuthenticated = localStorage.getItem('hp-pin-auth') === 'true';

  if (isAuthenticated) {
    return null; // Let routing handle
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.jpg" alt="HP Home Improvements" className="login-logo" />
        <h1>HP Home Improvements</h1>
        <h2>Team Dashboard Access</h2>
        <form onSubmit={handleSubmit}>
          <div className="pin-input">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="Enter PIN"
              autoFocus
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="login-btn">
            Access Dashboard
          </button>
        </form>
        <p className="public-note">Public customer views don't need PIN.</p>
      </div>
    </div>
  );
}

export default Login;
</xai:function_call ><xai:function_call name="edit">
<parameter name="path">hp-home-improvements-app/frontend/src/App.js