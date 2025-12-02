import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const variants = {
  default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_-3px_rgba(245,158,11,0.2)]",
  error: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_-3px_rgba(244,63,94,0.2)]",
};

const dotColors = {
  default: "bg-slate-400",
  neutral: "bg-slate-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-rose-400",
};

export function StatusBadge({ variant = "default", children, className, animate = false }: BadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300",
      variants[variant],
      className
    )}>
      <span className="relative flex h-2 w-2">
        {animate && (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[variant])}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[variant])} />
      </span>
      {children}
    </div>
  );
}
