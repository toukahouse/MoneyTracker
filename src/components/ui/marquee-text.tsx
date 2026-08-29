"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  className?: string;
  speed?: number; // pixels per second
}

export function MarqueeText({
  text,
  className,
  speed = 28,
  ...props
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [duration, setDuration] = useState(6);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const diff = textWidth - containerWidth;
        const overflowing = diff > 0;
        setIsOverflowing(overflowing);
        if (overflowing) {
          const overflowDistance = diff + 8; // Extra padding so the final letters are fully clear
          setOffset(overflowDistance);
          const moveDuration = overflowDistance / speed;
          // Allocate time: 25% start pause + 50% move + 17% end pause + 8% reset
          setDuration(Math.max(4.5, Math.round((moveDuration * 2) + 2)));
        } else {
          setOffset(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    const timeout = setTimeout(checkOverflow, 150);

    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeout);
    };
  }, [text, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden whitespace-nowrap min-w-0 max-w-full relative",
        className
      )}
      title={text}
      {...props}
    >
      <span
        ref={textRef}
        className={cn(
          "inline-block max-w-full",
          isOverflowing ? "animate-marquee-scroll will-change-transform" : "truncate"
        )}
        style={
          isOverflowing
            ? ({
                "--marquee-offset": `-${offset}px`,
                animationDuration: `${duration}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
}
