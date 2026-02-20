import React from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Starfield from "../components/Starfield"

export default function Signup() {
  const [username, setUsername] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const navigate = useNavigate();
  const [signupSuccess, setSignupSuccess] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [countdown, setCountdown] = React.useState(15);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!username.trim() || !firstName.trim() || !lastName.trim()) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, firstName, lastName },
      },
    });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      const newUsername =
        result.data?.user?.user_metadata?.username || username;

      setMessage(
        `Signup successful, ${newUsername}!`
      );
      setSignupSuccess(true);
      setCountdown(15);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    if (!signupSuccess) return;

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

    // Redirect at 15 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [signupSuccess, navigate]);


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 text-white overflow-hidden">
      <Starfield gradient="from-black via-black/90 to-blue-500/40" />
      <div className="w-full max-w-sm bg-gray-950/70 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 mt-10 shadow-2xl">
        <h1 className="text-center text-xl font-bold tracking-wide mb-6 pb-4">
          Create Your Account
        </h1>

        <form onSubmit={handleSignup} autoComplete="off" className="flex flex-col gap-5">
          {/* TEXT FIELDS */}
          {[
            {
              label: "Username",
              value: username,
              set: setUsername,
              type: "text",
              auto: "new-username",
            },
            {
              label: "First Name",
              value: firstName,
              set: setFirstName,
              type: "text",
              auto: "given-name",
            },
            {
              label: "Last Name",
              value: lastName,
              set: setLastName,
              type: "text",
              auto: "family-name",
            },
            {
              label: "Email",
              value: email,
              set: setEmail,
              type: "email",
              auto: "new-email",
            },
          ].map((field) => (
            <div key={field.label} className="relative">
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder=" "
                autoComplete={field.auto}
                className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg 
                border border-gray-700 outline-none 
                focus:border-blue-400 focus:ring-4 focus:ring-blue-600/20
                peer transition-all"
              />

              <label
                className={`
                  absolute left-3 px-1 bg-gray-950/70 rounded-md 
                  text-gray-400 transition-all pointer-events-none
                  ${field.value 
                    ? "top-[-0.55rem] text-xs text-blue-300" 
                    : "top-2.5 text-base"}
                  peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-blue-300
                `}
              >
                {field.label}
              </label>
            </div>
          ))}

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder=" "
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/60 rounded-lg border border-gray-700 
              text-white focus:border-blue-400 focus:ring-4 focus:ring-blue-600/20 
              outline-none peer"
            />

            <label
              className={`
                absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all
                ${password 
                  ? "top-[-0.55rem] text-xs text-blue-300" 
                  : "top-2.5 text-base"}
                peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-blue-300
              `}
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-300 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder=" "
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/60 rounded-lg border border-gray-700 
              text-white focus:border-blue-400 focus:ring-4 focus:ring-blue-600/20 
              outline-none peer"
            />

            <label
              className={`
                absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all
                ${confirmPassword 
                  ? "top-[-0.55rem] text-xs text-blue-300" 
                  : "top-2.5 text-base"}
                peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-blue-300
              `}
            >
              Confirm Password
            </label>

            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-300 transition"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 
            active:scale-[.98] transition font-semibold tracking-wide 
            shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* EXTRA SPACING + CONFIRM/ERROR MESSAGE */}
        {message && (
          <p className="mt-4 pt-3 text-center text-sm text-red-300">
            {message}
            {signupSuccess && (
              <span className="block text-blue-300 mt-2">
                Redirecting to home in T-{countdown} seconds...
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
