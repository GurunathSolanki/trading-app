import './App.css';
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [trades, setTrades] = useState([]);
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
    fetchTrades();
  }, []);

  async function fetchTrades() {
    const { data, error } = await supabase.from("trading").select("*");
    if (error) console.error(error);
    else setTrades(data);
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

  function calculateRequiredProfit(entry_date, exit_date, options_trading_amount) {
    if (!entry_date || !exit_date || !options_trading_amount) return "";

    const start = new Date(entry_date);
    const end = new Date(exit_date);

    // Difference in days
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = (options_trading_amount * 16 * diffDays) / (100 * 365);

    return Math.round(result); // integer
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

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Trading Log</h2>

      <form onSubmit={addTrade} className="row g-3">
        <div className="col-md-6">
          <input type="date" className="form-control"
            value={form.entry_date}
            onChange={(e) => handleChange("entry_date", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="date" className="form-control"
            value={form.exit_date}
            onChange={(e) => handleChange("exit_date", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Options Amount"
            value={form.options_trading_amount}
            onChange={(e) => handleChange("options_trading_amount", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Required Profit"
            value={form.required_profit || ""}
            readOnly />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Interest"
            value={form.interest || ""}
            onChange={(e) => handleChange("interest", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Actual Profit"
            value={form.actual_profit || ""}
            onChange={(e) => handleChange("actual_profit", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Total Profit"
            value={form.total_profit || ""}
            readOnly />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="Percent"
            value={form.percent || ""}
            readOnly />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="MF Trading Amount"
            value={form.mf_trading_amount || ""}
            onChange={(e) => handleChange("mf_trading_amount", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="PnL"
            value={form.pnl || ""}
            onChange={(e) => handleChange("pnl", e.target.value)} />
        </div>

        <div className="col-md-6">
          <input type="number" className="form-control" placeholder="MF Profit Percent"
            value={form.mf_profit || ""}
            readOnly />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary w-100">Add Trade</button>
        </div>
      </form>

      <h3 className="mt-5">Trade History</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th>Entry Date</th>
              <th>Exit Date</th>
              <th>Options Amount</th>
              <th>Required Profit</th>
              <th>Interest</th>
              <th>Actual Profit</th>
              <th>Total Profit</th>
              <th>Percent</th>
              <th>MF Amount</th>
              <th>PnL</th>
              <th>MF Profit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id}>
                <td>{t.entry_date}</td>
                <td>{t.exit_date}</td>
                <td>{t.options_trading_amount}</td>
                <td>{t.required_profit}</td>
                <td>{t.interest}</td>
                <td>{t.actual_profit}</td>
                <td>{t.total_profit}</td>
                <td>{t.percent}</td>
                <td>{t.mf_trading_amount}</td>
                <td>{t.pnl}</td>
                <td>{t.mf_profit}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => startEdit(t)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;




