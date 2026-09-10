# Vault Breaker — MERN Cybersecurity Escape Room

Vault Breaker is a gamified cybersecurity awareness escape room built strictly on the **MERN Stack** (MongoDB, Express, React, Node.js).

---

## 📁 Project Structure

```
Digital Escape Room/
├── backend/
│   ├── index.js             # Express API, MongoDB connection & Auth routes
│   ├── package.json         # Express, Mongoose, bcryptjs, jsonwebtoken, cors
│   └── package-lock.json
│
├── frontend/
│   ├── index.html           # Main HTML entry
│   ├── vite.config.js       # Vite configuration with React & API proxy
│   ├── package.json         # React 18, Vite
│   └── src/
│       ├── main.jsx         # Game state machine, detective narrative, audio triggers
│       ├── style.css        # Cyber aesthetic, swipe deck, glitch effects
│       ├── components/      # UI components (Companion, Navbar, Modals, SwipeDeck, etc.)
│       ├── context/         # AuthContext (JWT session management)
│       ├── data/            # Curated case files & forensic tells
│       └── utils/           # Procedural Web Audio API sound synthesizer
│
├── package.json             # Root workspace runner (runs backend & frontend concurrently)
└── README.md
```

---

## 🚀 Running the Project

### 1. Run Both (Frontend + Backend) Concurrently from Root:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### 2. Or Run Separately:

#### Backend:
```bash
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
