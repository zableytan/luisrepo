// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PredictionForm from "./components/PredictionForm";
import PredictionResults from "./components/PredictionResults";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import CropStats from "./components/CropStats"; // Import the new CropStats component
import { getPrediction } from "./services/api";

function App() {
  const [results, setResults] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handlePrediction = async (commodity, weekNumber, startOfWeek) => {
    try {
      const prediction = await getPrediction(commodity, weekNumber);
      console.log("API Response:", prediction);
      const weeksWithDates = prediction.map((result, index) => {
        const weekStartDate = new Date(startOfWeek);
        weekStartDate.setDate(weekStartDate.getDate() + index * 7);
        return {
          ...result,
          date: weekStartDate,
        };
      });
      setResults(weeksWithDates);
      setSelectedCrop(commodity);
      setSelectedDate(startOfWeek);
    } catch (error) {
      alert("Failed to fetch prediction. Check console for details.");
      console.error(error);
    }
  };

  return (
    <Router>
      <div className="container">
        <header>
          <h1>Price Prediction Web</h1>
        </header>
        <Sidebar />
        <main className="flex-container">
          <Routes>
            <Route path="/" element={
              <div className="column">
                <Dashboard /> {/* Set Dashboard as the default component */}
              </div>
            } />
            <Route path="/prediction" element={
              <div className="column">
                <PredictionForm onSubmit={handlePrediction} />
                {results && (
                  <PredictionResults
                    results={results}
                    crop={selectedCrop}
                    date={selectedDate}
                  />
                )}
              </div>
            } />
            <Route path="/crop-stats" element={<CropStats />} /> {/* Add route for CropStats */}
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Price Prediction Web. All rights reserved.</p>
          <p>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;