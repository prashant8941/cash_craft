// src/pages/RegisterPage.tsx (FIXED)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Ensure this matches your backend port
const API_URL = 'http://localhost:5000/api/auth/register'; 

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); 
        setLoading(true);

        try {
            const response = await axios.post(API_URL, {
                email,
                password
            });

            setMessage('Registration successful! Redirecting to login...');
            console.log(response.data);
            
            setTimeout(() => {
                navigate('/login'); 
            }, 2000);

        } catch (error: unknown) {
            let errorMessage = 'An unexpected error occurred.';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = `Error: ${error.response.data.msg || 'Registration failed'}`;
            } else {
                console.error(error);
            }
            setMessage(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '450px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#1a1a1a',
        }}>
            <div style={{
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backgroundColor: '#242424',
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '30px', color: '#fff', textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontWeight: 'bold' }}>Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                boxSizing: 'border-box',
                            }}
                            placeholder="your@email.com"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontWeight: 'bold' }}>Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                boxSizing: 'border-box',
                            }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginTop: '10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                {message && (
                    <p style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '4px',
                        color: message.startsWith('Error') ? '#ff6b6b' : '#51cf66',
                        backgroundColor: message.startsWith('Error') ? 'rgba(255, 107, 107, 0.1)' : 'rgba(81, 207, 102, 0.1)',
                        border: `1px solid ${message.startsWith('Error') ? '#ff6b6b' : '#51cf66'}`,
                        textAlign: 'center',
                    }}>
                        {message}
                    </p>
                )}
                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <p style={{ color: '#999', margin: '0 0 10px 0' }}>Already have an account?</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Login Here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;