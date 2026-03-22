import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JournalPage from "./JournalPage";
import PerformancePage from "./PerformancePage";
import DashboardPage from "./DashboardPage";
import { supabase } from "./supabaseClient";
import { ToastContainer, toast } from "react-toastify"; // New import for notifications
import "react-toastify/dist/ReactToastify.css"; // New import for styles
import { NavLink } from "react-router-dom";


function AppContent() {
  const fetchOnceRef = useRef(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading
  const [form, setForm] = useState({
    entry_date: "",
    exit_date: "",
    options_trading_amount: "",
    required_profit: "",
    interest: "",
    actual_profit: "",
    total_profit: "",
    percent: "",
    mf_trading_amount: "",
    pnl: "",
    mf_profit: ""
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);
    console.log("Fetching trades from Supabase...");
    const { data, error } = await supabase.from("trading").select("*");
    if (error) {
      console.error(error);
      toast.error("Failed to load trades."); // New: Error notification
    } else {
      setTrades(data);
      toast.success("Trades loaded successfully."); // New: Success notification
    }
    setLoading(false);
  }

  async function addTrade(e) {
    e.preventDefault();

    let cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    // Auto-calc required_profit if possible
    if (cleanedForm.entry_date && cleanedForm.exit_date && cleanedForm.options_trading_amount) {
      cleanedForm.required_profit = calculateRequiredProfit(
        cleanedForm.entry_date,
        cleanedForm.exit_date,
        Number(cleanedForm.options_trading_amount)
      );
    }

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from("trading")
        .update(cleanedForm)
        .eq("id", editingId);
      error = updateError;
      setEditingId(null);
    } else {
      const { error: insertError } = await supabase
        .from("trading")
        .insert([cleanedForm]);
      error = insertError;
    }

    if (error) {
      console.error(error);
      toast.error("Failed to save trade."); // New: Error notification    
    } else {
      setForm({
        entry_date: "",
        exit_date: "",
        options_trading_amount: "",
        required_profit: "",
        interest: "",
        actual_profit: "",
        total_profit: "",
        percent: "",
        mf_trading_amount: "",
        pnl: "",
        mf_profit: ""
      });
      toast.success("Trade added/updated successfully."); // New: Success notification
      fetchTrades();
    }
  }

  function startEdit(trade) {
    setEditingId(trade.id);
    setForm({
      entry_date: trade.entry_date || "",
      exit_date: trade.exit_date || "",
      options_trading_amount: trade.options_trading_amount || "",
      required_profit: trade.required_profit || "",
      interest: trade.interest || "",
      actual_profit: trade.actual_profit || "",
      total_profit: trade.total_profit || "",
      percent: trade.percent || "",
      mf_trading_amount: trade.mf_trading_amount || "",
      pnl: trade.pnl || "",
      mf_profit: trade.mf_profit || ""
    });
  }

  function handleChange(field, value) {
    const updatedForm = { ...form, [field]: value };

    // Auto-calc required_profit if possible
    if (updatedForm.entry_date && updatedForm.exit_date && updatedForm.options_trading_amount) {
      updatedForm.required_profit = calculateRequiredProfit(
        updatedForm.entry_date,
        updatedForm.exit_date,
        Number(updatedForm.options_trading_amount)
      );
    }

    // Auto-calc total_profit (interest + actual_profit)
    const interestVal = Number(updatedForm.interest) || 0;
    const actualProfitVal = Number(updatedForm.actual_profit) || 0;

    updatedForm.total_profit = interestVal + actualProfitVal;


    // Auto-calc percent (to 2 decimals)
    if (updatedForm.entry_date && updatedForm.exit_date && updatedForm.options_trading_amount) {
      const start = new Date(updatedForm.entry_date);
      const end = new Date(updatedForm.exit_date);
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0 && updatedForm.options_trading_amount > 0) {
        updatedForm.percent = (
          (updatedForm.total_profit * 365 * 100) /
          (diffDays * Number(updatedForm.options_trading_amount))
        ).toFixed(2); // ✅ ensures two decimal places
      } else {
        updatedForm.percent = "0.00";
      }
    }

    // Auto-calc mf_profit (to 2 decimals)
    if (updatedForm.entry_date && updatedForm.exit_date && updatedForm.mf_trading_amount && updatedForm.pnl) {
      const start = new Date(updatedForm.entry_date);
      const end = new Date(updatedForm.exit_date);
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0 && updatedForm.mf_trading_amount > 0) {
        updatedForm.mf_profit = (
          (updatedForm.pnl * 365 * 100) /
          (diffDays * Number(updatedForm.mf_trading_amount))
        ).toFixed(2);
      } else {
        updatedForm.mf_profit = "0.00";
      }
    }



    setForm(updatedForm);
  }

  function calculateRequiredProfit(entry_date, exit_date, options_trading_amount) {
    if (!entry_date || !exit_date || !options_trading_amount) return "";

    const start = new Date(entry_date);
    const end = new Date(exit_date);

    // Difference in days
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = (options_trading_amount * 16 * diffDays) / (100 * 365);

    return Math.round(result); // integer
  }

  return (
    <div className="container my-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Updated Navbar with Branding and Active Highlighting */}


      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 rounded">
        <div className="container-fluid">
          {/* Brand */}
          <span className="navbar-brand fw-bold" style={{ color: '#17a2b8' }}>
            📊 Trading Journal
          </span>

          {/* Hamburger toggle for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible nav links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav ms-auto">
              <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
              <NavLink to="/" className="nav-link">Journal</NavLink>
              <NavLink to="/performance" className="nav-link">Performance</NavLink>
              <NavLink to="/settings" className="nav-link">Settings</NavLink>
            </div>
          </div>
        </div>
      </nav>


      {/* Loading Spinner */}
      {loading && <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}

      {/* Routes */}
      <Routes>
        <Route path="/dashboard" element={<DashboardPage trades={trades} />} />
        <Route path="/" element={
          <JournalPage
            trades={trades}
            form={form}
            handleChange={handleChange}
            addTrade={addTrade}
            startEdit={startEdit}
          />
        } />
        <Route path="/performance" element={<PerformancePage trades={trades} />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;