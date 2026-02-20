import React from "react";
import Starfield from "../../components/Starfield";
import ShootingStars from "../../components/ShootingStars";
import Strawberry from "../../styles/Strawberry.png";
// import { Star_Facts } from "../stars/data/starFacts";
// import { homeFeatures } from "./data/homeFeatures";
import HomeCarousel from "./components/HomeCarousel";

export default function Home() {
  {
    /* "Locked" Feature Teaser Modal */
  }
  const [lockedFeature, setLockedFeature] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!lockedFeature) return;
    const t = setTimeout(() => setLockedFeature(null), 2500);
    return () => clearTimeout(t);
  }, [lockedFeature]);

  {
    /* Scroll Hide */
  }
  const [hideScroll, setHideScroll] = React.useState(false);

  React.useEffect(() => {
    const hide = () => setHideScroll(true);
    window.addEventListener("wheel", hide, { passive: true });
    window.addEventListener("touchstart", hide);
    window.addEventListener("keydown", hide);
    window.addEventListener("mousedown", hide);
    return () => {
      window.removeEventListener("wheel", hide);
      window.removeEventListener("touchstart", hide);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("mousedown", hide);
    };
  }, []);

  {
    /* Typewriter Tagline */
  }
  const line1 = "Discover real stars.";
  const line2 = "Remember the ones that call to you.";

  const [typedLine1, setTypedLine1] = React.useState("");
  const [typedLine2, setTypedLine2] = React.useState("");

  React.useEffect(() => {
    let i = 0;
    let j = 0;

    const typeLine1 = setInterval(() => {
      setTypedLine1(line1.slice(0, i + 1));
      i++;
      if (i === line1.length) {
        clearInterval(typeLine1);

        setTimeout(() => {
          const typeLine2 = setInterval(() => {
            setTypedLine2(line2.slice(0, j + 1));
            j++;
            if (j === line2.length) {
              clearInterval(typeLine2);
            }
          }, 60);
        }, 600);
      }
    }, 60);

    return () => clearInterval(typeLine1);
  }, []);

  {
    /* Star Facts */
  }
  // const [starFact, setStarFact] = React.useState("");

  // React.useEffect(() => {
  //   const index = Math.floor(Math.random() * Star_Facts.length);
  //   setStarFact(Star_Facts[index]);
  // }, []);

  return (
    <main className="relative w-full overflow-x-hidden text-white">
      <ShootingStars />
      {/* 🌟 Starfield with gradient */}
      <Starfield gradient="from-black via-gray-950 to-rose-950" />

      {/* Hero section */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center z-10">
        <div className="relative inline-block">
          {/* Lens flare */}
          <div className="lens-flare" aria-hidden />
          <h1
            className="
              font-extrabold tracking-tight text-5xl leading-tight sm:text-6xl md:text-7xl
              drop-shadow-[0_0_25px_rgba(255,100,200,0.45)]
              mb-6 pt-12 text-center relative z-10
            "
          >
            <span className="block depth depth-1 bg-linear-to-b from-rose-700 via-rose-500 to-red-400 bg-clip-text text-transparent">
              Strawberry
            </span>
            <span className="block depth depth-2 bg-linear-to-b from-pink-300 via-white to-zinc-500 bg-clip-text text-transparent">
              Star
            </span>
            <span className="block depth depth-3 bg-linear-to-b from-pink-500 via-fuchsia-400 to-rose-500 bg-clip-text text-transparent">
              Travel
            </span>
          </h1>
        </div>

        {/* Avatar + Tagline group */}
        <div className="flex flex-col items-center translate-y-9 sm:translate-y-12">
          {/* 🐱 Strawberry’s cosmic floating avatar */}
          <img
            src={Strawberry}
            alt="Strawberry the cat"
            className="
            w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover
            border-2 border-red-500 shadow-xl
            animate-[float_4s_ease-in-out_infinite,glow_3s_ease-in-out_infinite] mb-2"
          />

          {/* Typewriter Tagline */}
          <p
            className="
            max-w-md sm:max-w-xl text-base sm:text-lg
            font-semibold italic text-gray-100 min-h-3.5rem mt-6"
          >
            <span className="block">{typedLine1}</span>
            <span className="block">{typedLine2}</span>
          </p>

          {/* Primary CTA */}
          <div className="mt-5 flex flex-col items-center gap-5">
            <a
              href="/signup"
              className="
              px-6 py-2 rounded-full font-bold text-sm sm:text-base
              bg-linear-to-r from-pink-700 via-rose-700 to-fuchsia-700
              text-zinc-300 shadow-[0_0_20px_rgba(255,120,200,0.6)]
              hover:scale-105 active:scale-100 transition-transform
            "
            >
              Begin Your Journey
            </a>
            <div className="flex justify-center mb-8">
              <p
                className="
                inline-block text-xs font-semibold italic text-slate-100
                px-4 py-1.5 rounded-full
                bg-black/30 border border-sky-400/30
                backdrop-blur-sm
                shadow-[0_0_12px_rgba(100,200,255,0.15)]
              "
              >
                Sign up for free to explore stars and unlock features!
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-6 text-gray-200 text-xs tracking-widest uppercase transition-opacity duration-500 ${
            hideScroll ? "opacity-0" : "opacity-100"
          }`}
        >
          Scroll
        </div>
      </section>

      {/* Features */}
      <section className="relative w-full py-28 z-10">
        {/* 2a — one-line explanation ABOVE the grid */}
        <div className="flex justify-center mb-6">
          <p
            className="
            inline-block text-xs font-semibold italic text-sky-100
            px-4 py-1.5 rounded-full
            bg-black/30 border border-sky-400/30
            backdrop-blur-sm
            shadow-[0_0_12px_rgba(100,200,255,0.15)]
          "
          >
            Unlock the below features by creating a free account!
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <HomeCarousel onFeatureClick={(title) => setLockedFeature(title)} />
        </div>
      </section>

      {/* Post-features CTA */}
      <div className="relative z-10 py-20 flex flex-col items-center gap-4">
        <p className="text-lg font-semibold text-gray-200">Ready to explore for real?</p>

        <a
          href="/signup"
          className="px-6 py-2 rounded-full font-bold text-sm sm:text-base
            bg-linear-to-r from-blue-800 to-cyan-700
            text-white
            shadow-[0_0_24px_rgba(255,120,200,0.6)]
            hover:scale-105 transition-transform
          "
        >
          Create Free Account
        </a>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-lg text-gray-200 font-semibold z-10">
        © {new Date().getFullYear()}{" "}
        <span className="inline-flex items-center gap-1">
          sjtroxel
          <a
            href="https://github.com/sjtroxel/Strawberry-Star-Travel-App"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Strawberry Star Travel GitHub repository"
            className="
              inline-flex items-center
              text-gray-300 hover:text-pink-300
              transition-colors
            "
          >
            {/* GitHub icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,150,255,0.4)]"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.852 0 1.337-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.523 2 12 2z" />
            </svg>
          </a>
        </span>
        . All rights reserved.
      </footer>

      {lockedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 border border-pink-400/40 shadow-xl text-center animate-fadeIn">
            <p className="text-lg font-bold text-pink-300 mb-1">{lockedFeature}</p>
            <p className="text-sm text-gray-200 italic">
              This feature unlocks when you create a free account!
            </p>
          </div>
        </div>
      )}

      {/* Custom keyframes */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes glow {
            0% { box-shadow: 0 0 8px rgba(255, 100, 150, 0.4); }
            50% { box-shadow: 0 0 16px rgba(255, 150, 200, 0.7); }
            100% { box-shadow: 0 0 8px rgba(255, 100, 150, 0.4); }
          }
          @keyframes titleShimmer {
            0% {
              filter: drop-shadow(0 0 4px rgba(255, 140, 200, 0.4))
                      drop-shadow(0 0 12px rgba(255, 90, 160, 0.3));
              opacity: 0.95;
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(255, 180, 240, 0.7))
                      drop-shadow(0 0 30px rgba(255, 120, 200, 0.8));
              opacity: 1;
            }
            100% {
              filter: drop-shadow(0 0 4px rgba(255, 140, 200, 0.4))
                      drop-shadow(0 0 12px rgba(255, 90, 160, 0.3));
              opacity: 0.95;
            }
          }
          .depth {
            display: block;
            will-change: transform;
          }

          .depth-1 {
            animation: drift1 10s ease-in-out infinite;
          }

          .depth-2 {
            animation: drift2 12s ease-in-out infinite;
          }

          .depth-3 {
            animation: drift3 14s ease-in-out infinite;
          }

          @keyframes drift1 {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(-14px, -10px, 0); }
          }

          @keyframes drift2 {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(14px, -14px, 0); }
          }

          @keyframes drift3 {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0px, 16px, 0); }
          }
          /* --- Lens flare --- */
          .lens-flare {
            position: absolute;
            top: 50%;
            left: -60%;
            width: 220%;
            height: 14px;

            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 220, 255, 0.6),
              rgba(255, 255, 255, 0.9),
              rgba(255, 220, 255, 0.6),
              transparent
            );

            transform: translateY(-50%);
            opacity: 0;
            filter: blur(6px);
            mix-blend-mode: screen;

            animation: lensFlare 7s ease-in-out infinite;
            pointer-events: none;
          }

          @keyframes lensFlare {
            0%, 82% {
              opacity: 0;
              transform: translate(-60%, -50%);
            }

            85% {
              opacity: 0.8;
            }

            92% {
              opacity: 0;
              transform: translate(60%, -50%);
            }

            100% {
              opacity: 0;
            }
          }
        `}
      </style>
    </main>
  );
}
