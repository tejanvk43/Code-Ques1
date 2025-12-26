import React from 'react';
import ProfessionalNavbar from '../../components/ProfessionalNavbar';
import Footer from '../../components/Footer';
import EventCard from '../../components/EventCard';
import RevealOnScroll from '../../components/RevealOnScroll';
import { eventsData } from '../../data/eventsData';

const EventPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ProfessionalNavbar />

      <main className="flex-grow container mx-auto px-6 py-16">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Explore Our Events</h1>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From coding battles to strategic quizzes, Code & Quest Feria 2025 has a challenge for every tech enthusiast.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsData.map((event, idx) => (
            <RevealOnScroll key={event.id} delay={idx * 100}>
              <EventCard 
                id={event.id}
                name={event.name}
                desc={event.shortDesc}
                color={event.color}
              />
            </RevealOnScroll>
          ))}
        </div>
      </main>
      
      {/* Background Pattern */}
      <div className="fixed top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none z-[-1]" />

      <Footer />
    </div>
  );
};

export default EventPage;
