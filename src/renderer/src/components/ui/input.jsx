import React from 'react'
import { cn } from "@/lib/utils"

function Input({ type, defaultValue, onChange, className, placeholder, ...props }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      onChange={onChange}
      className={cn(
        "w-full bg-maxify-card border border-maxify-border rounded-lg px-3 py-2 text-maxify-text",
        "focus:ring-0 focus:outline-hidden focus:border-maxify-primary transition-colors",
        className
      )}
      placeholder={placeholder}
      {...props}
    />
  )
}


function LargeInput({ placeholder, value, onChange, icon: Icon, className, ...props }) {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-maxify-card border border-maxify-border",
      "rounded-xl px-4 backdrop-blur-xs transition-colors",
      "focus-within:border-maxify-primary",
      className
    )}>
      {Icon && <Icon className="w-5 h-5 text-maxify-text-secondary" />}
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full py-3 px-0 bg-transparent border-none",
          "focus:outline-hidden focus:ring-0 text-maxify-text",
          "placeholder:text-maxify-text-secondary"
        )}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}

export { Input, LargeInput }

