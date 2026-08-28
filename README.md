# 🚨 APADHA SEVA (ఆపద సేవ)
> **Emergency Healthcare, Ambulance Booking & Live Tracking Platform**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

**APADHA SEVA** is a modern emergency services platform designed to provide rapid medical assistance, instant ambulance booking, real-time vehicle tracking, and essential first-aid guidelines during critical emergency situations.

Built with performance, accessibility, and emergency responsiveness in mind, **APADHA SEVA** bridges the gap between emergency victims, hospitals, and ambulance services.

---

## ✨ Key Features

- 🚑 **Instant Ambulance Booking:** Request nearest emergency transport with one click.
- 📍 **Real-Time Live Tracking:** Track ambulance route and estimated time of arrival (ETA) in real-time.
- 🩹 **Interactive First Aid Assistance:** Quick step-by-step guidance for emergency situations (CPR, Burns, Fractures, Stay Calm procedures).
- 🔐 **User & Emergency Contact Profiles:** Store medical records, emergency contacts, and blood group details for fast access by first responders.
- 📜 **Emergency Incident History:** View past bookings, ride details, and emergency logs.
- ⚡ **Firebase Authentication & Database:** Secure authentication and real-time state management.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 6 |
| **Styling** | Custom Responsive CSS3, Smooth Scroll, Modern UI/UX |
| **Backend & Auth** | Firebase Auth & Firestore DB |
| **Icons & Assets** | Custom SVG graphics & Emergency guides |
| **Build Tooling** | Vite, ESBuild |

---

## 📂 Project Structure

```text
APADHA-SEVA/
├── apadhaseva-react/       # Main React + Vite Application
│   ├── public/             # Static emergency icons and assets
│   └── src/
│       ├── assets/         # App graphics & visual assets
│       ├── components/     # UI Components (Header, Footer, SmoothScroll)
│       ├── context/        # Auth Context & State Management
│       ├── pages/          # Booking, Tracking, FirstAid, Dashboard, Profile
│       ├── firebase.js     # Firebase Configuration & Services
│       ├── App.jsx         # App routes & structure
│       └── main.jsx        # Entry point
├── *.html                  # Legacy HTML versions
└── README.md               # Project documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/shrinikeathreddy/APADHA-SEVA.git
cd APADHA-SEVA/apadhaseva-react
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [Issues page](https://github.com/shrinikeathreddy/APADHA-SEVA/issues).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
