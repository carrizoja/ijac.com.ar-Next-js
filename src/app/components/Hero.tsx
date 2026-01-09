"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { HeroHighlight } from "./ui/hero-highlight";
import { TypewriterEffectSmoothDemo } from "./TypeWriterEffectSmooth";
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
        className="mt-4 md:mt-16 mb-8 md:mb-16 text-md px-4 md:text-3xl lg:text-4xl font-heading font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto overflow-hidden"
      >
        Soluciones Informáticas y Desarrollo Web
      </motion.h1>
      <motion.div className="mb-8 md:mb-16">
        {/* Logo */}
        <motion.div
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
          className="flex justify-center mb-3 md:mb-4"
        >
          <Image
            src="/ijac-logo.png"
            alt="iJAC IT Solutions Logo"
            width={100}
            height={100}
            className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
            priority={true}
          />
        </motion.div>
        <motion.h2
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
            delay: 0.1,
          }}
          className="text-sm px-4 md:text-xl lg:text-2xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto overflow-hidden"
          style={{ fontFamily: "SphereFez, sans-serif" }}
        >
          iJac IT Solutions
        </motion.h2>
      </motion.div>

      <TypewriterEffectSmoothDemo />
      <motion.div className="mt-8 md:mt-12">
          <PrimaryButton text="Contactanos" colorVariant="purple" />
      </motion.div>
    
    </HeroHighlight>
  );
}
