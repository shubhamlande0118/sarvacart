import { cn } from "../utils/cn";
import logo from "../assets/logo.png";

export default function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src={logo}
        alt="SarvaCart"
        className={cn("h-9 w-9 rounded-xl object-contain", imgClassName)}
      />
      <span className="font-serif text-2xl font-bold tracking-wide text-[#1d1a17]">
        Sarva<span className="text-gradient-gold">Cart</span>
      </span>
    </span>
  );
}
