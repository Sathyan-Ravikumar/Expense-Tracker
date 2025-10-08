const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const removeIndex = async () => {
  try {
    const db = mongoose.connection;
    await db.collection('users').dropIndex('employeeId_1');
    console.log('Index removed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

removeIndex();
