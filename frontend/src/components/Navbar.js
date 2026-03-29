// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Folder, CheckCircle, Settings, LogOut } from 'lucide-react';
import logo from '../assets/images/TIKI_TASK_logo.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/profile">
          <img src={logo} alt="TIKI TASK" className="logo-image" />
        </Link>
      </div>

      <div className="navbar-menu">
        <Link to="/profile" className="nav-item">
          <User className="nav-icon" size={scrolled ? 24 : 28} strokeWidth={2} />
          <span className="nav-label">profile</span>
        </Link>

        <Link to="/projects" className="nav-item">
          <Folder className="nav-icon" size={scrolled ? 24 : 28} strokeWidth={2} />
          <span className="nav-label">projects</span>
        </Link>

        <Link to="/tasks" className="nav-item">
          <CheckCircle className="nav-icon" size={scrolled ? 24 : 28} strokeWidth={2} />
          <span className="nav-label">tasks</span>
        </Link>

        <Link to="/settings" className="nav-item">
          <Settings className="nav-icon" size={scrolled ? 24 : 28} strokeWidth={2} />
          <span className="nav-label">settings</span>
        </Link>

        <button onClick={handleLogout} className="nav-item logout-btn">
          <LogOut className="nav-icon" size={scrolled ? 24 : 28} strokeWidth={2} />
          <span className="nav-label">logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;