import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px]">
          About Me
        </p>

        <AnimatedTitle
          title="Designing and buil<b>d</b>ing immersive <br /> inter<b>a</b>ctive web experien<b>c</b>es"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p>Hi, I’m Aryan — a front‑end developer focused on motion, 3D, and delightful UX.</p>
          <p className="text-gray-500">
            I craft fast, accessible interfaces with React, GSAP, and Tailwind, blending
            performant code with expressive visuals to tell compelling stories on the web.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.webp"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
