Pioneer Cemetery Project

A Firebase-powered digital cemetery records platform for the Pioneer Cemetery in Rexburg, Idaho.

This project began as a static searchable cemetery website and is being expanded into a scalable web application with user submissions, admin moderation, and future app-ready architecture.

Project Goals

The purpose of this project is to:

Preserve cemetery records digitally
Improve record accuracy over time
Allow family members and community members to submit corrections or historical information
Provide a searchable and visual cemetery experience
Build a maintainable platform future developers can continue expanding
Current Features
Public Website
Search cemetery records by:
Name
Birth date
Death date
Veteran filtering
Interactive cemetery grid map
Responsive UI
Firebase-powered suggestion submission system
Suggest Edit System

Users can submit:

Record corrections
Biography information
Historical notes
Additional context

Suggestions are stored in Firebase Firestore for admin review.

Admin Dashboard

Authenticated admins can:

Review pending submissions
Approve edits
Reject edits
Moderate incoming changes
Tech Stack
Frontend
HTML5
CSS3
Vanilla JavaScript
Backend / Cloud Services
Firebase Authentication
Firebase Firestore
Firebase Hosting
Data
CSV cemetery record source files
Firestore collections for live application data
Repository Structure
pioneer-cemetery-project/
│
├── data/
│   ├── cemetery_data.csv
│   └── cemetery_data_fixed.csv
│
├── index.html
├── records.html
├── map.html
├── admin.html
├── login.html
│
├── app.js
├── map.js
├── admin.js
├── login.js
├── suggest.js
├── header-auth.js
├── firebase-init.js
│
├── style.css
│
├── PHASE2_NOTES.md
└── README.md
Firebase Collections
people

Main cemetery records collection.

Example structure:

{
  "name": "Saxton, Leslie Leroy",
  "birth": "1917-07-03",
  "death": "1935-10-25",
  "gridCode": "H5",
  "bio": "Short biography",
  "veteran": true
}
pendingEdits

Stores visitor-submitted corrections awaiting review.

Example structure:

{
  "person": "Saxton, Leslie Leroy",
  "proposedChanges": {
    "bio": "Updated biography"
  },
  "status": "pending",
  "submittedAt": "timestamp"
}
users

Stores user role information.

Example structure:

{
  "email": "admin@example.com",
  "role": "admin"
}
Local Development Setup
1. Clone Repository
git clone https://github.com/Kolten-B/pioneer-cemetery-project.git
2. Open in VS Code
code .
3. Run Local Server

Recommended:

VS Code Live Server extension

Default local address:

http://127.0.0.1:5501
Firebase Setup
1. Create Firebase Project

Go to:

https://console.firebase.google.com/

2. Enable Services

Enable:

Authentication
Firestore Database
Hosting
3. Configure Authentication

Enable:

Email/Password sign-in

Create admin account through Firebase Authentication.

4. Update firebase-init.js

Replace Firebase config with your own Firebase project credentials.

Deployment
Firebase Hosting

Install Firebase CLI:

npm install -g firebase-tools

Login:

firebase login

Initialize hosting:

firebase init

Deploy:

firebase deploy
Current Development Status
Completed
Static searchable records website
Cemetery map page
Firebase integration
Suggest Edit workflow
Admin moderation system
Authentication system
Firestore backend architecture
In Progress
Firestore migration for all cemetery records
Improved admin workflow
UI polishing
Better person matching system
Future Plans
React frontend migration
Mobile app support
Photo uploads
QR code grave links
Advanced map system
Genealogy integration
Public memorial pages
Handoff Notes

This project is intentionally designed so future developers can continue building it without needing the original creator.

Key priorities:

Maintain simple deployment
Keep Firebase collections documented
Avoid hardcoded credentials
Document major architectural changes
Preserve compatibility with future React migration
Contributors
Original Project

Katesy Shepard

Current Maintainer

Kolten Brown

License

This project is intended for educational and community preservation purposes.

Further licensing terms may be added in future versions.

Contact

For project continuation, maintenance, or future development inquiries, contact the current project maintainer through GitHub.

I created a professional README for the project that covers:

Project overview
Features
Firebase architecture
Repository structure
Setup instructions
Deployment steps
Firestore collections
Future roadmap
Handoff documentation notes
