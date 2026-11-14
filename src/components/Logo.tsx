import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "ink" shows the logo in its own navy; "light" turns it white for photos and dark bands. */
  tone?: "ink" | "light";
  className?: string;
}

/** The Table LK "Smart Tables" logo. */
const Logo: React.FC<LogoProps> = ({ tone = "ink", className }) => (
  <img
    src="/lovable-uploads/188afeac-f211-4f16-bbfa-8018bbc74324.png"
    alt="Table LK Smart Tables"
    width={672}
    height={173}
    className={cn(
      "h-9 w-auto select-none object-contain transition-[filter] duration-300 md:h-10",
      tone === "light" && "brightness-0 invert",
      className,
    )}
    draggable={false}
  />
);

export default Logo;
