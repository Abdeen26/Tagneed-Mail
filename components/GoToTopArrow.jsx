"use client";
import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function GoToTopArrow() {
  const [showArrow, setShowArrow] = useState(false);

  const checkScrollTop = () => {
    if (!showArrow && window.pageYOffset > 300) {
      setShowArrow(true);
    } else if (showArrow && window.pageYOffset <= 300) {
      setShowArrow(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showArrow]);
  return (
    showArrow && (
      <AnimatePresence>
        <motion.div
          className="fixed bottom-10 right-10 z-20 cursor-pointer hover:drop-shadow-md w-auto h-auto overflow-hidden p-3 rounded-full bg-gradient-to-br from-maincolor to-secondcolor text-white transition-opacity duration-300"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "tween",
            duration: 0.5,
          }}
          exit={{ opacity: 0, y: 100 }}
        >
          <FaArrowUp size={20} />
        </motion.div>
      </AnimatePresence>
    )
  );
}
