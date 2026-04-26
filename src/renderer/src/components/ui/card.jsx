import { cn } from "@/lib/utils"

function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-maxify-card border border-maxify-border rounded-xl hover:border-maxify-primary transition group",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
