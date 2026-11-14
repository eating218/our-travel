"use client";

import type { ReactNode } from "react";

type TravelIconName = "itinerary" | "train" | "card" | "japanese" | "checklist" | "money" | "shopping" | "receipt" | "home" | "plane";

export default function TravelIcon({ name, size = 32, className = "" }: { name: TravelIconName; size?: number; className?: string }) {
  const ink = "#51443D";
  const shapes: Record<TravelIconName, ReactNode> = {
    itinerary: <><path d="M7 13 22 5l15 8v23H7z" fill="#F9E8C3"/><path d="M4 15 22 4l18 11M9 15v22h26V15"/><path d="M17 37V25h10v12" fill="#F2A497"/><path d="M11 18h6v6h-6zM28 18h6v6h-6z" fill="#A8D3E6"/><path d="M4 37h36"/><path d="M35 8c3-4 6-3 7 0-3 0-4 2-5 4" fill="#F2A497"/></>,
    train: <><rect x="8" y="6" width="28" height="30" rx="9" fill="#B9DAA5"/><rect x="12" y="13" width="20" height="12" rx="3" fill="#A8D3E6"/><path d="M16 8h12M12 29h20"/><circle cx="16" cy="30" r="2" fill="#F6D27A"/><circle cx="28" cy="30" r="2" fill="#F6D27A"/><path d="m14 36-4 5m20-5 4 5"/></>,
    card: <><rect x="5" y="11" width="34" height="24" rx="5" fill="#A8D3E6"/><path d="M5 18h34" strokeWidth="5"/><rect x="10" y="25" width="10" height="4" rx="2" fill="#FFF8E8" stroke="none"/><path d="M32 6c2 3 4 5 7 6-3 1-5 3-7 6-1-3-3-5-6-6 3-1 5-3 6-6Z" fill="#F2A497"/></>,
    japanese: <><path d="M5 11q9-5 17 1 8-6 17-1v26q-9-5-17 1-8-6-17-1z" fill="#FFF3E2"/><path d="M22 12v26"/><path d="M10 21h8m-4-4v11m-4 0h8M27 19h7m-7 6h7" stroke="#C87978"/><path d="m33 35 5-13 4 2-5 13-5 4z" fill="#F6D27A"/></>,
    checklist: <><rect x="9" y="7" width="27" height="34" rx="4" fill="#FFF4DE"/><path d="M17 7V5h11v2"/><path d="m14 18 3 3 5-6m-8 15 3 3 5-6" stroke="#80AB75"/><path d="M25 19h7m-7 11h7"/><path d="M36 33c2-4 4-4 6 0-3 1-4 3-4 5-2-2-3-3-6-4" fill="#F2A497"/></>,
    money: <><path d="M15 15 12 9l7 2 4-6 5 6 7-2-3 6c5 5 8 10 8 17 0 7-7 10-17 10S6 39 6 32c0-7 4-13 9-17Z" fill="#F6D27A"/><path d="M15 15h17M18 24h10m-5-4v16m-6-9 6 5 6-5"/><ellipse cx="36" cy="36" rx="6" ry="3" fill="#F8D995"/><path d="M30 36v5c2 4 10 4 12 0v-5" fill="#F8D995"/></>,
    shopping: <><path d="M9 16h27l-3 24H12z" fill="#F9D4CA"/><path d="M16 17v-5a7 7 0 0 1 14 0v5"/><path d="M19 28h8m-4-4v8" stroke="#A96B69"/><path d="M34 7c2-4 4-4 6 0-3 1-4 3-4 5-1-2-3-4-5-4" fill="#B9DAA5"/></>,
    receipt: <><path d="M11 5h23v35l-5-3-5 3-5-3-4 3-4-3z" fill="#FFF4DF"/><path d="M17 14h11m-11 7h11m-11 7h7"/><path d="M30 29c3-4 5-4 7 0-3 1-4 3-4 6-1-3-3-5-6-5" fill="#F2A497"/></>,
    home: <><path d="M5 21 22 6l17 15v19H5z" fill="#FFF0D1"/><path d="M3 22 22 5l19 17M10 20v19h24V20"/><path d="M18 39V27h9v12" fill="#B9DAA5"/><path d="M30 13c2-4 4-4 6 0" stroke="#C87978"/></>,
    plane: <><path d="m5 25 14 2 11-18c2-3 7-2 6 2l-6 20 8 5-2 4-13-3-10 4-3-4 8-8-13-1z" fill="#A8D3E6"/><path d="m5 25 14 2 11-18c2-3 7-2 6 2l-6 20 8 5-2 4-13-3-10 4-3-4 8-8-13-1z"/><path d="M8 12c2-3 4-3 6 0" stroke="#F2A497"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 46 46" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>{shapes[name]}</svg>;
}
