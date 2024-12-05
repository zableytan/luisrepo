import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getPrediction } from '../services/api'; // Import the prediction function
import PriceComparisonGraph from './PriceComparisonGraph'; // Import the graph component
import '../CropStats.css'; // Import the CSS file for styling

const CropStats = () => {
  const [lastPrices, setLastPrices] = useState([]);
  const [predictedPrices, setPredictedPrices] = useState([]);
  const [error, setError] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);
  const crop = queryParams.get('crop');

  useEffect(() => {
    const fetchCropStats = async () => {
      try {
        // Fetch last 4 weeks prices
        const response = await axios.get(`http://localhost:5000/crop-stats?crop=${crop}`);
        setLastPrices(response.data);

        // Fetch predicted prices for the next 4 weeks
        const today = new Date();
        const weekNumber = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 604800000); // Calculate current week number
        const prediction = await getPrediction(crop, weekNumber);
        setPredictedPrices(prediction);
      } catch (err) {
        setError(err.message);
      }
    };

    if (crop) {
      fetchCropStats();
    }
  }, [crop]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="crop-stats-container">
      {/* Crop Statistics Heading */}
      <div className="crop-stats-heading">
        <h2>Crop Statistics for {crop}</h2>
      </div>

      <div className="crop-card">
        <h3>Last 4 Weeks Prices</h3>
        <ul>
          {lastPrices.map((stat, index) => (
            <li key={index}>
              Date: {new Date(stat.Date).toLocaleDateString()} - Retail Price: {stat.Retail}
            </li>
          ))}
        </ul>
      </div>

      <div className="crop-card">
        <h3>Predicted Prices for Next 4 Weeks</h3>
        <ul>
          {predictedPrices.map((prediction, index) => (
            <li key={index}>
              Week {prediction.week}: Predicted Retail Price = {prediction.retail_prediction}
            </li>
          ))}
        </ul>
      </div>

      <div className="crop-card">
        <PriceComparisonGraph lastPrices={lastPrices} predictedPrices={predictedPrices} />
      </div>
    </div>
  );
};

export default CropStats;
