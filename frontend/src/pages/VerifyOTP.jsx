import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerifyOTP = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white glass rounded-3xl w-full max-w-md">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h1>
      <p className="text-slate-500 mb-8 text-center">We've sent a 6-digit code to <br /><span className="font-semibold text-slate-700">{email}</span></p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 text-center text-2xl tracking-widest font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            placeholder="000000"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
