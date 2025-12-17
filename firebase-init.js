// firebase-init.js
// PHASE 2: Firebase / Firestore + Auth integration skeleton.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyC83hhuawQPThYc4tLIrApMmneebZFSYmA",
  authDomain: "pioneer-cemetery.firebaseapp.com",
  projectId: "pioneer-cemetery",
  storageBucket: "pioneer-cemetery.firebasestorage.app",
  messagingSenderId: "383254113294",
  appId: "1:383254113294:web:929df43f13eb8463fda05f"
};

// Init app + Firestore
export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// NOTE:
// - db will be used for "pendingEdits" collection (Phase 2).
// - auth is used for login + admin-only access.