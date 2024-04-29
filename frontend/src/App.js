import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login'; 
import CreateAccount from './components/CreateAccount'; 
import CreateNewTask from './components/CreateNewTask';
import TaskList from './components/TaskList';
import EditProfile from './components/EditProfile';
import UserProfile from './components/UserProfile';
import UserTasks from './components/UserTasks';
import NavBar from './components/NavBar';
import TaskManagement from './components/TaskManagement';
import Statistics from './components/Statistics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/create-new-task" element={<CreateNewTask />} />
        <Route path="/task-list" element={<TaskList />}/>
        <Route path="/edit-profile" element={<EditProfile/>}/>
        <Route path="/user-profile" element={<UserProfile/>}/>
        <Route path="/user-tasks" element={<UserTasks/>}/>
        <Route path="/nav" element={<NavBar/>}/>
        <Route path="/task-management" element={<TaskManagement/>}/>
        <Route path="/stats" element={<Statistics/>}/>


      </Routes>
    </Router>
  );
}

export default App;
