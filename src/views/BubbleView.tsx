import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ServiceItem, HealthState, ServiceCategory } from "../types";
import { ServiceIcon } from "../components/ServiceIcon";
import { cn } from "../lib/utils";

interface BubbleViewProps {
  categories: ServiceCategory[];
  healthMap: Record<string, HealthState>;
  stats: Record<string, number>;
  onVisit: (href: string) => void;
}

// 螺旋坐标生成算法
const generateSpiralCoords = (n: number, spacing: number) => {
  const coords = [{ x: 0, y: 0 }];
  if (n <= 1) return coords;

  let angle = 0;
  let radius = 0;
  // 初始半径步长
  const a = spacing; 
  // 角度增量，控制螺旋紧密度
  const b = spacing / (2 * Math.PI);

  // 使用阿基米德螺旋线近似，或者更简单的：层级圆环布局
  // 为了实现蜂窝状紧密堆积，我们可以使用 hex grid 坐标系
  
  // 简易版：同心圆环布局，每圈数量增加
  let count = 1;
  let ring = 1;
  while (count < n) {
    const itemsInRing = Math.floor(2 * Math.PI * (ring * spacing) / spacing); // 近似周长/直径
    const actualItems = Math.min(itemsInRing, n - count);
    
    for (let i = 0; i < actualItems; i++) {
      const theta = (i / actualItems) * 2 * Math.PI;
      // 添加一些随机扰动或者旋转偏移让看起来更自然
      const offsetTheta = (ring % 2) * (Math.PI / actualItems); 
      
      coords.push({
        x: Math.cos(theta + offsetTheta) * (ring * spacing),
        y: Math.sin(theta + offsetTheta) * (ring * spacing)
      });
    }
    count += actualItems;
    ring++;
  }
  
  return coords;
};

export function BubbleView({ categories, stats, onVisit }: BubbleViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 1. 扁平化所有服务并按点击量排序
  const sortedServices = useMemo(() => {
    const all = categories.flatMap(c => c.services);
    return all.sort((a, b) => {
      const scoreA = stats[a.href] || 0;
      const scoreB = stats[b.href] || 0;
      return scoreB - scoreA; // 降序
    });
  }, [categories, stats]);

  // 2. 生成坐标
  const coords = useMemo(() => {
    // 基础间距，根据图标大小调整
    return generateSpiralCoords(sortedServices.length, 140);
  }, [sortedServices.length]);

  // 计算中心位置偏移，让整个图居中
  // 由于是围绕 (0,0) 生成的，直接放在容器中心即可

  return (
    <div className="relative w-full h-[80vh] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-none">
      <motion.div 
        className="relative flex items-center justify-center"
        drag
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {sortedServices.map((service, index) => {
          const coord = coords[index] || { x: 0, y: 0 };
          const visits = stats[service.href] || 0;
          
          // 越中间（index越小）越大，但也受点击量影响
          // 基础大小
          let size = 100; 
          let zIndex = 50 - index;
          let opacity = 1;

          // 前三名特别大
          if (index === 0) size = 160;
          else if (index < 7) size = 130;
          else if (index < 19) size = 110;
          else size = 90;

          const isHovered = hovered === service.href;
          
          return (
            <motion.a
              key={service.href}
              href={service.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => onVisit(service.href)}
              onMouseEnter={() => setHovered(service.href)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "absolute flex items-center justify-center rounded-full shadow-2xl border border-white/10 backdrop-blur-md transition-colors duration-300",
                "bg-gradient-to-br from-white/10 to-white/5 hover:from-sky-500/20 hover:to-purple-500/20 hover:border-sky-500/50"
              )}
              style={{
                x: coord.x,
                y: coord.y,
                width: size,
                height: size,
                zIndex: isHovered ? 100 : zIndex,
              }}
              whileHover={{ scale: 1.2, zIndex: 100 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                delay: index * 0.02 
              }}
            >
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <ServiceIcon icon={service.icon} className={cn("w-1/2 h-1/2 drop-shadow-lg", index === 0 ? "w-20 h-20" : "")} />
                
                {/* 只在较大的图标或悬停时显示名称 */}
                {(index < 7 || isHovered) && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-medium text-white/90 truncate max-w-full px-2 bg-black/20 rounded-full backdrop-blur-sm"
                  >
                    {service.name}
                  </motion.span>
                )}
              </div>
            </motion.a>
          );
        })}
      </motion.div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-sm pointer-events-none">
        拖拽画布 • 滚轮缩放
      </div>
    </div>
  );
}
