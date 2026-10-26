"use client";

import { useEffect, useState } from "react";
import { tripData, TripItem, TripItemType } from "../../data/tripData";

type Props = {
  isOpen: boolean;
  item: TripItem | null;
  currentDay: number;
  onClose: () => void;
  onSave: (newDay: number, updatedItem: TripItem) => void;
};

const typeOptions: Array<{
  value: TripItemType;
  label: string;
  icon: string;
}> = [
  { value: "sightseeing", label: "景點", icon: "⛩️" },
  { value: "food", label: "餐廳", icon: "🍴" },
  { value: "transport", label: "交通", icon: "🚆" },
  { value: "hotel", label: "飯店", icon: "🏨" },
];

export default function EditItinerarySheet({
  isOpen,
  item,
  currentDay,
  onClose,
  onSave,
}: Props) {
  const [day, setDay] = useState(currentDay);
  const [type, setType] = useState<TripItemType>("sightseeing");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [closedDays, setClosedDays] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;

    setDay(currentDay);
    setType(item.type);
    setName(item.name);
    setDetail(item.detail ?? "");
    setStartTime(item.startTime);
    setEndTime(item.endTime ?? "");
    setAddress(item.location?.address ?? "");
    setOpeningHours(item.openingHours ?? "");
    setClosedDays(item.closedDays ?? "");
  }, [isOpen, item, currentDay]);

  if (!isOpen || !item) return null;

  function handleSave() {
    if (!item) {
        return;
    }

    const cleanName = name.trim();

    if (!cleanName || !startTime) {
        return;
    }

    const cleanAddress =
        address.trim();

    const currentItem = item;

    const updatedItem: TripItem = {
        ...currentItem,

        type,

        name: cleanName,

        detail:
        detail.trim() ||
        undefined,

        startTime,

        endTime:
        endTime.trim() ||
        undefined,

        openingHours:
        type === "sightseeing"
            ? openingHours.trim() ||
            undefined
            : undefined,

        closedDays:
        type === "sightseeing"
            ? closedDays.trim() ||
            undefined
            : undefined,

        location: cleanAddress
        ? {
            name:
                currentItem.location
                ?.name ??
                cleanName,

            address:
                cleanAddress,

            mapQuery:
                cleanAddress,
            }
        : currentItem.location,
    };

    onSave(
        day,
        updatedItem
    );

    onClose();
    }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/35 px-0 sm:items-center sm:px-4">
      <button
        type="button"
        aria-label="關閉編輯行程"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-4 shadow-2xl sm:rounded-[28px]">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              EDIT ITINERARY
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">編輯行程</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 active:scale-95"
          >
            ×
          </button>
        </div>

        <div className="mt-6">
          <FieldLabel>移動到哪一天</FieldLabel>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {tripData.days.map((tripDay) => (
              <button
                key={tripDay.day}
                type="button"
                onClick={() => setDay(tripDay.day)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  day === tripDay.day
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                DAY {tripDay.day}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <FieldLabel>類型</FieldLabel>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`rounded-xl px-2 py-3 text-center transition active:scale-95 ${
                  type === option.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div className="text-lg">{option.icon}</div>
                <div className="mt-1 text-[10px] font-bold">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <FieldLabel>名稱</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="mt-4">
          <FieldLabel>補充說明</FieldLabel>
          <input
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="例如：參拜・散策"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>開始時間</FieldLabel>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <FieldLabel>結束時間</FieldLabel>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel>地址 / 地點</FieldLabel>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="地址或可供 Google Maps 搜尋的地點"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        {type === "sightseeing" && (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4">
            <p className="text-[10px] font-bold tracking-[0.16em] text-amber-700">
              PLACE INFO
            </p>

            <div className="mt-3">
              <FieldLabel>營業／參拜時間</FieldLabel>
              <input
                value={openingHours}
                onChange={(event) => setOpeningHours(event.target.value)}
                placeholder="例如 06:00–18:00"
                className="mt-2 h-12 w-full rounded-xl border border-amber-100 bg-white px-4 text-sm text-slate-800 outline-none focus:border-amber-300"
              />
            </div>

            <div className="mt-4">
              <FieldLabel>休館日</FieldLabel>
              <input
                value={closedDays}
                onChange={(event) => setClosedDays(event.target.value)}
                placeholder="例如 無休 / 每週一"
                className="mt-2 h-12 w-full rounded-xl border border-amber-100 bg-white px-4 text-sm text-slate-800 outline-none focus:border-amber-300"
              />
            </div>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                `${name.trim()} ${address.trim()} 官方 営業時間`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-800 transition active:scale-[0.99]"
            >
              🔎 搜尋官方營業資訊
            </a>
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-500 active:scale-[0.99]"
          >
            取消
          </button>

          <button
            type="button"
            disabled={!name.trim() || !startTime}
            onClick={handleSave}
            className="h-12 flex-[1.6] rounded-xl bg-slate-900 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30"
          >
            儲存修改
          </button>
        </div>
      </section>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-wide text-slate-500">
      {children}
    </p>
  );
}
