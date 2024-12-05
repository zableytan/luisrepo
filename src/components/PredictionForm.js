import React, { useState } from "react";
import PriceGraph from './PriceGraph'; // Ensure the PriceGraph component handles multiple weeks
import '../Prediction.css'; 

const PredictionForm = ({ onSubmit }) => {
  const [commodity, setCommodity] = useState("Gabi"); // Default commodity
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [showGraph, setShowGraph] = useState(false); // State to manage graph visibility
  const [results, setResults] = useState(null); // Store prediction results
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !commodity) {
      setError("Please select a valid crop and date.");
      return;
    }
    setError("");
    setLoading(true); // Set loading state to true while fetching data

    const selectedDate = new Date(date);
    const { weekNumber, startOfWeek } = getWeekInfo(selectedDate);
    
    try {
      const prediction = await onSubmit(commodity, weekNumber, startOfWeek);
      setResults(prediction);
      setShowGraph(true);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError("There was an issue fetching the prediction. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false after data is fetched
    }
  };

  // Function to calculate week number and the start date of the week
  const getWeekInfo = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1); // January 1st of the year
    const daysSinceYearStart = Math.floor((date - firstDayOfYear) / 86400000); // Days since Jan 1
    const weekNumber = Math.ceil((daysSinceYearStart + firstDayOfYear.getDay() + 1) / 7); // Calculate week number

    // Calculate the start date of the current week
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // Day of the week (0 = Sunday, 6 = Saturday)
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1); // Adjust to Monday of the current week

    return { weekNumber, startOfWeek };
  };

  // Function to toggle graph visibility
  const handleToggleGraph = () => {
    setShowGraph((prev) => {
      if (prev) {
        setResults(null); // Clear results when hiding the graph
      }
      return !prev;
    });
  };

  return (
    <div className="prediction-form">
      <h2>Crop Price Prediction Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Crop:
          <select value={commodity} onChange={(e) => setCommodity(e.target.value)}>
            <option value="Gabi">Gabi</option>
            <option value="Kamote">Kamote</option>
            <option value="Karlang">Karlang</option>
            <option value="Cassava">Cassava</option>
          </select>
        </label>
        <br />
        <label>
          Select Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <br />
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Fetching Prediction..." : "Predict Prices"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {showGraph && results && (
        <>
          <PriceGraph data={results} /> {/* Pass the predictions to the graph */}
          <ul>
            {results.map((prediction) => (
              <li key={prediction.week}>
                Week {prediction.week}: Retail Price = {prediction.retail_prediction}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PredictionForm;
