export type HomeFeature = {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon key
};

export const homeFeatures: HomeFeature[] = [
  {
    id: "stars",
    title: "Browse Stars",
    description: "Explore nearby stars with real astronomical data.",
    icon: "⭐",
  },
  {
    id: "favorites",
    title: "Favorite Systems",
    description: "Save stars to your personal observatory.",
    icon: "💫",
  },
  {
    id: "map",
    title: "Galactic Map",
    description: "Visualize star positions across the galaxy.",
    icon: "🌌",
  },
  {
    id: "wikipedia",
    title: "Star Lore",
    description: "Learn myths, science, and facts about stars.",
    icon: "📜",
  },
  {
    id: "missions",
    title: "Mission Planner",
    description: "Plan hypothetical journeys between star systems.",
    icon: "🚀",
  },
];
