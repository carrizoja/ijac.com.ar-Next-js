"use client";
import { TypewriterEffectSmooth } from "../components/ui/TypewriterEffect";
export function TypewriterEffectSmoothDemo({ words }: { words: readonly string[] }) {
  const styledWords = words.map((text, index) => ({
    text,
    className: index === words.length - 1 ? "text-blue-500 dark:text-blue-500" : undefined,
  }));
  return (
    <span >
    
      <TypewriterEffectSmooth words={styledWords} />
 
    </span>
  );
}
