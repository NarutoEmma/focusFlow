# 🎯 FocusFlow — AI-Powered Mobile Learning Companion

A cross-platform mobile application designed to help students manage focus, reduce exam anxiety, and stay on top of their studies — powered by an adaptive AI assistant and real-time cloud sync.

Built with React Native (Expo), TypeScript, Firebase Firestore, and Groq (LLaMA) for AI-driven interaction.

---

## 💡 Motivation

Students often struggle not just with the content they're studying, but with *how* they study — poor time management, mounting anxiety, and no clear picture of their own progress. FocusFlow brings together AI assistance, progress tracking, and hands-free interaction into a single mobile experience built around how students actually work.

---

## ✨ Features

- 🤖 **AI-powered study assistant** — intelligent responses that adapt to the user's input, handling incomplete or noisy messages gracefully
- 🎙️ **Hands-free interaction** — speech-to-text input and text-to-speech output for eyes-free study sessions
- 📊 **Progress visualisation** — track assessments, scores, and improvement over time
- ⏰ **Study reminders** — personalised reminders to keep users on schedule
- ☁️ **Real-time cloud sync** — data stored and synced via Firebase Firestore
- 📱 **Cross-platform** — runs on both iOS and Android via Expo

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo), TypeScript |
| Backend API | FastAPI / Node.js (deployed on Render) |
| Database | Firebase Firestore |
| AI Model | Groq API (LLaMA) |
| Version Control | Git, GitHub |

> 🔗 Backend repository: [FocusFlow_Server](https://github.com/NarutoEmma/FocusFlow_Server)

---

## 🚀 Getting Started

### Prerequisites

- Node.js & Expo CLI
- A Firebase project with Firestore enabled
- Backend server running (see [FocusFlow_Server](https://github.com/NarutoEmma/FocusFlow_Server))

---

### 1. Clone the repository

```bash
git clone https://github.com/NarutoEmma/focusFlow.git
cd focusFlow
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
BACKEND_URL=https://your-render-deployment.onrender.com
```

---

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or run on an emulator.

---

## 📁 Project Structure

```
focusFlow/
├── app/                  # React Native screens
├── components/           # Reusable UI components
├── services/             # API calls and Firebase logic
├── hooks/                # Custom React hooks
├── assets/               # Images and fonts
└── README.md
```

---

## 🔗 Related

- **Backend:** [FocusFlow_Server](https://github.com/NarutoEmma/FocusFlow_Server) — FastAPI/Node.js backend deployed on Render

---

## 🔮 Future Work

- [ ] Spaced repetition flashcard system
- [ ] Group study rooms with shared progress
- [ ] Offline mode with local caching

---

## 👤 Author

**Igwegbe Emmanuel**
- GitHub: [@NarutoEmma](https://github.com/NarutoEmma)
- LinkedIn: [emmanuel-igwegbe](https://www.linkedin.com/in/emmanuel-igwegbe-22b837347/)
- Email: captainemm45@gmail.com

---

## 📄 Licence

This project is for academic and portfolio purposes. Contact the author for any other use.
