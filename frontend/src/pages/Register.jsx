import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { ArrowLeft, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Try a different username/email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-text-secondary mt-2">Join Antigravity to manage your finances</p>
                </div>

                {success ? (
                    <div className="bg-success/10 border border-success/20 text-success p-6 rounded-sm text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="font-bold text-lg">Registration Successful</h3>
                        <p className="text-sm">Redirecting you to login...</p>
                    </div>
                ) : (
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
                                <Mail className="absolute left-0 top-3 text-text-secondary" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                <span className="animate-pulse font-mono">PROCESSING...</span>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <UserPlus size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 flex justify-center">
                    <Link to="/login" className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeft size={16} />
                        <span>Back to login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
