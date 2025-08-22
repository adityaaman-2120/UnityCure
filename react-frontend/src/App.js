import React, { useState } from 'react';
import Login from './components/Login';
import HospitalList from './components/HospitalList';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login />;
      case 'hospitals':
        return <HospitalList />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏥</span>
          UnityCure React Demo
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentPage('login')}
          >
            Login/Register
          </button>
          <button 
            className={`nav-link ${currentPage === 'hospitals' ? 'active' : ''}`}
            onClick={() => setCurrentPage('hospitals')}
          >
            Hospitals
          </button>
          <button 
            className={`nav-link ${currentPage === 'chatbot' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chatbot')}
          >
            AI Chatbot
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>UnityCure React Frontend Demo - MySQL Backend Integration</p>
          <p>API Base URL: http://localhost:5174/api</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
