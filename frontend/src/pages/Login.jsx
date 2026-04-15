import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../api';
import toast from 'react-hot-toast';
import useStore from '../store';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useStore();

    const nextPath = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('next') || '/';
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuthToken(data?.token);
            setUser(data);
            toast.success('Logged in successfully!');
            navigate(nextPath);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">Enter your credentials to access your CRM</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to={`/register?next=${encodeURIComponent(nextPath)}`} className="text-primary font-semibold hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
