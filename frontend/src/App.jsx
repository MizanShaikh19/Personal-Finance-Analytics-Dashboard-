import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Login from './pages/Login';
import Register from './pages/Register';
import { getCurrentUser } from './services/auth';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const userData = await getCurrentUser();
                    setUser(userData);
                }
            } catch (err) {
                console.error("Auth check failed", err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-text-secondary animate-pulse font-mono">INITIALIZING...</div>
        </div>
    );

    return (
        <Router>
            <div className="min-h-screen bg-background">
                {user && <Navbar user={user} setUser={setUser} />}
                <main className={user ? "container mx-auto px-4 py-8" : ""}>
                    <Routes>
                        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
                        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

                        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
                        <Route path="/budgets" element={user ? <Budgets /> : <Navigate to="/login" />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
