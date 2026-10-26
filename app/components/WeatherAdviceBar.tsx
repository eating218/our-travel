"use client";

import Link from "next/link";
import {
  getWeatherMeta,
  useWeather,
} from "../../hooks/useWeather";

function getAdvice(
  apparentTemperature: number,
  rainProbability: number
) {
  if (rainProbability >= 50) {
    return {
      icon: "☂️",
      text:
        apparentTemperature <= 15
          ? "今天降雨機率較高 · 建議帶傘與外套"
          : "今天降雨機率較高 · 建議攜帶雨傘",
    };
  }

  if (apparentTemperature <= 8) {
    return {
      icon: "🧣",
      text: "今天體感偏冷 · 建議注意保暖",
    };
  }

  if (apparentTemperature <= 15) {
    return {
      icon: "🧥",
      text: "今天體感偏涼 · 建議攜帶外套",
    };
  }

  if (apparentTemperature >= 32) {
    return {
      icon: "☀️",
      text: "今天體感炎熱 · 注意防曬與補水",
    };
  }

  if (apparentTemperature >= 28) {
    return {
      icon: "🥤",
      text: "今天偏熱 · 記得補充水分",
    };
  }

  return {
    icon: "✨",
    text: "目前天氣穩定 · 適合今天的行程",
  };
}

export default function WeatherAdviceBar() {
  const {
    weather,
    today,
    loaded,
    locating,
    error,
    requestCurrentLocation,
  } = useWeather();

  if (!loaded) {
    return (
      <div className="mt-4 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-4">
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-52 rounded bg-slate-200" />
      </div>
    );
  }

  if (!weather || !today) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-4">
        <p className="text-sm font-bold text-slate-700">
          🌦️ 暫時無法取得天氣
        </p>
      </div>
    );
  }

  const meta = getWeatherMeta(
    weather.current.weatherCode
  );

  const advice = getAdvice(
    weather.current.apparentTemperature,
    today.precipitationProbability
  );

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80">
      <div className="flex items-stretch">
        <Link
          href="/weather"
          className="min-w-0 flex-1 px-4 py-4 transition active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-2xl">
                {meta.icon}
              </span>

              <div className="flex min-w-0 items-end gap-2">
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {Math.round(
                    weather.current.temperature
                  )}
                  °
                </p>

                <div className="pb-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    {meta.label}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    體感{" "}
                    {Math.round(
                      weather.current
                        .apparentTemperature
                    )}
                    °
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-center justify-end gap-1">
                <p className="text-[11px] font-bold text-slate-500">
                  {weather.locationSource ===
                  "device"
                    ? "📍 目前位置"
                    : `🗓️ ${weather.locationName}`}
                </p>

                <span className="text-sm text-slate-300">
                  ›
                </span>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                {Math.round(
                  today.maxTemperature
                )}
                ° /{" "}
                {Math.round(
                  today.minTemperature
                )}
                °
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
            <span className="shrink-0 text-sm">
              {advice.icon}
            </span>

            <p className="min-w-0 text-[11px] font-semibold leading-4 text-slate-600">
              {advice.text}
            </p>
          </div>
        </Link>

        {weather.locationSource !== "device" && (
          <div className="flex items-start border-l border-slate-200 px-3 pt-4">
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={locating}
              aria-label="使用目前位置"
              className="rounded-lg px-1 py-1 text-[10px] font-bold text-blue-600 transition active:scale-95 disabled:text-slate-300"
            >
              {locating ? (
                "..."
              ) : (
                <>
                  📍
                  <span className="ml-1">
                    定位
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-slate-200 px-4 py-2">
          <p className="text-[10px] text-amber-600">
            {error}
          </p>
        </div>
      )}
    </section>
  );
}