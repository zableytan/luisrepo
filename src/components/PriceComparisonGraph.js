// src/components/PriceComparisonGraph.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components you are using
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LastPricesGraph = ({ lastPrices }) => {
  const labels = lastPrices.map(stat => new Date(stat.Date).toLocaleDateString());
  const lastPricesData = lastPrices.map(stat => stat.Retail);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Last 4 Weeks Prices',
        data: lastPricesData,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointBorderColor: '#fff',
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h3>Last 4 Weeks Prices</h3>
      <Line data={chartData} />
    </div>
  );
};

const PredictedPricesGraph = ({ predictedPrices }) => {
  const predictedPricesData = predictedPrices.map(prediction => parseFloat(prediction.retail_prediction));
  const predictedPricesLabels = predictedPrices.map(prediction => `Week ${prediction.week}`);

  const chartData = {
    labels: predictedPricesLabels,
    datasets: [
      {
        label: 'Predicted Prices for Next 4 Weeks',
        data: predictedPricesData,
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        pointBackgroundColor: 'rgba(255,99,132,1)',
        pointBorderColor: '#fff',
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h3>Predicted Prices for Next 4 Weeks</h3>
      <Line data={chartData} />
    </div>
  );
};

const PriceComparisonGraph = ({ lastPrices, predictedPrices }) => {
  return (
    <div>
      <LastPricesGraph lastPrices={lastPrices} />
      <PredictedPricesGraph predictedPrices={predictedPrices} />
    </div>
  );
};

export default PriceComparisonGraph;