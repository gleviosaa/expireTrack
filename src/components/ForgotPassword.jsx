import React, { useState } from 'react';
import { Package, Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = ({ onBack, darkMode }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center shadow-lg">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              If an account with that email exists, we've sent you a password reset link.
              Please check your inbox and spam folder.
            </p>

            <button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Package className="w-10 h-10 text-white" />
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Forgot Password?</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Enter your email and we'll send you a reset link
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
