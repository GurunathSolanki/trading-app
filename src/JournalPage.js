import React from "react";
import { useState } from "react";

export default function JournalPage({ trades = [], form = {}, handleChange, addTrade, startEdit, submitting = false }) {
    const [sortField, setSortField] = useState('exit_date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filter, setFilter] = useState('all'); // 'all', 'winning', 'losing'

    // Sorting and filtering logic
    const sortedTrades = [...trades].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    }).filter(t => {
        if (filter === 'winning') return parseFloat(t.total_profit) > 0;
        if (filter === 'losing') return parseFloat(t.total_profit) <= 0;
        return true;
    });

    // Validation
    const isFormValid = form.entry_date && form.exit_date && new Date(form.exit_date) >= new Date(form.entry_date);

    return (
        <div>
            {/* Trading Form with Grouping and Validation */}
            <div className="card shadow-sm mb-5">
                <div className="card-header bg-primary text-white fw-semibold">Add New Trade</div>
                <div className="card-body">
                    <form onSubmit={addTrade} className="row g-3">
                        {/* Dates Group */}
                        <fieldset className="col-12">
                            <legend className="fw-bold">Trade Dates</legend>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">Entry Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.entry_date || ""}
                                        onChange={(e) => handleChange("entry_date", e.target.value)}
                                        aria-label="Entry date"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Exit Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.exit_date || ""}
                                        onChange={(e) => handleChange("exit_date", e.target.value)}
                                        aria-label="Exit date"
                                        disabled={submitting}
                                    />
                                    {!isFormValid && form.exit_date && <small className="text-danger">Exit date must be after entry date.</small>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Options Group */}
                        <fieldset className="col-12">
                            <legend className="fw-bold">Options Metrics</legend>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">Options Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter amount in INR"
                                        value={form.options_trading_amount}
                                        onChange={(e) => handleChange("options_trading_amount", e.target.value)}
                                        aria-label="Options trading amount"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Required Profit</label>
                                    <input type="number" className="form-control bg-light" value={form.required_profit || ""} readOnly aria-label="Required profit" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Interest</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Interest earned"
                                        value={form.interest || ""}
                                        onChange={(e) => handleChange("interest", e.target.value)}
                                        aria-label="Interest"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Actual Profit</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Actual profit/loss"
                                        value={form.actual_profit || ""}
                                        onChange={(e) => handleChange("actual_profit", e.target.value)}
                                        aria-label="Actual profit"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Total Profit</label>
                                    <input type="number" className="form-control bg-light" value={form.total_profit || ""} readOnly aria-label="Total profit" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Percent</label>
                                    <input type="number" className="form-control bg-light" value={form.percent || ""} readOnly aria-label="Percent return" />
                                </div>
                            </div>
                        </fieldset>

                        {/* MF Group */}
                        <fieldset className="col-12">
                            <legend className="fw-bold">Mutual Fund Metrics</legend>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">MF Trading Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="MF investment amount"
                                        value={form.mf_trading_amount || ""}
                                        onChange={(e) => handleChange("mf_trading_amount", e.target.value)}
                                        aria-label="MF trading amount"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">PnL</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Profit/Loss"
                                        value={form.pnl || ""}
                                        onChange={(e) => handleChange("pnl", e.target.value)}
                                        aria-label="PnL"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">MF Profit Percent</label>
                                    <input type="number" className="form-control bg-light" value={form.mf_profit || ""} readOnly aria-label="MF profit percent" />
                                </div>
                            </div>
                        </fieldset>

                        <div className="col-12">
                            <button type="submit" className="btn btn-primary w-100" disabled={!isFormValid || submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Adding Trade...
                                    </>
                                ) : (
                                    'Add Trade'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Trade History */}
            <div className="card shadow-sm">
                <div className="card-header bg-secondary text-white fw-semibold d-flex justify-content-between align-items-center">
                    Trade History
                    <div>
                        <select className="form-select form-select-sm d-inline-block w-auto me-2" onChange={(e) => setFilter(e.target.value)} value={filter}>
                            <option value="all">All Trades</option>
                            <option value="winning">Winning Only</option>
                            <option value="losing">Losing Only</option>
                        </select>
                        <select className="form-select form-select-sm d-inline-block w-auto" onChange={(e) => setSortField(e.target.value)} value={sortField}>
                            <option value="exit_date">Sort by Date</option>
                            <option value="total_profit">Sort by Profit</option>
                            <option value="percent">Sort by %</option>
                        </select>
                        <button className="btn btn-sm btn-outline-light ms-2" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered align-middle" style={{ position: 'sticky', top: 0 }}>
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
                                {sortedTrades.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.entry_date}</td>
                                        <td>{t.exit_date}</td>
                                        <td>{t.options_trading_amount}</td>
                                        <td>{t.required_profit}</td>
                                        <td>{t.interest}</td>
                                        <td>{t.actual_profit}</td>
                                        <td>
                                            <span className={`badge ${parseFloat(t.total_profit) >= 0 ? "bg-success" : "bg-danger"}`}>
                                                {t.total_profit}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${parseFloat(t.percent) >= 0 ? "bg-success" : "bg-danger"}`}>
                                                {t.percent}%
                                            </span>
                                        </td>
                                        <td>{t.mf_trading_amount}</td>
                                        <td>
                                            <span className={`badge ${t.pnl >= 0 ? "bg-success" : "bg-danger"}`}>
                                                {t.pnl}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${t.mf_profit >= 0 ? "bg-success" : "bg-danger"}`}>
                                                {t.mf_profit}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-warning btn-sm" onClick={() => startEdit(t)} disabled={submitting}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center mt-5 text-muted">
                <small>© 2026 Trading Log App</small>
            </footer>
        </div>
    );
}