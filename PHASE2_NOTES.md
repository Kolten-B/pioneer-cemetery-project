# Phase 2 Plan – Pioneer Cemetery Project

This file is for future collaborators so you know how to upgrade
this site without having to reverse-engineer everything!

---

## Current State (Phase 1 – no backend, free hosting)

- Static site hosted on GitHub Pages.
- Data is stored in CSV files in `/data`:
  - `cemetery_data.csv` – raw-ish export from the city spreadsheet.
  - `cemetery_data_fixed.csv` – CSV where each person has a `Grid_y` like `H5`
    so we can show them on the map grid.
- Frontend is plain:
  - HTML: `index.html`, `records.html`, `map.html`
  - CSS: `style.css`
  - JS: `app.js` (records), `map.js` (grid “map”)
  - No login, no user accounts, no direct edits to the data.

This is *deliberately* “static-only” because it’s free and super easy to deploy.

---

## Phase 2 Goal

Add:

1. User accounts (family members can log in).
2. Ability to submit:
   - More accurate dates
   - Short biographies
   - Photos of headstones / people
3. An **admin review queue** so changes are moderated before going live.
4. Eventually: a more precise visual map (not just a grid).

We want all of this without breaking the simplicity and safety of the current site.

---

## Phase 2 – Likely Tech Stack

**Backend / DB:**
- Free tier of Firebase:
  - Authentication: Google sign-in or email/password.
  - Firestore: collection like `people` and `pendingEdits`.

**How data would flow:**

- `people` collection:
  ```jsonc
  {
    "name": "Saxton, Leslie Leroy",
    "birth": "1917-07-03",        // normalized ISO date if possible
    "death": "1935-10-25",
    "gridCode": "H5",             // like Grid_y
    "ward": "1",
    "block": "1",
    "lot": "3",
    "plot": "2",
    "veteran": true,
    "bio": "Short biography text...",
    "photos": ["https://..."],    // URLs to storage
    "source": "city-csv"          // or "user-submitted"
  }




## Phase 2 Ideas
{
  "personId": "<reference to people doc or city-id>",
  "proposedChanges": {
    "bio": "New biography text...",
    "birth": "1917-07-03",
    "photos": ["..."]
  },
  "submittedByUid": "<firebase user id>",
  "submittedAt": "<timestamp>",
  "status": "pending" // or "approved" / "rejected"
}


**Admin flow idea:**

Only admin accounts (or a special role/claim) can:
- View all pendingEdits.
- Approve or reject them.

When approved, a Cloud Function (or admin-only frontend tool) copies changes
from pendingEdits.proposedChanges into the main people document.