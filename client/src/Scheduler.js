import React, { useState, useEffect } from 'react';
import './Scheduler.css';
import axios from 'axios';
import ScheduleComponent from './ScheduleComponent';

const API_BASE = "http://localhost:3001";

function Scheduler() {
    const [schedule, setSchedule] = useState({ startTime: '', endTime: '', deviceId: '' });
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await axios.get(`${API_BASE}/schedules`);
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${API_BASE}/newschedule`, schedule);
            alert('Schedule set successfully');
            fetchSchedules();
        } catch (error) {
            console.error('Error setting schedule:', error);
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await axios.delete(`${API_BASE}/deleteschedule/${id}`);
            const response = await axios.get(`${API_BASE}/schedules`);
            setSchedules(response.data);
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    return (
        <div className="scheduler">
            <h4>Device Scheduler</h4>
            <form onSubmit={handleSubmit} className="scheduler-form">
				<input
					type="datetime-local"
					value={schedule.startTime}
					onChange={(e) =>
					setSchedule({ ...schedule, startTime: e.target.value })
					}
				/>
				<input
					type="datetime-local"
					value={schedule.endTime}
					onChange={(e) =>
					setSchedule({ ...schedule, endTime: e.target.value })
					}
				/>
				<input
					type="text"
					value={schedule.deviceId}
					onChange={(e) =>
					setSchedule({ ...schedule, deviceId: e.target.value })
					}
					placeholder="Device ID"
				/>
                <button type="submit">Set Schedule</button>
            </form>
            {schedules.map(sch => (
                <ScheduleComponent key={sch._id} schedule={sch} deleteSchedule={deleteSchedule} />
            ))}
        </div>
    );
}

export default Scheduler;
