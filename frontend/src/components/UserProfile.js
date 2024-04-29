import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

import './format/UserProfile.css';

const ProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/api/user/profile`, {
        headers: { 'x-access-token': `${token}` }
      });

      setUserData(response.data);
    } catch (error) {
      console.error(error);
      if (error.response.status === 401) {
        window.location.href = '/login';
      }
      setError('Error. Please log in again.');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/user/delete-account',
        { password },
        { headers: { 'x-access-token': token } }
      );
      if (response.data.success) {
        // Account deleted successfully, log out the user
        localStorage.removeItem('token');
        // Redirect to login or home page
        window.location.href = '/login'; // or any other route
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPassword('');
    setDeleteError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-card">
        {deleteError && <p className="error-message">{deleteError}</p>}
        <p>Username: {userData.username}</p>
        <p>Email: {userData.email}</p>

        <Link to="/edit-profile">
          <button>Edit Profile</button>
        </Link>
        <button className="delete-button" onClick={() => setShowDeleteModal(true)}>Delete Account</button>

        <Link to="/task-management">
          <button className='delete-button'>Task Management</button>
        </Link>

        <Link to="/stats">
          <button className='delete-button'>View Statistics</button>
        </Link>


      </div>

      <a href="#" className='log-out' onClick={() => handleLogout()}>Log Out</a>


      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} backdrop="static" keyboard={true}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Verify your password:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {deleteError && <p className="error-message">{deleteError}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleCloseDeleteModal}>Cancel</button>
          <button onClick={handleDelete}>Confirm Delete</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage;
