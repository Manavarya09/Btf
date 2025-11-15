"use client";

import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger, ScrollSmoother } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { MessageSection } from "./MessageSection";
import { BenefitSection } from "./BenefitSection";
import { BottomBanner } from "./BottomBanner";
import { FooterSection } from "./FooterSection";
import { PreLoader } from "./PreLoader";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export const LandingPage: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  useGSAP(() => {
    if (loaded && !ScrollSmoother.get()) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
      });
      ScrollTrigger.refresh();
    }
  }, [loaded]);

  return (
    <main>
      {!loaded && <PreLoader onComplete={() => setLoaded(true)} />}

      {loaded && (
        <>
          <Navbar />
          <div id="smooth-wrapper">
            <div id="smooth-content">
              <HeroSection />
              <MessageSection />
              <div>
                <BenefitSection />
              </div>
              <BottomBanner />
              <FooterSection />
            </div>
          </div>
        </>
      )}
    </main>
  );
};
