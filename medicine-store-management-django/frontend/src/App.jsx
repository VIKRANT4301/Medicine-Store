import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DealerComponent from './components/DealerComponent';
import EmployeeComponent from './components/EmployeeComponent';
import CustomerComponent from './components/CustomerComponent';
import MedicineComponent from './components/MedicineComponent';
import PurchaseComponent from './components/PurchaseComponent';
import Home from './pages/Home'; // Import the Home component

import './styles/custom.css';  // Import custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Medical Shop Management</h1>

        {/* Navigation */}
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dealers">Dealers</a></li>
            <li><a href="/employees">Employees</a></li>
            <li><a href="/customers">Customers</a></li>
            <li><a href="/medicines">Medicines</a></li>
            <li><a href="/purchases">Purchases</a></li>
          </ul>
        </nav>

        {/* Routes for each section */}
        <Routes>
          <Route path="/" element={<Home />} />  {/* Add the Home route */}
          <Route path="/dealers" element={<DealerComponent />} />
          <Route path="/employees" element={<EmployeeComponent />} />
          <Route path="/customers" element={<CustomerComponent />} />
          <Route path="/medicines" element={<MedicineComponent />} />
          <Route path="/purchases" element={<PurchaseComponent />} />
        </Routes>

        {/* Copyright Footer */}
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Pharma Store Management. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
