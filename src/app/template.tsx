"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A single short fade-and-rise on route change. Templates remount per
 * navigation, which is exactly the hook this needs. Kept at 220ms with no
 * spring so navigation still feels instant rather than bouncy.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
