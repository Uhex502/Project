import React, { useState } from 'react';

function DeviceComponent({ device, flipStatus }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const handleStatusFlip = (e) => {
        e.stopPropagation(); // Prevent click from bubbling up to the device element
        flipStatus(device.deviceId);
    };

    return (
        <div className="device" onClick={handleExpansion}>
            <div className="device-summary">
                <div className="Type">{device.deviceType}</div>
                <div className="Location">{device.location}</div>
            </div>

            {isExpanded && (
                <div className="device-details">
                    {/* Detailed information */}
                    <div className="Device Id">Device ID: {device.deviceId}</div>
                    <div className="Status">Status: {device.status ? "On" : "Off"}</div>
                    <div className="Live Consumption in kWh">Live Consumption in kWh: {device.liveConsumption}</div>
                    <div className="Live Consumption in SAR">Live Consumption in SAR: {device.liveConsumption * 0.18}</div>
                    <div className="Cumulative Consumption in kWh">Cumulative Consumption in kWh: {device.cumulativeConsumption}</div>
                    <div className="Cumulative Consumption in SAR">Cumulative Consumption in SAR: {device.cumulativeConsumption * 0.18}</div>
                    <div className={`status-slider ${device.status ? 'on' : 'off'}`} onClick={handleStatusFlip}>
                        <div className="slider-thumb"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeviceComponent;
