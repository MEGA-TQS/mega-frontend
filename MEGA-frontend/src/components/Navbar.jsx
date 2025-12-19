import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
            <div className="container">
                {/* --- YOUR NEW LOGO AREA --- */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img 
                        src="/MEGA_completely_original_logo.png" 
                        alt="MEGA Logo"
                        style={{ height: '35px', marginRight: '5px' }} 
                    />
                     <img 
                        src="/Title_image.png" 
                        alt="MEGA Title"
                        style={{ height: '32px', marginRight: '2px' }} 
                    />
                </Link>
                {/* ------------------------- */}
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center gap-2">
                        {user ? (
                            <>
                                {/* Renter Link */}
                                <li className="nav-item">
                                    <Link to="/my-bookings" className="btn btn-sm btn-outline-primary border-0">My Bookings</Link>
                                </li>

                                {/* Owner Links */}
                                <li className="nav-item">
                                    <Link to="/items/new" className="btn btn-sm btn-outline-success">List Item</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/my-listings" className="btn btn-sm btn-outline-dark border-0">My Listings</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/incoming-bookings" className="btn btn-sm btn-outline-warning border-0 position-relative">
                                        Requests
                                    </Link>
                                </li>

                                <li className="nav-item ms-2">
                                    <span className="text-muted small me-2">
                                        Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                                    </span>
                                    <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link to="/login" className="btn btn-primary btn-sm px-4">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;