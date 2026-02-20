import React from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Starfield from "../components/Starfield";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loginSuccess, setLoginSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(5);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful!");
      setLoginSuccess(true);
      setCountdown(5);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    if (!loginSuccess) return;

    // Countdown interval
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Redirect at 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [loginSuccess, navigate]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 text-white overflow-hidden">
      {/* Starfield background */}
      <Starfield gradient="from-black via-black/90 to-green-500/30" />

      {/* Login Form */}
      <div className="w-full max-w-sm bg-gray-950/70 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 shadow-2xl z-10">
        <h1 className="text-center text-xl font-bold tracking-wide mb-6 pb-4">
          Log In
        </h1>

        <form
          onSubmit={handleLogin}
          autoComplete="off"
          className="flex flex-col gap-5"
        >
          {/* Email Field */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              autoComplete="username"
              className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-600/20 peer transition-all"
            />
            <label
              className={`
                absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all pointer-events-none
                ${email ? "top-[-0.55rem] text-xs text-green-300" : "top-2.5 text-base"}
                peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-green-300
              `}
            >
              Email
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              autoComplete="current-password"
              className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-600/20 peer"
            />
            <label
              className={`
                absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all
                ${password ? "top-[-0.55rem] text-xs text-green-300" : "top-2.5 text-base"}
                peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-green-300
              `}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-300 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 active:scale-[.98] transition font-semibold tracking-wide shadow-lg shadow-green-600/30 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Error / Success Message */}
        {message && (
          <p className="mt-4 pt-3 text-center text-sm text-red-300">
            {message}
            {loginSuccess && (
              <span className="block text-green-300 mt-2">
                Redirecting to dashboard in T-{countdown} seconds...
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
