import { FC, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "./icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent Hydration Mismatch
  if (!isMounted) return <div className="w-6 h-6" />;

  return (
    <button
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      onClick={onChange}
      className={clsx(
        "px-px transition-opacity hover:opacity-80 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      {theme === "light" ? (
        <MoonFilledIcon size={22} />
      ) : (
        <SunFilledIcon size={22} />
      )}
    </button>
  );
};
