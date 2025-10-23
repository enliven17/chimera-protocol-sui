import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-[#eab308]", sizeClasses[size])} />
      {text && <span className="text-gray-400 text-sm">{text}</span>}
    </div>
  );
}

export function LoadingCard({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border border-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-center space-x-3">
        <LoadingSpinner size="md" />
        <div>
          {title && <h3 className="text-white font-medium">{title}</h3>}
          {description && <p className="text-gray-400 text-sm">{description}</p>}
        </div>
      </div>
    </div>
  );
}