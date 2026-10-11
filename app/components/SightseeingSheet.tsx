"use client";

import { TripItem } from "../../data/tripData";

type Props = {
  item: TripItem | null;
  onClose: () => void;
};

export default function SightseeingSheet({
  item,
  onClose,
}: Props) {
  if (!item || !item.guide) {
    return null;
  }

  const mapUrl = item.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.location.mapQuery
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50">

      {/* 黑色背景 */}
      <button
        aria-label="關閉景點介紹"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* Bottom Sheet */}
      <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[88vh] max-w-md overflow-y-auto rounded-t-[32px] bg-[#fffdfa]">

        {/* 拖曳提示 */}
        <div className="sticky top-0 z-10 bg-[#fffdfa] pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="p-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-emerald-700 px-2 py-1 text-[9px] font-bold tracking-widest text-emerald-700">
                  SIGHTSEEING
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  ◷ {item.endTime
                      ? `${item.startTime} - ${item.endTime}`
                      : item.startTime}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {item.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500"
            >
              ×
            </button>
          </div>

          {/* Address */}
          {item.location?.address && (
            <div className="mt-4 flex gap-2 text-sm text-slate-500">
              <span>⌖</span>

              <p>{item.location.address}</p>
            </div>
          )}

          <div className="my-6 h-px bg-slate-200" />

          {/* Introduction */}
          <GuideSection
            title="關於這裡"
            icon="◉"
            text={item.guide.introduction}
          />

          <GuideSection
            title="值得注意"
            icon="✦"
            text={item.guide.highlights}
          />

          <GuideSection
            title="小故事"
            icon="📖"
            text={item.guide.story}
          />

          <GuideSection
            title="推薦"
            icon="💡"
            text={item.guide.tips}
          />

          {/* Google Maps */}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-800 text-sm font-bold text-white"
            >
              ◇　Google Maps 導航
            </a>
          )}

        </div>
      </section>
    </div>
  );
}

function GuideSection({
  title,
  icon,
  text,
}: {
  title: string;
  icon: string;
  text: string;
}) {
  return (
    <section className="mb-7">
      <div className="flex items-center gap-2">
        <span>{icon}</span>

        <h3 className="text-xs font-bold tracking-wider text-slate-500">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-[15px] leading-7 text-slate-700">
        {text}
      </p>
    </section>
  );
}