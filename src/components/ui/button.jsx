import * as React from "react";

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg";
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
      ghost: "hover:bg-gray-100 text-gray-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };
    
    const sizes = {
      sm: "h-9 px-3 text-sm",
      default: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-base",
    };
    
    return (
      <button
        className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
