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
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  increment,
  runTransaction,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
const db = getFirestore(app);
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.serverTimestamp = serverTimestamp;
window.collection = collection;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.limit = limit;
window.getDocs = getDocs;
window.updateDoc = updateDoc;
window.increment = increment;
window.runTransaction = runTransaction;
window.onSnapshot = onSnapshot;

// 👇 أهم خطوة (عشان HTML يشوفهم)
window.auth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.sendEmailVerification = sendEmailVerification;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.updateProfile = updateProfile;
window.updatePassword = updatePassword;
window.EmailAuthProvider = EmailAuthProvider;
window.reauthenticateWithCredential = reauthenticateWithCredential;
console.log("Firebase شغال 🔥");

// =========================
// Loyalty + Orders (frontend)
// =========================

function userRef(uid) {
  return doc(db, "users", uid);
}

function orderRefAutoId() {
  return doc(collection(db, "orders"));
}

async function updateLoyaltyPoints(uid, delta) {
  if (!uid) throw new Error("Missing uid");
  await updateDoc(userRef(uid), {
    loyaltyPoints: increment(delta),
  });
}

// Creates order ONLY (no points on create).
async function createOrder(uid, orderData) {
  if (!uid) throw new Error("Missing uid");
  if (!orderData || typeof orderData !== "object") throw new Error("Missing orderData");

  const ref = orderRefAutoId();

  await setDoc(ref, {
    ...orderData,
    userId: uid,
    status: orderData.status || "pending",
    createdAt: orderData.createdAt || serverTimestamp(),
    loyaltyDeliveredApplied: false
  });

  return ref.id;
}

// Cancels order ONLY (no points on cancel, since points are awarded on delivery only).
async function cancelOrder(uid, orderId) {
  if (!uid) throw new Error("Missing uid");
  if (!orderId) throw new Error("Missing orderId");

  const ref = doc(db, "orders", orderId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Order not found");
    const data = snap.data() || {};
    if (data.userId !== uid) throw new Error("Not your order");

    // If already cancelled, do nothing (no double-deduct)
    if (data.status === "cancelled") return;

    // cancel
    tx.update(ref, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
    });
  });
}

// Awards +50 points exactly once when order is completed (set by you in Firebase).
// Idempotency: uses `loyaltyDeliveredApplied` flag inside the order doc.
async function applyDeliveryPointsOnce(uid, orderId) {
  if (!uid) throw new Error("Missing uid");
  if (!orderId) throw new Error("Missing orderId");

  const ref = doc(db, "orders", orderId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data() || {};
    if (data.userId !== uid) return;
    if (data.status !== "completed") return;
    if (data.loyaltyDeliveredApplied === true) return;

    tx.update(ref, {
      loyaltyDeliveredApplied: true,
      loyaltyDeliveredAt: serverTimestamp(),
      loyaltyDeliveredDelta: 50,
    });

    tx.set(
      userRef(uid),
      {
        loyaltyPoints: increment(50),
        loyaltyUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

// expose to HTML
window.updateLoyaltyPoints = updateLoyaltyPoints;
window.createOrder = createOrder;
window.cancelOrder = cancelOrder;
window.applyDeliveryPointsOnce = applyDeliveryPointsOnce;