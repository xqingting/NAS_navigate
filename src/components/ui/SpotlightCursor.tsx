import { useEffect } from "react";
import { useMotionValue, useSpring, motion, useMotionTemplate } from "framer-motion";

export const SpotlightCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 平滑的弹簧物理效果
  const springX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{
        background: useMotionTemplate`radial-gradient(
          600px circle at ${springX}px ${springY}px,
          rgba(255, 255, 255, 0.03),
          transparent 40%
        )`,
      }}
    />
  );
};
