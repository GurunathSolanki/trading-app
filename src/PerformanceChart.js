import { Line } from 'react-chartjs-2';
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
  const data = {
    labels: trades.map(t => t.exit_date), // X-axis: exit dates
    datasets: [
      {
        label: 'Options %',
        data: trades.map(t => t.percent), // use percent values
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
      {
        label: 'MF %',
        data: trades.map(t => t.mf_profit), // use MF percent values
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Options vs Mutual Fund Performance (%)' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false, // allow negative values
        ticks: {
          callback: function (value) {
            return value + '%'; // show % on axis
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}