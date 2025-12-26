import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import AdminNavbar from '../../components/AdminNavbar';

interface RegistrationData {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phoneNumber: string;
  year: string;
  section: string;
  transactionId?: string;
  screenshotUrl?: string;
  resumeUrl?: string;
  status?: 'pending' | 'verified' | 'declined' | 'pending_payment';
  paymentMode?: 'online' | 'cash' | 'cashfree_gateway' | 'cashfree_auto' | 'cashfree_synced' | 'bulk_import';
  createdAt: any;
}

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterResume, setFilterResume] = useState(''); // '' | 'uploaded' | 'not_uploaded'
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'declined'>('all');

  // Manual Registration State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualData, setManualData] = useState({
    name: '', rollNumber: '', email: '', phoneNumber: '', year: '2nd Year', section: ''
  });

  const sectionOptions: { [key: string]: string[] } = {
    '2nd Year': ['CSE A', 'CSE B', 'CSE C', 'AIML', 'AIDS', 'IT'],
    '3rd Year': ['CSE A', 'CSE B', 'AIML', 'AIDS', 'IT']
  };

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        console.log("Fetching registrations from Firebase...");
        const querySnapshot = await getDocs(collection(db, 'registrations'));
        
        const mappedData: RegistrationData[] = querySnapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                name: d.name || d.full_name,
                rollNumber: d.rollNumber || d.roll_number,
                email: d.email,
                phoneNumber: d.phoneNumber || d.phone,
                year: d.year || d.year_of_study,
                section: d.section,
                transactionId: d.transactionId || '',
                screenshotUrl: d.screenshotUrl || '',
                resumeUrl: d.resumeUrl || '',
                paymentMode: d.paymentMode || 'online',
                status: (d.status === 'verified' || d.status === 'paid') ? 'verified' : (d.status === 'declined' ? 'declined' : 'pending'),
                createdAt: d.createdAt
            };
        });
        
        // Sort by date desc
        mappedData.sort((a, b) => {
             const tA = a.createdAt?.seconds || 0;
             const tB = b.createdAt?.seconds || 0;
             return tB - tA;
        });

        setRegistrations(mappedData);
      } catch (error) {
        console.error("Error fetching registrations: ", error);
        alert("Failed to fetch data from Firebase.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Helper for Email
  const sendApprovalEmail = (email: string | undefined, name: string | undefined, rollNumber: string | undefined, password: string) => {
       if (!email || !name) return;
       
       // Use Netlify Function endpoint
       const emailEndpoint = '/.netlify/functions/send-email'; 
       
       fetch(emailEndpoint, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               email,
               name,
               rollNumber,
               password,
               loginUrl: 'https://694d4924329c8ee8906fc027--code-quest2025.netlify.app/login' 
           })
       }).then(res => res.json())
         .then(data => {
             if(data.success) console.log("Email sent to", email);
             else console.error("Email failed:", data);
         })
         .catch(err => console.error("Email API Error:", err));
  };

  const handleStatusUpdate = async (id: string, newStatus: 'verified' | 'declined') => {
      if (!window.confirm(`Are you sure you want to mark this as ${newStatus.toUpperCase()}?`)) return;
      
      try {
          const updates: any = { status: newStatus };
          let generatedPassword = '';

          if (newStatus === 'verified') {
               generatedPassword = Math.random().toString(36).slice(-8);
               updates.password = generatedPassword;
               updates.isFirstLogin = true;
          }

          await updateDoc(doc(db, 'registrations', id), updates);
          
          if (newStatus === 'verified') {
              const student = registrations.find(r => r.id === id);
              sendApprovalEmail(student?.email, student?.name, student?.rollNumber, generatedPassword);
          }

          setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg));
          
      } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status.");
      }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this registration permanently?")) {
      try {
        await deleteDoc(doc(db, 'registrations', id));
        setRegistrations(prev => prev.filter(reg => reg.id !== id));
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete.");
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                            Bulk Upload Logic                               */
  /* -------------------------------------------------------------------------- */
  const downloadSampleCSV = () => {
    const headers = ['Name,RollNumber,Email,Phone,Year,Section'];
    const sampleRow = ['John Doe,21UR1A0501,john@example.com,9876543210,3rd Year,CSE A'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, sampleRow].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllCSV = () => {
    const headers = ['Name,RollNumber,Email,Phone,Year,Section,Status,PaymentMode,ResumeLink,TransactionID'];
    const rows = filteredRegistrations.map(reg => [
        reg.name,
        reg.rollNumber,
        reg.email,
        reg.phoneNumber,
        reg.year,
        reg.section,
        reg.status || 'pending',
        reg.paymentMode || '',
        reg.resumeUrl || 'Not Uploaded',
        reg.transactionId || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        // Remove header
        const rows = lines.slice(1).filter(line => line.trim() !== '');
        
        if (rows.length === 0) {
            alert("CSV is empty or only has headers.");
            return;
        }

        if (!window.confirm(`Found ${rows.length} rows. Process import?`)) return;

        let successCount = 0;
        let failCount = 0;

        for (const row of rows) {
            try {
                const cols = row.split(',').map(c => c.trim());
                if (cols.length < 6) {
                    failCount++;
                    continue;
                }

                const [name, rollNumber, email, phone, year, section] = cols;
                const generatedPassword = Math.random().toString(36).slice(-8);

                const newDoc = {
                    name,
                    rollNumber,
                    email,
                    phoneNumber: phone,
                    year,
                    section,
                    status: 'verified',
                    paymentMode: 'bulk_import',
                    password: generatedPassword,
                    isFirstLogin: true,
                    createdAt: serverTimestamp()
                };
                
                // Add to Firebase
                const docRef = await addDoc(collection(db, 'registrations'), newDoc);
                
                // Send Email
                sendApprovalEmail(email, name, rollNumber, generatedPassword);

                // Add to local state
                const mappedNewReg: RegistrationData = {
                    id: docRef.id,
                    ...newDoc,
                    status: 'verified' // Explicitly verified
                } as RegistrationData;

                setRegistrations(prev => [mappedNewReg, ...prev]);
                successCount++;

            } catch (err) {
                console.error("Row Import Failed:", row, err);
                failCount++;
            }
        }

        alert(`Import Complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        e.target.value = ''; // Reset input
    };
    
    reader.readAsText(file);
  };
  
  /* -------------------------------------------------------------------------- */

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

        const docRef = await addDoc(collection(db, 'registrations'), newDoc);
        
        sendApprovalEmail(manualData.email, manualData.name, manualData.rollNumber, generatedPassword);

        const mappedNewReg: RegistrationData = {
            id: docRef.id,
            ...newDoc,
            status: 'verified' // explicit typing
        } as RegistrationData;
        
        setRegistrations(prev => [mappedNewReg, ...prev]);
        setActiveTab('verified');
        
        setShowManualModal(false);
        setManualData({ name: '', rollNumber: '', email: '', phoneNumber: '', year: '2nd Year', section: '' });
        alert("Manual Registration Added via Firebase!");

    } catch (error) {
        console.error("Error adding manual registration:", error);
        alert("Failed to add registration to Firebase.");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                            Edit Functionality                                */
  /* -------------------------------------------------------------------------- */
  const [editingStudent, setEditingStudent] = useState<RegistrationData | null>(null);

  const handleEditClick = (student: RegistrationData) => {
      setEditingStudent(student);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent) return;

      try {
          const updates = {
              name: editingStudent.name,
              rollNumber: editingStudent.rollNumber,
              email: editingStudent.email,
              phoneNumber: editingStudent.phoneNumber,
              year: editingStudent.year,
              section: editingStudent.section
          };

          await updateDoc(doc(db, 'registrations', editingStudent.id), updates);
          
          setRegistrations(prev => prev.map(r => r.id === editingStudent.id ? { ...r, ...updates } : r));
          setEditingStudent(null);
          alert("Student details updated successfully!");

      } catch (error) {
          console.error("Error updating student:", error);
          alert("Failed to update student.");
      }
  };
  /* -------------------------------------------------------------------------- */

  const filteredRegistrations = registrations.filter(reg => {
    const isMatchingTab = activeTab === 'all' || (reg.status || 'pending') === activeTab;
    if (!isMatchingTab) return false;

    const term = searchTerm.toLowerCase();
    const searchString = `${reg.name} ${reg.rollNumber} ${reg.phoneNumber} ${reg.transactionId || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(term);

    const matchYear = filterYear ? reg.year === filterYear : true;
    const matchSection = filterSection ? reg.section === filterSection : true;
    
    // Resume Filter
    let matchResume = true;
    if (filterResume === 'uploaded') matchResume = !!reg.resumeUrl;
    if (filterResume === 'not_uploaded') matchResume = !reg.resumeUrl;

    return matchesSearch && matchYear && matchSection && matchResume;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminNavbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Manage Code & Quest Feria Registrations</p>
            </div>
            <div className="flex gap-3">
               <button onClick={downloadAllCSV} className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer">
                  <span>📥</span> Export CSV
               </button>
               <button onClick={downloadSampleCSV} className="text-xs font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer mr-2">
                  Format
               </button>
               <label className="px-5 py-2.5 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 shadow-lg flex items-center gap-2 transition-all cursor-pointer">
                  <span>📂</span> Bulk Upload
                  <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
               </label>
               <button onClick={() => setShowManualModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2 transition-all cursor-pointer">
                  <span>+</span> Manual
               </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
            {(['all', 'pending', 'verified', 'declined'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                        activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    } cursor-pointer`}
                >
                    {tab === 'all' ? 'All Students' : tab} ({
                        tab === 'all' 
                        ? registrations.length 
                        : registrations.filter(r => {
                            const s = r.status || 'pending';
                            // Map 'pending_payment' to 'pending' for tab counting
                            return (s === 'pending_payment' ? 'pending' : s) === tab; 
                        }).length
                    })
                </button>
            ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
             <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm" />
             <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm cursor-pointer">
                 <option value="">All Years</option>
                 <option value="2nd Year">2nd Year</option>
                 <option value="3rd Year">3rd Year</option>
             </select>
             <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm cursor-pointer">
                 <option value="">All Sections</option>
                 {sectionOptions['2nd Year']?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
             <select value={filterResume} onChange={e => setFilterResume(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm cursor-pointer border-blue-100 bg-blue-50/50">
                 <option value="">All Resumes</option>
                 <option value="uploaded">Uploaded</option>
                 <option value="not_uploaded">Not Uploaded</option>
             </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">S.No</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Student Info</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Year/Sec</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Resume</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Payment</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg, index) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-6 text-xs font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</td>
                            <td className="py-4 px-6">
                                <div className="font-bold text-slate-900">{reg.name}</div>
                                <div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1 rounded mt-1">{reg.rollNumber}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">
                                {reg.year} <br /> <span className="text-xs font-bold text-slate-400">{reg.section}</span>
                            </td>
                            <td className="py-4 px-6 text-sm">
                                {reg.resumeUrl ? (
                                    <a href={reg.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 underline">
                                        📄 View PDF
                                    </a>
                                ) : (
                                    <span className="text-slate-400 text-xs italic">Not Uploaded</span>
                                )}
                            </td>
                            <td className="py-4 px-6">
                                {reg.paymentMode === 'cash' ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">CASH</span>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="text-xs font-mono font-bold text-blue-600">Paid Online</div>
                                        {reg.transactionId && <div className="text-[10px] text-slate-400">ID: {reg.transactionId}</div>}
                                    </div>
                                )}
                            </td>
                            <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => handleEditClick(reg)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                                        ✏️
                                    </button>
                                    {(activeTab === 'pending' || activeTab === 'all') && reg.status !== 'verified' && (
                                            <button onClick={() => handleStatusUpdate(reg.id, 'verified')} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 hover:scale-105 transition-all text-xs font-bold cursor-pointer" title="Verify">
                                                ✅ Accept
                                            </button>
                                    )}
                                    
                                    <button onClick={() => handleDelete(reg.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredRegistrations.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No {activeTab} registrations found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Manual Registration Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Manual Registration</h2>
                    <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer">&times;</button>
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <input required type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} />
                         <input required type="text" placeholder="Roll Number" className="w-full px-4 py-2 border rounded-lg" value={manualData.rollNumber} onChange={e => setManualData({...manualData, rollNumber: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <input required type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={manualData.email} onChange={e => setManualData({...manualData, email: e.target.value})} />
                         <input required type="tel" placeholder="Phone" className="w-full px-4 py-2 border rounded-lg" value={manualData.phoneNumber} onChange={e => setManualData({...manualData, phoneNumber: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <select className="w-full px-4 py-2 border rounded-lg" value={manualData.year} onChange={e => setManualData({...manualData, year: e.target.value})}>
                             <option value="2nd Year">2nd Year</option>
                             <option value="3rd Year">3rd Year</option>
                         </select>
                         <select className="w-full px-4 py-2 border rounded-lg" value={manualData.section} onChange={e => setManualData({...manualData, section: e.target.value})}>
                             <option value="">Select Section</option>
                             {sectionOptions[manualData.year]?.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm font-bold text-center border border-green-100">
                        💰 Admin collected Cash Payment (₹30)
                    </div>
                    <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 cursor-pointer">Register Student</button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Edit Student</h2>
                    <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer">&times;</button>
                </div>
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                            <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Roll Number</label>
                            <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={editingStudent.rollNumber} onChange={e => setEditingStudent({...editingStudent, rollNumber: e.target.value})} />
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                            <input required type="email" className="w-full px-4 py-2 border rounded-lg" value={editingStudent.email} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                            <input required type="tel" className="w-full px-4 py-2 border rounded-lg" value={editingStudent.phoneNumber} onChange={e => setEditingStudent({...editingStudent, phoneNumber: e.target.value})} />
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year</label>
                            <select className="w-full px-4 py-2 border rounded-lg" value={editingStudent.year} onChange={e => setEditingStudent({...editingStudent, year: e.target.value})}>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Section</label>
                            <select className="w-full px-4 py-2 border rounded-lg" value={editingStudent.section} onChange={e => setEditingStudent({...editingStudent, section: e.target.value})}>
                                <option value="">Select Section</option>
                                {sectionOptions[editingStudent.year]?.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 cursor-pointer">Update Student</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
