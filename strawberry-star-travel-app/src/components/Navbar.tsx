import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom"
import Strawberry from "../styles/Strawberry.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user?.user_metadata?.username;
  const avatar = user?.user_metadata?.avatar;
  const [menuOpen, setMenuOpen] = React.useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50 shadow-lg">

      {/* Energy-wave border (no height change) */}
      <div className="
        absolute bottom-0 left-0 w-full h-2px pointer-events-none
        bg-linear-to-r from-pink-500 via-purple-400 to-indigo-500
        opacity-60 animate-[pulseWave_3s_ease-in-out_infinite]
      "></div>

      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 max-w-6xl relative">

        {/* Title — cosmic gradient + shimmer + glow */}
        <Link
          to="/"
          className="
            font-bold text-base sm:text-2xl whitespace-nowrap
            bg-linear-to-r from-pink-300 via-purple-300 to-indigo-300
            bg-clip-text text-transparent
            drop-shadow-[0_0_6px_rgba(255,180,255,0.6)]
            animate-[titleGlow_6s_ease-in-out_infinite]
            relative
          "
        >
          Strawberry Star Travel

          {/* Shimmer Layer */}
          <span className="
            absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent
            opacity-0 animate-[shimmer_4s_linear_infinite]
            pointer-events-none
          "></span>
        </Link>

        {/* Desktop Greeting & Avatar */}
        {user && (
          <div className="hidden sm:flex items-center gap-3 ml-6">

            {/* Nebula blur background */}
            <div className="
              absolute w-20 h-20 rounded-full blur-2xl opacity-25
              bg-linear-to-r from-purple-600 via-pink-500 to-indigo-500
              animate-pulse pointer-events-none
            "></div>

            <span className="text-pink-300 text-sm font-semibold drop-shadow-[0_0_4px_rgba(255,100,255,0.5)]">
              Hello, {username || "traveler"}!
            </span>

            {/* Avatar — only desktop spins */}
            <img
              src={avatar || Strawberry}
              alt="avatar"
              className="
                w-9 h-9 rounded-full object-cover border-2 border-pink-300
                transition-transform duration-500 ease-out
                hover:rotate-180 active:rotate-180
                shadow-[0_0_12px_rgba(255,140,255,0.5)]
              "
            />
          </div>
        )}

    {/* Right Side */}
    <div className="flex items-center gap-3 ml-auto">

      {/* LOGGED OUT → show buttons */}
      {!user && (
        <div className="flex items-center gap-1">
          <Link
            to="/login"
            className="
              px-3 py-1.5 rounded-full font-semibold text-sm
              bg-linear-to-r from-blue-800 to-cyan-700
              text-white
              shadow-[0_0_16px_rgba(255,120,200,0.6)]
              hover:scale-105 transition-transform
            "
          >
           Log In
          </Link>

          <Link
            to="/signup"
            className="
              px-3 py-1.5 rounded-full font-semibold text-sm
              bg-linear-to-r from-pink-800 to-rose-800
              text-white
              shadow-[0_0_16px_rgba(255,120,200,0.6)]
              hover:scale-105 transition-transform
            "
          >
          Sign Up
          </Link>
        </div>
      )}

      {/* LOGGED IN → avatar + hamburger */}
      {user && (
        <>
          {/* Mobile avatar — does NOT spin */}
          <img
            src={avatar || Strawberry}
            alt="avatar"
            className="
              w-9 h-9 rounded-full object-cover border-2 border-pink-300
              sm:hidden
            "
          />

          {/* Hamburger icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="
              text-pink-300 text-2xl sm:text-xl transition-transform duration-300
              drop-shadow-[0_0_8px_rgba(255,150,255,0.6)]
              hover:scale-110 active:scale-110
            "
            style={{
              transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </>
      )}
    </div>
</div>

      {/* Mobile Menu — Cosmic Panel + glow + shimmer */}
      {menuOpen && (
        <div className="
          sm:hidden bg-gray-900 border-t border-pink-500/40 animate-fadeIn
          shadow-[0_0_16px_rgba(255,80,255,0.4)]
        ">
          <nav className="flex flex-col text-sm divide-y divide-gray-800">

            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 font-semibold hover:bg-gray-800 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 font-semibold hover:bg-gray-800">
                  Sign Up
                </Link>
              </>
            )}

            {user && (
              <>
                {[
                  ["🛰️  Dashboard", "/dashboard"],
                  ["🌟  Browse Stars", "/browse-stars"],
                  ["💖  Favorites", "/favorites"],
                  ["📡  Profile", "/profile"],
                ].map(([label, path]) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="
                      px-4 py-3 font-semibold transition-colors
                      hover:bg-pink-900/30
                      hover:text-pink-300
                      animate-[menuPulse_4s_ease-in-out_infinite]
                    "
                  >
                    {label}
                  </Link>
                ))}

                <Link
                  to="/galactic-map"
                  onClick={() => setMenuOpen(false)}
                  className="
                    px-4 font-semibold py-3 hover:bg-pink-900/30 text-pink-300
                    animate-[menuPulse_4s_ease-in-out_infinite]
                  "
                >
                  🌌  Galactic Map <span className="text-xs italic opacity-70">(coming soon)</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="
                    px-4 py-3 font-semibold text-left text-red-400 hover:bg-red-900/20
                  "
                >
                  Log Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Desktop Menu — Cosmic Panel */}
      {menuOpen && (
        <div className="
          hidden sm:block absolute right-6 mt-2 w-64 bg-gray-900
          border border-pink-400 rounded-xl shadow-xl animate-fadeIn
          overflow-hidden
        ">
          <nav className="flex flex-col font-semibold text-sm divide-y divide-gray-800">

            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-3 hover:bg-gray-800">Log In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-3 hover:bg-gray-800">Sign Up</Link>
              </>
            )}

            {user && (
              <>
                {[
                  ["🛰️  Dashboard", "/dashboard"],
                  ["🌟  Browse Stars", "/browse-stars"],
                  ["💖  Favorites", "/favorites"],
                  ["📡  Profile", "/profile"],
                ].map(([label, path]) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="
                      px-4 py-3 transition-colors hover:bg-pink-900/30
                      hover:text-pink-300 font-semibold animate-[menuPulse_4s_ease-in-out_infinite]
                    "
                  >
                    {label}
                  </Link>
                ))}

                <Link
                  to="/galactic-map"
                  onClick={() => setMenuOpen(false)}
                  className="
                    px-4 font-semibold py-3 hover:bg-pink-900/30 text-pink-300
                    animate-[menuPulse_4s_ease-in-out_infinite]
                  "
                >
                  🌌  Galactic Map <span className="text-xs italic opacity-70">(coming soon)</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-3 font-semibold text-left text-red-400 hover:bg-red-900/20"
                >
                  Log Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
}
