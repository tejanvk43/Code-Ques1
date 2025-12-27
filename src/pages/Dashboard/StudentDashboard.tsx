import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, increment, onSnapshot } from 'firebase/firestore'; 
import { db, storage } from '../../firebase';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const StudentDashboard: React.FC = () => {
  const { currentUser, logout, login } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(currentUser?.resumeUrl || null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(currentUser?.resumeStatus || null);
  const [uploadAttempts, setUploadAttempts] = useState(0);

  // Sync currentUser with Firebase on mount
  // Real-time listener for updates
  useEffect(() => {
    if (currentUser?.id) {
       const unsubscribe = onSnapshot(doc(db, 'registrations', currentUser.id), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.resumeUrl) setResumeUrl(data.resumeUrl);
                if (data.resumeAttempts) setUploadAttempts(data.resumeAttempts);
                if (data.resumeStatus) setResumeStatus(data.resumeStatus);
                
                // Handle async status updates
                if (data.resumeStatus === 'Accepted') {
                     setValidating(false);
                     if (uploading) {
                         alert("Resume Verified & Accepted!");
                         setUploading(false);
                     }
                } else if (data.resumeStatus === 'Rejected') {
                    setValidating(false);
                    setResumeUrl(null); // Clear URL to show upload form
                    if (uploading) {
                        alert(`Resume Rejected: ${data.lastRejectionReason || data.resumeAIReason}`);
                        setUploading(false);
                    }
                } else if (data.resumeStatus === 'Processing') {
                    setValidating(true);
                    setUploading(true);
                }
            }
       });
       return () => unsubscribe();
    }
  }, [currentUser, uploading]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      if (selected.type !== 'application/pdf') {
        alert("Please upload a PDF file only.");
        return;
      }
      
      if (selected.size > 5 * 1024 * 1024) { // 5MB
        alert("File size must be less than 5MB.");
        return;
      }

      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser || !currentUser.id) return;
    
    if (uploadAttempts >= 3) {
        alert("Maximum upload attempts reached. Access Restricted.");
        return;
    }

    setUploading(true);
    setValidating(true); // Show "Analyzing/Processing" UI

    try {
        // 1. Upload to Firebase Storage
        const storageRef = ref(storage, `resumes/${currentUser.rollNumber}_${Date.now()}.pdf`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        // 2. Set Status to Processing in Database
        await updateDoc(doc(db, 'registrations', currentUser.id), {
            resumeUrl: url,
            resumeStatus: 'Processing',
            processingStartedAt: new Date().toISOString()
        });

        // 3. Queue Validation Job on Backend
        const apiUrl = (import.meta.env.VITE_API_URL || '') + '/api/queue-validation';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: currentUser.id, 
                resumeUrl: url 
            })
        });
        
        if (!response.ok) throw new Error("Failed to queue validation");

        // UI stays in "Uploading/Analyzing" state until listener picks up the change

    } catch (error: any) {
        console.error("Upload Error:", error);
        alert(`Error: ${error.message}`);
        setUploading(false);
        setValidating(false);
    }
  };

  if (!currentUser) return <div className="p-10 text-slate-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Override for Logged In User */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
             <img src="/assets/college_logo.png" alt="Logo" className="h-14 w-auto" />
           </div>
           
           <div className="flex items-center gap-6">
               <span className="hidden md:block text-sm font-bold text-slate-500 uppercase tracking-wide">
                   Student Portal • <span className="text-blue-600">{currentUser.name}</span>
               </span>
               <button 
                onClick={handleLogout} 
                className="px-5 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-lg transition-all cursor-pointer border border-red-100"
               >
                   Logout
               </button>
           </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {resumeStatus !== 'Accepted' ? (
          // UPLOAD RESUME STATE
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 border border-slate-200 shadow-xl text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.771.08-1.177.313-.615.895-.89 1.519-.932.356-.024.745.099 1.077.332.203.142.294.346.294.63 0 .285-.09.488-.282.63-.335.253-.734.348-1.07.305-.153-.019-.306-.056-.445-.102l.165-.366c.228.093.447.163.642.163.228 0 .424-.093.522-.246.046-.073.076-.17.076-.285 0-.106-.026-.199-.071-.271-.097-.15-.316-.219-.572-.219-.17 0-.342.062-.516.185L5.3 13.97l-.697.117z"/></svg>
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-3">Upload Your Resume</h2>
             <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                 AI Validation Enabled. Ensure you upload a valid Resume/CV.
                 <br/><span className="text-red-500 font-bold text-sm">Attempts Remaining: {3 - uploadAttempts}</span>
             </p>
             
             {uploadAttempts >= 3 ? (
                 <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold">
                     🚫 Upload Blocked. Maximum attempts exceeded.
                 </div>
             ) : (
                 <div className="flex flex-col items-center gap-6">
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-bold
                        file:bg-blue-50 file:text-blue-700
                        file:cursor-pointer hover:file:bg-blue-100
                        file:transition-colors
                        "
                    />
                    {file && (
                        <button 
                            onClick={handleUpload} 
                            disabled={uploading}
                            className="mt-2 px-10 py-4 bg-blue-900 hover:bg-blue-800 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto cursor-pointer flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    {validating ? 'Analyzing Text...' : 'Uploading...'}
                                </>
                            ) : (
                                'Submit Resume'
                            )}
                        </button>
                    )}
                 </div>
             )}
          </div>
        ) : (
          // PROFILE & PREVIEW STATE
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Profile Card */}
              <div className="md:col-span-4 lg:col-span-3">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-lg shadow-blue-900/20">
                          {currentUser.name.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">{currentUser.name}</h2>
                      <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 mb-6 font-mono">
                          {currentUser.rollNumber}
                      </div>
                      
                      <div className="space-y-4 text-sm">
                          <div className="pb-3 border-b border-slate-50">
                              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</span>
                              <span className="font-medium text-slate-700">{currentUser.email}</span>
                          </div>
                          <div className="pb-3 border-b border-slate-50">
                              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</span>
                              <span className="font-medium text-slate-700">{currentUser.phoneNumber}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Year</span>
                                  <span className="font-medium text-slate-700">{currentUser.year}</span>
                              </div>
                              <div>
                                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Section</span>
                                  <span className="font-medium text-slate-700">{currentUser.section}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold text-center border border-green-100">
                          ✅ Resume Verified & Accepted
                      </div>
                  </div>
              </div>

              {/* Resume Preview */}
              <div className="md:col-span-8 lg:col-span-9">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[80vh]">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center px-6">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-red-500" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>
                              Resume Preview
                          </h3>
                          <a href={resumeUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-bold cursor-pointer flex items-center gap-1">
                              Open in New Tab 
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
                          </a>
                      </div>
                      <iframe src={resumeUrl || undefined} className="w-full flex-grow bg-slate-100" title="Resume Preview"></iframe>
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
