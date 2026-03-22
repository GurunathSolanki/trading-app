import React from "react";
import { Link } from "react-router-dom";

export default function DashboardPage({ trades = [] }) {
  // Calculate KPIs
  const totalTrades = trades.length;
  const avgOptionsPercent = totalTrades > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.percent || 0), 0) / totalTrades).toFixed(2) : 0;
  const avgMfPercent = totalTrades > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.mf_profit || 0), 0) / totalTrades).toFixed(2) : 0;
  const winLossRatio = totalTrades > 0 ? `${trades.filter(t => parseFloat(t.total_profit) > 0).length}/${trades.filter(t => parseFloat(t.total_profit) <= 0).length}` : "0/0";
  const bestTrade = totalTrades > 0 ? Math.max(...trades.map(t => parseFloat(t.total_profit || 0))) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...trades.map(t => parseFloat(t.total_profit || 0))) : 0;

  return (
    <div>
      <h1 className="text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Trading Dashboard</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-teal">📈 Avg Options %</h5>
              <p className="card-text fs-4">{avgOptionsPercent}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-crimson">📉 Avg MF %</h5>
              <p className="card-text fs-4">{avgMfPercent}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title">⚖️ Win/Loss Ratio</h5>
              <p className="card-text fs-4">{winLossRatio}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title">💰 Best Trade</h5>
              <p className="card-text fs-4 text-success">₹{bestTrade}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title">💸 Worst Trade</h5>
              <p className="card-text fs-4 text-danger">₹{worstTrade}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <Link to="/" className="btn btn-primary me-2">Go to Journal</Link>
        <Link to="/performance" className="btn btn-secondary">View Performance</Link>
      </div>
    </div>
  );
}