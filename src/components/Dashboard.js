// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cassavaImage from '../assets/cassava.png';
import gabiImage from '../assets/Gabi.png';
import kamoteImage from '../assets/kamote.png';
import karlangImage from '../assets/karlang.png';
import '../Dashboard.css';

const crops = ['Gabi', 'Kamote', 'Karlang', 'Cassava'];

const Dashboard = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [cropData, setCropData] = useState([]);

  useEffect(() => {
    const fetchCropStats = async () => {
      try {
        const promises = crops.map(async (crop) => {
          const response = await axios.get(`http://localhost:5000/crop-stats?crop=${crop}`);
          const lastPrices = response.data;

          // Fetch predicted prices for the next week
          const today = new Date();
          const weekNumber = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 604800000);
          const predictionResponse = await axios.post(`http://localhost:5000/predict`, { commodity: crop, week: weekNumber });
          const predictedPrice = predictionResponse.data.predictions[0].retail_prediction;

          // Get the last price
          const lastPrice = lastPrices.length > 0 ? lastPrices[lastPrices.length - 1].Retail : null;

          return {
            crop,
            lastPrice,
            predictedPrice: parseFloat(predictedPrice),
            priceChange: lastPrice ? (parseFloat(predictedPrice) - lastPrice).toFixed(2) : null,
            trend: lastPrice ? (parseFloat(predictedPrice) > lastPrice ? 'up' : 'down') : null,
          };
        });

        const results = await Promise.all(promises);
        setCropData(results);
      } catch (error) {
        console.error("Error fetching crop stats:", error);
      }
    };

    fetchCropStats();
  }, []);

  // Function to handle crop selection and navigation
  const handleCropSelect = (crop) => {
    navigate(`/crop-stats?crop=${crop}`); // Navigate to crop stats with crop as a query parameter
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <p>Welcome to the dashboard! Here you can view various statistics and insights.</p>

        <div className="crop-overview">
          {cropData.map(({ crop, lastPrice, predictedPrice, priceChange, trend }, index) => (
            <div key={index} className="crop-card" onClick={() => handleCropSelect(crop)}>
              <h3>{crop}</h3>
              <img
                src={crop === 'Gabi' ? gabiImage : crop === 'Kamote' ? kamoteImage : crop === 'Karlang' ? karlangImage : cassavaImage}
                alt={crop}
              />
              <p>Last Price: {lastPrice ? `₱${lastPrice.toFixed(2)}` : 'N/A'}</p>
              <p>Predicted Price Next Week: {predictedPrice ? `₱${predictedPrice.toFixed(2)}` : 'N/A'}</p>
              {priceChange !== null && (
                <p>
                  Price Change: {trend === 'up' ? '↑' : '↓'} ₱{Math.abs(priceChange)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;