const express = require('express');
const connectWithMongoose = require('../database/mongoose');
const jwt = require('jsonwebtoken');
const User = require('../modules/User');
const Task = require('../modules/Task');
const router = express.Router();
const dbo = require('../database/db');
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const validator = require('validator');
const mongoose = require('mongoose');


// Middleware function to verify the JWT token in the request headers.
const verifyToken = (req, res, next) => {
    console.log("verify func");
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to authenticate token.' });
      }
      req.user = { id: decoded.id };
      next();
    });
};
  
// Route to verify token
router.get('/verify-token', verifyToken, (req, res) => {
    res.send({ valid: true });
});


// Retrieve all the tasks from the database
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().populate('createdBy', 'assignedTo', 'title', 'status', 'priority', 'dueDate').lean();
        res.json(tasks);
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error fetching tasks");
    }
});

router.post('/createTask', verifyToken, async(req, res) => {
  const { title, description, assignedTo, dueDate, priority, createdBy } = req.body;
  
  if (!validator.isAscii(title) || !validator.isAscii(description) || !validator.isISO8601(dueDate) || !validator.isIn(priority, ['Low', 'Medium', 'High'])) {
    return res.status(400).json({ message: 'Invalid task data' });
  }
  
  try {

    const session = await mongoose.startSession();
    session.startTransaction();

    const createdBy = new ObjectId(req.user.id); 
    const assignedToIds = assignedTo.map(user => new ObjectId(user._id));
    const newTask = new Task({
      createdBy,
      title,
      description,
      assignedTo: assignedToIds,
      priority,
      dueDate,

    });

    // const savedTask = await newTask.save();

    // await User.findByIdAndUpdate(createdBy, { $push: { createdTasks: savedTask._id, tasks: savedTask._id } });
    // // Update assignees' assignedTask array
    // for (const userId of assignedToIds) {
    //   await User.findByIdAndUpdate(userId, { $push: { assignedTasks: savedTask._id, tasks: savedTask._id } });
    // }

    const savedTask = await newTask.save({ session });
    await User.findByIdAndUpdate(createdBy, { $push: { createdTasks: savedTask._id, tasks: savedTask._id } }, { session });
    for (const userId of assignedToIds) {
      await User.findByIdAndUpdate(userId, { $push: { assignedTasks: savedTask._id, tasks: savedTask._id } }, { session });
    }

    await session.commitTransaction(); 
    session.endSession(); 

   
    res.status(201).json({ message: 'Task created successfully', task: savedTask });


  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();

    res.status(500).send("Error creating new task");
  }
});


// Get the tasks of the users
router.get('/getTasks', verifyToken, async(req, res) => {

  const dbConnect = dbo.getDb();
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    const taskIds = user.tasks.map(id => new ObjectId(id));
    const tasks = await Task.find({ _id: { $in: taskIds } });
    const taskIdsArray = tasks.map(task => task._id);
    
    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erorr fetching user tasks.");
  }

});

// Route handler to get tasks created by a user
router.get('/getCreated', verifyToken, async (req, res) => {

  const dbConnect = dbo.getDb();

  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Fetch all tasks created by the authenticated user
    const tasks = await Task.find({ createdBy: userId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching created tasks.");
  }
});

// Route handler to get tasks assigned to a user
router.get('/getAssigned', verifyToken, async (req, res) => {

  const dbConnect = dbo.getDb();

  try {

    const userId = req.user.id;
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('User not found.');
    }
    const tasks = await Task.find({ assignedTo: req.user.id });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching assigned tasks.");
  }
});

