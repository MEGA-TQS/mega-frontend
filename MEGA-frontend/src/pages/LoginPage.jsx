import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Added password state
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Call Real Backend
            const data = await AuthService.login(email, password);
            
            // 2. Update Context
            login(data);

            // 3. Redirect based on Role
            navigate(data.role === 'ADMIN' ? '/owner-dashboard' : '/');
        } catch (err) {
            // Handle 401 Unauthorized
            setError("Invalid email or password.");
            console.error(err);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h3 className="text-center mb-4 fw-bold">Sign In</h3>

                            {error && (
                                <div className="alert alert-danger" data-testid="login-error">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        data-testid="email-input"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        data-testid="password-input"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3" data-testid="login-button">Login</button>
                            </form>

                            <p className="small mt-3">Don't have an account? <Link to="/register">Register here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;