const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
const Device = require('./models/Device');
const Budget = require('./models/Budget');
const Schedule = require('./models/Schedule');
const WebSocket = require('ws');
//const cron = require('node-cron');
//const path = require('path');
//const Schedule = require('./models/Schedule');


// Load environment variables
require('dotenv').config();

//craete an express appliaction, uses json
const app = express();
app.use(express.json());
app.use(cors());

/*const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

app.get("/*", function(req, res) {
    res.sendFile(path.join(buildPath, 'index.html'), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});*/

//create a websocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', function connection(ws) {
	console.log('A new client connected');
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});
});

function broadcastUpdate(data) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
}

// Connect to MongoDB
mongoose.connect("mongodb+srv://senior:Aa112233@senior.xhlztmh.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Could not connect to MongoDB', err));
// MQTT Broker Setup
var options = {
	host: '6f4b7b96195e47ecbf7314fc3a1e8466.s1.eu.hivemq.cloud',
	port: '8883',
	protocol: 'mqtts',
	username: 'cloud',
	password: 'Aa112233'
}
var mqttClient = mqtt.connect(options);
mqttClient.on('connect', function () {
	console.log('Connected to HiveMq')
});
mqttClient.on('error', function (error) {
    console.log(error);
});

mqttClient.on('message', async (topic, message) => {
    try {
        console.log(`Received message from topic: ${topic}`);
		console.log(message.toString());
        let deviceId = topic.split('/')[1];
        let deviceData = JSON.parse(message.toString());

        // Assuming deviceData contains status, liveConsumption, and cumulativeConsumption
		if (topic.startsWith('devicedata')) {
			const updatedDevice = await Device.findOneAndUpdate(
				{ deviceId: deviceId },
				{
					status: deviceData.St ? 1 : 0,
					liveConsumption: deviceData.P,
					cumulativeConsumption: deviceData.E,
					fireSignal: deviceData.FS ? 1 : 0,
					currentSignal: deviceData.CS ? 1 : 0
				},
				{ new: true }
			);
			const mesh = await Device.findOne({ deviceId: deviceId });
			if (updatedDevice) {
				broadcastUpdate(mesh);
				console.log(`Device ${deviceId} updated in database.`);
			} else {
				console.log(`Device ${deviceId} not found.`);
			}
		} else if (topic.startsWith('devicetype')) {
			const updatedDevice = await Device.findOneAndUpdate(
				{ deviceId: deviceId },
				{
					deviceType: deviceData.deviceType
				},
				{ new: true }
			);
			const mesh = await Device.findOne({ deviceId: deviceId });
			if (updatedDevice) {
				broadcastUpdate(mesh);
				console.log(`Device ${deviceId} updated in database.`);
			} else {
				console.log(`Device ${deviceId} not found.`);
			}
		}
    } catch (error) {
        console.error('Error processing MQTT message:', error);
    }
});

// Subscribe to topics for existing devices on startup
Device.find().then(devices => {
    devices.forEach(device => {
        mqttClient.subscribe("devicedata/" + device.deviceId);
		mqttClient.subscribe("devicetype/" + device.deviceId);
    });
});

///** / Define routes / **///

// /*/ Device Routes /*/ //
// get all devices
app.get('/devices', async (req,res) => {
	try {
		const devices = await Device.find();
		res.json(devices);
	} catch (error) {
		res.status(400).send(error);
	}
});
// add new device to the database
app.post('/device', async (req, res) => {
	try {
		const newDevice = new Device(req.body);
		await newDevice.save();// save the new device in the database
		mqttClient.subscribe("devicedata/" + newDevice.deviceId);// subscribe in the data topic of that device
		res.json(newDevice);
	} catch (error) {
		res.status(400).send(error);
	}
});
// update device in the database
app.put('/device/update/:id', async (req, res) => {
	try {
		const device = await Device.findOneAndUpdate({deviceId: req.params.id}, req.body, { new: true });
		if (!device) {
			return res.status(404).send();
		}
		// Notification
		checkForNotifications();
		res.json(device);
	} catch (error) {
		res.status(400).send(error);
	}
});
// Route to flip the status of a device
app.put('/flip-status/:id', async (req, res) => {
    try {
        const device = await Device.findOne({deviceId: req.params.id});
        if (!device) {
            return res.status(404).send('Device not found');
        }
        // Flip the status
        device.status = !device.status;
        await device.save();

		let digitalStatus
		if (device.status) {
			digitalStatus = 1
		} else if (!device.status) {
			digitalStatus = 0
		}
        // Publish the updated status
        const message = JSON.stringify({ St: digitalStatus});
        mqttClient.publish("devicecontrol/" + device.deviceId, message);

        res.send(device);
    } catch (error) {
        res.status(500).send('Server error');
    }
});
// delete device from the database
app.delete('/device/delete/:id', async (req, res) => {
	try {
		const device = await Device.findOneAndDelete({deviceId: req.params.id});
		if (!device) {
			return res.status(404).send();
		}
		mqttClient.unsubscribe("devicedata/" + device.deviceId);
		res.json(device);
	} catch (error) {
		res.status(500).send(error);
	}
});

// /*/ Budget Routes /*/ //
// add new Budget to the database
app.post('/newbudget', async (req, res) => {
		try {
			const newBudget = new Budget(req.body);
			await newBudget.save();
			res.json(newBudget);
		} catch (error) {
			res.status(400).send(error);
		}
});
// get the budget
app.get('/budget', async (req, res) => {
	try {
		const setBudget = await Budget.find();
		res.json(setBudget);
	} catch (error) {
		res.status(400).send(error);
	}
});
// delete a budget
app.delete('/deletebudget', async (req, res) => {
    try {
        const deletedBudgets = await Budget.deleteMany({});
        res.json(deletedBudgets);
    } catch (error) {
        res.status(400).send(error);
    }
});

// /*/ Schedule Routes /*/ //
// Add Schedule 
app.post('/newschedule', async (req, res) => {
	try {
		const schedule = new Schedule(req.body);
		await schedule.save();
		res.json(schedule);
	} catch (error) {
		res.status(400).send(error);
	}
});
// get schedules
app.get('/schedules', async (req, res) => {
	try {
		const setSchedules = await Schedule.find();
		res.json(setSchedules);
	} catch (error) {
		res.status(400).send(error);
	}
});
// delete a schedule
app.delete('/deleteschedule/:id', async (req, res) => {
	try {
		const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
	} catch (error) {
		res.status(400).send(error);
	}
});

/*
// Function to check schedules and update device status
async function checkSchedulesAndUpdateDevices() {
    const schedules = await Schedule.find();
    const currentTime = new Date();

    schedules.forEach(async (schedule) => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);

        if (currentTime >= startTime && currentTime <= endTime) {
            // Turn the device on
            await flipDeviceStatus(schedule.deviceId, true);
        } else if (currentTime > endTime) {
            // Turn the device off
            await flipDeviceStatus(schedule.deviceId, false);
        }
    });
}
// Function to flip device status
async function flipDeviceStatus(deviceId, status) {
    const device = await Device.findOne({ deviceId: deviceId });
    if (device) {
        device.status = status;
        await device.save();

        // Publish the updated status
        const message = JSON.stringify({ status: device.status });
        mqttClient.publish("devicecontrol/" + device.deviceId, message);
    }
}
// Schedule a task to run every minute
cron.schedule('* * * * *', () => {
    checkSchedulesAndUpdateDevices();
});
*/
// Start the server
const port = 3001;
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});
