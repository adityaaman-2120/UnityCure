import React, { useState } from 'react';
import apiService from '../services/api';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'Citizen',
    redirect: '/user_dashboard.html'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login
        const response = await apiService.login(formData.identifier, formData.password);
        if (response.ok) {
          setMessage(`Login successful! Redirecting to ${response.redirect}`);
          // In a real app, you'd store the user session and redirect
          setTimeout(() => {
            window.location.href = response.redirect;
          }, 2000);
        }
      } else {
        // Registration
        const response = await apiService.register(formData);
        if (response.ok) {
          setMessage('Registration successful! You can now login.');
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
        }
      }
    } catch (error) {
      setMessage(error.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Phone:</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter email or phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Hospital Staff">Hospital Staff</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Platform Admin">Platform Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Redirect URL:</label>
                <input
                  type="text"
                  name="redirect"
                  value={formData.redirect}
                  onChange={handleInputChange}
                  placeholder="Redirect URL after login"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="toggle-form">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setFormData({
                identifier: '',
                password: '',
                role: 'Citizen',
                redirect: '/user_dashboard.html'
              });
            }}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <ul>
            <li><strong>Citizen:</strong> citizen@example.com / Test@123</li>
            <li><strong>Hospital Staff:</strong> hospitaladmin@uc.com / Admin@123</li>
            <li><strong>Doctor:</strong> doctor@uc.com / Doc@123</li>
            <li><strong>Dispatcher:</strong> dispatcher@uc.com / Disp@123</li>
            <li><strong>Platform Admin:</strong> platformadmin@uc.com / Root@123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
