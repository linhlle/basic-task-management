const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    }],
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'],
        default: 'To Do', 
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium', 
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    completedAt: {
        type: Date,
    },

});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;