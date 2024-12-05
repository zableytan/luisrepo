// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <Link to="/">Dashboard</Link> {/* Link to Dashboard */}
        </li>
        <li>
          <Link to="/prediction">Prediction</Link> {/* Link to Prediction */}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;