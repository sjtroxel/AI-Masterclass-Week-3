import React from "react";

interface Star {
  size: number;
  top: number;
  left: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
}

interface StarfieldProps {
  numStars?: number;
  gradient?: string; // Tailwind gradient classes, e.g., "from-black via-gray-900 to-rose-950"
  className?: string;
}

export default function Starfield({
  numStars = 140,
  gradient = "from-black via-gray-900 to-rose-950",
  className = "",
}: StarfieldProps) {
  const [stars] = React.useState<Star[]>(
    () =>
      Array.from({ length: numStars }, () => ({
        size: Math.random() * 2 + 2.5,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.5 + 0.6,
        driftX: (Math.random() - 0.5) * 200,
        driftY: (Math.random() - 0.5) * 200,
        duration: 20 + Math.random() * 20,
      }))
  );

  return (
    <>
      {/* Stars */}
      <div className={`pointer-events-none fixed inset-0 -z-20 overflow-hidden ${className}`}>
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animation: `
                twinkle 2.5s ease-in-out ${star.delay}s infinite,
                starDrift ${star.duration}s linear infinite
              `,
              '--dx': `${star.driftX}px`,
              '--dy': `${star.driftY}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className={`pointer-events-none fixed inset-0 -z-30 bg-linear-to-b ${gradient}`} />

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes starDrift {
            from { transform: translate(0, 0); }
            to { transform: translate(var(--dx), var(--dy)); }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.35); }
          }
        `}
      </style>
    </>
  );
}
