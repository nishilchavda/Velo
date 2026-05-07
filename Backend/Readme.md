# Velo Backend ⚙️

The core API for the Velo platform, handling authentication, trip coordination, and real-time social interactions.

## 🚀 Key Modules
- **Auth**: JWT-based registration and login.
- **Movements**: Logic for creating and matching travel plans.
- **Community**: Forum-style posts, comments, and community management.
- **Connections**: Handshake-based connection system.
- **Real-time**: Socket.io integration for instant notifications and chat.

## 🛠️ Tech Stack
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **Socket.io**
- **JWT** for security

## 📦 Installation

```bash
npm install
```

## ⚙️ Environment Variables
Create a `.env` file in the root of this folder:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## 🏗️ Running locally
```bash
npm start
```

## 🚢 Deployment (Render)
This backend is ready for deployment on Render.
1. Connect your repository.
2. Set **Root Directory** to `Backend`.
3. Set **Start Command** to `node app.js`.
4. Ensure all environment variables are added to the Render dashboard.

---

## 📋 Requirements Overview (Original URS/BRS)
### User Personas
- **Solo Explorer**: Finding buddies for safety.
- **Planner**: Coordinating group activities.
- **Local Buddy**: Meeting newcomers.

### Core Logic
- **Intersection Algorithm**: Finding overlaps between travelers based on destination and dates.
- **Handshake System**: Mutual acceptance required for private data access.