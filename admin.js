// admin.js
// Protects admin page and manages pendingEdits review.

import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const statusEl = document.getElementById("admin-status");
const pendingList = document.getElementById("pending-edits-list");

if (pendingList) {
  pendingList.classList.add("loading");
}

// NOTE: keep in sync with login.js / header-auth.js
const ADMIN_EMAILS = [
  "admin@example.com",
];

function renderNotAuthorized(msg) {
  statusEl.textContent = msg;
  if (pendingList) {
    pendingList.innerHTML = `
      <li class="future-note">
        You must be signed in as an admin to view pending edits.
      </li>
    `;
  }
}

function renderPendingEdits(snapshot) {
  if (!pendingList) return;

  pendingList.classList.remove("loading");

  if (snapshot.empty) {
    pendingList.innerHTML = `
      <li class="future-note">
        There are currently no pending edits. 🎉
      </li>
    `;
    return;
  }

  pendingList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.className = "pending-edit-item";

    const submitted = data.submittedAt?.toDate
      ? data.submittedAt.toDate().toLocaleString()
      : "Unknown time";

    li.innerHTML = `
      <div class="pending-edit-meta">
        <strong>${data.personName || "(Unknown person)"}</strong>
        <br>
        Submitted by: ${data.submittedBy || "anonymous"}${data.contactEmail ? ` (${data.contactEmail})` : ""}
        <br>
        Status: ${data.status || "pending"} • ${submitted}
      </div>
      <div>
        <strong>Suggestion:</strong>
        <div>${(data.suggestion || "").replace(/\n/g, "<br>")}</div>
      </div>
      <div class="pending-edit-actions">
        <button class="btn-small btn-approve">Approve</button>
        <button class="btn-small btn-reject">Reject</button>
      </div>
    `;

    const approveBtn = li.querySelector(".btn-approve");
    const rejectBtn  = li.querySelector(".btn-reject");

    approveBtn.addEventListener("click", async () => {
      await updateDoc(doc(db, "pendingEdits", docSnap.id), {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewNote: "Approved via admin dashboard"
        // PHASE 2: also apply updates to "people" collection here.
      });
    });

    rejectBtn.addEventListener("click", async () => {
      await updateDoc(doc(db, "pendingEdits", docSnap.id), {
        status: "rejected",
        reviewedAt: serverTimestamp(),
        reviewNote: "Rejected via admin dashboard"
      });
    });

    pendingList.appendChild(li);
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    statusEl.textContent = "Not signed in. Redirecting to login...";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  const email = user.email || "";
  const isAdmin = ADMIN_EMAILS.includes(email);

  if (!isAdmin) {
    renderNotAuthorized(`Signed in as ${email}, but this account is not marked as an admin.`);
    return;
  }

  statusEl.textContent = `Signed in as admin: ${email}`;

  // Live updates from Firestore
  const q = query(
    collection(db, "pendingEdits"),
    orderBy("submittedAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    renderPendingEdits(snapshot);
  });
});
