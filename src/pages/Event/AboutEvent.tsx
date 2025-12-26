import React from 'react';
import ProfessionalNavbar from '../../components/ProfessionalNavbar';
import Footer from '../../components/Footer';
import RevealOnScroll from '../../components/RevealOnScroll';

const AboutEvent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ProfessionalNavbar />

      {/* Hero Section */}
      <div className="relative w-full py-20 lg:py-32 flex flex-col items-center justify-center bg-white border-b border-slate-100 overflow-hidden">
         {/* Simple background blobs */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply filter opacity-50 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-3xl mix-blend-multiply filter opacity-50 pointer-events-none" />
         
         <div className="container mx-auto px-6 relative z-10 text-center">
            <RevealOnScroll>
               <div className="inline-block px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-sm font-bold tracking-wide mb-6">
                 EST. 2008 • USHA RAMA COLLEGE
               </div>
               <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                 About The <span className="text-blue-700">Feria 2025</span>
               </h1>
               <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                 Where innovation meets competition. A celebration of technical excellence, creativity, and the coding spirit.
               </p>
            </RevealOnScroll>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           
           {/* Section 1: The Event */}
           <RevealOnScroll>
              <div className="relative">
                 <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-100 rounded-full opacity-50 z-0" />
                 <h2 className="text-3xl font-bold text-slate-900 mb-6 relative z-10">Igniting Innovation</h2>
                 <p className="text-lg text-slate-600 leading-relaxed mb-6">
                   <strong className="text-slate-900">Code & Quest Feria</strong> is a department-level technical fest for the sharpest minds. 
                   Hosted by the Department of Information Technology at Usha Rama College, this event brings together students 
                   to compete in high-stakes coding challenges, strategic quizzes, and mock interview rounds.
                 </p>
                 <p className="text-lg text-slate-600 leading-relaxed">
                   Our mission is simple: To provide a platform where talent gets recognized, skills get sharpened, and the 
                   next generation of tech leaders takes the stage.
                 </p>
              </div>
           </RevealOnScroll>

           {/* Visual/Stat (Placeholder for Image or Stats) */}
           <RevealOnScroll delay={100}>
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity" />
                 
                 <div className="grid grid-cols-2 gap-8 text-center relative z-10">
                    <div>
                       <div className="text-4xl font-black text-blue-600 mb-2">5+</div>
                       <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Major Events</div>
                    </div>
                    <div>
                       <div className="text-4xl font-black text-green-600 mb-2">₹30</div>
                       <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Entry Fee</div>
                    </div>
                 </div>
              </div>
           </RevealOnScroll>
        </div>

        {/* Section 2: The College */}
        <div className="mt-32">
           <RevealOnScroll>
              <div className="bg-slate-900 rounded-3xl p-12 text-center relative overflow-hidden">
                 {/* Decorative circles */}
                 <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen" />
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl mix-blend-screen" />

                 <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Hosted by Usha Rama College</h2>
                    <p className="text-xl text-slate-300 leading-relaxed mb-10">
                       Usha Rama College of Engineering and Technology is a premier institution dedicated to excellence in technical education. 
                       With state-of-the-art infrastructure and a vibrant student community, we foster an environment where innovation thrives.
                    </p>
                    <a 
                       href="https://usharama.edu.in/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-block px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    >
                       Visit College Website
                    </a>
                 </div>
              </div>
           </RevealOnScroll>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutEvent;
