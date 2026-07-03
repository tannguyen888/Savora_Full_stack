import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

// Assign depth to routes: 0 = tab root, 1 = detail, 2 = edit
function getDepth(pathname) {
  if (pathname === "/" || pathname === "/meal-plan" || pathname === "/settings") return 0;
  if (pathname.startsWith("/recipe/") && pathname.endsWith("/edit")) return 2;
  if (pathname === "/recipe/new") return 1;
  if (pathname.startsWith("/recipe/")) return 1;
  return 0;
}

export default function PageTransition({ children }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const prevDepth = getDepth(prevPathRef.current);
  const currDepth = getDepth(location.pathname);

  // direction: 1 = push (slide left), -1 = pop (slide right)
  const direction = currDepth >= prevDepth ? 1 : -1;
  prevPathRef.current = location.pathname;

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          initial={(dir) => ({ x: dir > 0 ? "100%" : "-25%", opacity: dir > 0 ? 0.8 : 1 })}
          animate={{ x: 0, opacity: 1 }}
          exit={(dir) => ({ x: dir > 0 ? "-25%" : "100%", opacity: dir > 0 ? 1 : 0.8 })}
          transition={{
            x: { type: "spring", stiffness: 350, damping: 36, mass: 0.9 },
            opacity: { duration: 0.18 },
          }}
          style={{ willChange: "transform" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}