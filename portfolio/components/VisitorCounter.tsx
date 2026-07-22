"use client";

import { useEffect, useRef, useState } from "react";

// Public by design — this is called directly from the browser, so there's
// nothing to gain by hiding it behind an env var.
const VISITOR_API_URL =
  "https://danh682p26.execute-api.ap-south-1.amazonaws.com/prod/visitorcountapi";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(VISITOR_API_URL)
      .then((res) => res.text())
      .then((text) => {
        const n = Number(text);
        if (Number.isFinite(n)) setCount(n);
      })
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-paper-dim">
      <span className="h-1.5 w-1.5 rounded-full bg-amber" />
      Visitors <span className="text-amber">{String(count).padStart(3, "0")}</span>
    </span>
  );
}
