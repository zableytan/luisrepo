import React from "react";
import PriceGraph from "./PriceGraph";

const PredictionResults = ({ results, crop, date }) => {
  // Format date to display in a readable format
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div>
      <h2>Prediction Results for {crop}</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            Week {result.week} (Starting {formatDate(result.date)}): 
            Retail Price Prediction = {result.retail_prediction}
          </li>
        ))}
      </ul>

      {/* Add the PriceGraph component to display the trend of retail prices */}
      <PriceGraph data={results} />
    </div>
  );
};

export default PredictionResults;
