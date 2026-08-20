# 🎓 EduPro LMS (Learning Management System)

A modern, full-stack Learning Management System and Affiliate Platform built with the MERN stack (MongoDB, Express.js, React, Node.js). 

EduPro LMS is designed to manage online courses, track student progress, handle multi-level affiliate commissions, process secure payouts, and ensure platform integrity through KYC verification and fraud detection.

![EduPro LMS](https://img.shields.io/badge/Status-Active-success.svg) ![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg) ![React](https://img.shields.io/badge/React-18.x-61dafb.svg)

---

## 🚀 Key Features

### 👨‍🎓 User Features
* **Course Library & Video Player:** Browse published courses, enroll, and track watch progress.
* **Affiliate & Referral System:** Generate unique referral links and earn multi-level commissions (Level 1 & Level 2).
* **Wallet & Payouts:** Track earnings in real-time, view transaction history, and request payouts directly to Bank or UPI.
* **KYC Verification:** Secure document upload (Aadhar/PAN) for identity verification before enabling payouts.
* **Profile Management:** Manage personal details, passwords, and active sessions.

### 🛡️ Admin Features
* **Comprehensive Dashboard:** Real-time analytics on revenue, users, pending KYC, and active alerts.
* **Course Management:** Create courses, set pricing, upload videos, and configure custom commission tiers per package.
* **User & Session Management:** View user details, block/unblock accounts, and revoke unauthorized active sessions.
* **KYC Processing:** Review user uploaded documents and approve or reject verification requests.
* **Payout Processing:** Review payout requests, bulk approve transactions, and export data as CSV.
* **Fraud Detection System:** Automatic alerts for suspicious activities, multiple accounts from same IP, or rapid payout requests.

---

## 🛠️ Technology Stack

**Frontend (Client):**
* React.js (Vite)
* Tailwind CSS (Styling)
* Zustand (State Management)
* TanStack React Query (Data Fetching & Caching)
* React Router v6 (Navigation)
* Lucide React (Icons)

**Backend (Server):**
* Node.js & Express.js
* MongoDB with Mongoose
* JSON Web Tokens (JWT) for Authentication
* Multer (Handling File/Video Uploads)
* Bcryptjs (Password Hashing)

---

## 📂 Project Structure

```text
EduPro-LMS/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Admin & User)
│   │   ├── routes/         # Protected and Admin routing logic
│   │   ├── services/       # API call wrappers (axios)
│   │   ├── store/          # Zustand global state
│   │   └── utils/          # Helper functions
│   └── vite.config.js
│
└── server/                 # Node.js Backend
    ├── src/
    │   ├── config/         # DB connection & multer setup
    │   ├── controllers/    # API Request handlers
    │   ├── middleware/     # Auth, Admin, and Fraud middlewares
    │   ├── models/         # Mongoose schemas (User, Package, Progress, etc.)
    │   ├── routes/         # Express API routes
    │   └── utils/          # Helpers (Email, CSV export, etc.)
    └── server.js           # Entry point
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/someshcoder/EduPro-LMS.git
cd EduPro-LMS
```

### 2. Setup Backend (Server)
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Add other required environment variables (e.g., SMTP settings for email)
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend (Client)
```bash
# Open a new terminal window
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🛡️ Security Measures
* **Protected Routes:** React Router wrappers to prevent unauthorized access to user/admin panels.
* **Token Expiration & Revocation:** JWT based authentication with session tracking and remote revocation.
* **Input Validation:** Backend validation on all incoming API requests.
* **Secure Uploads:** Multer configurations restricting file types and sizes.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/someshcoder/EduPro-LMS/issues).

## 📝 License
This project is [MIT](LICENSE) licensed.
