import * as React from "react";

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg";
    
    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow",
      outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
      secondary: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs font-semibold",
      ghost: "hover:bg-slate-100 text-slate-700",
      destructive: "bg-rose-600 text-white hover:bg-rose-700",
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
