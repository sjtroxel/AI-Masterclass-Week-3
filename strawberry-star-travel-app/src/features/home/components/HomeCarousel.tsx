import React from "react";
import { homeFeatures } from "../data/homeFeatures";
import HomeFeatureCard from "./HomeFeatureCard";
import "./HomeCarousel.css";

type Props = {
  onFeatureClick: (title: string) => void;
};

export default function HomeCarousel({ onFeatureClick }: Props) {
  const [index, setIndex] = React.useState(0);
  const isMobile = window.matchMedia("(max-width: 480px)").matches;

  const rotateLeft = () => setIndex((i) => (i - 1 + homeFeatures.length) % homeFeatures.length);

  const rotateRight = () => setIndex((i) => (i + 1) % homeFeatures.length);

  // 📱 MOBILE: simple stacked list
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-6">
        {homeFeatures.map((feature) => (
          <HomeFeatureCard
            key={feature.id}
            feature={feature}
            onClick={() => onFeatureClick(feature.title)}
          />
        ))}
      </div>
    );
  }

  // 🖥 DESKTOP: carousel
  return (
    <div className="home-carousel">
      <div className="carousel-ring">
        {homeFeatures.map((feature, i) => {
          const offset = i - index;

          return (
            <div
              key={feature.id}
              className="carousel-item"
              style={{
                transform: `
                  rotateY(${offset * 60}deg)
                  translateZ(280px)
                `,
                opacity: Math.abs(offset) > 2 ? 0 : 1,
              }}
            >
              <HomeFeatureCard feature={feature} onClick={() => onFeatureClick(feature.title)} />
            </div>
          );
        })}
      </div>

      <div className="carousel-controls">
        <button onClick={rotateLeft} className="carousel-btn">
          L
        </button>
        <button onClick={rotateRight} className="carousel-btn">
          R
        </button>
      </div>
    </div>
  );
}
