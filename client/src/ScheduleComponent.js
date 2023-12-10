import React, { useState } from 'react';

function ScheduleComponent({ schedule, deleteSchedule }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation(); // Prevent the expansion toggle when clicking delete
        await deleteSchedule(schedule._id);
    };

    return (
        <div className="schedule" onClick={toggleExpansion}>
            <div className="schedule-summary">
                Device ID: {schedule.deviceId}
            </div>

            {isExpanded && (
                <div className="schedule-details">
                    <div>Start Time: {schedule.startTime}</div>
                    <div>End Time: {schedule.endTime}</div>
                    <button className="delete-button" onClick={handleDeleteClick}>Delete Schedule</button>
                </div>
            )}
        </div>
    );
}

export default ScheduleComponent;
