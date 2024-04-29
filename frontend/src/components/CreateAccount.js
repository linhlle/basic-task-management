import React, { useState } from 'react';
import axios from 'axios';
import './format/CreateAccount.css'; // Importing CreateAccount.css

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const { email, username, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { email, username, password });
      setMessage('Account created successfully!');
      console.log(res.data);
      setTimeout(() => {
        window.location.href = '/login';  
      }, 2000); 
 
    } catch (error) {
      console.error(error.response.data);
      setMessage('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="create-account-container">
      <h2>Create Account</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          className="input-field"
          type="text"
          name="username"
          value={username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          className="input-field"
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button className="submit-button" type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateAccount;
