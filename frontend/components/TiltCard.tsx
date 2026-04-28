"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

interface ModernTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const ModernTiltCard = ({
  children,
  className = "",
  maxTilt = 10,
}: ModernTiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // smoother, premium motion
  const smoothX = useSpring(x, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 18 });

  // tilt
  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    [`${maxTilt}deg`, `-${maxTilt}deg`]
  );
  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    [`-${maxTilt}deg`, `${maxTilt}deg`]
  );

  // shadow movement
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);

  // light tracking
  const lightX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);

  const light = useMotionTemplate`
    radial-gradient(circle at ${lightX} ${lightY},
    rgba(255,255,255,0.25),
    transparent 60%)
  `;

  const borderGlow = useMotionTemplate`
    linear-gradient(
      120deg,
      rgba(255,255,255,0.4),
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.4)
    )
  `;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ perspective: "1400px" }}
      className={`relative ${className}`}
    >
      {/* Shadow */}
      <motion.div
        style={{
          x: shadowX,
          y: shadowY,
        }}
        className="absolute inset-0 rounded-3xl bg-black/40 blur-3xl"
      />

      {/* Card */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10"
      >
        {/* Noise texture (optional but 🔥) */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none bg-[url('/noise.png')]" />

        {/* Border glow */}
        <motion.div
          style={{ background: borderGlow }}
          className="absolute inset-0 opacity-20 blur-md pointer-events-none"
        />

        {/* Content layer (IMPORTANT for next/image) */}
        <div
          className="relative w-full h-full z-10"
          style={{
            transform: "translateZ(40px)",
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>

        {/* Soft depth colors */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: "translateZ(10px)",
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />
        </div>

        {/* Light */}
        <motion.div
          style={{ background: light }}
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
        />

        {/* Rim border */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl" />
      </motion.div>
    </div>
  );
};

export default ModernTiltCard;