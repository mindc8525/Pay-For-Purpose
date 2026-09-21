import * as React from "react";

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 border-b border-gray-100 ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 border-t border-gray-100 ${className}`} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
