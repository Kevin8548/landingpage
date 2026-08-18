import React from "react";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";
type IconPosition = "left" | "right";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-light-green-primary/0 border border-light-green-primary text-white hover:bg-dark-green-secondary shadow-sm",

  secondary:
    "bg-amber border border-amber text-black hover:bg-amber hover:text-black shadow-sm",
  
  outline:
    "bg-transparent border border-white text-white hover:bg-white hover:text-black shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full font-semibold transition-colors duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="inline-flex">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="inline-flex">{icon}</span>}
    </button>
  );
}