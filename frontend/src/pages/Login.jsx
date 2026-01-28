import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { ArrowRight, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(username, password);
            setUser({ username }); // We'll re-fetch full user data in App.jsx effect anyway
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-sm mb-4">
                        <span className="text-white font-bold">AG</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-text-secondary mt-2">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-alert/10 border border-alert/20 text-alert p-3 rounded-sm flex items-center space-x-2 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <UserIcon className="absolute left-0 top-3 text-text-secondary" size={18} />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-8 input-minimal"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-0 top-3 text-text-secondary" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-8 input-minimal"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                        {loading ? (
                            <span className="animate-pulse">PROCESSING...</span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
