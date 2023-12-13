import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BudgetSetter.css';

const API_BASE = "http://ec2-157-175-156-138.me-south-1.compute.amazonaws.com:3001";

function BudgetSetter() {
  const [budget, setBudget] = useState('');
  const [currentBudget, setCurrentBudget] = useState();

  useEffect(() => {
    fetchCurrentBudget();
  }, []);

  const fetchCurrentBudget = async () => {
    try {
      const response = await axios.get(`${API_BASE}/budget`);
      setCurrentBudget(response.data[0].budget); // Ensure this matches the response structure
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  }

  const deleteExistingBudgets = async () => {
    try {
      await axios.delete(`${API_BASE}/deletebudget`);
    } catch (error) {
      console.error('Error deleting existing budgets:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await deleteExistingBudgets();
      await axios.post(`${API_BASE}/newbudget`, { budget });
      //alert('Budget set successfully');
      fetchCurrentBudget(); // Refresh the displayed budget
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  return (
    <div className="budget-setter">
      <h4>Set Your Budget</h4>
      <form onSubmit= {handleSubmit} className="budget-form">
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter your budget"
        />
        <button type="submit">Set Budget</button>
      </form>
      {currentBudget !== null && (
        <div className="current-budget">
          Current Budget: {currentBudget} SAR
        </div>
      )}
    </div>
  );
}

export default BudgetSetter;
