import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './format/CreateNewTask.css';

const CreateNewTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',
    priority: 'Medium'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({});
  const [message, setMessage] = useState('');

  const { title, description, assignedTo, dueDate, priority } = formData;

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchSearchResults();
  }, [searchTerm]);



  const fetchUserData = async () => {
    const tokenFromStorage = localStorage.getItem('token');
    setToken(tokenFromStorage);

    try {
      const response = await axios.get(`http://localhost:5000/api/user/profile`, {
        headers: { 'x-access-token': tokenFromStorage }
      });

      setUserData(response.data);
    } catch (error) {
      console.error(error);
      setError('Error. Please log in again.');
    }
  };

  const fetchSearchResults = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/search/${searchTerm}`, {
        headers: { 'x-access-token': token }
      });
      setSearchResults(res.data.filter(user => !assignedTo.some(u => u._id === user._id)));
    } catch (error) {
      console.error(error.response.data);
    }
  };


  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const handleAssigneeSelect = user => {
    if (!assignedTo.find(u => u._id === user._id)) {
      setFormData({ ...formData, assignedTo: [...assignedTo, user] });
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveAssignee = userToRemove => {
    const updatedAssignedTo = assignedTo.filter(user => user._id !== userToRemove._id);
    setFormData({ ...formData, assignedTo: updatedAssignedTo });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setFormData({ ...formData, createdBy: userData._id });
      console.log(formData);

      const res = await axios.post(
        'http://localhost:5000/api/task/createTask',
        formData,
        {
          headers: { 'x-access-token': token }
        }
      );

      setMessage('Task created successfully');
      console.log('Response Data:', res.data);

      setFormData({
        title: '',
        description: '',
        assignedTo: [],
        dueDate: '',
        priority: 'Medium'
      });
    } catch (error) {
      console.error(error.response.data);
      setMessage('Error creating task');
    }
  };

  return (
    <div className="task-form-container">
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit} className="task-form">
        {message && <div>{message}</div>}
        <input type="text" name="title" value={title} onChange={handleChange} placeholder="Title" required />
        <textarea name="description" value={description} onChange={handleChange} placeholder="Description" required />
        <div className="assignee-search">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Assignee"
            className="assignee-input"
          />
          <div className="search-results">
            {searchResults.map(user => (
              <button key={user._id} onClick={() => handleAssigneeSelect(user)}>{user.username}</button>
            ))}
          </div>
        </div>
        {assignedTo.length > 0 && (
          <div>
            <p>Assignees:</p>
            <ul>
              {assignedTo.map(user => (
                <li key={user._id}>
                  {user.username}
                  <button onClick={() => handleRemoveAssignee(user)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <input type="date" name="dueDate" value={dueDate} onChange={handleChange} placeholder="Due Date" required />
        <select name="priority" value={priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
};

export default CreateNewTask;
