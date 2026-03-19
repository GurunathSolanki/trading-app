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

    setForm(updatedForm);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Trading Log</h2>
      <form onSubmit={addTrade}>
        <input type="date" value={form.entry_date}
          onChange={(e) => handleChange("entry_date", e.target.value)} />

        <input type="date" value={form.exit_date}
          onChange={(e) => handleChange("exit_date", e.target.value)} />

        <input type="number" placeholder="Options Amount"
          value={form.options_trading_amount}
          onChange={(e) => handleChange("options_trading_amount", e.target.value)} />

        <input type="number" placeholder="Required Profit"
          value={form.required_profit || ""}
          readOnly
        />
        <input type="number" placeholder="Interest"
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })} />
        <input type="number" placeholder="Actual Profit"
          value={form.actual_profit}
          onChange={(e) => setForm({ ...form, actual_profit: e.target.value })} />
        <input type="number" placeholder="Total Profit"
          value={form.total_profit}
          onChange={(e) => setForm({ ...form, total_profit: e.target.value })} />
        <input type="number" placeholder="Percent"
          value={form.percent}
          onChange={(e) => setForm({ ...form, percent: e.target.value })} />
        <input type="number" placeholder="MF Amount"
          value={form.mf_trading_amount}
          onChange={(e) => setForm({ ...form, mf_trading_amount: e.target.value })} />
        <input type="number" placeholder="PnL"
          value={form.pnl}
          onChange={(e) => setForm({ ...form, pnl: e.target.value })} />
        <input type="number" placeholder="MF Profit"
          value={form.mf_profit}
          onChange={(e) => setForm({ ...form, mf_profit: e.target.value })} />
        <button type="submit">Add Trade</button>
      </form>
      <h3>Trade History</h3>
      <table border="1" cellPadding="5">
        <thead>
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
                <button onClick={() => startEdit(t)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;




