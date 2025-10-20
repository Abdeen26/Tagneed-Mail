"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

const Title = ({
  title = "Enter Title Here",
  linkAvailable = false,
  linkTitle = "Enter Link Title",
  href = "/",
  children,
}) => {
  const { data: session, status } = useSession();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-5xl text-center pb-4 pt-4 md:pt-8 md:px-8 px-4 font-semibold w-full"
    >
      {title}
      {linkAvailable && session && status === "authenticated" && (
        <div className="font-medium text-2xl p-4 flex items-center justify-center w-full">
          <Link
            href={href}
            className="bg-white text-maincolor rounded-xl border-2 border-maincolor py-3 px-6 hover:scale-105 hover:drop-shadow-md transition duration-300"
          >
            {linkTitle}
          </Link>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Title;
