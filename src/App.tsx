import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import LoginPage from './pages/LoginPage';
import PlayerPage from './pages/PlayerPage';

const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/" element={token ? <PlayerPage /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
