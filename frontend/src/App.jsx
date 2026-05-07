import { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import LoginSignup from "./Pages/Auth/LoginSignup";
import Movement from "./Pages/Movement";
import Profile from "./Pages/Profile";
import Chat from "./Pages/Chat";
import Notifications from "./Pages/Notifications";
import Community from "./Pages/Community";
import CommunityDetail from "./Pages/CommunityDetail";

import { AuthProvider } from "./Context/AuthProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [hideMobileNav, setHideMobileNav] = useState(false);

  // Dynamic Tab Title Effect
  useEffect(() => {
    const originalTitle = "Welcome back to Velo!";
    const outOfFocusTitle = "Hey, don't forget Velo!";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = outOfFocusTitle;
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);


  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col md:flex-row min-h-screen bg-white">
          <Sidebar 
            isExpanded={isSidebarExpanded} 
            setIsExpanded={setIsSidebarExpanded} 
            hideMobileNav={hideMobileNav}
          />
          <main className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login-signup" element={<LoginSignup />} />
              <Route path="/movements" element={<Movement />} />
              <Route path="/explore" element={<Navigate to="/movements" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:userId" element={<Profile />} />
              <Route path="/chat" element={<Chat setHideMobileNav={setHideMobileNav} />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:communityId" element={<CommunityDetail />} />
            </Routes>
          </main>
        </div>
        <ToastContainer position="bottom-right" theme="dark" hideProgressBar />
      </Router>
    </AuthProvider>
  );
};

export default App;