router.post('/delete-task', verifyToken, async(req, res) => {
  const userId = req.user.id;
  const taskId = req.body.taskId; 

  try {
    const session = await mongoose.startSession(); 
    session.startTransaction(); 

    const task = await Task.findOne({ _id: taskId, createdBy: userId });
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send('Task not found or you are not authorized to delete this task.');
    }


    // await User.updateMany({ _id: { $in: task.assignedTo } }, { $pull: { assignedTasks: taskId } });

    // await Task.deleteOne({ _id: taskId });

    // await User.updateOne({ _id: userId }, { $pull: { createdTasks: taskId, tasks: taskId } });

    await User.updateMany({ _id: { $in: task.assignedTo } }, { $pull: { assignedTasks: taskId } }, { session });
    await Task.deleteOne({ _id: taskId }, { session });
    await User.updateOne({ _id: userId }, { $pull: { createdTasks: taskId, tasks: taskId } }, { session });

    await session.commitTransaction(); 
    session.endSession(); 

    res.status(200).send('Task deleted successfully.');
  } catch (error) {
      console.error('Error deleting task:', error);
      await session.abortTransaction(); 
      session.endSession();
      res.status(500).send('Failed to delete task.');
  }
});

router.post('/complete-task', verifyToken, async(req, res) => {
  const userId = req.user.id;
  const taskId = req.body.taskId;

  try {

    const session = await mongoose.startSession(); 
    session.startTransaction(); 

    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send('User not found.');
    }

    const task = await Task.findOne({ _id: taskId });
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send('Task not found or you are not authorized to delete this task.');
    } 

    // await Task.updateOne({ _id: taskId }, { $set: { status: 'Completed', completedAt: Date.now() } });

    await Task.updateOne({ _id: taskId }, { $set: { status: 'Completed', completedAt: Date.now() } }, { session });
    await session.commitTransaction(); 
    session.endSession(); 
    res.status(200).send('Task completed successfully.');


  }
  catch (error) {
    console.error('Error completing task:', error);
    await session.abortTransaction();
    session.endSession();

    res.status(500).send('Failed to complete task.');

  }
});

