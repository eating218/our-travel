"use client";

import Link from "next/link";
import {
  getWeatherMeta,
  useWeather,
} from "../../hooks/useWeather";

function formatHour(time: string) {
  const hour = time.split("T")[1]?.slice(0, 2);

  return hour ? `${hour}:00` : "";
}

function formatDate(
  date: string,
  index: number
) {
  if (index === 0) {
    return "今天";
  }

  if (index === 1) {
    return "明天";
  }

  const [, month, day] = date.split("-");

  return `${Number(month)}/${Number(day)}`;
}

export default function WeatherPage() {
  const {
    weather,
    today,
    todayHourly,
    loaded,
    locating,
    error,
    requestCurrentLocation,
  } = useWeather();

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-md px-5 py-7">
          <p className="text-sm text-slate-400">
            取得天氣中...
          </p>
        </div>
      </main>
    );
  }

  if (!weather || !today) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-md px-5 py-7">
          <Link
            href="/"
            className="text-sm font-bold text-slate-500"
          >
            ← 首頁
          </Link>

          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">
              暫時無法取得天氣
            </p>
          </div>
        </div>
      </main>
    );
  }

  const currentMeta = getWeatherMeta(
    weather.current.weatherCode
  );

  const currentHour =
    Number(
      weather.current.time
        .split("T")[1]
        ?.slice(0, 2)
    ) || 0;

  const upcomingHours = todayHourly
    .filter((hour) => {
      const hourNumber =
        Number(
          hour.time
            .split("T")[1]
            ?.slice(0, 2)
        ) || 0;

      return hourNumber >= currentHour;
    })
    .slice(0, 8);

  const rainyHours = todayHourly.filter(
    (hour) =>
      hour.precipitationProbability >= 50
  );

  const coldestApparent =
    todayHourly.length > 0
      ? Math.min(
          ...todayHourly.map(
            (hour) =>
              hour.apparentTemperature
          )
        )
      : weather.current.apparentTemperature;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-md px-5 pt-7">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-blue-600">
              WEATHER
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              旅行天氣
            </h1>
          </div>

          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 shadow-sm"
          >
            ×
          </Link>
        </header>

        <section className="mt-6 rounded-[32px] bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-300">
              TODAY
            </p>

            <p className="text-xs text-slate-400">
              {weather.locationSource === "device"
                ? "📍 目前位置附近"
                : `🗓️ ${weather.locationName}`}
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">
                {currentMeta.icon}
              </span>

              <div>
                <p className="text-5xl font-bold tracking-tight">
                  {Math.round(
                    weather.current.temperature
                  )}
                  °
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {currentMeta.label}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                體感
              </p>

              <p className="mt-1 text-lg font-bold">
                {Math.round(
                  weather.current
                    .apparentTemperature
                )}
                °
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-5 border-t border-white/10 pt-5 text-sm">
            <div>
              <p className="text-[10px] text-slate-400">
                最高
              </p>

              <p className="mt-1 font-bold">
                {Math.round(
                  today.maxTemperature
                )}
                °
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400">
                最低
              </p>

              <p className="mt-1 font-bold">
                {Math.round(
                  today.minTemperature
                )}
                °
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400">
                降雨
              </p>

              <p className="mt-1 font-bold">
                {
                  today.precipitationProbability
                }
                %
              </p>
            </div>
          </div>
        </section>

        {weather.locationSource !== "device" && (
          <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  想看你附近的天氣？
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  定位不會被儲存。
                </p>
              </div>

              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={locating}
                className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white disabled:bg-slate-300"
              >
                {locating
                  ? "定位中..."
                  : "📍 定位"}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-[10px] text-amber-600">
                {error}
              </p>
            )}
          </section>
        )}

        <section className="mt-7">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600">
              HOURLY
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              接下來幾小時
            </h2>
          </div>

          <div className="mt-3 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              {upcomingHours.map((hour) => {
                const meta =
                  getWeatherMeta(
                    hour.weatherCode
                  );

                return (
                  <div
                    key={hour.time}
                    className="w-[76px] rounded-2xl bg-white px-3 py-4 text-center shadow-sm"
                  >
                    <p className="text-[10px] font-semibold text-slate-400">
                      {formatHour(hour.time)}
                    </p>

                    <p className="mt-3 text-xl">
                      {meta.icon}
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {Math.round(
                        hour.temperature
                      )}
                      °
                    </p>

                    <p
                      className={`mt-2 text-[10px] font-bold ${
                        hour.precipitationProbability >=
                        50
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      💧{" "}
                      {
                        hour.precipitationProbability
                      }
                      %
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-7">
          <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600">
            TRIP ADVICE
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            今天建議
          </h2>

          <div className="mt-3 space-y-2">
            {rainyHours.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <span className="text-xl">
                    ☂️
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      今天有較高降雨機率
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      建議攜帶雨傘，之後會再和你的行程時間一起分析。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {coldestApparent <= 15 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <span className="text-xl">
                    {coldestApparent <= 8
                      ? "🧣"
                      : "🧥"}
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {coldestApparent <= 8
                        ? "今天體感偏冷"
                        : "今天有偏涼時段"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      最低體感約{" "}
                      {Math.round(
                        coldestApparent
                      )}
                      °C，
                      {coldestApparent <= 8
                        ? "建議注意保暖。"
                        : "建議攜帶一件外套。"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rainyHours.length === 0 &&
              coldestApparent > 15 && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <span className="text-xl">
                      ✨
                    </span>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        目前沒有特別提醒
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        今天的天氣條件目前看起來不錯。
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </section>

        <section className="mt-7">
          <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600">
            NEXT DAYS
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            未來天氣
          </h2>

          <div className="mt-3 overflow-hidden rounded-3xl bg-white shadow-sm">
            {weather.daily.map(
              (day, index) => {
                const meta =
                  getWeatherMeta(
                    day.weatherCode
                  );

                return (
                  <div
                    key={day.date}
                    className={`flex items-center justify-between px-5 py-4 ${
                      index !==
                      weather.daily.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-xl">
                        {meta.icon}
                      </span>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {formatDate(
                            day.date,
                            index
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {meta.label}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-right">
                      <p
                        className={`text-xs font-bold ${
                          day.precipitationProbability >=
                          50
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      >
                        💧{" "}
                        {
                          day.precipitationProbability
                        }
                        %
                      </p>

                      <p className="w-16 text-sm font-bold text-slate-800">
                        {Math.round(
                          day.maxTemperature
                        )}
                        ° /{" "}
                        {Math.round(
                          day.minTemperature
                        )}
                        °
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          Weather data by Open-Meteo
        </p>
      </div>
    </main>
  );
}