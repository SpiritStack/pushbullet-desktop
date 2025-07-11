import React, { useState } from 'react';
import { Key, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  onAuth: (token: string) => void;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, error }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    try {
      await onAuth(token.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pushbullet</h1>
          <p className="text-gray-600">Enter your API token to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              API Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your Pushbullet API token"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Get your API token from{' '}
              <a 
                href="https://www.pushbullet.com/#settings/account" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                Pushbullet Settings
              </a>
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;