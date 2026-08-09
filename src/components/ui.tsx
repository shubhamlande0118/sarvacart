import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, type ReactNode } from "react";
import { cn } from "../utils/cn";

/* ----------------------------- Scroll reveal ----------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- Page transition ---------------------------- */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("min-h-[70vh]", className)}
    >
      {children}
    </motion.main>
  );
}

/* -------------------------------- Parallax -------------------------------- */
export function Parallax({
  children,
  amount = 60,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* --------------------------------- Button --------------------------------- */
type ButtonProps = {
  children: ReactNode;
  variant?: "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  to?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  full?: boolean;
};

export function Button({
  children,
  variant = "gold",
  size = "md",
  className,
  to,
  type = "button",
  disabled,
  onClick,
  full,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-sm",
  };
  const variants = {
    gold: "bg-gradient-to-r from-[#e8cf8f] via-[#d4af37] to-[#b8860b] text-black hover:shadow-[0_0_30px_-4px_rgba(212,175,55,0.6)] hover:-translate-y-0.5",
    outline:
      "border border-gold/40 text-gold-soft hover:border-gold hover:bg-gold/10 hover:-translate-y-0.5",
    ghost: "text-zinc-300 hover:text-gold-soft",
    dark: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:-translate-y-0.5",
  };
  const cls = cn(base, sizes[size], variants[variant], full && "w-full", className);

  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* --------------------------------- Badge ---------------------------------- */
export function StockBadge({ stock }: { stock: number }) {
  const out = stock <= 0;
  const low = stock > 0 && stock <= 5;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        out
          ? "bg-red-500/15 text-red-400"
          : low
          ? "bg-amber-500/15 text-amber-300"
          : "bg-emerald-500/15 text-emerald-300"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          out ? "bg-red-400" : low ? "bg-amber-300" : "bg-emerald-300"
        )}
      />
      {out ? "Out of stock" : low ? `Only ${stock} left` : "In stock"}
    </span>
  );
}

/* ------------------------------ Section title ----------------------------- */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-soft">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-zinc-400">{subtitle}</p>}
    </div>
  );
}
