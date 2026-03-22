import React from "react";

export default function JournalPage({ trades = [], form = {}, handleChange, addTrade, startEdit }) {
  return (
    <div>
      {/* Trading Form */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white fw-semibold">
          Add New Trade
        </div>
        <div className="card-body">
          <form onSubmit={addTrade} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Entry Date</label>
              <input
                type="date"
                className="form-control"
                value={form.entry_date || ""}
                onChange={(e) => handleChange("entry_date", e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Exit Date</label>
              <input
                type="date"
                className="form-control"
                value={form.exit_date || ""}
                onChange={(e) => handleChange("exit_date", e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Options Amount</label>
              <input type="number" className="form-control"
                value={form.options_trading_amount}
                onChange={(e) => handleChange("options_trading_amount", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Required Profit</label>
              <input type="number" className="form-control bg-light" value={form.required_profit || ""} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Interest</label>
              <input type="number" className="form-control"
                value={form.interest || ""}
                onChange={(e) => handleChange("interest", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Actual Profit</label>
              <input type="number" className="form-control"
                value={form.actual_profit || ""}
                onChange={(e) => handleChange("actual_profit", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Total Profit</label>
              <input type="number" className="form-control bg-light" value={form.total_profit || ""} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Percent</label>
              <input type="number" className="form-control bg-light" value={form.percent || ""} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">MF Trading Amount</label>
              <input type="number" className="form-control"
                value={form.mf_trading_amount || ""}
                onChange={(e) => handleChange("mf_trading_amount", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">PnL</label>
              <input type="number" className="form-control"
                value={form.pnl || ""}
                onChange={(e) => handleChange("pnl", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">MF Profit Percent</label>
              <input type="number" className="form-control bg-light" value={form.mf_profit || ""} readOnly />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">Add Trade</button>
            </div>
          </form>
        </div>
      </div>

      {/* Trade History */}
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white fw-semibold">
          Trade History
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle">
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
                    <td>
                      <span className={`badge ${t.total_profit >= 0 ? "bg-success" : "bg-danger"}`}>
                        {t.total_profit}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.percent >= 0 ? "bg-success" : "bg-danger"}`}>
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
                      <button className="btn btn-warning btn-sm" onClick={() => startEdit(t)}>Edit</button>
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