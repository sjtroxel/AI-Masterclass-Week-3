import React from "react";
import "./FavoritesCarousel.css";

type DummyCard = {
  id: number;
  title: string;
  subtitle: string;
};

const dummyCards: DummyCard[] = [
  { id: 1, title: "Sirius", subtitle: "Brightest star" },
  { id: 2, title: "Betelgeuse", subtitle: "Red supergiant" },
  { id: 3, title: "Vega", subtitle: "Lyra constellation" },
  { id: 4, title: "Polaris", subtitle: "North Star" },
  { id: 5, title: "Rigel", subtitle: "Blue supergiant" },
];

export default function FavoritesCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const total = dummyCards.length;
  const radius = 250; // distance from center (depth)

  const rotateLeft = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const rotateRight = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="carousel-wrapper">
      <button onClick={rotateLeft} className="carousel-button">
        ◀
      </button>

      <div className="carousel-scene">
        <div
          className="carousel-ring"
          style={{
            transform: `rotateY(${-activeIndex * (360 / total)}deg)`,
          }}
        >
          {dummyCards.map((card, index) => {
            const angle = (360 / total) * index;

            return (
              <div
                key={card.id}
                className="carousel-card"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                }}
              >
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={rotateRight} className="carousel-button">
        ▶
      </button>
    </div>
  );
}
