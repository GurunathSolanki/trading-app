import React from "react";
import { useState, useEffect, useRef } from "react";
import { Edit, ArrowUpDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { formatIndianNumber } from "./lib/utils";

export default function JournalPage({ trades = [], form = {}, handleChange, addTrade, startEdit, cancelEdit, submitting = false, editingId, saveError = "", setSaveError }) {
    const [sortField, setSortField] = useState('entry_date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('all'); // 'all', 'winning', 'losing'

    const [displayValues, setDisplayValues] = useState({
        options_trading_amount: '',
        interest: '',
        actual_profit: '',
        mf_trading_amount: '',
        pnl: ''
    });

    const firstFieldRef = useRef(null);

    useEffect(() => {
        if (editingId && firstFieldRef.current) {
            const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (!isMobile) {
                firstFieldRef.current.focus();
            }
            firstFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editingId]);

    const handleInputChange = (field, value) => {
        // For number fields, handle Indian number formatting
        // We allow leading minus for negative values and preserve decimals while typing
        const rawValue = value.replace(/,/g, ''); // remove existing commas
        
        // Regex to allow: empty, just minus, numbers with optional decimal and leading minus
        if (rawValue === '' || rawValue === '-' || /^-?\d*\.?\d*$/.test(rawValue)) {
            const numValue = (rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.') ? '' : parseFloat(rawValue);
            handleChange(field, numValue);
            
            // Only format if it's a complete number and doesn't end with a dot
            // This prevents the input from jumping/stripping characters while typing decimals or signs
            const formatted = (rawValue === '' || rawValue === '-' || rawValue.endsWith('.')) 
                ? rawValue 
                : formatIndianNumber(parseFloat(rawValue));
                
            setDisplayValues(prev => ({
                ...prev,
                [field]: formatted
            }));
        }
    };

    // Initialize display values when form changes (for editing)
    useEffect(() => {
        const fieldsToFormat = ['options_trading_amount', 'interest', 'actual_profit', 'mf_trading_amount', 'pnl'];
        const newDisplayValues = {};
        fieldsToFormat.forEach(field => {
            const value = form[field];
            newDisplayValues[field] = value !== undefined && value !== null && value !== ''
                ? formatIndianNumber(value)
                : '';
        });
        setDisplayValues(newDisplayValues);
    }, [form]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };

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
    const isFormValid = form.entry_date;

    const exportToCSV = () => {
        if (trades.length === 0) return;
        
        const headers = [
            "Entry Date", "Exit Date", "Options Amount", "Required Profit", 
            "Interest", "Actual Profit", "Total Profit", "Percent", 
            "MF Amount", "PnL", "MF Profit"
        ];
        
        const csvContent = [
            headers.join(","),
            ...trades.map(t => [
                t.entry_date,
                t.exit_date,
                t.options_trading_amount,
                t.required_profit,
                t.interest,
                t.actual_profit,
                t.total_profit,
                t.percent,
                t.mf_trading_amount,
                t.pnl,
                t.mf_profit
            ].join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyErrorToClipboard = () => {
        if (!saveError || !navigator.clipboard) return;
        navigator.clipboard.writeText(saveError).catch(() => {});
    };

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            {/* Trading Form */}
            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? "Edit Trade" : "Add New Trade"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addTrade} className="space-y-6">
                        {saveError && (
                            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="font-semibold">Save error - Full details below</div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={copyErrorToClipboard}
                                            className="text-xs underline underline-offset-2"
                                        >
                                            Copy error
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSaveError("")}
                                            className="text-xs underline underline-offset-2"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    readOnly
                                    value={saveError}
                                    className="w-full min-h-[200px] rounded-md border border-destructive/50 bg-background p-2 text-xs font-mono text-foreground resize-y"
                                />
                                <div className="text-xs text-muted-foreground">This error will persist until you dismiss it or save successfully. Copy the full details to share for debugging.</div>
                            </div>
                        )}
                        {/* Dates Group */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold">Trade Dates</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entry-date">Entry Date</Label>
                                    <Input
                                        ref={firstFieldRef}
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
                                    {form.entry_date && form.exit_date && new Date(form.exit_date) < new Date(form.entry_date) && (
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
                                        type="text"
                                        placeholder="Enter amount in INR"
                                        value={displayValues.options_trading_amount}
                                        onChange={(e) => handleInputChange("options_trading_amount", e.target.value)}
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
                                        type="text"
                                        placeholder="Interest earned"
                                        value={displayValues.interest}
                                        onChange={(e) => handleInputChange("interest", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="actual-profit">Actual Profit</Label>
                                    <Input
                                        id="actual-profit"
                                        type="text"
                                        placeholder="Actual profit/loss"
                                        value={displayValues.actual_profit}
                                        onChange={(e) => handleInputChange("actual_profit", e.target.value)}
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
                                        type="text"
                                        placeholder="MF investment amount"
                                        value={displayValues.mf_trading_amount}
                                        onChange={(e) => handleInputChange("mf_trading_amount", e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pnl">PnL</Label>
                                    <Input
                                        id="pnl"
                                        type="text"
                                        placeholder="Profit/Loss"
                                        value={displayValues.pnl}
                                        onChange={(e) => handleInputChange("pnl", e.target.value)}
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Button type="submit" className="sm:col-span-2" disabled={!isFormValid || submitting}>
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        {editingId ? 'Updating Trade...' : 'Adding Trade...'}
                                    </>
                                ) : (
                                    editingId ? 'Update Trade' : 'Add Trade'
                                )}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="secondary" onClick={() => cancelEdit && cancelEdit()} disabled={submitting}>
                                    Cancel
                                </Button>
                            )}
                        </div>
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
                                className="px-3 py-1 text-base md:text-sm border border-input bg-background rounded-md"
                                onChange={(e) => setFilter(e.target.value)}
                                value={filter}
                            >
                                <option value="all">All Trades</option>
                                <option value="winning">Winning Only</option>
                                <option value="losing">Losing Only</option>
                            </select>
                            <select
                                className="px-3 py-1 text-base md:text-sm border border-input bg-background rounded-md"
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToCSV}
                                disabled={trades.length === 0}
                                title="Export to CSV"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Entry Date</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Exit Date</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Options Amount</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Required Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Interest</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Actual Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Total Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Percent</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">MF Amount</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">PnL</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">MF Profit</th>
                                    <th className="text-left p-2 font-medium bg-card sticky top-0 z-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTrades.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="p-12 text-center text-muted-foreground italic">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span>No trades yet — add your first trade to start tracking!</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTrades.map((t) => (
                                        <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors duration-150">
                                        <td className="p-2">{formatDate(t.entry_date)}</td>
                                        <td className="p-2">{formatDate(t.exit_date)}</td>
                                        <td className="p-2">{formatIndianNumber(t.options_trading_amount)}</td>
                                        <td className="p-2">{formatIndianNumber(t.required_profit)}</td>
                                        <td className="p-2">{formatIndianNumber(t.interest)}</td>
                                        <td className="p-2">{formatIndianNumber(t.actual_profit)}</td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                parseFloat(t.total_profit) >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {formatIndianNumber(t.total_profit)}
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
                                        <td className="p-2">{formatIndianNumber(t.mf_trading_amount)}</td>
                                        <td className="p-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                t.pnl >= 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {formatIndianNumber(t.pnl)}
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
                                )))}
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