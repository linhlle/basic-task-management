import React from 'react';
import { Link } from 'react-router-dom';
import './format/LandingPage.css'

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div className="landing-page-content">

        <h1>Welcome to Task Management</h1>
        <div className="button-container">
          <Link to="/login" className="landing-button">
            Log In
          </Link>
          <Link to="/create-account" className="landing-button">
            Create Account
          </Link>
        </div>
      </div>
    </div>

  );
};

export default LandingPage;

