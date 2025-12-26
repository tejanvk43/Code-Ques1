import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
              Code & Quest Feria 2025  
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              The premier national-level technical symposium of Usha Rama College of Engineering and Technology. 
              Igniting minds, fostering innovation, and celebrating technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-slate-200">Quick Links</h3>
            <ul className="space-y-3">
              <li><button onClick={() => navigate('/')} className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => navigate('/events')} className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">Events</button></li>
              <li><button onClick={() => window.location.href = 'https://app-8gixcp0ztqtd.appmedo.com/register'} className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">Register</button></li>
              <li><button onClick={() => navigate('/login')} className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">Coordinator Login</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-slate-200">Contact Us</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-3">
                <span>📍</span>
                <span>NH-16, Near Gannavaram, Telaprolu, Andhra Pradesh 521109</span>
              </li>
              <li className="flex items-center gap-3">
                <span>📧</span>
                <span>23ng1a0543@usharama.edu.in</span>
              </li>
              <li className="flex items-center gap-3">
                <span>📞</span>
                <span>+91 81257 27137</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>© 2025 Usha Rama College of Engineering and Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
