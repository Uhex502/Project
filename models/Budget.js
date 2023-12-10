const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budget: { type: Number, default: 1080 }
});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
