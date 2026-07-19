// login.js
// Real Firebase Email/Password login for Admin & Users.

import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const form        = document.getElementById("login-form");
const emailInput  = document.getElementById("login-email");
const passwordInp = document.getElementById("login-password");
const message     = document.getElementById("login-message");


const ADMIN_EMAILS = [
  "admin@example.com",
];

if (form) {
  // Handle login submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Signing in...";

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        emailInput.value,
        passwordInp.value
      );

      const email = userCred.user.email || "";
      const isAdmin = ADMIN_EMAILS.includes(email);

      if (isAdmin) {
        message.textContent = `Signed in as admin: ${email}`;
        window.location.href = "admin.html";
      } else {
        message.textContent = `Signed in as user: ${email}`;
        // You *could* redirect normal users if you want:
        // window.location.href = "index.html";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "Login failed. Please check your email and password.";
    }
  });

  // React if already signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      message.textContent = `Already signed in as ${user.email}`;
    }
  });
}
