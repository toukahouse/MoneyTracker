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
  speed = 25,
  ...props
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [duration, setDuration] = useState(8);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const overflowing = textWidth > containerWidth;
        setIsOverflowing(overflowing);
        if (overflowing) {
          // Duration based on text length so speed is consistent
          setDuration(Math.max(6, Math.round(textWidth / speed)));
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
        "overflow-hidden whitespace-nowrap min-w-0 max-w-full",
        isOverflowing && "mask-marquee-edges relative",
        className
      )}
      title={text}
      {...props}
    >
      <span
        ref={textRef}
        className={isOverflowing ? "sr-only" : "inline-block truncate max-w-full"}
      >
        {text}
      </span>

      {isOverflowing && (
        <div
          className="inline-flex animate-marquee-infinite will-change-transform"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="pr-8 inline-block">{text}</span>
          <span className="pr-8 inline-block" aria-hidden="true">
            {text}
          </span>
        </div>
      )}
    </div>
  );
}
