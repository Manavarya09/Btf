"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "react-responsive";
import { NutritionLayersTitle } from "./NutritionLayersTitle";
import { NutritionLayersSlider } from "./NutritionLayersSlider";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export const NutritionLayersSection: React.FC = () => {
  const flavorRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);

  const isTablet = useMediaQuery({
    query: "(max-width: 1024px)",
  });
  const isMob = useMediaQuery({
    query: "(max-width: 768px)",
  });

  useGSAP(() => {
    if (!slideRef.current) return;

    const scrollAmount = slideRef.current.scrollWidth - window.innerWidth;

    if (!isTablet) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavor-section",
          start: "top 0%",
          end: "+=4000",
          scrub: true,
          pin: true,
        },
      });

      tl.to(".flavor-scroll-inner", {
        x: isMob ? 0 : `-${scrollAmount}px`,
        ease: "power1.inOut",
      });
    }
    if (isMob) {
      const btn = document.querySelector(".fixed-btn") as HTMLElement | null;
      if (!btn) return;

      ScrollTrigger.create({
        trigger: ".flavor-section",
        start: "top 90%",
        end: "bottom bottom",
        onToggle: (self) => {
          btn.style.position = self.isActive ? "fixed" : "absolute";
          btn.style.bottom = "0%";
          btn.style.left = "50%";
          btn.style.transform = "translateX(-50%)";
        },
      });

      return () => ScrollTrigger.killAll();
    }
  });

  return (
    <section ref={flavorRef} className="flavor-section relative overflow-hidden">
      {/* shop CTA removed */}
      <div className="flavor-scroll-inner h-full flex lg:flex-row flex-col relative">
        <div className="lg:w-[57%] flex-none h-80 lg:h-full lg:mt-[9%] xl:mt-0 lg:pb-50">
          <NutritionLayersTitle />
        </div>
        <div ref={slideRef} className="lg:pb-0 pb-8 slider-con">
          <NutritionLayersSlider />
        </div>
      </div>
    </section>
  );
};
