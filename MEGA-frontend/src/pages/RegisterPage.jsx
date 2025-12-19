import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER', 
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            // 1. Prepare DTO (excluding confirmPassword)
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            // 2. Call Backend
            const data = await AuthService.register(payload);

            // 3. Login Immediately
            login(data);
            setSuccess(`Registration successful! Welcome ${data.name}.`);

            // 4. Redirect
            setTimeout(() => {
                navigate(data.role === 'ADMIN' ? '/owner-dashboard' : '/');
            }, 1000);

        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError("Email already exists.");
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h3 className="text-center mb-4 fw-bold">Create Account</h3>

                            {error && <div className="alert alert-danger" data-testid="register-error">{error}</div>}
                            {success && <div className="alert alert-success" data-testid="register-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        data-testid="name-input"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        data-testid="email-input"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        data-testid="password-input"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        data-testid="confirm-password-input"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Account Type</label>
                                    <select
                                        className="form-select"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        data-testid="role-select"
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-success w-100 mb-3" data-testid="register-button">Register</button>
                            </form>
                            <div className="text-center mt-3 pt-3 border-top">
                                <p className="small">Already have an account? <Link to="/login">Login here</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;