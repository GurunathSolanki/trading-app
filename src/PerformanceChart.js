import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PerformanceChart({ trades }) {
  const [showAbsolute, setShowAbsolute] = useState(false); // New state for toggle

  // Calculate cumulative data
  let cumulativeOptions = 0;
  let cumulativeMF = 0;
  const cumulativeOptionsData = trades.map(t => cumulativeOptions += parseFloat(t.total_profit || 0));
  const cumulativeMFData = trades.map(t => cumulativeMF += parseFloat(t.pnl || 0));

  const data = {
    labels: trades.map(t => t.exit_date),
    datasets: [
      {
        label: showAbsolute ? "Options Cumulative Profit" : "Options %",
        data: showAbsolute ? cumulativeOptionsData : trades.map(t => t.percent),
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.18)",
        pointBackgroundColor: "#0f766e",
        tension: 0.3,
        fill: true,
      },
      {
        label: showAbsolute ? "MF Cumulative PnL" : "MF %",
        data: showAbsolute ? cumulativeMFData : trades.map(t => t.mf_profit),
        borderColor: "#dc3545",
        backgroundColor: "rgba(220, 53, 69, 0.18)",
        pointBackgroundColor: "#dc3545",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Cumulative Growth",
        data: showAbsolute
          ? cumulativeOptionsData.map((v, i) => v + cumulativeMFData[i])
          : trades.map(t => Number(t.percent || 0) + Number(t.mf_profit || 0)),
        borderColor: "#6d28d9",
        backgroundColor: "rgba(109, 40, 217, 0.12)",
        pointBackgroundColor: "#6d28d9",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  // Move options inside to access showAbsolute 
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: showAbsolute ? 'Options vs Mutual Fund Performance (Absolute)' : 'Options vs Mutual Fund Performance (%)' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return showAbsolute ? `${context.dataset.label}: ₹${context.parsed.y}` : `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false, // allow negative values
        ticks: {
          callback: function (value) {
            return showAbsolute ? '₹' + value : value + '%';
          }
        }
      }
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-teal">Avg Options %</h5>
              <p className="card-text fs-4">{trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.percent || 0), 0) / trades.length).toFixed(2) : 0}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-crimson">Avg MF %</h5>
              <p className="card-text fs-4">{trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.mf_profit || 0), 0) / trades.length).toFixed(2) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="mb-3 text-center">
        <button className="btn btn-outline-primary" onClick={() => setShowAbsolute(!showAbsolute)}>
          Toggle to {showAbsolute ? 'Percentage' : 'Absolute Values'}
        </button>
      </div>

      <Line data={data} options={options} />
    </div>
  );
}