import { useUser } from "../../hooks/useUser";
import { Link } from "react-router-dom";
import Starfield from "../../components/Starfield";
import Strawberry from "../../styles/Strawberry.png";

export default function Dashboard() {
  const { user } = useUser();

  const username = user?.user_metadata?.username;
  const avatarUrl = user?.user_metadata?.avatar;

  return (
    <main className="relative w-full min-h-screen text-white overflow-x-hidden">

      {/* ⭐ Starfield with fiery gradient */}
      <Starfield gradient="from-black via-red-900 to-orange-900" />

      {/* MAIN CONTENT */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center">

        {/* 🔥 Large avatar with orange fire-glow */}
        <img
          src={avatarUrl || Strawberry}
          alt="User avatar"
          className="
            w-32 h-32 rounded-full object-cover
            border-4 border-orange-400 shadow-2xl
            animate-avatar-float
          "
        />

        {/* 🔥 Cinematic fiery welcome */}
        <h1
          className="
            mt-6 text-3xl sm:text-4xl font-extrabold tracking-wide text-center
            bg-linear-to-r from-orange-300 via-yellow-100 to-red-300
            bg-clip-text text-transparent
            animate-fade-in
          "
        >
          Welcome, {username || "Traveler"}!
        </h1>

        <p className="mt-4 max-w-md text-gray-200 font-semibold leading-relaxed text-base sm:text-lg text-center pt-4 italic animate-fade-in-delayed">
          Your mission console is online — select a destination or manage your star logs.
        </p>

        {/* 🌋 Fiery Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 animate-fade-in-delayed-2">

          {[
            {
              title: "🌟 Browse Stars",
              link: "/browse-stars",
              text: "Explore real cataloged stars with distances and spectral data.",
            },
            {
              title: "👤 Your Profile",
              link: "/profile",
              text: "Update your traveler identity and customize your appearance.",
            },
            {
              title: "💖 Favorites",
              link: "/favorites",
              text: "View the stars you’ve saved for future expeditions.",
            },
          ].map((card) => (
            <Link to={card.link} key={card.title}>
              <div
                className="
                  bg-black/40 backdrop-blur-xl border border-orange-400/30
                  rounded-xl p-6 shadow-xl cursor-pointer transition 
                  transform duration-300 
                  hover:-translate-y-2 hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(255,140,50,0.7)]
                "
              >
                <h2 className="text-xl font-semibold mb-2 text-orange-300">
                  {card.title}
                </h2>
                <p className="text-sm text-gray-200 pt-1 leading-relaxed">
                  {card.text}
                </p>
              </div>
            </Link>
          ))}

          {/* 🔥 Galactic Map — Coming Soon */}
          <Link to="/galactic-map">
            <div
              className="
                bg-black/30 backdrop-blur-xl border border-orange-500/40 
                rounded-xl p-6 shadow-xl opacity-80 cursor-pointer transition
                hover:opacity-100 hover:-translate-y-2 hover:border-orange-400/70
                hover:shadow-[0_0_20px_rgba(255,140,50,0.6)]
              "
            >
              <h2 className="text-xl font-semibold mb-2 text-orange-300">
                🌌 Galactic Map
              </h2>
              <p className="text-sm text-gray-200 pt-1 leading-relaxed">
                Soon you'll navigate your favorite stars on an interactive galactic map.
              </p>
              <p className="mt-3 text-xs font-bold pt-1 italic text-orange-400">
                Coming soon! 🔥
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 🔥 Custom Animations */}
      <style>
        {`
          @keyframes avatar-float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          .animate-avatar-float {
            animation: avatar-float 5s ease-in-out infinite;
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }
          .animate-fade-in-delayed {
            animation: fade-in 1.4s ease-out forwards;
          }
          .animate-fade-in-delayed-2 {
            animation: fade-in 1.8s ease-out forwards;
          }
        `}
      </style>

    </main>
  );
}
