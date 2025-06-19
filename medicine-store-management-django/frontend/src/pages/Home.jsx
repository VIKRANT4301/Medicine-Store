import React from "react";
import { useNavigate } from "react-router-dom";  // Importing useNavigate hook
import "../styles/styles.css";  // Assuming you have custom styles defined here

const Home = () => {
  const navigate = useNavigate();  // Initialize the useNavigate hook

  // Function to handle redirection when the button is clicked
  const handleGetStarted = () => {
    navigate('/customers');  // Redirects to the customers page (or you can change the path if needed)
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Medical  Store Management</h1>
        <p className="home-description">
          Manage your customers, medicines, and purchases with ease. Experience a seamless and efficient way to run your pharmacy.
        </p>

        <div className="flash-offer">
          <h2>Flash Offers!</h2>
          <div className="offer-item">
            <p><strong>Heart & Lung Patients:</strong> 20% off on all purchases</p>
          </div>
          <div className="offer-item">
            <p><strong>Shopping Above ₹5000:</strong> 10% off on your order</p>
          </div>
        </div>

        <button className="cta-button" onClick={handleGetStarted}>
          Get Started
        </button>
        
      
      </div>
    </div>
  );
};

export default Home;
