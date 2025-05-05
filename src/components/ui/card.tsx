import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Updated CardTitle to default to div, allow 'as' prop for custom tag
const CardTitle = React.forwardRef<
  HTMLHeadingElement, // Keep semantic ref type
  React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType } // Add 'as' prop
>(({ className, as: Component = 'div', ...props }, ref) => (
  <Component // Use the dynamic component type
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // Style remains
      className
    )}
    {...props} // Spread remaining props
  />
))
CardTitle.displayName = "CardTitle"

// Updated CardDescription to default to div, allow 'as' prop
const CardDescription = React.forwardRef<
  HTMLParagraphElement, // Keep semantic ref type
  React.HTMLAttributes<HTMLParagraphElement> & { as?: React.ElementType } // Add 'as' prop
>(({ className, as: Component = 'div', ...props }, ref) => (
  <Component // Use the dynamic component type
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)} // Style remains
    {...props} // Spread remaining props
  />
))
CardDescription.displayName = "CardDescription"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} /> // Removed pt-0
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
