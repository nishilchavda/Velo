# Velo | Find your crew. Share the journey. 🌍

Velo is a premium travel social platform designed for solo explorers and group travelers to find companions, join "Movements" (trips), and stay connected through real-time chat.

![Velo Logo](frontend/public/logo.png) <!-- Replace with actual path if different -->

## 🚀 Project Overview

Velo bridges the gap between planning a trip and finding the right people to share it with. Whether you're looking for a buddy for safety or a group to hike with, Velo helps you sync with like-minded travelers.

### Key Features
- **Unified Movements**: A consolidated view of global "Explore" trips and your personal "Mine" journeys.
- **Smart Discovery**: Filter and find travelers based on destination and vibe.
- **Real-time Sync**: Instant messaging and community chats powered by Socket.io.
- **Premium UI**: Fluid animations using Framer Motion and GSAP with a modern "Liquid Glass" aesthetic.
- **Connection System**: Secure "Sync Requests" to unlock private chats with fellow travelers.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS + Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **Real-time**: Socket.io-client
- **Icons**: Lucide React

### Backend
- **Environment**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io

---

## 📂 Project Structure

```bash
Velo/
├── frontend/        # React + Vite application (Deployed on Vercel)
└── Backend/         # Node.js + Express API (Deployed on Render)
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Velo.git
cd Velo
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` folder:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Run the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:3001
```
Run the development server:
```bash
npm run dev
```

---

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add Environment Variable: `VITE_API_URL` (pointing to your deployed backend).
4. Deploy!

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `Backend`.
4. Build Command: `npm install`
5. Start Command: `node app.js` (or your main entry point).
6. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, etc.
7. Deploy!

---

## 📄 License
This project is for demonstration purposes. All rights reserved.
