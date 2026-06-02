import { Comfortaa } from "next/font/google";
import { cn } from "@/lib/utils";

// next/font/google works fine in your local dev + Vercel
// only avoid it in the Claude build environment
const comfortaa = Comfortaa({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

type LogoProps = {
    className?: string;
    size?: "sm" | "md" | "lg";
};

const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
};

export function Logo({ className, size = "md" }: LogoProps) {
    return (
        <span
            className={cn(
                comfortaa.className,
                "inline-block font-light tracking-tight text-foreground select-none",
                sizes[size],
                className
            )}
            
        >
            bloqk
            <span className="text-blue-500 select-none">.</span>
        </span>
    );
}
