import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import DeviceComponent from './DeviceComponent';

const API_BASE = "http://ec2-157-175-156-138.me-south-1.compute.amazonaws.com:3001";

function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [totalConsumption, setTotalConsumption] = useState(0);
    const [currentBudget, setCurrentBudget] = useState(1080);
    const [newDevice, setNewDevice] = useState({ deviceId: '', deviceType: '', location: '' });

    useEffect(() => {
        const ws = new WebSocket('ws://ec2-157-175-156-138.me-south-1.compute.amazonaws.com:3001');
        
        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            console.log('Message from server ', message);
            updateDeviceState(message);
            checkForAlerts(message);
            //checkBudgetAlert();
        };

        ws.onerror = (e) => {
            console.error('WebSocket Error: ', e);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        fetchDevicesAndBudget();
        //checkBudgetAlert();

        return () => {
            ws.close();
        };
    }, []);

    const fetchDevicesAndBudget = async () => {
        try {
            const devicesResponse = await axios.get(`${API_BASE}/devices`);
            const budgetResponse = await axios.get(`${API_BASE}/budget`);

            setDevices(devicesResponse.data);
            setCurrentBudget(budgetResponse.data.budget);
            calculateTotalConsumption(devicesResponse.data);
            checkBudgetAlert();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculateTotalConsumption = (devices) => {
        const total = devices.reduce((acc, device) => acc + device.cumulativeConsumption * 0.18, 0);
        setTotalConsumption(total);
        //checkBudgetAlert(totalConsumption);
    };

    const updateDeviceState = (updatedDevice) => {
        setDevices(devices => {
            const newDevices = devices.map(device =>
                device._id === updatedDevice._id ? updatedDevice : device
            );
            calculateTotalConsumption(newDevices);
            checkBudgetAlert();
            return newDevices;
        });
    };

    const checkForAlerts = (updatedDevice) => {
        if (updatedDevice.fireSignal) {
            alert(`Fire signal detected from device ${updatedDevice.deviceId}`);
        }
        if (updatedDevice.currentSignal) {
            alert(`High current signal detected from device ${updatedDevice.deviceId}`);
        }
    };

    const checkBudgetAlert = () => {
        if (totalConsumption >= currentBudget * 0.9 && totalConsumption < currentBudget) {
            alert(`Total consumption has reached 90% of the budget.`);
        } else if (totalConsumption >= currentBudget) {
            alert(`Total consumption has exceeded the budget.`);
        }
    };

    const flipStatus = async (id) => {
        await axios.put(`${API_BASE}/flip-status/${id}`);
        fetchDevicesAndBudget();
        //checkBudgetAlert();
    };

    const handleAddDevice = async (event) => {
        event.preventDefault();
        await axios.post(`${API_BASE}/device`, newDevice);
        setNewDevice({ deviceId: '', deviceType: '', location: '' });
        fetchDevicesAndBudget();
        //checkBudgetAlert();
    };

    return (
        <div className="dashboard">
            <h4>Device Dashboard</h4>
            <form onSubmit={handleAddDevice}>
                <input type="text" value={newDevice.deviceId} onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })} placeholder="Device ID" />
                <input type="text" value={newDevice.deviceType} onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })} placeholder="Device Type" />
                <input type="text" value={newDevice.location} onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} placeholder="Location" />
                <button type="submit">Add Device</button>
            </form>
            <div className='total-consumption'>
                Total Consumption: {totalConsumption} SAR
            </div>
            {devices.map(device => (
                <DeviceComponent key={device._id} device={device} flipStatus={flipStatus} />
            ))}
        </div>
    );
}

export default Dashboard;
