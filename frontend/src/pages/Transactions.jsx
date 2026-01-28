import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Upload,
    Search,
    Filter,
    Trash2,
    Check,
    X,
    PlusCircle,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');

    // New transaction form
    const [showAdd, setShowAdd] = useState(false);
    const [newTx, setNewTx] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0], category_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [txRes, catRes] = await Promise.all([
                axios.get('/transactions/'),
                axios.get('/categories/')
            ]);
            setTransactions(txRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Fetch transactions failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post('/transactions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchData();
        } catch (err) {
            alert("Upload failed: " + (err.response?.data?.detail || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/transactions/', newTx);
            setShowAdd(false);
            setNewTx({ amount: '', description: '', date: new Date().toISOString().split('T')[0], category_id: '' });
            fetchData();
        } catch (err) {
            alert("Failed to add transaction");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this transaction?")) return;
        try {
            await axios.delete(`/transactions/${id}`);
            fetchData();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        categories.find(c => c.id === tx.category_id)?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-text-secondary">Manage and categorize your spending</p>
                </div>

                <div className="flex items-center space-x-3">
                    <label className="btn-secondary cursor-pointer flex items-center space-x-2 text-sm py-2">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>{uploading ? 'Processing...' : 'Upload CSV'}</span>
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="btn-primary flex items-center space-x-2 text-sm py-2"
                    >
                        <Plus size={16} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </header>

            {/* Add Transaction Form */}
            {showAdd && (
                <div className="card border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Date</label>
                            <input
                                type="date"
                                value={newTx.date}
                                onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                                className="w-full input-minimal text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Description</label>
                            <input
                                type="text"
                                placeholder="e.g. Starbucks"
                                value={newTx.description}
                                onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                                className="w-full input-minimal text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newTx.amount}
                                onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                                className="w-full input-minimal text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Category</label>
                            <select
                                value={newTx.category_id}
                                onChange={e => setNewTx({ ...newTx, category_id: e.target.value })}
                                className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary"
                                required
                            >
                                <option value="" disabled className="bg-surface">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-4 flex justify-end space-x-3 mt-2">
                            <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-text-secondary hover:text-text-primary px-4 py-2">CANCEL</button>
                            <button type="submit" className="btn-primary text-xs px-6">SAVE TRANSACTION</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search descriptions or categories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-sm text-sm focus:border-primary outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-text-secondary font-bold">Date</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-text-secondary font-bold">Description</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-text-secondary font-bold">Category</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-text-secondary font-bold text-right">Amount</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-text-secondary font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-surface/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-text-secondary whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{tx.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tighter bg-primary/10 text-primary border border-primary/20">
                                            {categories.find(c => c.id === tx.category_id)?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-right font-bold text-text-primary">
                                        ${parseFloat(tx.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="text-text-secondary hover:text-alert opacity-0 group-hover:opacity-100 transition-all p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-text-secondary italic text-sm">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
