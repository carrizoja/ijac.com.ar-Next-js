"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";
import {
  getHomeSectionHref,
  getHomeSectionId,
  getLocaleFromPath,
  getNavHref,
  isHomeSectionAvailable,
  localizePath,
  type HomeSection,
} from "@/i18n/routing";
import { getContactNavLink, navigationContent } from "@/i18n/chrome/navigation";

export function NavbarIjac() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const copy = navigationContent[locale];
  const homePath = localizePath("/", locale);
  const contactLink = getContactNavLink(locale);

  // Function to handle smooth scrolling to sections
  const scrollToSection = (section: HomeSection) => {
    const sectionId = getHomeSectionId(section, locale);
    if (!sectionId) return;

    if (pathname !== homePath) {
      window.location.assign(getHomeSectionHref(section, locale) ?? homePath);
      return;
    }

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
        "fixed top-4 inset-x-0 max-w-2xl mx-auto z-[100]",
        className
      )}
    >
      <Menu>
        <div className="flex flex-row items-center gap-2">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href={homePath} title={copy.logoTitle} className="flex items-center mr-4">
              <Image
                src="/ijac-logo.png"
                alt="IJAC Logo"
                title="IJAC IT Solutions Logo"
                width={320}
                height={315}
                className="w-10 h-auto hover:scale-110 transition-transform duration-300"
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-row gap-x-2 justify-center items-center">
            <MenuItem
              item={copy.servicesLabel}
              href={getNavHref("services", "/services", locale)}
            />
            {isHomeSectionAvailable("about", locale) && (
              <MenuItem
                item={copy.aboutLabel}
                href={getHomeSectionHref("about", locale)}
                onClick={() => scrollToSection("about")}
              />
            )}
            {isHomeSectionAvailable("testimonials", locale) && (
              <MenuItem
                item={copy.testimonialsLabel}
                href={getHomeSectionHref("testimonials", locale)}
                onClick={() => scrollToSection("testimonials")}
              />
            )}
            <MenuItem
              item={copy.contactLabel}
              href={contactLink.href}
              external={contactLink.external}
            />
          </div>
          <LanguageToggle />
        </div>
      </Menu>
    </div>
  );
}
