"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      className={cn(
        "relative overflow-hidden rounded-lg bg-gray-100",
        className
      )}
      {...(props as any)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </MotionDiv>
  );
}

export { Skeleton };
