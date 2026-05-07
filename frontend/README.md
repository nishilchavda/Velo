# Velo Frontend 🎨

The frontend of the Velo platform, built with React and Vite. Designed with a premium "Liquid Glass" aesthetic and smooth animations.

## 🚀 Features
- **Modern Navigation**: Sliding sidebar and responsive mobile layout.
- **Interactive Toggles**: Premium Framer Motion toggles for switching views (Explore/Mine, Personal/Community).
- **Real-time Chat**: Fully integrated chat interface with Socket.io.
- **Dynamic Content**: Masonry grids and animated feed items.

## 🛠️ Tech Stack
- **React.js** (Vite)
- **Framer Motion** (Layout animations)
- **GSAP** (Hero animations)
- **Tailwind CSS** (Utility styling)
- **Lucide React** (Iconography)

## 📦 Installation

```bash
npm install
```

## ⚙️ Environment Variables
Create a `.env` file in the root of this folder:
```env
VITE_API_URL=your_backend_url
```

## 🏗️ Build & Deployment
### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Vercel Deployment
This project is optimized for Vercel. Ensure your root directory is set to `frontend` and your environment variables are configured in the Vercel dashboard.
