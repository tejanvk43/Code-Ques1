import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalNavbar from '../components/ProfessionalNavbar';
import Footer from '../components/Footer';
import RevealOnScroll from '../components/RevealOnScroll';
import { eventsData } from '../data/eventsData';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Show first 3 events as featured
  const featuredEvents = eventsData.slice(0, 3).map(event => ({
    id: event.id,
    name: event.name,
    desc: event.shortDesc,
    icon: event.icon
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden font-sans">
      {/* Navbar */}
      <ProfessionalNavbar />

      {/* Hero Section */}
      <div className="relative w-full py-8 lg:py-16 flex flex-col items-center justify-center bg-hero-pattern overflow-hidden">
         {/* Abstract background blobs */}
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-blob" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000" />
         
         <div className="container mx-auto px-6 relative z-10 text-center">
            <RevealOnScroll>
              <div className="inline-block px-4 py-1.5 bg-white border border-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wide mb-4 shadow-sm">
                 🚀 DECEMBER 29 • REGISTRATION FEE: ₹30
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={100}>
               <div className="relative w-full max-w-7xl mx-auto mb-6 transform hover:scale-[1.01] transition-transform duration-500">
                  <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-3xl -z-10"></div>
                  <img 
                    src="/src/assets/hero_banner.png" 
                    alt="Code & Quest Feria 2025 Banner" 
                    className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
                  />
               </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => window.location.href = 'https://app-8gixcp0ztqtd.appmedo.com/register'}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-600/30 hover:-translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Register Now <span className="text-xl">&rarr;</span>
                  </button> 
                  <button 
                  onClick={() => navigate('/events')}
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg shadow-lg shadow-slate-200/50 hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-1 cursor-pointer"
                >
                  View Events
                </button>
              </div>
            </RevealOnScroll>
         </div>
      </div>

      {/* Featured Section */}
      <section className="py-24 bg-white relative z-10 border-t border-slate-100">
        <div className="container mx-auto px-6">
           <RevealOnScroll>
             <div className="flex flex-col md:flex-row justify-between items-end mb-16">
               <div className="max-w-2xl">
                 <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Participate?</h2>
                 <p className="text-slate-500 text-lg">
                   More than just a competition. Code & Quest Feria offers a platform to launch your career and test your limits.
                 </p>
               </div>
               <button onClick={() => navigate('/events')} className="hidden md:block text-blue-600 font-bold hover:text-blue-800 cursor-pointer">
                 See All Events &rarr;
               </button>
             </div>
           </RevealOnScroll>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((item, idx) => (
                <RevealOnScroll key={idx} delay={idx * 100}>
                  <div 
                    onClick={() => navigate(`/event/${item.id}`)}
                    className="card-panel p-10 bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
                  >
                     <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block drop-shadow-sm">{item.icon}</div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.name}</h3>
                     <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
