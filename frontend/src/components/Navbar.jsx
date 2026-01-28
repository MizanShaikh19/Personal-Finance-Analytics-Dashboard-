import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Wallet, LogOut, User } from 'lucide-react';
import { logout } from '../services/auth';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate('/login');
    };

    const NavLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-sm transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
            >
                <Icon size={18} />
                <span className="text-sm font-medium">{children}</span>
            </Link>
        );
    };

    return (
        <nav className="border-b border-border bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="text-xl font-bold tracking-tighter flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">AG</span>
                        </div>
                        <span>ANTIGRAVITY</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
                        <NavLink to="/transactions" icon={ReceiptText}>Transactions</NavLink>
                        <NavLink to="/budgets" icon={Wallet}>Budgets</NavLink>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-text-secondary">
                        <User size={18} />
                        <span className="text-xs font-mono lowercase">{user.username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-text-secondary hover:text-alert transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
