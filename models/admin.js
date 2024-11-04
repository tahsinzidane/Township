const mongoose = require('mongoose');
require('dotenv').config()


const adminSchema = new mongoose.Schema({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
