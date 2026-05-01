import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JournalPage from "./JournalPage";
import PerformancePage from "./PerformancePage";
import DashboardPage from "./DashboardPage";
import MarginCalculatorPage from "./MarginCalculatorPage";
import { supabase } from "./supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { getCompleteTrades, calculateAnnualizedPercent } from "./lib/tradingUtils";
import "./App.css";


function AppContent() {
  const fetchOnceRef = useRef(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading
  const [submitting, setSubmitting] = useState(false); // New state for form submission
  const [saveError, setSaveError] = useState("");

  const initialForm = {
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
  };

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to filter only complete trades for calculations
  const getCompleteTradesFiltered = (tradesArray) => {
    return getCompleteTrades(tradesArray);
  };

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);
    console.log("Fetching trades from Supabase...");

    if (!supabase || typeof supabase.from !== "function") {
      console.warn("Supabase client is unavailable or mocked incorrectly.");
      setTrades([]);
      setLoading(false);
      return;
    }

    const fromQuery = supabase.from("trading");
    if (!fromQuery || typeof fromQuery.select !== "function") {
      console.warn("Supabase query chain is unavailable or mocked incorrectly.");
      setTrades([]);
      setLoading(false);
      return;
    }

    const { data, error } = await fromQuery.select("*");
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
    setSaveError("");
    setSubmitting(true);

    // Convert empty strings to null first, then handle numeric conversion
    let cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    const numericFields = [
      "options_trading_amount",
      "required_profit",
      "interest",
      "actual_profit",
      "total_profit",
      "percent",
      "mf_trading_amount",
      "pnl",
      "mf_profit"
    ];

    // Default all optional numeric fields to zero - handles blank mobile inputs
    // This must happen BEFORE parsing to Number to avoid NaN issues
    numericFields.forEach((field) => {
      if (cleanedForm[field] === null || cleanedForm[field] === undefined || cleanedForm[field] === "") {
        cleanedForm[field] = 0;
      } else {
        // Parse to number, default to 0 if NaN
        const parsed = Number(cleanedForm[field]);
        cleanedForm[field] = Number.isNaN(parsed) ? 0 : parsed;
      }
    });

    cleanedForm.total_profit = Number(cleanedForm.interest || 0) + Number(cleanedForm.actual_profit || 0);
    cleanedForm.required_profit = cleanedForm.entry_date && cleanedForm.exit_date && Number(cleanedForm.options_trading_amount) > 0
      ? calculateRequiredProfit(
          cleanedForm.entry_date,
          cleanedForm.exit_date,
          Number(cleanedForm.options_trading_amount)
        )
      : 0;
    cleanedForm.percent = Number(calculateAnnualizedPercent(
      cleanedForm.total_profit,
      cleanedForm.entry_date,
      cleanedForm.exit_date,
      Number(cleanedForm.options_trading_amount)
    ));
    cleanedForm.mf_profit = Number(calculateAnnualizedPercent(
      Number(cleanedForm.pnl),
      cleanedForm.entry_date,
      cleanedForm.exit_date,
      Number(cleanedForm.mf_trading_amount)
    ));

    let error;
    const operation = editingId ? "update" : "insert";

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("trading")
          .update(cleanedForm)
          .eq("id", editingId);
        error = updateError;
        if (!error) {
          setEditingId(null);
        }
      } else {
        const { error: insertError } = await supabase
          .from("trading")
          .insert([cleanedForm]);
        error = insertError;
      }

      if (error) {
        console.error("Supabase trade save failed", {
          operation,
          editingId,
          payload: cleanedForm,
          error
        });
        let errorMessage = "Failed to save trade.";
        if (error.message) {
          if (error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("fetch")) {
            errorMessage = "Network error. Please check your internet connection and try again.";
          } else if (error.message.toLowerCase().includes("auth")) {
            errorMessage = "Authentication error. Please log in again.";
          } else {
            errorMessage = `Failed to save trade: ${error.message}`;
          }
        }
        const fullError = error && typeof error === 'object'
          ? `${errorMessage}\n\nError Details:\n${JSON.stringify(error, null, 2)}${error.stack ? `\n\nStack Trace:\n${error.stack}` : ''}`
          : errorMessage;
        setSaveError(fullError);
        toast.error(errorMessage);
      } else {
        setSaveError("");
        setForm(initialForm);
        toast.success(editingId ? "Trade updated successfully." : "Trade added successfully.");
        setEditingId(null);
        fetchTrades();
      }
    } catch (unexpectedError) {
      console.error("Unexpected error while saving trade", {
        operation,
        editingId,
        payload: cleanedForm,
        unexpectedError
      });
      const unexpectedMessage = unexpectedError && unexpectedError.message
        ? `Unexpected error while saving trade: ${unexpectedError.message}`
        : "Unexpected error while saving trade.";
      const fullUnexpected = unexpectedError && typeof unexpectedError === 'object'
        ? `${unexpectedMessage}\n\nError Details:\n${JSON.stringify(unexpectedError, null, 2)}${unexpectedError.stack ? `\n\nStack Trace:\n${unexpectedError.stack}` : ''}`
        : unexpectedMessage;
      setSaveError(fullUnexpected);
      toast.error(unexpectedMessage);
    } finally {
      setSubmitting(false);
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

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
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
    <div className="min-h-screen bg-background font-sans">
      {/* Modern Navbar */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Brand */}
              <div className="flex-shrink-0 flex items-center">
                <div className="text-2xl font-bold text-primary">
                  Trading Journal
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`
                }
              >
                Journal
              </NavLink>
              <NavLink
                to="/performance"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`
                }
              >
                Performance
              </NavLink>
              <NavLink
                to="/margin-calculator"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`
                }
              >
                Margin Calculator
              </NavLink>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-b border-border shadow-sm">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Journal
          </NavLink>
          <NavLink
            to="/performance"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Performance
          </NavLink>
          <NavLink
            to="/margin-calculator"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Margin Calculator
          </NavLink>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Routes */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage trades={getCompleteTradesFiltered(trades)} />} />
          <Route path="/" element={
            <JournalPage
              trades={trades}
              form={form}
              handleChange={handleChange}
              addTrade={addTrade}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              submitting={submitting}
              editingId={editingId}
              saveError={saveError}
              setSaveError={setSaveError}
            />
          } />
          <Route path="/performance" element={<PerformancePage trades={getCompleteTradesFiltered(trades)} />} />
          <Route path="/margin-calculator" element={<MarginCalculatorPage />} />
        </Routes>
      </main>

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