import React from "react";
import { useState } from "react";
import { Edit, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

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
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            {/* Trading Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Trade</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addTrade} className="space-y-6">
                        {/* Dates Group */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Trade Dates</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entry-date">Entry Date</Label>
                                    <Input
                                        id="entry-date"
                                        type="date"
                                        value={form.entry_date || ""}
                                        onChange={(e) => handleChange("entry_date", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exit-date">Exit Date</Label>
                                    <Input
                                        id="exit-date"
                                        type="date"
                                        value={form.exit_date || ""}
                                        onChange={(e) => handleChange("exit_date", e.target.value)}
                                        disabled={submitting}
                                    />
                                    {!isFormValid && form.exit_date && (
                                        <p className="text-sm text-destructive">Exit date must be after entry date.</p>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        {/* Options Group */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Options Metrics</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="options-amount">Options Amount</Label>
                                    <Input
                                        id="options-amount"
                                        type="number"
                                        placeholder="Enter amount in INR"
                                        value={form.options_trading_amount}
                                        onChange={(e) => handleChange("options_trading_amount", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="required-profit">Required Profit</Label>
                                    <Input
                                        id="required-profit"
                                        type="number"
                                        value={form.required_profit || ""}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interest">Interest</Label>
                                    <Input
                                        id="interest"
                                        type="number"
                                        placeholder="Interest earned"
                                        value={form.interest || ""}
                                        onChange={(e) => handleChange("interest", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="actual-profit">Actual Profit</Label>
                                    <Input
                                        id="actual-profit"
                                        type="number"
                                        placeholder="Actual profit/loss"
                                        value={form.actual_profit || ""}
                                        onChange={(e) => handleChange("actual_profit", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total-profit">Total Profit</Label>
                                    <Input
                                        id="total-profit"
                                        type="number"
                                        value={form.total_profit || ""}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="percent">Percent</Label>
                                    <Input
                                        id="percent"
                                        type="number"
                                        value={form.percent || ""}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* MF Group */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Mutual Fund Metrics</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mf-amount">MF Trading Amount</Label>
                                    <Input
                                        id="mf-amount"
                                        type="number"
                                        placeholder="MF investment amount"
                                        value={form.mf_trading_amount || ""}
                                        onChange={(e) => handleChange("mf_trading_amount", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pnl">PnL</Label>
                                    <Input
                                        id="pnl"
                                        type="number"
                                        placeholder="Profit/Loss"
                                        value={form.pnl || ""}
                                        onChange={(e) => handleChange("pnl", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mf-profit">MF Profit Percent</Label>
                                    <Input
                                        id="mf-profit"
                                        type="number"
                                        value={form.mf_profit || ""}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <Button type="submit" className="w-full" disabled={!isFormValid || submitting}>
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                    Adding Trade...
                                </>
                            ) : (
                                'Add Trade'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Trade History */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Trade History</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <select
                                className="px-3 py-1 text-sm border border-input bg-background rounded-md"
                                onChange={(e) => setFilter(e.target.value)}
                                value={filter}
                            >
                                <option value="all">All Trades</option>
                                <option value="winning">Winning Only</option>
                                <option value="losing">Losing Only</option>
                            </select>
                            <select
                                className="px-3 py-1 text-sm border border-input bg-background rounded-md"
                                onChange={(e) => setSortField(e.target.value)}
                                value={sortField}
                            >
                                <option value="exit_date">Sort by Date</option>
                                <option value="total_profit">Sort by Profit</option>
                                <option value="percent">Sort by %</option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Entry Date</th>
                                    <th className="text-left p-2 font-medium">Exit Date</th>
                                    <th className="text-left p-2 font-medium">Options Amount</th>
                                    <th className="text-left p-2 font-medium">Required Profit</th>
                                    <th className="text-left p-2 font-medium">Interest</th>
                                    <th className="text-left p-2 font-medium">Actual Profit</th>
                                    <th className="text-left p-2 font-medium">Total Profit</th>
                                    <th className="text-left p-2 font-medium">Percent</th>
                                    <th className="text-left p-2 font-medium">MF Amount</th>
                                    <th className="text-left p-2 font-medium">PnL</th>
                                    <th className="text-left p-2 font-medium">MF Profit</th>
                                    <th className="text-left p-2 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTrades.map((t) => (
                                    <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors duration-150">
                                        <td className="p-2">{t.entry_date}</td>
                                        <td className="p-2">{t.exit_date}</td>
                                        <td className="p-2">{t.options_trading_amount}</td>
                                        <td className="p-2">{t.required_profit}</td>
                                        <td className="p-2">{t.interest}</td>
                                        <td className="p-2">{t.actual_profit}</td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                parseFloat(t.total_profit) >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.total_profit}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                parseFloat(t.percent) >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.percent}%
                                            </span>
                                        </td>
                                        <td className="p-2">{t.mf_trading_amount}</td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                t.pnl >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.pnl}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                t.mf_profit >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.mf_profit}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => startEdit(t)}
                                                disabled={submitting}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <footer className="text-center py-8 text-muted-foreground">
                <p className="text-sm">© 2026 Trading Log App</p>
            </footer>
        </div>
    );
}