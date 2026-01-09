"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsOpen(false); // Close menu after navigation
  };

  const menuItems = [
    { label: "Servicios", section: "servicios" },
    { label: "Nosotros", section: "nosotros" },
    { label: "Testimonios", section: "testimonios" },
    { label: "FAQ", section: "faq" },
    { label: "Contacto", section: "contacto" },
  ];

  return (
    <>
      {/* Fixed Header with Hamburger Button Only */}
      <div className="fixed top-4 right-4 z-[100]">
        <div className="flex items-center justify-end">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-10 h-10 flex flex-col justify-center items-center bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-300 shadow-lg border border-gray-200 dark:border-white/[0.2]"
          >
            {/* Hamburger Lines */}
            <motion.span
              className="block w-6 h-0.5 bg-black dark:bg-white rounded-full absolute"
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 0 : -4,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-black dark:bg-white rounded-full absolute"
              animate={{
                opacity: isOpen ? 0 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-black dark:bg-white rounded-full absolute"
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? 0 : 4,
              }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 border-l border-gray-200 dark:border-gray-700/50 z-[95] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Menu Content */}
            <div className="flex flex-col h-full pt-20 px-6">
              {/* Tech Lines Decoration */}
              <div className="absolute top-6 right-6 opacity-30">
                <div className="w-16 h-px bg-gradient-to-r from-gray-400 to-gray-600 dark:from-blue-400 dark:to-cyan-400 mb-1"></div>
                <div className="w-12 h-px bg-gradient-to-r from-gray-400 to-gray-600 dark:from-blue-400 dark:to-cyan-400 mb-1 ml-4"></div>
                <div className="w-8 h-px bg-gradient-to-r from-gray-400 to-gray-600 dark:from-blue-400 dark:to-cyan-400 ml-8"></div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1">
                <ul className="space-y-4">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.section}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <button
                        onClick={() => scrollToSection(item.section)}
                        className="group relative w-full text-left py-3 px-6 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-300/50 dark:border-gray-600/30 hover:border-gray-400 dark:hover:border-blue-400/50 transition-all duration-300 hover:scale-105"
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-300/0 via-gray-400/10 to-gray-300/0 dark:from-blue-400/0 dark:via-cyan-400/5 dark:to-blue-400/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Text */}
                        <span className="relative z-10 text-lg font-medium text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                          {item.label}
                        </span>
                        
                        {/* Arrow */}
                        <motion.div
                          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-blue-400"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer Section */}
              <motion.div
                className="mt-auto pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <Image
                    src="/ijac-logo.png"
                    alt="IJAC Logo"
                    width={50}
                    height={50}
                    className="hover:scale-110 transition-transform duration-300"
                    priority
                  />
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4 mb-6">
                  <a
                    href="https://www.instagram.com/ijacsi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/ijacsolucionesinformaticas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>

                {/* Company Info */}
                <div className="text-center text-gray-400 text-sm">
                  <p className="mb-1">iJAC IT Solutions</p>
                  <p>Almagro, Buenos Aires</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
