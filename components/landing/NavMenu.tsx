"use client";

import { useState, useEffect } from "react";
import gsap from "gsap";
import { getImage } from "@/lib/landing/media";

interface MenuItem {
  name: string;
  img: string;
}

interface NavMenuProps {
  isOpen: boolean;
}

export const NavMenu: React.FC<NavMenuProps> = ({ isOpen = false }) => {
  const menuItems: MenuItem[] = [
    { name: "Shop", img: getImage("menu1.png") },
    { name: "Find in stores", img: getImage("menu2.png") },
    { name: "About Us", img: getImage("menu3.png") },
    { name: "Tasty Talks", img: getImage("menu4.png") },
    { name: "Programs", img: getImage("menu5.png") },
    { name: "Contacts", img: getImage("menu6.png") },
  ];

  const [hovered, setHovered] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<string>(getImage("menu7.webp"));

  useEffect(() => {
    const menu = document.querySelector(".navmenu") as HTMLElement | null;
    if (!menu) return;

    if (isOpen) {
      gsap.fromTo(
        menu,
        { yPercent: -100, opacity: 0, display: "flex" },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          display: "flex",
        }
      );
    } else {
      gsap.to(menu, {
        yPercent: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(menu, { display: "none" });
        },
      });
    }
  }, [isOpen]);

  return (
    <div className="navmenu fixed inset-0 w-full h-screen bg-[#faeade] justify-center items-center hidden z-50">
      <div className="flex w-full h-full">
        <div className="menu-links w-1/2 flex flex-col justify-center items-center text-center">
          {menuItems.map((item) => (
            <a
              href="#"
              key={item.name}
              onMouseEnter={() => {
                setHovered(item.name);
                setCurrentImg(item.img);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setCurrentImg(getImage("menu7.webp"));
              }}
              className={`uppercase text-8xl font-extrabold tracking-tighter transition-all duration-400 ${
                hovered === item.name ? "" : hovered ? "opacity-15" : ""
              }`}
            >
              {item.name}
            </a>
          ))}

          <div className="flex justify-center items-center gap-6 text-lg mt-10">
            <a href="#">YouTube</a>
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
          </div>
        </div>

        <div className="menu-img w-1/2 flex justify-center items-center">
          <img
            src={currentImg}
            alt="Menu Preview"
            className="w-full h-full object-cover transition-all duration-300 ease-out"
          />
        </div>
      </div>
    </div>
  );
};
