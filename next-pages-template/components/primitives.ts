export const title = (color: string = "foreground", size: string = "md", fullWidth: boolean = false) => {
  const baseClasses = "tracking-tight inline font-semibold";
  const sizeClasses = {
    sm: "text-3xl lg:text-4xl",
    md: "text-[2.3rem] lg:text-5xl leading-9",
    lg: "text-4xl lg:text-6xl",
  };
  const colorClasses = {
    violet: "from-[#FF1CF7] to-[#b249f8]",
    yellow: "from-[#FF705B] to-[#FFB457]",
    blue: "from-[#5EA2EF] to-[#0072F5]",
    cyan: "from-[#00b7fa] to-[#01cfea]",
    green: "from-[#6FEE8D] to-[#17c964]",
    pink: "from-[#FF72E1] to-[#F54C7A]",
    foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]",
  };
  const fullWidthClass = fullWidth ? "w-full block" : "";
  
  const classes = [
    baseClasses,
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
    fullWidthClass,
    colorClasses[color as keyof typeof colorClasses] || colorClasses.foreground,
    "bg-clip-text text-transparent bg-gradient-to-b"
  ].filter(Boolean).join(" ");
  
  return classes;
};

export const subtitle = (fullWidth: boolean = true) => {
  const baseClasses = "w-full md:w-1/2 my-2 text-lg lg:text-xl text-gray-600 block max-w-full";
  const fullWidthClass = fullWidth ? "!w-full" : "";
  
  return [baseClasses, fullWidthClass].filter(Boolean).join(" ");
};
