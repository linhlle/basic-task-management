import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './format/UserTasks.css'; 

const UserTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/task/getTasks', {
          headers: {
            'x-access-token': token
          }
        });
        setTasks(response.data);
      } catch (error) {
        console.error(error);
        setError('Error fetching tasks');
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="task-list">
      <h2>User Tasks</h2>
      {error && <p className="error-message">{error}</p>}
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <p>Title: {task.title}</p>
            <p>Description: {task.description}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserTasks;
