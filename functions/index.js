const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

function userRef(uid) {
  return db.collection("users").doc(uid);
}

exports.onOrderCreateAddLoyalty = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    const uid = data.userId;
    if (!uid) return null;

    try {
      await userRef(uid).set(
        {
          loyaltyPoints: admin.firestore.FieldValue.increment(50),
          loyaltyUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("onOrderCreateAddLoyalty:", e);
    }

    return null;
  });

exports.onOrderCancelSubtractLoyalty = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};

    const uid = after.userId;
    if (!uid) return null;

    // Only when status transitions to cancelled (once).
    if (before.status === "cancelled" || after.status !== "cancelled") return null;

    try {
      await userRef(uid).set(
        {
          loyaltyPoints: admin.firestore.FieldValue.increment(-50),
          loyaltyUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("onOrderCancelSubtractLoyalty:", e);
    }

    return null;
  });

