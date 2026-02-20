import type { HomeFeature } from "../data/homeFeatures";

type Props = {
  feature: HomeFeature;
  onClick: () => void;
};

export default function HomeFeatureCard({ feature, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        relative w-[80vw] max-w-[20rem] h-36 rounded-xl
        overflow-hidden
        bg-white/10 backdrop-blur-xl
        border-3 border-cyan-400/20
        shadow-lg text-center
        p-4 text-white
        hover:scale-105 transition-transform
      "
    >
      <div className="text-3xl mb-2">{feature.icon}</div>
      <h3 className="text-lg font-bold">{feature.title}</h3>
      <p className="text-sm text-cyan-50 mt-1">{feature.description}</p>
    </button>
  );
}
