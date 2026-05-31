"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";

export default function SafeResponsiveChart({ height = 280, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ width: "100%", height, minHeight: height }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
