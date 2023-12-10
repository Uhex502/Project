const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {type: String, required: true},
  deviceType: {type: String, default: "Unidentified Device"},
  location: {type: String, default: "Home"},
  status: {type: Boolean, default: false},
  liveConsumption: {type: Number, default: 0},
  cumulativeConsumption: {type: Number, default: 0},
  fireSignal: {type: Boolean, default: false},
  currentSignal: {type: Boolean, default: false}
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;