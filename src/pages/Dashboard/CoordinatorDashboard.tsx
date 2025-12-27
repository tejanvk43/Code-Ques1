import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CoordinatorDashboard: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [showManualModal, setShowManualModal] = useState(false);
    const [manualData, setManualData] = useState({
        name: '', rollNumber: '', email: '', phoneNumber: '', year: '2nd Year', section: ''
    });

    const sectionOptions: { [key: string]: string[] } = {
        '2nd Year': ['CSE A', 'CSE B', 'CSE C', 'AIML', 'AIDS', 'IT'],
        '3rd Year': ['CSE A', 'CSE B', 'AIML', 'AIDS', 'IT']
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Helper for Email - same as Admin Dashboard
    const sendApprovalEmail = (email: string | undefined, name: string | undefined, rollNumber: string | undefined, password: string) => {
        if (!email || !name) return;

        // Use Netlify Function endpoint
        // Use Local Backend endpoint
        const emailEndpoint = `${import.meta.env.VITE_API_URL}/api/send-approval-email`;

        fetch(emailEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                name,
                rollNumber,
                password,
                loginUrl: 'https://code-quest-1.netlify.app/login'
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) console.log("Email sent to", email);
                else console.error("Email failed:", data);
            })
            .catch(err => console.error("Email API Error:", err));
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const generatedPassword = Math.random().toString(36).slice(-8);

            const newDoc = {
                name: manualData.name,
                rollNumber: manualData.rollNumber,
                email: manualData.email,
                phoneNumber: manualData.phoneNumber,
                year: manualData.year,
                section: manualData.section,
                status: 'verified',
                paymentMode: 'cash',
                password: generatedPassword,
                isFirstLogin: true,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'registrations'), newDoc);

            sendApprovalEmail(manualData.email, manualData.name, manualData.rollNumber, generatedPassword);

            setShowManualModal(false);
            setManualData({ name: '', rollNumber: '', email: '', phoneNumber: '', year: '2nd Year', section: '' });
            alert("Manual Registration Added via Firebase!");

        } catch (error) {
            console.error("Error adding manual registration:", error);
            alert("Failed to add registration to Firebase.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10 font-sans">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-yellow-500">Coordinator Dashboard</h1>
                    <p className="text-gray-400 mt-2">Restricted Access: Manual Registration Only</p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg cursor-pointer">Logout</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-3xl font-bold mb-4">Manual Registration</h2>
                    <p className="text-gray-400 mb-8 max-w-md">Register students manually who have paid via cash. This will automatically verify them and send login credentials via email.</p>
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="px-8 py-4 bg-yellow-500 text-gray-900 rounded-xl font-black hover:bg-yellow-400 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex items-center gap-3 text-lg"
                    >
                        <span>+</span> New Registration
                    </button>
                </div>
            </div>

            {/* Manual Registration Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Manual Registration</h2>
                            <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer">&times;</button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.name} onChange={e => setManualData({ ...manualData, name: e.target.value })} />
                                <input required type="text" placeholder="Roll Number" className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.rollNumber} onChange={e => setManualData({ ...manualData, rollNumber: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.email} onChange={e => setManualData({ ...manualData, email: e.target.value })} />
                                <input required type="tel" placeholder="Phone" className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.phoneNumber} onChange={e => setManualData({ ...manualData, phoneNumber: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.year} onChange={e => setManualData({ ...manualData, year: e.target.value })}>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                </select>
                                <select className="w-full px-4 py-2 border rounded-lg text-slate-900" value={manualData.section} onChange={e => setManualData({ ...manualData, section: e.target.value })}>
                                    <option value="">Select Section</option>
                                    {sectionOptions[manualData.year]?.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm font-bold text-center border border-green-100">
                                💰 Coordinator collected Cash Payment (₹30)
                            </div>
                            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 cursor-pointer">Register Student & Send Email</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
