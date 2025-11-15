/**
 * Landing page data and constants
 * Migrated from src/constants/details.ts
 */

interface Flavor {
  name: string;
  color: string;
  rotation: string;
}

interface Nutrient {
  label: string;
  amount: string;
}

interface Card {
  src: string;
  rotation: string;
  name: string;
  img: string;
  translation?: string;
}

const flavorlists: Flavor[] = [
  {
    name: "Chocolate Milk",
    color: "brown",
    rotation: "md:rotate-[-8deg] rotate-0",
  },
  {
    name: "Stawberry Milk",
    color: "red",
    rotation: "md:rotate-[8deg] rotate-0",
  },
  {
    name: "Cookies & Cream",
    color: "blue",
    rotation: "md:rotate-[-8deg] rotate-0",
  },
  {
    name: "Peanut Butter Chocolate",
    color: "orange",
    rotation: "md:rotate-[8deg] rotate-0",
  },
  {
    name: "Vanilla Milkshake",
    color: "white",
    rotation: "md:rotate-[-8deg] rotate-0",
  },
  {
    name: "Max Chocolate Milk",
    color: "black",
    rotation: "md:rotate-[8deg] rotate-0",
  },
];

const nutrientLists: Nutrient[] = [
  { label: "EV Charger Availability", amount: "up to 120 chargers free" },
  { label: "Parking Stress Level", amount: "moderate occupancy" },
  { label: "Heat Index", amount: "up to 38°C" },
  { label: "Event Impact", amount: "Expo City, high crowd" },
  { label: "Safe Walking Window", amount: "6pm–9am recommended" },
];

const cards: Card[] = [
  {
    src: "/landing/assets/videos/f1.mp4",
    rotation: "rotate-z-[-10deg]",
    name: "Madison",
    img: "/landing/assets/images/p1.png",
    translation: "translate-y-[-5%]",
  },
  {
    src: "/landing/assets/videos/f2.mp4",
    rotation: "rotate-z-[4deg]",
    name: "Alexander",
    img: "/landing/assets/images/p2.png",
  },
  {
    src: "/landing/assets/videos/f3.mp4",
    rotation: "rotate-z-[-4deg]",
    name: "Andrew",
    img: "/landing/assets/images/p3.png",
    translation: "translate-y-[-5%]",
  },
  {
    src: "/landing/assets/videos/f4.mp4",
    rotation: "rotate-z-[4deg]",
    name: "Bryan",
    img: "/landing/assets/images/p4.png",
    translation: "translate-y-[5%]",
  },
  {
    src: "/landing/assets/videos/f5.mp4",
    rotation: "rotate-z-[-10deg]",
    name: "Chris",
    img: "/landing/assets/images/p5.png",
  },
  {
    src: "/landing/assets/videos/f6.mp4",
    rotation: "rotate-z-[4deg]",
    name: "Devante",
    img: "/landing/assets/images/p6.png",
    translation: "translate-y-[5%]",
  },
  {
    src: "/landing/assets/videos/f7.mp4",
    rotation: "rotate-z-[-3deg]",
    name: "Melisa",
    img: "/landing/assets/images/p7.png",
    translation: "translate-y-[10%]",
  },
];

export { flavorlists, nutrientLists, cards };
