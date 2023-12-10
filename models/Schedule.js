const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: true },
    deviceId: { type: String, required: true }
  });
  
const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;