import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchBar = ({ value, onChange, className }: SearchBarProps) => {
  return (
    <div className={cn("relative group max-w-md w-full mx-auto", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-white/40 group-focus-within:text-sky-400 transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索服务..."
          className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-12 pr-12 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all duration-300 focus:border-sky-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-sky-500/10"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
