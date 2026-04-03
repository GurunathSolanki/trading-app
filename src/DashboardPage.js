import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Scale,
  DollarSign,
  Target,
  ArrowUpIcon,
  ArrowDownIcon,
  Activity,
  BarChart3,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function DashboardPage({ trades = [] }) {
  const [timePeriod, setTimePeriod] = useState('all');

  // Filter trades based on selected time period
  const getFilteredTrades = () => {
    if (timePeriod === 'all') return trades;
    
    const now = new Date();
    const filterDate = new Date();

    switch (timePeriod) {
      case 'daily':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        filterDate.setDate(now.getDate() - 30);
        break;
      default:
        return trades;
    }

    return trades.filter(trade => {
      if (!trade.exit_date) return false;
      const tradeDate = new Date(trade.exit_date);
      return tradeDate >= filterDate;
    });
  };

  const filteredTrades = getFilteredTrades();

  // Calculate comprehensive KPIs using filtered trades
  const totalTrades = filteredTrades.length;

  // Total P&L calculations (your requested metrics)
  const totalOptionsPL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.total_profit || 0), 0);
  const totalMFPL = filteredTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  const totalPortfolioPL = totalOptionsPL + totalMFPL;

  // Win/Loss analysis
  const winningTrades = filteredTrades.filter(t => parseFloat(t.total_profit || 0) > 0);
  const losingTrades = filteredTrades.filter(t => parseFloat(t.total_profit || 0) <= 0);
  const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : 0;

  // Profit Factor (Gross Profit / Gross Loss)
  const grossProfit = winningTrades.reduce((sum, t) => sum + parseFloat(t.total_profit || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.total_profit || 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : 0;

  // Average Win/Loss
  const avgWin = winningTrades.length > 0 ? (grossProfit / winningTrades.length).toFixed(0) : 0;
  const avgLoss = losingTrades.length > 0 ? (grossLoss / losingTrades.length).toFixed(0) : 0;

  // Risk/Reward Ratio
  const riskRewardRatio = avgLoss > 0 ? (parseFloat(avgWin) / parseFloat(avgLoss)).toFixed(2) : 0;

  // Best/Worst trades
  const bestTrade = totalTrades > 0 ? Math.max(...filteredTrades.map(t => parseFloat(t.total_profit || 0))) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...filteredTrades.map(t => parseFloat(t.total_profit || 0))) : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPLColor = (amount) => amount >= 0 ? 'text-green-600' : 'text-red-600';
  const getPLIcon = (amount) => amount >= 0 ?
    <ArrowUpIcon className="h-4 w-4 text-green-600" /> :
    <ArrowDownIcon className="h-4 w-4 text-red-600" />;

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground mt-2">Professional trading performance overview</p>
      </div>

      {/* Time Period Filter */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-card p-1">
          {['daily', 'weekly', 'monthly', 'all'].map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimePeriod(period)}
              className="capitalize"
            >
              {period === 'all' ? 'All Time' : period}
            </Button>
          ))}
        </div>
      </div>

      {/* Period Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {totalTrades} trade{totalTrades !== 1 ? 's' : ''} {timePeriod === 'all' ? 'from all time' : `from the last ${timePeriod === 'daily' ? '24 hours' : timePeriod === 'weekly' ? '7 days' : '30 days'}`}
      </div>

      {/* Hero Section - Total Portfolio P&L */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-medium text-muted-foreground">Total Portfolio P&L</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-4xl font-bold ${getPLColor(totalPortfolioPL)} flex items-center justify-center gap-2`}>
            {getPLIcon(totalPortfolioPL)}
            {formatCurrency(totalPortfolioPL)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Combined Options + Mutual Funds performance
          </p>
        </CardContent>
      </Card>

      {/* Primary KPIs - Your Requested Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Options P&L</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPLColor(totalOptionsPL)} flex items-center gap-2`}>
              {getPLIcon(totalOptionsPL)}
              {formatCurrency(totalOptionsPL)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total profit/loss from options trading
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MF P&L</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPLColor(totalMFPL)} flex items-center gap-2`}>
              {getPLIcon(totalMFPL)}
              {formatCurrency(totalMFPL)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total profit/loss from mutual funds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades.length} wins out of {totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitFactor}</div>
            <p className="text-xs text-muted-foreground">
              Gross profit ÷ gross loss ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk/Reward</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskRewardRatio}:1</div>
            <p className="text-xs text-muted-foreground">
              Average win vs average loss ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(avgWin)}</div>
            <p className="text-xs text-muted-foreground">
              Average profit per winning trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(avgLoss)}</div>
            <p className="text-xs text-muted-foreground">
              Average loss per losing trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              Total number of executed trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Trades Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Trade</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(bestTrade)}</div>
            <p className="text-xs text-muted-foreground">
              Highest single trade profit
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Trade</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(worstTrade)}</div>
            <p className="text-xs text-muted-foreground">
              Lowest single trade profit
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