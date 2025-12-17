// header-auth.js
// Keeps the header's top-right area in sync with Firebase Auth state.

import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Keep this in sync with login.js
const ADMIN_EMAILS = [
  "admin@example.com",
];

function renderLoggedOut(headerRight) {
  headerRight.innerHTML = `
    <a href="login.html" class="login-link">Admin Login</a>
  `;
}

function renderLoggedIn(headerRight, email) {
  const isAdmin = ADMIN_EMAILS.includes(email);

  headerRight.innerHTML = `
    <div class="user-menu">
      <button id="user-menu-toggle" class="login-link user-menu-toggle">
        ${email}
      </button>
      <div class="user-menu-dropdown" id="user-menu-dropdown">
        ${isAdmin ? `<a href="admin.html" class="user-menu-item">Admin dashboard</a>` : ""}
        <button id="user-menu-signout" class="user-menu-item user-menu-signout">
          Sign out
        </button>
      </div>
    </div>
  `;

  const toggle   = document.getElementById("user-menu-toggle");
  const dropdown = document.getElementById("user-menu-dropdown");
  const signout  = document.getElementById("user-menu-signout");

  if (toggle && dropdown) {
    toggle.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== toggle) {
        dropdown.classList.remove("open");
      }
    });
  }

  if (signout) {
    signout.addEventListener("click", async () => {
      await signOut(auth);
      dropdown.classList.remove("open");
      // Back to home after logout
      window.location.href = "index.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const headerRight = document.getElementById("header-right");
  if (!headerRight) return;

  // Default
  renderLoggedOut(headerRight);

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      renderLoggedOut(headerRight);
    } else {
      const email = user.email || "Signed in";
      renderLoggedIn(headerRight, email);
    }
  });
});
