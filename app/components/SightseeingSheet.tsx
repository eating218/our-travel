"use client";

import { useEffect, useState } from "react";
import { TripItem } from "../../data/tripData";

type Props = {
  item: TripItem | null;
  note: string;
  onSaveNote: (itemId: string, note: string) => void;
  onDeleteNote: (itemId: string) => void;
  onClose: () => void;
};

export default function SightseeingSheet({
  item,
  note,
  onSaveNote,
  onDeleteNote,
  onClose,
}: Props) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState("");

  // ========================================
  // GUIDE EXPAND / COLLAPSE
  // ========================================

  const [isGuideExpanded, setIsGuideExpanded] = useState(true);

  // ========================================
  // RESET WHEN ITEM CHANGES
  // ========================================

  useEffect(() => {
    setDraftNote(note);
    setIsEditingNote(false);

    // 每次打開不同景點時，
    // 景點介紹重新預設為展開。
    setIsGuideExpanded(true);
  }, [item?.id, note]);

  if (!item || !item.guide) {
    return null;
  }

  // ========================================
  // GOOGLE MAPS
  // ========================================

  const mapUrl = item.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.location.mapQuery
      )}`
    : null;

  // ========================================
  // NOTE ACTIONS
  // ========================================

  function handleStartEdit() {
    setDraftNote(note);
    setIsEditingNote(true);
  }

  function handleCancelEdit() {
    setDraftNote(note);
    setIsEditingNote(false);
  }

  function handleSaveNote() {
    if (!item) return;

    onSaveNote(item.id, draftNote);
    setIsEditingNote(false);
  }

  function handleDeleteNote() {
    if (!item) return;

    onDeleteNote(item.id);
    setDraftNote("");
    setIsEditingNote(false);
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* =====================================
          BLACK BACKDROP
      ===================================== */}

      <button
        type="button"
        aria-label="關閉景點介紹"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* =====================================
          BOTTOM SHEET
      ===================================== */}

      <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[88vh] max-w-md overflow-y-auto rounded-t-[32px] bg-[#fffdfa]">
        {/* =================================
            DRAG HANDLE
        ================================= */}

        <div className="sticky top-0 z-10 bg-[#fffdfa] pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="p-6">
          {/* =================================
              HEADER
          ================================= */}

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md border border-emerald-700 px-2 py-1 text-[9px] font-bold tracking-widest text-emerald-700">
                  SIGHTSEEING
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  ◷{" "}
                  {item.endTime
                    ? `${item.startTime} - ${item.endTime}`
                    : item.startTime}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {item.name}
              </h2>
            </div>

            <button
              type="button"
              aria-label="關閉"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition active:scale-95"
            >
              ×
            </button>
          </div>

          {/* =================================
              OPENING HOURS
          ================================= */}

          {item.openingHours && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <span>◷</span>

              <div>
                <span className="font-bold">
                  營業／參拜時間
                </span>

                <span className="ml-2">
                  {item.openingHours}
                </span>
              </div>
            </div>
          )}

          {/* =================================
              ADDRESS
          ================================= */}

          {item.location?.address && (
            <div className="mt-4 flex gap-2 text-sm text-slate-500">
              <span>⌖</span>

              <p>{item.location.address}</p>
            </div>
          )}

          <div className="my-6 h-px bg-slate-200" />

          {/* =================================
              GUIDE
          ================================= */}

          <section>
            {/* GUIDE HEADER */}

            <button
              type="button"
              onClick={() =>
                setIsGuideExpanded(
                  (current) => !current
                )
              }
              aria-expanded={isGuideExpanded}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 text-left transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                  ⛩️
                </div>

                <div>
                  <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                    PLACE GUIDE
                  </p>

                  <h3 className="mt-0.5 text-sm font-bold text-slate-800">
                    景點介紹
                  </h3>
                </div>
              </div>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-slate-500 shadow-sm transition-transform duration-200 ${
                  isGuideExpanded
                    ? "rotate-90"
                    : "rotate-0"
                }`}
              >
                ›
              </div>
            </button>

            {/* GUIDE CONTENT */}

            {isGuideExpanded && (
              <div className="pt-6">
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
              </div>
            )}
          </section>

          <div className="my-7 h-px bg-slate-200" />

          {/* =================================
              MY NOTE
          ================================= */}

          <section>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                  MY NOTE
                </p>

                <h3 className="mt-1 text-sm font-bold text-slate-800">
                  📝 我的景點備註
                </h3>
              </div>

              {!isEditingNote && note && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 transition active:scale-95"
                >
                  編輯
                </button>
              )}
            </div>

            {/* =================================
                NOTE EDIT MODE
            ================================= */}

            {isEditingNote ? (
              <div className="mt-4">
                <textarea
                  value={draftNote}
                  onChange={(event) =>
                    setDraftNote(
                      event.target.value
                    )
                  }
                  rows={6}
                  autoFocus
                  placeholder={
                    "例如：\n・音羽瀑布要去\n・買御守\n・17:00 前完成參拜"
                  }
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-slate-400"
                />

                <div className="mt-3 flex gap-2">
                  {note && (
                    <button
                      type="button"
                      onClick={
                        handleDeleteNote
                      }
                      className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition active:scale-95"
                    >
                      刪除
                    </button>
                  )}

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={
                      handleCancelEdit
                    }
                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition active:scale-95"
                  >
                    取消
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveNote
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95"
                  >
                    儲存
                  </button>
                </div>
              </div>
            ) : note ? (
              /* =================================
                  NOTE DISPLAY
              ================================= */

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3.5">
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {note}
                </p>
              </div>
            ) : (
              /* =================================
                  EMPTY NOTE
              ================================= */

              <button
                type="button"
                onClick={handleStartEdit}
                className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-xs font-bold text-slate-500 transition active:scale-[0.99]"
              >
                ＋ 新增景點備註
              </button>
            )}
          </section>

          {/* =================================
              GOOGLE MAPS
          ================================= */}

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-800 text-sm font-bold text-white transition active:scale-[0.99]"
            >
              ◇　Google Maps 導航
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

// ========================================
// GUIDE SECTION
// ========================================

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