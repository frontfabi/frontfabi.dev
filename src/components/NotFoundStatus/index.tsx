"use client";

import { useEffect, useState } from "react";

const statuses = [
  "STATUS: ERR_404_ROUTE_NULL · MEMORY: 12% · COFFEE: CRITICAL · RETRYING…",
  "STATUS: DNS_GHOST_PACKET · UPLINK: LOST · FALLBACK: ENABLED",
  "STATUS: SEMICOLON_MISSING · CHAOS: CONTAINED · REBOOT: NOT REQUIRED",
];

export default function NotFoundStatus() {
  const [status, setStatus] = useState(statuses[0]);

  useEffect(() => {
    setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
  }, []);

  return (
    <footer className="not-found-status" aria-label="Status do sistema">
      <span>{status}</span>
      <span aria-hidden="true">{status}</span>
    </footer>
  );
}