router.get('/getStatistics', verifyToken,  async (req, res) => {

  
  const userId = req.user.id;
  const now = new Date();

  try {
    // 1. Number of tasks the user created last week and last month
    const tasksCreatedLastWeek = await Task.countDocuments({ createdBy: userId, createdAt: { $gte: moment().subtract(1, 'weeks').toDate() } });
    const tasksCreatedLastMonth = await Task.countDocuments({ createdBy: userId, createdAt: { $gte: moment().subtract(1, 'months').toDate() } });

    // 2. Total tasks the user has created
    const totalTasksCreated = await Task.countDocuments({ createdBy: userId });

    // 3. Number of tasks the user has been assigned last week and last month
    const tasksAssignedLastWeek = await Task.countDocuments({ assignedTo: userId, createdAt: { $gte: moment().subtract(1, 'weeks').toDate() } });
    const tasksAssignedLastMonth = await Task.countDocuments({ assignedTo: userId, createdAt: { $gte: moment().subtract(1, 'months').toDate() } });

    // 4. Total tasks the user has been assigned
    const totalTasksAssigned = await Task.countDocuments({ assignedTo: userId });

    // 5. Total completed, in-progress, overdue, and to do in the created tasks and their percentage
    const createdTasksStats = await getTaskStats(userId, 'created');
    const assignedTasksStats = await getTaskStats(userId, 'assigned');

    // 7. Priority distribution of the tasks created and assigned
    const priorityDistribution = await getPriorityDistribution(userId);

    // 8. Average completion time for assigned and created tasks
    const averageCompletionTime = await getAverageCompletionTime(userId);

    res.status(200).json({
      tasksCreatedLastWeek,
      tasksCreatedLastMonth,
      totalTasksCreated,
      tasksAssignedLastWeek,
      tasksAssignedLastMonth,
      totalTasksAssigned,
      createdTasksStats,
      assignedTasksStats,
      priorityDistribution,
      averageCompletionTime,
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).send('Error fetching task statistics');
  }
});

// Function to get task statistics (completed, in-progress, overdue, and to-do) for a user
const getTaskStats = async (userId, type) => {
  const now = new Date();
  const tasks = await Task.find({ [type === 'created' ? 'createdBy' : 'assignedTo']: userId });

  let completed = 0;
  let inProgress = 0;
  let overdue = 0;
  let toDo = 0;

  tasks.forEach(task => {
    if (task.status === 'Completed') {
      completed++;
    } else if ((task.status === 'In Progress' || task.status === 'To Do') && new Date(task.dueDate) < now) {
      overdue++;
    } else if (task.status === 'In Progress') {
      inProgress++;
    } else {
      toDo++;
    }
  });
  
  const total = completed + inProgress + overdue + toDo;

  return {
    completed: { count: completed, percentage: (completed / total) * 100 },
    inProgress: { count: inProgress, percentage: (inProgress / total) * 100 },
    overdue: { count: overdue, percentage: (overdue / total) * 100 },
    toDo: { count: toDo, percentage: (toDo / total) * 100 },
  };
};


const getPriorityDistribution = async (userId) => {
  const user = await User.findById(userId).populate('tasks');
  
  const priorityCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  user.tasks.forEach(task => priorityCounts[task.priority]++);

  return priorityCounts;
};


// Function to calculate average completion time for assigned and created tasks
const getAverageCompletionTime = async (userId) => {
  const createdTasks = await Task.find({ createdBy: userId, status: 'Completed' });
  const assignedTasks = await Task.find({ assignedTo: userId, status: 'Completed' });

  const createdCompletionTimes = createdTasks.map(task => task.completedAt - task.createdAt);
  const assignedCompletionTimes = assignedTasks.map(task => task.completedAt - task.createdAt);

  const averageCreatedCompletionTime = createdCompletionTimes.reduce((acc, curr) => acc + curr, 0) / createdCompletionTimes.length;
  const averageAssignedCompletionTime = assignedCompletionTimes.reduce((acc, curr) => acc + curr, 0) / assignedCompletionTimes.length;

  // Convert milliseconds to hours
  const averageCreatedCompletionTimeHours = averageCreatedCompletionTime / (1000 * 60 * 60);
  const averageAssignedCompletionTimeHours = averageAssignedCompletionTime / (1000 * 60 * 60);

  // Convert milliseconds to days
  const averageCreatedCompletionTimeDays = averageCreatedCompletionTime / (1000 * 60 * 60 * 24);
  const averageAssignedCompletionTimeDays = averageAssignedCompletionTime / (1000 * 60 * 60 * 24);
  

  return {
    created: {
      hours: averageCreatedCompletionTimeHours,
      days: averageCreatedCompletionTimeDays,
    },
    assigned: {
      hours: averageAssignedCompletionTimeHours,
      days: averageAssignedCompletionTimeDays,
    },
  };
};

router.get('/getTaskInfo/:taskId', verifyToken, async(req, res) => {

  const userId = req.user.id;
  const taskId = req.params.taskId.trim();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found.')
    }

    const task = await Task.findOne({ _id: taskId, createdBy: userId}).populate('assignedTo');
    if (!task) {
      return res.status(404).send('Task not found or you are not eligible to retrieve this task information.');
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fail to get Task Information')
  }
});

router.post('/edit-task/:taskId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.taskId;
  const { title, description, assignedTo, dueDate, priority, status } = req.body;

  try {
    const session = await mongoose.startSession(); 
    session.startTransaction(); 

    const task = await Task.findOne({ _id: taskId, createdBy: userId });

    if (!task) {
      await session.abortTransaction(); 
      session.endSession(); 
      return res.status(404).json({ message: 'Task not found or unauthorized to edit' });
    }

    task.title = title;
    task.description = description;
    task.assignedTo = assignedTo;
    task.dueDate = dueDate;
    task.priority = priority;
    task.status = status;

    console.log(task);
    // await task.save();

    await task.save({ session });

    await session.commitTransaction();
    session.endSession(); 
    res.status(200).json({ message: 'Task updated successfully', task: task });
  } catch (error) {
    console.error(error);
    await session.abortTransaction(); 
    session.endSession(); 
    res.status(500).json({ message: 'Failed to update task' });
  }
});


module.exports = router;