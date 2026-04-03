import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
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

  const avgOptionsPercent = trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.percent || 0), 0) / trades.length).toFixed(2) : 0;
  const avgMFPercent = trades.length > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.mf_profit || 0), 0) / trades.length).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Options %</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgOptionsPercent}%</div>
            <p className="text-xs text-muted-foreground">
              Annualized return on options trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg MF %</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgMFPercent}%</div>
            <p className="text-xs text-muted-foreground">
              Annualized return on mutual funds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowAbsolute(!showAbsolute)}>
          Toggle to {showAbsolute ? 'Percentage' : 'Absolute Values'}
        </Button>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px] w-full">
            <Line 
              data={data} 
              options={{
                ...options,
                maintainAspectRatio: false,
                responsive: true,
              }}
              height={null}
              width={null}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}