import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ArrowUpRight,
    BrainCircuit,
    AlertTriangle
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [trends, setTrends] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsRes, forecastRes, summaryRes] = await Promise.all([
                    axios.get('/analytics/trends'),
                    axios.get('/analytics/forecast'),
                    axios.get(`/transactions/summary?start_date=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}`)
                ]);
                setTrends(trendsRes.data);
                setForecast(forecastRes.data);
                setSummary(summaryRes.data);
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const lineData = {
        labels: trends.map(t => t.date),
        datasets: [{
            label: 'Monthly Spending',
            data: trends.map(t => t.amount),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3B82F6',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E1E1E',
                titleColor: '#A0A0A0',
                bodyFont: { family: 'JetBrains Mono' },
                padding: 12,
                cornerRadius: 4,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#A0A0A0', font: { size: 10 } } },
            y: { grid: { color: '#333' }, ticks: { color: '#A0A0A0', font: { size: 10 } } }
        }
    };

    if (loading) return <div className="text-text-secondary font-mono animate-pulse">LOADING ANALYTICS...</div>;

    const currentMonthSpending = summary.reduce((acc, curr) => acc + curr.total_spent, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                <p className="text-text-secondary">Financial summary and spending patterns</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-text-secondary">Monthly Spending</span>
                        <div className="p-2 bg-primary/10 rounded-sm text-primary">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold font-mono">
                        ${currentMonthSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-4 flex items-center text-xs text-text-secondary">
                        <Calendar size={12} className="mr-1" />
                        <span>Current Billing Period</span>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-text-secondary">AI Spending Forecast</span>
                        <div className="p-2 bg-primary/10 rounded-sm text-primary">
                            <BrainCircuit size={18} />
                        </div>
                    </div>
                    {forecast?.predicted_amount ? (
                        <>
                            <div className="text-3xl font-bold font-mono">
                                ${forecast.predicted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className={`mt-4 flex items-center text-xs ${forecast.trend === 'increasing' ? 'text-alert' : 'text-success'}`}>
                                {forecast.trend === 'increasing' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                <span className="capitalize">{forecast.trend} trend detection</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-text-secondary flex items-start space-x-2">
                            <AlertTriangle size={16} className="mt-0.5 text-alert/50" />
                            <span>{forecast?.message || 'Calculation pending...'}</span>
                        </div>
                    )}
                </div>

                <div className="card border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-primary">Growth Index</span>
                        <ArrowUpRight size={18} className="text-primary" />
                    </div>
                    <div className="text-3xl font-bold font-mono text-primary">
                        {forecast?.monthly_growth_rate ? (forecast.monthly_growth_rate > 0 ? '+' : '') + forecast.monthly_growth_rate.toFixed(1) + '%' : '0.0%'}
                    </div>
                    <p className="mt-4 text-xs text-text-secondary">Calculated via simple linear regression</p>
                </div>
            </div>

            {/* Main Trends Chart */}
            <div className="card h-96">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold">Spending Trends</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs text-text-secondary">Monthly Totals</span>
                    </div>
                </div>
                <div className="h-72">
                    {trends.length > 0 ? (
                        <Line data={lineData} options={chartOptions} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-secondary border border-dashed border-border rounded-sm">
                            No historical data detected. Upload a bank statement to see trends.
                        </div>
                    )}
                </div>
            </div>

            {/* Categorized Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold mb-6">Current Month Breakdown</h3>
                    <div className="space-y-4">
                        {summary.sort((a, b) => b.total_spent - a.total_spent).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-sm text-text-primary capitalize">{item.category}</span>
                                </div>
                                <div className="font-mono text-sm">${item.total_spent.toFixed(2)}</div>
                            </div>
                        ))}
                        {summary.length === 0 && (
                            <div className="text-sm text-text-secondary italic">No transactions this month.</div>
                        )}
                    </div>
                </div>

                <div className="card flex flex-col justify-center items-center text-center p-8 space-y-4 border-dashed">
                    <div className="p-4 bg-surface border border-border rounded-full">
                        <ReceiptText size={32} className="text-text-secondary" />
                    </div>
                    <div>
                        <h4 className="font-bold">Ready to analyze more?</h4>
                        <p className="text-sm text-text-secondary max-w-xs mt-2">
                            Upload your latest bank statement to refine your AI spending forecast.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/transactions'}
                        className="btn-secondary text-xs"
                    >
                        Go to Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
