const mongoose = require('mongoose');

const StatusMasterSchema = new mongoose.Schema({
  statusName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('StatusMaster', StatusMasterSchema);
