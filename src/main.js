import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyAjH6JBRtesJH9vLuHzYTxL4iakHVazzgE",
  authDomain: "niche-ef31e.firebaseapp.com",
  projectId: "niche-ef31e",
  storageBucket: "niche-ef31e.firebasestorage.app",
  messagingSenderId: "1026946498550",
  appId: "1:1026946498550:web:061b545a38a47e2d9cd1d7",
  measurementId: "G-VDYZFJFDPJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// 👇 أهم خطوة (عشان HTML يشوفهم)
window.auth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.sendEmailVerification = sendEmailVerification;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.updateProfile = updateProfile;
console.log("Firebase شغال 🔥");