import React, { useState } from "react";
import "../styles/ShootingStars.css";

type ShootingStar = {
  startX: string;
  startY: string;
  dx: string;
  dy: string;
  duration: string;
};

type CSSWithVars = React.CSSProperties & {
  "--angle"?: string;
  "--dx"?: string;
  "--dy"?: string;
};

function generateStar(): ShootingStar {
  const startX = Math.random() * 100; // vw
  const startY = Math.random() * 100; // vh
  const length = 120 + Math.random() * 80; // length of star
  const angleRad = Math.random() * Math.PI * 2; // 0–360 degrees
  const dx = Math.cos(angleRad) * length;
  const dy = Math.sin(angleRad) * length;
  const duration = 0.8 + Math.random() * 1.2 + "s"; // 0.8–2s

  return {
    startX: `${startX}vw`,
    startY: `${startY}vh`,
    dx: `${dx}px`,
    dy: `${dy}px`,
    duration,
  };
}

export default function ShootingStars() {
  const [star, setStar] = useState<ShootingStar | null>(null);

  // Trigger a new star with random delay
  const spawnStar = () => {
    const delay = 3000 + Math.random() * 5000; // 3-8s
    setTimeout(() => {
      setStar(generateStar());
    }, delay);
  };

  const handleAnimationEnd = () => {
    setStar(null); // remove old star
    spawnStar();   // schedule new one
  };

  // initial spawn
  React.useEffect(() => {
    spawnStar();
  }, []);

  if (!star) return null;

  const angle =
    (Math.atan2(parseFloat(star.dy), parseFloat(star.dx)) * 180) / Math.PI;

  return (
    <div className="shooting-stars-container">
      <div
        className="shooting-star"
        style={
          {
            left: star.startX,
            top: star.startY,
            animationDuration: star.duration,
            "--dx": star.dx,
            "--dy": star.dy,
            "--angle": `${angle}deg`,
          } as CSSWithVars
        }
        onAnimationEnd={handleAnimationEnd}
      />
    </div>
  );
}
