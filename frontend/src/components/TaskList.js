import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 

import axios from 'axios';
import './format/TaskList.css';

const TaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tasks/${filter}/${sortBy}/${userId}`);
        setTasks(res.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchTasks();
  }, [filter, sortBy, userId]);

  const handleFilterChange = e => {
    setFilter(e.target.value);
  };

  const handleSortChange = e => {
    setSortBy(e.target.value);
  };

  return (
    <div className="task-list-container">
      <h2>Task List</h2>
      <div className="task-list-controls">
        <label>Filter by:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Created">Created</option>
          <option value="Assigned">Assigned</option>
        </select>
        <label>Sort by:</label>
        <select value={sortBy} onChange={handleSortChange}>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
        <Link to="/create-new-task" className="btn-create-task">Create New Task</Link>

      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id} className="task-item">
            <h3>{task.title}</h3>
            <p>Description: {task.description}</p>
            <p>Due Date: {task.dueDate}</p>
            <p>Priority: {task.priority}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
