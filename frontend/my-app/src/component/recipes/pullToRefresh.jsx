import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, THRESHOLD], [0, 360]);
  const opacity = useTransform(y, [0, THRESHOLD * 0.4, THRESHOLD], [0, 0.6, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      // Apply rubber-band resistance
      const resistance = Math.min(delta * 0.45, THRESHOLD * 1.1);
      y.set(resistance);
    }
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (y.get() >= THRESHOLD * 0.85) {
      setRefreshing(true);
      await animate(y, THRESHOLD * 0.6, { type: "spring", stiffness: 300, damping: 30 });
      await onRefresh();
      setRefreshing(false);
    }
    animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
  }, [y, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ height: y, opacity }}
        className="flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ rotate, scale }}>
          <RefreshCw
            className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`}
          />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
}