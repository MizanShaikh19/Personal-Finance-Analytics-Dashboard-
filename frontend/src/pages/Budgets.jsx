import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Wallet,
    FileDown,
    CheckCircle2,
    AlertCircle,
    Clock,
    Download,
    Loader2
} from 'lucide-react';

const Budgets = () => {
    const [performance, setPerformance] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportTaskId, setReportTaskId] = useState(null);
    const [reportFile, setReportFile] = useState(null);

    // New budget form
    const [showAdd, setShowAdd] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category_id: '',
        amount: '',
        period: 'monthly',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const [perfRes, catRes] = await Promise.all([
                axios.get(`/budgets/performance?month_start=${monthStart}`),
                axios.get('/categories/')
            ]);
            setPerformance(perfRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Fetch budgets failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/budgets/', newBudget);
            setShowAdd(false);
            setNewBudget({
                category_id: '',
                amount: '',
                period: 'monthly',
                start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create budget");
        }
    };

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setReportFile(null);
        try {
            const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
            const res = await axios.post(`/reports/generate?month=${monthName}`);
            setReportTaskId(res.data.task_id);
        } catch (err) {
            alert("Report generation failed");
            setReportLoading(false);
        }
    };

    // Poll report status
    useEffect(() => {
        if (!reportTaskId) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/reports/status/${reportTaskId}`);
                if (res.data.task_status === 'SUCCESS' || res.data.task_status === 'completed') {
                    setReportFile(res.data.result.filename);
                    setReportTaskId(null);
                    setReportLoading(false);
                    clearInterval(interval);
                } else if (res.data.task_status === 'FAILURE') {
                    alert("Background task failed");
                    setReportTaskId(null);
                    setReportLoading(false);
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Status check failed", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [reportTaskId]);

    const handleDownload = () => {
        if (reportFile) {
            window.open(`/reports/download/${reportFile}`, '_blank');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budgets & Reports</h1>
                    <p className="text-text-secondary">Track performance and export financial health reports</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleGenerateReport}
                        disabled={reportLoading}
                        className="btn-secondary flex items-center space-x-2 text-sm py-2"
                    >
                        {reportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                        <span>{reportLoading ? 'Generating...' : reportFile ? 'Report Ready' : 'Generate PDF'}</span>
                    </button>

                    {reportFile && (
                        <button
                            onClick={handleDownload}
                            className="btn-primary bg-success hover:bg-success/90 flex items-center space-x-2 text-sm py-2"
                        >
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    )}

                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="btn-primary flex items-center space-x-2 text-sm py-2"
                    >
                        <Plus size={16} />
                        <span>Set Budget</span>
                    </button>
                </div>
            </header>

            {/* Set Budget Form */}
            {showAdd && (
                <div className="card bg-surface/50 border-primary/20 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleCreateBudget} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Category</label>
                            <select
                                value={newBudget.category_id}
                                onChange={e => setNewBudget({ ...newBudget, category_id: e.target.value })}
                                className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary"
                                required
                            >
                                <option value="" disabled className="bg-surface">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Limit Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newBudget.amount}
                                onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })}
                                className="w-full input-minimal text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-text-secondary hover:text-text-primary px-4 py-2">CANCEL</button>
                            <button type="submit" className="btn-primary text-xs px-6">CREATE BUDGET</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Budget Performance List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performance.map((item, idx) => {
                    const isOver = item.spent > item.budget;
                    return (
                        <div key={idx} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-sm ${isOver ? 'bg-alert/10 text-alert' : 'bg-success/10 text-success'}`}>
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold capitalize">{item.category}</h3>
                                        <p className="text-xs text-text-secondary">Monthly Limit: ${item.budget.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold font-mono ${isOver ? 'text-alert' : 'text-text-primary'}`}>
                                        ${item.spent.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">Spent</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isOver ? 'bg-alert' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(100, item.percent)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                    <span className={isOver ? 'text-alert' : 'text-text-secondary'}>
                                        {item.percent.toFixed(1)}% Consumed
                                    </span>
                                    <span className="text-text-secondary">
                                        ${Math.max(0, item.remaining).toFixed(2)} Remaining
                                    </span>
                                </div>
                            </div>

                            {isOver && (
                                <div className="mt-4 flex items-center space-x-2 text-alert text-[10px] font-bold uppercase tracking-widest bg-alert/5 p-2 rounded-sm border border-alert/10">
                                    <AlertCircle size={12} />
                                    <span>Over-budget threshold exceeded</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {performance.length === 0 && !loading && (
                    <div className="md:col-span-2 card border-dashed flex flex-col items-center justify-center py-16 space-y-4">
                        <Clock size={48} className="text-border" />
                        <div className="text-center">
                            <h3 className="font-bold">No budgets set yet</h3>
                            <p className="text-sm text-text-secondary mt-1">Start tracking by setting limits for your expense categories.</p>
                        </div>
                        <button onClick={() => setShowAdd(true)} className="btn-secondary text-xs">CREATE YOUR FIRST BUDGET</button>
                    </div>
                )}
            </div>

            {/* Report Status Toast Area */}
            {reportTaskId && (
                <div className="fixed bottom-8 right-8 bg-surface border border-primary/20 p-4 rounded-sm shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-8 duration-500">
                    <Loader2 size={20} className="text-primary animate-spin" />
                    <div className="text-xs">
                        <p className="font-bold">Generating Report...</p>
                        <p className="text-text-secondary">This might take a few seconds.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
