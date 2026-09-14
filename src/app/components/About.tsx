"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { OurStaff } from "./OurStaff";
import { aboutContent } from "@/i18n/home/about";
import type { Locale } from "@/i18n/routing";

// Move the hook outside the component
function useCountAnimation(target: number, duration: number = 2000) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * target);
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// Create a separate component for the counter
function CounterDisplay({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useCountAnimation(target);
  return <>{count}{suffix}</>;
}

// Custom hook for scroll-triggered fade-in effect
const useScrollFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return { ref, isVisible };
};

export function About({ locale = "es" }: { locale?: Locale }) {
  const { ref } = useScrollFadeIn();
  const content = aboutContent[locale];

  const stats = [
    {
      numericValue: 150,
      suffix: "+",
      label: content.stats.projectsCompleted,
      color: "text-blue-600"
    },
    {
      numericValue: 100,
      suffix: "%",
      label: content.stats.clientSatisfaction,
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-heading"
          >
            {content.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            {content.subheading}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <HeroHighlight containerClassName="w-full md:w-[100%] h-56 md:h-72 rounded-2xl border border-gray-200 dark:border-gray-700">
                <p className=" w-[90%] mx-auto text-center text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.highlightPrefix}
                <Highlight className="text-black dark:text-white p-1 md:p-2">{content.highlightedName}</Highlight>
                {content.highlightSuffix}
              </p>
            </HeroHighlight>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center">
              {content.followUp}
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    <CounterDisplay target={stat.numericValue} suffix={stat.suffix} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4 font-heading">{content.missionTitle}</h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                {content.missionBody}
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="font-semibold">{content.innovationTitle}</p>
                  <p className="text-blue-200 text-sm">{content.innovationSubtitle}</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl transform rotate-3 -z-10"></div>
          </motion.div>
        </div>
          <OurStaff locale={locale} />
      </div>

    </section>
  );
}
