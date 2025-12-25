import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalNavbar from '../components/ProfessionalNavbar';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@usharama.edu.in' && password === 'admin123') {
        login('ADMIN', { email, name: 'Main Admin' });
        navigate('/admin');
    } else {
        alert('Invalid Admin Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ProfessionalNavbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Restricted Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                placeholder="admin@usharama.edu.in"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
