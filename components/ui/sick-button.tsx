import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface SickButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "text" | "danger";
  icon: ReactNode;
  children: ReactNode;
}

export const SickButton: React.FC<SickButtonProps> = ({
  variant = "text",
  icon,
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "p-1.5 bg-transparent rounded-none transition-colors duration-150 flex items-center justify-center " +
    "border-t-2 border-l-2 border-r-2 border-b-2 border-t-[#222222] border-l-[#222222] border-r-black border-b-black cursor-pointer";

  const variantStyles = {
    text: "text-[#888888] hover:text-[#ffffff]",
    danger: "text-[#555555] hover:text-[#ff4444]",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon} {children}
    </button>
  );
};
