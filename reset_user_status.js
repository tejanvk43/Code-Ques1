
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDWiE3irAvXzDTGH77StY6_WxaXgCW8z3c",
    authDomain: "interviews-e177f.firebaseapp.com",
    projectId: "interviews-e177f",
    storageBucket: "interviews-e177f.firebasestorage.app",
    messagingSenderId: "528485388968",
    appId: "1:528485388968:web:2f53e04ec3950db225e89d",
    measurementId: "G-ZVR2Y99GLZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = "weF1V70HrSUQo9S9bntQ"; // ID from logs

async function resetUser() {
    try {
        console.log(`Resetting status for user ${userId}...`);
        await updateDoc(doc(db, 'registrations', userId), {
            resumeStatus: 'Rejected', // Set to Rejected to clear the spinner
            resumeAIReason: 'System Reset: Please upload again.',
            processingStartedAt: null
        });
        console.log("User status reset successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error resetting user:", error);
        process.exit(1);
    }
}

resetUser();
