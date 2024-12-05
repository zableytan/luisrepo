import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register the components you are using
ChartJS.register(
  CategoryScale,  // CategoryScale for x-axis
  LinearScale,    // LinearScale for y-axis
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceGraph = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy any existing chart before rendering a new one
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    }
  }, [data]); // Re-run the effect when 'data' changes

  const weeks = data.map(item => `Week ${item.week}`);
  const prices = data.map(item => parseFloat(item.retail_prediction));

  const chartData = {
    labels: weeks,
    datasets: [
      {
        label: "Retail Price",
        data: prices,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        pointBackgroundColor: "rgba(75,192,192,1)",
        pointBorderColor: "#fff",
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h3>Price Trend</h3>
      <Line ref={chartRef} data={chartData} />
    </div>
  );
};

export default PriceGraph;
