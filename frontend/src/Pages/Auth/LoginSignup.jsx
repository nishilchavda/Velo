import { useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import { User, Mail, Lock, Zap } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const LoginSignup = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".auth-main-container",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }
      );
    },
    { scope: containerRef }
  );

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await login(loginData.email, loginData.password);
    if (res.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(res.message || "Login failed");
    }
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await register(
      signupData.username,
      signupData.email,
      signupData.password
    );
    if (res.success) {
      toast.success("Account created successfully!");
      navigate("/");
    } else {
      toast.error(res.message || "Registration failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div
      ref={containerRef}
      className="h-full md:h-screen bg-white flex items-center justify-center relative overflow-hidden font-sans"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes move {
                    0%, 49.99% { opacity: 0; z-index: 1; }
                    50%, 100% { opacity: 1; z-index: 5; }
                }
            `,
        }}
      />

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full animate-pulse-soft" />
      </div>

      <div className="auth-main-container relative z-10 w-full max-w-6xl min-h-200 md:min-h-162.5">
        <div
          className="bg-white/40 backdrop-blur-3xl shadow-2xl rounded-4xl overflow-hidden w-full h-full"
        >
          <div className="relative w-full h-full min-h-200 md:min-h-162.5">
            {/* Sign Up Form */}
            <div  
              className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-1 ${
                isActive ? "md:translate-x-full opacity-100 z-5 animate-[move_0.7s]" : "opacity-0 pointer-events-none"
              }`}
            >
              <form
                onSubmit={handleSignupSubmit}
                className="flex flex-col items-center justify-center px-8 md:px-16 h-full text-center py-12"
              >
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4 text-gray-900 leading-none">
                  Create <span className="text-brand">Account.</span>
                </h1>
                <p className="text-gray-500 font-medium mb-10 text-sm md:text-base">
                  Join 40k+ travelers syncing their journeys.
                </p>

                <div className="w-full space-y-4 max-w-sm">
                  <div className="relative group/input">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand transition-colors" size={18} />
                    <input
                      className="bg-gray-50/50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl w-full outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                      type="text"
                      name="username"
                      placeholder="Full Name"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <div className="relative group/input">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand transition-colors" size={18} />
                    <input
                      className="bg-gray-50/50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl w-full outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-brand transition-colors" size={18} />
                    <input
                      className="bg-gray-50/50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl w-full outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                      type="password"
                      name="password"
                      placeholder="Secure Password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 text-white py-4 px-12 rounded-2xl font-black mt-10 transition-all hover:bg-brand active:scale-95 disabled:opacity-50 flex items-center gap-2 group/btn shadow-lg shadow-gray-900/10 hover:shadow-brand/20"
                >
                  {isSubmitting ? "SYNCING..." : <>JOIN VELO <Zap size={18} /></>}
                </button>
              </form>
            </div>

            {/* Sign In Form */}
            <div
              className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-2 ${
                isActive ? "md:translate-x-full opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <form
                onSubmit={handleLoginSubmit}
                className="flex flex-col items-center justify-center px-8 md:px-16 h-full text-center py-12"
              >
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4 text-gray-900 leading-none">
                  Welcome <span className="text-brand">back.</span>
                </h1>
                <p className="text-gray-500 font-medium mb-10 text-sm md:text-base">
                  Ready for your next adventure?
                </p>

                <div className="w-full space-y-4 max-w-sm">
                  <div className="relative group/input">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-secondary transition-colors" size={18} />
                    <input
                      className="bg-gray-50/50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl w-full outline-none focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-secondary transition-colors" size={18} />
                    <input
                      className="bg-gray-50/50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl w-full outline-none focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-gray-900 placeholder:text-gray-400"
                      type="password"
                      name="password"
                      placeholder="Your Password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>

                <Link
                  to="/forget-password"
                  className="text-gray-400 mt-5 text-sm font-bold hover:text-secondary transition-colors tracking-wide"
                >
                  Forgot Password?
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 text-white py-4 px-12 rounded-2xl font-black mt-10 transition-all hover:bg-secondary active:scale-95 disabled:opacity-50 shadow-lg shadow-gray-900/10 hover:shadow-secondary/20"
                >
                  {isSubmitting ? "RESYNCING..." : "LOG IN"}
                </button>
              </form>
            </div>

            {/* Toggle Overlay (Desktop) */}
            <div
              className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-10 ${
                isActive ? "-translate-x-full" : ""
              }`}
            >
              <div
                className={`relative -left-full h-full w-[200%] bg-gray-900 bg-linear-to-br from-brand via-orange-600 to-secondary text-white transition-all duration-700 ease-in-out ${
                  isActive ? "translate-x-1/2" : "translate-x-0"
                }`}
              >
                {/* Left Toggle (Login trigger) */}
                <div
                  className={`absolute top-0 flex flex-col items-center justify-center text-center h-full w-1/2 transition-all duration-700 ease-in-out ${
                    isActive ? "translate-x-0" : "translate-x-[-200%]"
                  }`}
                >
                  <h2 className="text-4xl font-display font-black tracking-tighter mb-6 leading-none">
                    Already a <br/> Velo member?
                  </h2>
                  <p className="text-sm leading-relaxed mb-10 text-white/80 font-medium">
                    Log in and jump back into your current movements.
                  </p>
                  <button
                    onClick={() => setIsActive(false)}
                    className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white text-xs py-4 px-10 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900 active:scale-95"
                  >
                    LOG IN
                  </button>
                </div>

                {/* Right Toggle (Signup trigger) */}
                <div
                  className={`absolute top-0 right-0 flex flex-col items-center justify-center px-12 text-center h-full w-1/2 transition-all duration-700 ease-in-out ${
                    isActive ? "translate-x-[200%]" : "translate-x-0"
                  }`}
                >
                  <h2 className="text-4xl font-display font-black tracking-tighter mb-6 leading-none">
                    New to the <br/> community?
                  </h2>
                  <p className="text-sm leading-relaxed mb-10 text-white/80 font-medium">
                    Start your first movement and connect with global explorers.
                  </p>
                  <button
                    onClick={() => setIsActive(true)}
                    className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white text-xs py-4 px-10 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white hover:text-brand active:scale-95"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Trigger */}
      <div className="md:hidden fixed top-20 z-10 flex bg-white/80 backdrop-blur-xl p-2 gap-2 rounded-2xl border border-gray-100">
        <button
          onClick={() => setIsActive(false)}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isActive ? "bg-gray-900 text-white" : "text-gray-400"}`}
        >
          Log In
        </button>
        <button
          onClick={() => setIsActive(true)}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-gray-900 text-white" : "text-gray-400"}`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginSignup;
