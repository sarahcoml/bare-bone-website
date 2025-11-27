"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const variants = {
    initial: { y: "-100vh", opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring" as const, bounce: 0.18, duration: 0.8 } },
    exit: { y: "100vh", opacity: 0, transition: { type: "tween" as const, duration: 0.6 } },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        style={{ minHeight: "100vh" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}