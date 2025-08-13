"use client";
import React from "react";
import { motion } from "framer-motion";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  item,
  onClick,
}: {
  item: string;
  onClick?: () => void;
}) => {
  return (
    <motion.div className="relative" whileHover="hover">
      <p 
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
        onClick={onClick}
      >
        {item}
      </p>
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 w-full bg-green-500"
        initial={{ scaleX: 0 }}
        variants={{
          hover: {
            scaleX: 1,
            transition: { duration: 0.3 },
          },
        }}
        style={{ transformOrigin: "center" }}
      />
    </motion.div>
  );
};

export const Menu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <nav
      className="relative rounded-xl border border-transparent dark:bg-neutral-900 dark:border-white/[0.2] bg-gray-50 shadow-input flex justify-center items-center space-x-2 px-4 py-4 mx-auto w-4/5"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};
