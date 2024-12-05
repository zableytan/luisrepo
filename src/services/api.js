import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Ensure this matches your Flask server URL

export const getPrediction = async (commodity, weekNumber) => {
  try {
    console.log("Sending request with:", { commodity, weekNumber }); // Log request data
    const response = await axios.post(`${API_BASE_URL}/predict`, { commodity, week: weekNumber });

    // Return all predictions (list of weeks and their retail predictions)
    return response.data.predictions; // Ensure the Flask API sends a `predictions` array
  } catch (error) {
    console.error("Error fetching prediction:", error.response || error.message);
    throw error;
  }
};
