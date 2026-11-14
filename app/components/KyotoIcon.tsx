"use client";

import type { ReactNode } from "react";

type IconName = "itinerary" | "train" | "card" | "japanese" | "checklist" | "money" | "home" | "receipt" | "suitcase";

export default function KyotoIcon({ name, size = 40 }: { name: IconName; size?: number }) {
  const common = { stroke: "#514037", strokeWidth: 2.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const blossom = <g><circle cx="43" cy="13" r="6" fill="#F6B9C5"/><circle cx="43" cy="13" r="2" fill="#FFF4CB"/></g>;
  const art: Record<IconName, ReactNode> = {
    itinerary: <><path d="M4 34h48" stroke="#B7CF9A" strokeWidth="4"/><path d="M10 31V18l18-11 18 11v13" fill="#FFE6C2" {...common}/><path d="M6 19 28 5l22 14" {...common}/><path d="M16 18h24M12 25h32M20 31V25h16v6" {...common}/><path d="M28 5v-3M16 13h24" {...common}/>{blossom}</>,
    train: <><rect x="10" y="6" width="36" height="36" rx="11" fill="#B8D9AC" {...common}/><rect x="16" y="13" width="24" height="15" rx="3" fill="#BFE6F4" {...common}/><path d="M18 33h2m16 0h2M19 42l-4 6m22-6 4 6" {...common}/><circle cx="19" cy="35" r="2" fill="#FFF4CB"/><circle cx="37" cy="35" r="2" fill="#FFF4CB"/></>,
    card: <><rect x="6" y="13" width="44" height="29" rx="5" fill="#D4EBF5" {...common}/><path d="M6 22h44" stroke="#5494B7" strokeWidth="7"/><path d="M14 34h11" {...common}/>{blossom}</>,
    japanese: <><path d="M7 10q11-4 21 2 10-6 21-2v32q-10-4-21 2-10-6-21-2z" fill="#FFF4F1" {...common}/><path d="M28 12v32M13 19h9m-9 6h9m12-6h9m-9 6h9" stroke="#E6A0AC" strokeWidth="2"/><path d="m37 37 11-16 4 3-11 16-6 2z" fill="#F6D27A" {...common}/></>,
    checklist: <><rect x="12" y="9" width="34" height="42" rx="5" fill="#FFF9EC" {...common}/><rect x="22" y="5" width="14" height="9" rx="3" fill="#F6D27A" {...common}/><path d="m18 23 3 3 5-6m-8 16 3 3 5-6M31 24h9M31 37h9" stroke="#87B77A" strokeWidth="2.7" fill="none"/>{blossom}</>,
    money: <><path d="M14 19q-8 12-8 21 0 12 22 12t22-12q0-9-8-21z" fill="#F6D27A" {...common}/><path d="M15 17 11 7l11 3 6-7 7 7 11-3-5 10z" fill="#FFE4A1" {...common}/><path d="M21 29h14m-7-7v19m-7-12 7 6 7-6" {...common}/></>,
    home: <><path d="M5 25 28 6l23 19M11 23v27h34V23M23 50V33h11v17" fill="#D8EBC9" {...common}/></>,
    receipt: <><path d="M12 5h32v46l-6-4-6 4-6-4-6 4-8-4z" fill="#FFF9EC" {...common}/><path d="M19 18h18m-18 9h18m-18 9h12" {...common}/></>,
    suitcase: <><rect x="8" y="16" width="40" height="35" rx="6" fill="#FFE2BC" {...common}/><path d="M20 16V9h16v7M18 16v35m20-35v35" {...common}/>{blossom}</>,
  };
  return <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true" className="inline-block shrink-0">{art[name]}</svg>;
}
