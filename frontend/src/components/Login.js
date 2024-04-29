import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './format/Login.css'; 

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { username, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);  
        setMessage('Login successful!');
        setError(''); // Reset error message if login successful
        // Add any additional logic here, such as redirecting to another page
        navigate('/user-profile');
      }
      
    } catch (error) {
      console.error(error.response.data);
      setError('Invalid login credentials. Please try again.');
      setMessage(''); // Reset message if login failed
    }
  };

  return (
    <div className="login-container " >
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <Link to="/create-account">Don't have an account? Register here</Link>
    </div>
  );
};

export default Login;
