"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarIjac() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 inset-x-0 max-w-xl mx-auto z-[100]",
        className
      )}
    >
      <Menu>
        <div className="flex flex-row items-center gap-2">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center mr-4">
              <Image
                src="/ijac-logo.png"
                alt="IJAC Logo"
                width={40}
                height={40}
                className="hover:scale-110 transition-transform duration-300"
                priority
              />
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-row gap-x-2 justify-center items-center">
            <MenuItem
              item="Servicios"
              onClick={() => scrollToSection("servicios")}
            />
            <MenuItem
              item="Nosotros"
              onClick={() => scrollToSection("nosotros")}
            />
            <MenuItem
              item="Testimonios"
              onClick={() => scrollToSection("testimonios")}
            />
            <MenuItem
              item="FAQ"
              onClick={() => scrollToSection("faq")}
            />
            <MenuItem
              item="Contacto"
              onClick={() => scrollToSection("contacto")}
            />
          </div>
        </div>
      </Menu>
    </div>
  );
}
