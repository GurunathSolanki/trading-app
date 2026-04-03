import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Scale, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function DashboardPage({ trades = [] }) {
  // Calculate KPIs
  const totalTrades = trades.length;
  const avgOptionsPercent = totalTrades > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.percent || 0), 0) / totalTrades).toFixed(2) : 0;
  const avgMfPercent = totalTrades > 0 ? (trades.reduce((sum, t) => sum + parseFloat(t.mf_profit || 0), 0) / totalTrades).toFixed(2) : 0;
  const winLossRatio = totalTrades > 0 ? `${trades.filter(t => parseFloat(t.total_profit) > 0).length}/${trades.filter(t => parseFloat(t.total_profit) <= 0).length}` : "0/0";
  const bestTrade = totalTrades > 0 ? Math.max(...trades.map(t => parseFloat(t.total_profit || 0))) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...trades.map(t => parseFloat(t.total_profit || 0))) : 0;

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your trading performance</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Options %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgMfPercent}%</div>
            <p className="text-xs text-muted-foreground">
              Annualized return on mutual funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win/Loss Ratio</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winLossRatio}</div>
            <p className="text-xs text-muted-foreground">
              Successful vs unsuccessful trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Trade</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{bestTrade}</div>
            <p className="text-xs text-muted-foreground">
              Highest profit in a single trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Trade</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{worstTrade}</div>
            <p className="text-xs text-muted-foreground">
              Lowest profit in a single trade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link to="/">Go to Journal</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/performance">View Performance</Link>
        </Button>
      </div>
    </div>
  );
}