import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalNavbar from '../components/ProfessionalNavbar';
import { db } from '../firebase';
// import { supabase } from '../supabaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import RevealOnScroll from '../components/RevealOnScroll';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    year: '',
    section: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionOptions: { [key: string]: string[] } = {
    '2nd Year': ['CSE A', 'CSE B', 'CSE C', 'AIML', 'AIDS', 'IT'],
    '3rd Year': ['CSE A', 'CSE B', 'AIML', 'AIDS', 'IT']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'year') {
      setFormData(prev => ({ ...prev, year: value, section: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber || !formData.year || !formData.section) {
        alert("Please fill in all fields.");
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Firebase (Primary App DB)
      await addDoc(collection(db, 'registrations'), {
        name: formData.name,
        rollNumber: formData.rollNumber,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        year: formData.year,
        section: formData.section,
        status: 'pending_payment',
        paymentMode: 'cashfree_gateway',
        createdAt: serverTimestamp()
      });

      // 2. Save to Supabase (REMOVED - Firebase Only Architecture)
      // Data is moved to Firebase only after Payment Verification (in Login.tsx)
      
      // NOTE: We do NOT save to Firebase here. 
      // Data is moved to Firebase only after Payment Verification (in Login.tsx)

      alert('Details Saved! Redirecting to Payment Gateway...');
      
      // Redirect to Cashfree
      setTimeout(() => {
          window.location.href = 'https://payments.cashfree.com/forms?code=Coders';
      }, 1000);

    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProfessionalNavbar />

      <div className="container mx-auto px-4 py-12 flex justify-center">
        <RevealOnScroll>
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            
            <div className="bg-blue-900 p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Event Registration</h1>
              <p className="text-blue-200 text-sm tracking-wide uppercase mb-4">Code & Quest Feria 2025</p>
              <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-white font-bold text-sm border border-white/20">
                Registration Fee: ₹30
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="21UR1A05..."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Year</label>
                    <select
                       name="year"
                       value={formData.year}
                       onChange={handleInputChange}
                       className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white cursor-pointer"
                       required
                    >
                      <option value="">Select Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Section</label>
                    <select
                       name="section"
                       value={formData.section}
                       onChange={handleInputChange}
                       disabled={!formData.year}
                       className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                       required
                    >
                      <option value="">Select Section</option>
                      {formData.year && sectionOptions[formData.year]?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6 font-medium">
                   ℹ️ You will be redirected to the secure Cashfree gateway to complete your payment of ₹30.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl font-black text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <span>💳</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default Registration;
