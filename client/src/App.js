import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import BudgetSetter from './BudgetSetter';
import Scheduler from './Scheduler';

function App() {
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li><Link to="/dashboard">Dashboard</Link></li>
						<li><Link to="/budget-setter">Budget Setter</Link></li>
						<li><Link to="/scheduler">Scheduler</Link></li>
					</ul>
				</nav>

				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/budget-setter" element={<BudgetSetter />} />
					<Route path="/scheduler" element={<Scheduler />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
