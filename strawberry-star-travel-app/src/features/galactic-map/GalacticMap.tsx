import Starfield from "../../components/Starfield";
import PingFoot from "../../styles/PingFoot.png";
// import FavoritesCarousel from "../favorites/FavoritesCarousel";

export default function GalacticMap() {
  return (
    <>
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 text-white overflow-hidden">
      {/* Deep forest-green starfield background */}
      <Starfield gradient="from-black via-green-950 to-emerald-200" />
      
      {/* Content container */}
      <div className="z-10 flex flex-col items-center text-center mt-10">
       
        <h2 className="mt-6 text-2xl font-bold pb-4 text-white drop-shadow-md tracking-wide">
          I'm not quite ready yet.
        </h2>

        <div className="
          w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 
          rounded-xl border-4 border-green-400 
          shadow-[0_0_25px_rgba(34,197,94,0.45)]
          overflow-hidden bg-black/40 backdrop-blur-sm
          flex items-center justify-center
        ">
          <img
            src={PingFoot}
            alt="PingFoot the cat"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="mt-6 text-2xl pt-1 font-bold text-black drop-shadow-md tracking-wide">
          Please be patient with me. :)
        </h2>
      </div>
    </div>
    {/* <FavoritesCarousel /> */}
    </>
  );
}
