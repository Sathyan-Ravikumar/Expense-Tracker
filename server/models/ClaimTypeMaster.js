const mongoose = require('mongoose');

const ClaimTypeMasterSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('ClaimTypeMaster', ClaimTypeMasterSchema);
