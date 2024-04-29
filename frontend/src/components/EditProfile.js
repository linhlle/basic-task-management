import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './format/EditProfile.css';
import NavBar from './NavBar';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    newUsername: '',
    newEmail: '',
    newPassword: '',
    avatar: null
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/api/user/profile`, {
        headers: { 'x-access-token': `${token}` }
      });

      setFormData({
        newUsername: response.data.username || '',
        newEmail: response.data.email || '',
        newPassword: '',
        avatar: response.data.avatar || null
      });
    } catch (error) {
      console.error(error);
      setError('Error. Please log in again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }
  
      const res = await axios.post('http://localhost:5000/api/user/edit-profile', formData, {
        headers: {
          'x-access-token': token
        }
      });
      
      alert('Profile updated successfully!');
      setError('');
      setTimeout(() => {
        window.location.href = '/user-profile'; // Redirect to user profile page after 2 seconds
      }, 2000);
    } catch (error) {
        console.error(error.response.data);
        if (error.response.data.includes('Username already existed')) {
          setError('Username is already taken. Please choose a different one.');
        } else if (error.response.data.includes('Email already existed')) {
          setError('Email is already taken. Please choose a different one.');
        } else {
          setError('Failed to update profile. Please try again.');
        }
    }
  };
  

  return (
    <div>
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="newUsername"
          value={formData.newUsername}
          onChange={handleChange}
          placeholder="New Username"
        />
        <input
          type="email"
          name="newEmail"
          value={formData.newEmail}
          onChange={handleChange}
          placeholder="New Email"
        />
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="New Password"
        />
        <button type="submit">Update Profile</button>
        <a className='back' href="/user-profile">Back to User Profile</a>
      </form>
    </div>
    </div>
  );
};

export default EditProfile;
