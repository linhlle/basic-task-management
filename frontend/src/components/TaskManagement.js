import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './format/TaskManagement.css';
import Modal from 'react-bootstrap/Modal';


const TaskManagement = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',
    priority: 'Medium',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({});
  const [message, setMessage] = useState('');
  const [view, setView] = useState('created'); 
  const [tasks, setTasks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sortBy, setSortBy] = useState('priority'); 
  const [sortOrder, setSortOrder] = useState('asc');


  const { title, description, assignedTo, dueDate, priority } = formData;

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchSearchResults();
  }, [searchTerm]);

  
  useEffect(() => {
    fetchTasks();
  }, [view]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/api/user/profile`, {
        headers: { 'x-access-token': token }
      });

      setUserData(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage('Error. Please log in again.');
    }
  };

  const fetchSearchResults = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/search/${searchTerm}`, {
        headers: { 'x-access-token': localStorage.getItem('token')
    }
      });
      setSearchResults(res.data.filter(user => !assignedTo.some(u => u._id === user._id)));
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const fetchTasks = async () => {
    try {
      let url = 'http://localhost:5000/api/task/';
      console.log(view);
      if (view === 'created') {
        url += 'getCreated';
      } else if (view === 'assigned') {
        url += 'getAssigned';
      } else if (view === 'all') {
        url += 'getTasks';
      }
      const res = await axios.get(url, {
        headers: { 'x-access-token': localStorage.getItem('token')}
      });
      setTasks(res.data);
      console.log(tasks);
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
          headers: { 'x-access-token':localStorage.getItem('token')}
        }
      );

      setMessage('Task created successfully');
      console.log('Response Data:', res.data);

      setFormData({
        title: '',
        description: '',
        assignedTo: [],
        dueDate: '',
        priority: 'Medium',
        status: ''
      });
      fetchTasks();
    } catch (error) {
      console.error(error.response.data);
      setMessage('Error creating task');
    }
  };

  const handleDeleteTask = async() => {
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    try {
        try {
            await axios.post('http://localhost:5000/api/auth/verify-password', 
                { password }, 
                { headers: { 'x-access-token': `${localStorage.getItem('token')}` } }
            );

        } catch (error) {
            console.error(error);
            setErrorMessage('Failed to delete account. Please try again.');
      
        }
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/task/delete-task', { taskId: selectedTaskId }, {
        headers: { 'x-access-token': token }
      });
      alert(response.data);
      await fetchTasks();
      setShowDeleteModal(false);
      setSelectedTaskId('');
      setPassword('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to delete task. Please try again.');
      setPassword('');
      setSelectedTaskId('');
    }
  };

  const handleCompleteTask = async(taskId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            'http://localhost:5000/api/task/complete-task',
            { taskId: taskId },
            { headers: { 'x-access-token': token } }
          );
          alert(response.data);
          await fetchTasks();  
    } catch (error) {
        console.error(error);
        setErrorMessage('Failed to complete task. Please try again.');
        setPassword('');
        setSelectedTaskId('');
    }
  }


  const handleCloseDeleteTaskModal = () => {
    setShowDeleteModal(false);
    setPassword('');
  };

  const sortTask = (tasks) => {

    if (!tasks) {
        return []; // or handle the undefined case appropriately
    }

    return tasks.sort((a, b) => {
      if (sortBy === 'dueDate') {
        // return new Date(a.dueDate) - new Date(b.dueDate);
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);  
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        console.log(sortOrder );
        const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
        // return priorityOrder[a.priority] - priorityOrder[b.priority];
        return sortOrder === 'asc' ? priorityOrder[a.priority] - priorityOrder[b.priority] : priorityOrder[b.priority] - priorityOrder[a.priority]; // Sort in ascending or descending order
      }
    });
  };

  const handleEditTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      console.log(taskId);
      const response = await axios.get(`http://localhost:5000/api/task/getTaskInfo/ ${taskId}`,
      {
        headers: { 'x-access-token': token }
      });
      setFormData(response.data);
      console.log("formData");
      console.log(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to fetch task data. Please try again.');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/task/edit-task/${selectedTaskId}`, formData, {
        headers: { 'x-access-token': token }
      });
      alert(response.data);
      await fetchTasks();
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to update task. Please try again.');
    }
  };


  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: '',
      priority: 'Medium',
      status: ''
    });
    setErrorMessage('');
  };



  return (
    <div>
    <button className='back' onClick={() => window.location.href = '/user-profile'}>
    Back to User Profile
    </button>

    <div className="task-management-container">
      <div className="create-task-container">
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
      <div className="toggle-bar">
        <button onClick={() => setView('created')}>Created Tasks</button>
        <button onClick={() => setView('assigned')}>Assigned Tasks</button>
        <button onClick={() => setView('all')}>All Tasks</button>
      </div>
      <div className="sort-bar">
        <span>Sort by:</span>
        <button onClick={()=> {
            const newSortOrder = sortBy === 'dueDate' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
            setSortBy('dueDate');
            setSortOrder(newSortOrder); 
            console.log(sortOrder);
          
        }}>Due Date</button>
        <button onClick={() => {
            const newSortOrder = sortBy === 'priority' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
            setSortBy('priority');
            setSortOrder(newSortOrder); 
            
        }}>Priority</button>
      </div>
      <div className="task-grid">
        {sortTask(tasks).map(task => (
            <div key={task._id} className='task-container'>
            <strong>{task.title}</strong>
            <p>Description: {task.description}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>   
            <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
            <div className="delete-button-container-1">
                <img
                src="https://static.vecteezy.com/system/resources/previews/010/147/759/non_2x/tick-icon-accept-approve-sign-design-free-png.png"
                alt="Done"
                className="delete-button-1"
                onClick={() => {
                    setSelectedTaskId(task._id);
                    handleCompleteTask(task._id);
                }}
                />
                {task.createdBy === userData._id && (
                  <img
                  src="https://cdn-icons-png.flaticon.com/512/5251/5251816.png"
                  alt="Delete"
                  className="delete-button-1"
                  onClick={() => {
                      setSelectedTaskId(task._id);
                      handleEditTask(task._id);
                  }}
                  />
                )}
                <img
                src="https://cdn-icons-png.flaticon.com/512/3687/3687412.png"
                alt="Edit"
                className="delete-button-1"
                onClick={() => {
                    setSelectedTaskId(task._id);
                    handleDeleteTask();
                }}
                />
                
            </div>
            </div>
        ))}
        </div>
        <Modal show={showDeleteModal} onHide={handleCloseDeleteTaskModal} backdrop="static" keyboard={true}>
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
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleCloseDeleteTaskModal}>Cancel</button>
          <button onClick={handleDeleteSubmit}>Confirm Delete</button>
        </Modal.Footer> 
        </Modal>
        
        
        <Modal show={showEditModal} onHide={handleCloseEditModal} backdrop="static" keyboard={true}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdateTask} className="edit-task-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={title} onChange={handleChange} required />
              </div>
              <hr className="divider" /> {/* Horizontal line to separate categories */}

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={description} onChange={handleChange} required />
              </div>
              <hr className="divider" /> {/* Horizontal line to separate categories */}

              <div className="form-group">
                <label>Assignees:</label>
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
                <ul className="assignee-list">
                  {assignedTo.map(user => (
                    <li key={user._id}>
                      {user.username}
                      <button onClick={() => handleRemoveAssignee(user)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
              <hr className="divider" /> 
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="dueDate" value={dueDate} onChange={handleChange} required />
              </div>
              <hr className="divider" /> 

              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <hr className="divider" /> 

              <div className="form-group">
                <label>Status</label>
                <select name="taskStatus" value={status} onChange={handleChange}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Update Task</button>

            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </Modal.Body>
          <Modal.Footer>
            <button onClick={handleCloseEditModal} className="btn btn-secondary">Cancel</button>
          </Modal.Footer>
        </Modal>


      </div>
    </div>
    
  );
};

export default TaskManagement;
