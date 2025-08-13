"use client";
import { TypewriterEffectSmooth } from "../components/ui/TypewriterEffect";
export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Hacemos",
    },
    {
      text: "ingeniería",
    },
    {
      text: "para",
    },
    {
      text: "un",
    },
      {
      text: "mundo",
    },
      {
      text: "más",
    },
    {
      text: "inteligente.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <span >
    
      <TypewriterEffectSmooth words={words} />
 
    </span>
  );
}
