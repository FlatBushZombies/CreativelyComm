import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-base" },
    md: { icon: "h-8 w-8", text: "text-lg" },
    lg: { icon: "h-10 w-10", text: "text-xl" },
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold",
          sizes[size].icon,
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        CC
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", sizes[size].text)}>
          Creatively<span className="text-primary">Comm</span>
        </span>
      )}
    </Link>
  );
}
