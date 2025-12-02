import { useEffect, useState } from "react";

export const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-8 gap-6">
      <div className="text-center md:text-left group cursor-default">
        <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 tracking-tighter font-mono transition-all duration-500 group-hover:tracking-widest">
          {formatTime(time)}
        </div>
        <div className="mt-2 text-lg md:text-xl text-sky-200/60 font-medium uppercase tracking-[0.2em] ml-2 transition-all duration-500 group-hover:text-sky-200">
          {formatDate(time)}
        </div>
      </div>
    </header>
  );
};
