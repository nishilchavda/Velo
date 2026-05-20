import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Route,
  MessageSquare,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  Settings,
  // MenuIcon,
  HomeIcon,
  MessageCircle,
  // X,
  LogIn,
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import api from "../api";
import { io } from "socket.io-client";
import GlassSurface from "./ui/GlassSurface";
import { toast } from "react-toastify";

const Sidebar = ({ isExpanded, setIsExpanded, hideMobileNav }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef(null);
  const profileDropdownRef = useRef(null);
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notification/unread-count");
        setUnreadCount(response.data?.count || 0);
      } catch (err) {
        console.error("Error fetching notification count:", err);
      }
    };
    fetchUnreadCount();

    const socketURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const socket = io(socketURL);
    socket.emit("join_user", user._id);

    socket.on("new_notification", (notif) => {
      setUnreadCount((prev) => prev + 1);
      toast.info(`${notif.senderId?.username} sent a notification`, {
        icon: <Bell className="text-brand" size={18} />,
        onClick: () => navigate("/notifications"),
      });
    });

    const interval = setInterval(fetchUnreadCount, 60000); // Check fallback every min
    return () => {
      clearInterval(interval);
      socket.close();
    };
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event) => {
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={24} />, requiresAuth: false },
    {
      name: "Movements",
      path: "/movements",
      icon: <Route size={24} />,
      requiresAuth: false,
    },
    {
      name: "Messages",
      path: "/chat",
      icon: <MessageSquare size={24} />,
      requiresAuth: true,
    },
    {
      name: "Community",
      path: "/community",
      icon: <HiOutlineUserGroup size={26} strokeWidth={1.7} />,
      requiresAuth: true,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: (
        <div className="relative">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
      requiresAuth: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserIcon size={24} />,
      requiresAuth: true,
    },
    {
      name: "Log In",
      path: "/login-signup",
      icon: <LogIn size={24} />,
      requiresAuth: false,
      guestOnly: true,
    },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (link.requiresAuth && !user) return false;
    if (link.guestOnly && user) return false;
    return true;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen border-r border-gray-100 bg-white z-50 p-4 transition-all duration-300 ease-in-out ${isExpanded ? "w-64" : "w-20"}`}
      >
        {/* Logo Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mb-10 mt-2 hover:opacity-80 transition-opacity outline-none"
        >
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="logo" />
          </div>
          <span
            className={`text-2xl font-display font-extrabold tracking-tighter text-gray-900 transition-all duration-300 origin-left ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0 overflow-hidden"}`}
          >
            Velo
          </span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                location.pathname === link.path
                  ? "bg-orange-50 text-brand"
                  : "text-gray-500 hover:bg-orange-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${location.pathname === link.path ? "text-brand" : ""}`}
              >
                {link.icon}
              </span>
              <span
                className={`font-semibold transition-all duration-300 origin-left whitespace-nowrap ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0 overflow-hidden"} ${location.pathname === link.path ? "font-bold" : ""}`}
              >
                {link.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            ref={profileButtonRef}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 relative"
          >
            <Menu size={24} className="shrink-0" />
            <span
              className={`font-semibold transition-all duration-300 origin-left ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0 overflow-hidden"}`}
            >
              More
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                ref={profileDropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute bottom-20 left-4 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden ${isExpanded ? "w-56" : "w-48"}`}
              >
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-sm font-black text-gray-900 leading-tight truncate">
                    {user?.username || "Guest"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Settings & Privacy
                  </p>
                </div>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-orange-50 transition-all"
                >
                  <Settings size={16} /> Settings
                </Link>

                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-t border-gray-50 mt-1"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
      {/* Mobile Top Navigation */}
      <AnimatePresence>
        {!hideMobileNav && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-3 right-3 top-1 h-14 flex items-center justify-between z-50"
          >
            <GlassSurface
              width={"fit-content"}
              height={"fit-content"}
              className="top-2 cursor-pointer hover:bg-white/10 transition-colors flex items-center"
              onClick={() => navigate("/")}
            >
              <img
                src="/logo.png"
                alt="logo"
                className="w-10 h-10 rounded-full"
              />

              <AnimatePresence mode="wait">
                {location.pathname === "/" && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, x: -10 }}
                    animate={{ width: "auto", opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-2xl font-display font-black tracking-tighter text-gray-900 px-2 overflow-hidden whitespace-nowrap"
                  >
                    Velo
                  </motion.span>
                )}
              </AnimatePresence>
            </GlassSurface>
            <div className="flex gap-2">
              <GlassSurface
                width={"fit-content"}
                height={"fit-content"}
                className="top-2 p-2 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Link
                  to={user ? "/notifications" : "/login-signup"}
                  className={` rounded-lg relative transition-transform duration-200 active:scale-90 ${location.pathname === "/notifications" ? "text-brand" : "text-black"}`}
                >
                  <motion.div
                    animate={
                      unreadCount > 0
                        ? { rotate: [0, -10, 10, -10, 10, 0] }
                        : {}
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      repeatDelay: 1,
                    }}
                  >
                    <Bell size={24} />
                  </motion.div>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </Link>
              </GlassSurface>
              {/* <GlassSurface
                width={"fit-content"}
                height={"fit-content"}
                className="top-2 p-2 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="cursor-pointer"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </motion.div>
              </GlassSurface> */}
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay removed as it was unused */}

      {/* Mobile Bottom Navigation */}
      <AnimatePresence>
        {!hideMobileNav && (
          <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50 flex justify-center">
            <motion.nav
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md"
            >
              <GlassSurface
                width={"100%"}
                height={"fit-content"}
                opacity={0.93}
                displace={0}
                borderRadius={24}
              >
                <div className="flex justify-around items-center w-full px-2">
                  <Link
                    to={"/"}
                    className={`p-3 ${location.pathname === "/" ? "text-brand" : "text-black"}`}
                  >
                    <HomeIcon />
                  </Link>
                  <Link
                    to={"/movements"}
                    className={`p-3 ${location.pathname === "/movements" ? "text-brand" : "text-black"}`}
                  >
                    <Route />
                  </Link>
                  <Link
                    to={user ? "/community" : "/login-signup"}
                    className={`p-3 ${location.pathname === "/community" ? "text-brand" : "text-black"}`}
                  >
                    <HiOutlineUserGroup size={30} />
                  </Link>

                  <Link
                    to={user ? "/chat" : "/login-signup"}
                    className={`p-3 ${location.pathname === "/chat" ? "text-brand" : "text-black"}`}
                  >
                    <MessageCircle />
                  </Link>
                  <Link
                    to={user ? "/profile" : "/login-signup"}
                    className={`p-3 ${location.pathname === "/profile" || location.pathname === "/login-signup" ? "text-brand" : "text-black"}`}
                  >
                    {user ? <UserIcon /> : <LogIn />}
                  </Link>
                </div>
              </GlassSurface>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
