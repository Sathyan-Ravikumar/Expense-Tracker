const mongoose = require('mongoose');

const RoleMasterSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('RoleMaster', RoleMasterSchema);
