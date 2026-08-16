import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const iconPixelSize = { sm: 28, md: 32, lg: 40 };

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-base" },
    md: { icon: "h-8 w-8", text: "text-lg" },
    lg: { icon: "h-10 w-10", text: "text-xl" },
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative shrink-0", sizes[size].icon)}>
        <Image
          src="/logo.png"
          alt="CreativelyComm"
          fill
          className="object-contain"
          sizes={`${iconPixelSize[size]}px`}
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-display font-medium tracking-tight", sizes[size].text)}>
          Creatively<span className="text-primary">Comm</span>
        </span>
      )}
    </Link>
  );
}
