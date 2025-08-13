"use client";
import { motion } from "motion/react";
import { HeroHighlight} from "./ui/hero-highlight";
import { TypewriterEffectSmoothDemo } from './TypeWriterEffectSmooth';
import { PrimaryButton } from "./ui/PrimaryButton";

export function Hero() {
  return (
    <HeroHighlight>
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
      >
        iJAC IT Solutions
      </motion.h1>
        <TypewriterEffectSmoothDemo />
        <PrimaryButton text="Contactanos" colorVariant="purple" />
    </HeroHighlight>
  );
}
